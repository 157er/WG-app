import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { PeriodReportDocument } from "../pdf/period-report";
import { renderToBuffer } from "@react-pdf/renderer";
import { DataExportService } from "../services/data-export-service";

const reportQuerySchema = z.object({ from: z.string(), to: z.string() });
const groupParamSchema = z.object({ id: z.string() });

export async function registerReportRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/groups/:id/reports/period",
    {
      preHandler: app.authenticate,
      schema: { params: groupParamSchema, querystring: reportQuerySchema },
    },
    async (request) => {
      const expenses = await app.prisma.expense.findMany({
        where: {
          groupId: request.params.id,
          date: {
            gte: new Date(request.query.from),
            lte: new Date(request.query.to),
          },
        },
        include: { participants: true },
      });

      const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      const byCategory = expenses.reduce<Record<string, number>>((acc, expense) => {
        acc[expense.category] = (acc[expense.category] ?? 0) + Number(expense.amount);
        return acc;
      }, {});

      return { total, byCategory };
    }
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    "/groups/:id/reports/period/pdf",
    {
      preHandler: app.authenticate,
      schema: { params: groupParamSchema, querystring: reportQuerySchema },
    },
    async (request, reply) => {
      const group = await app.prisma.group.findUnique({ where: { id: request.params.id } });
      if (!group) {
        throw app.httpErrors.notFound();
      }

      const expenses = await app.prisma.expense.findMany({
        where: {
          groupId: request.params.id,
          date: {
            gte: new Date(request.query.from),
            lte: new Date(request.query.to),
          },
        },
        include: { participants: true },
      });

      const balances = await calculateBalances(app, request.params.id, {
        from: new Date(request.query.from),
        to: new Date(request.query.to),
      });

      const settlements = await app.prisma.settlement.findMany({
        where: {
          groupId: request.params.id,
          createdAt: {
            gte: new Date(request.query.from),
            lte: new Date(request.query.to),
          },
        },
      });

      const buffer = await renderToBuffer(
        <PeriodReportDocument
          groupName={group.name}
          currency={group.currency}
          period={request.query}
          expenses={expenses.map((expense) => ({
            date: expense.date.toISOString().split("T")[0],
            payer: expense.payerId,
            category: expense.category,
            amount: Number(expense.amount),
          }))}
          balances={balances}
          settlements={settlements.map((settlement) => ({
            from: settlement.fromUserId,
            to: settlement.toUserId,
            amount: Number(settlement.amount),
          }))}
        />
      );

      reply.header("Content-Type", "application/pdf");
      reply.header(
        "Content-Disposition",
        `inline; filename=wg-split-report-${request.query.from}-${request.query.to}.pdf`
      );
      return reply.send(buffer);
    }
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/groups/:id/export/csv",
    {
      preHandler: app.authenticate,
      schema: { params: groupParamSchema },
    },
    async (request, reply) => {
      const expenses = await app.prisma.expense.findMany({
        where: { groupId: request.params.id },
        include: { participants: true },
      });

      const rows = ["date,payer,category,amount"].concat(
        expenses.map((expense) =>
          [
            expense.date.toISOString(),
            expense.payerId,
            expense.category,
            Number(expense.amount).toFixed(2),
          ].join(",")
        )
      );

      reply.header("Content-Type", "text/csv");
      reply.send(rows.join("\n"));
    }
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    "/me/data-export",
    { preHandler: app.authenticate },
    async (request) => {
      const userId = request.user.sub as string;
      const groups = await app.prisma.groupMember.findMany({
        where: { userId },
        include: { group: true },
      });
      const expenses = await app.prisma.expense.findMany({
        where: { groupId: { in: groups.map((item) => item.groupId) } },
      });
      const settlements = await app.prisma.settlement.findMany({
        where: { groupId: { in: groups.map((item) => item.groupId) } },
      });

      const service = new DataExportService();
      const archive = await service.buildArchive({
        users: [await app.prisma.user.findUniqueOrThrow({ where: { id: userId } })],
        groups,
        expenses,
        settlements,
      });

      await app.prisma.dataExportRequest.create({
        data: {
          userId,
          status: "READY",
          url: `data:application/zip;base64,${Buffer.from(archive).toString("base64")}`,
        },
      });

      return { status: "READY" };
    }
  );
}

async function calculateBalances(app: FastifyInstance, groupId: string, range?: { from?: Date; to?: Date }) {
  const expenses = await app.prisma.expense.findMany({
    where: {
      groupId,
      date: {
        gte: range?.from,
        lte: range?.to,
      },
    },
    include: { participants: true },
  });

  const totals = new Map<string, { totalPaid: number; totalOwed: number }>();
  for (const expense of expenses) {
    const paid = totals.get(expense.payerId) ?? { totalPaid: 0, totalOwed: 0 };
    paid.totalPaid += Number(expense.amount);
    totals.set(expense.payerId, paid);

    for (const participant of expense.participants) {
      const owed = totals.get(participant.userId) ?? { totalPaid: 0, totalOwed: 0 };
      owed.totalOwed += Number(participant.share ?? 0);
      totals.set(participant.userId, owed);
    }
  }

  return Array.from(totals.entries()).map(([userId, value]) => ({
    userId,
    totalPaid: value.totalPaid,
    totalOwed: value.totalOwed,
    net: Number((value.totalPaid - value.totalOwed).toFixed(2)),
  }));
}
