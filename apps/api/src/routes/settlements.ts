import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { SettlementService } from "../services/settlement-service";
import { createSettlementSchema } from "../schemas/settlement";
import { SettlementStatus } from "@prisma/client";

const groupParamSchema = z.object({ id: z.string() });
const settlementParamSchema = z.object({ id: z.string(), settlementId: z.string() });

export async function registerSettlementRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/groups/:id/balances",
    { preHandler: app.authenticate, schema: { params: groupParamSchema } },
    async (request) => {
      return loadBalances(app, request.params.id);
    }
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    "/groups/:id/settlements/suggest",
    { preHandler: app.authenticate, schema: { params: groupParamSchema } },
    async (request) => {
      const balances = await loadBalances(app, request.params.id);
      return SettlementService.suggestTransfers(balances);
    }
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    "/groups/:id/settlements",
    {
      preHandler: app.authenticate,
      schema: { params: groupParamSchema, body: createSettlementSchema },
    },
    async (request) => {
      const settlement = await app.prisma.settlement.create({
        data: {
          groupId: request.params.id,
          fromUserId: request.body.fromUserId,
          toUserId: request.body.toUserId,
          amount: request.body.amount,
          currency: (await app.prisma.group.findUnique({ where: { id: request.params.id } }))?.currency ??
            "EUR",
        },
      });

      return settlement;
    }
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    "/groups/:id/settlements/:settlementId/confirm",
    {
      preHandler: app.authenticate,
      schema: { params: settlementParamSchema },
    },
    async (request) => {
      const settlement = await app.prisma.settlement.update({
        where: { id: request.params.settlementId },
        data: { status: SettlementStatus.CONFIRMED, confirmedAt: new Date() },
      });

      return settlement;
    }
  );
}

async function loadBalances(app: FastifyInstance, groupId: string, range?: { from?: Date; to?: Date }) {
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
    ...value,
    net: Number((value.totalPaid - value.totalOwed).toFixed(2)),
  }));
}
