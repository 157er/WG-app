import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { createExpenseSchema, updateExpenseSchema, expensesQuerySchema } from "../schemas/expense";
import { SplitService } from "../services/split-service";
import { SplitType, Prisma } from "@prisma/client";
import { scheduleRecurringExpense } from "../jobs/recurring-expense-processor";
import { validateReceiptUpload } from "../utils/uploads";

const expenseParamSchema = z.object({ id: z.string(), expenseId: z.string() });
const groupParamSchema = z.object({ id: z.string() });

export async function registerExpenseRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/groups/:id/expenses",
    {
      preHandler: app.authenticate,
      schema: { params: groupParamSchema, body: createExpenseSchema },
    },
    async (request) => {
      const group = await app.prisma.group.findUnique({ where: { id: request.params.id } });
      if (!group) {
        throw app.httpErrors.notFound("Group not found");
      }

      const splitService = new SplitService(group.rounding);
      const split = splitService.compute(
        request.body.splitType as SplitType,
        request.body.amount,
        request.body.participants
      );

      const expense = await app.prisma.expense.create({
        data: {
          groupId: request.params.id,
          payerId: request.body.payerId,
          amount: new Prisma.Decimal(request.body.amount),
          currency: request.body.currency ?? group.currency,
          date: new Date(request.body.date),
          category: request.body.category,
          notes: request.body.notes,
          splitType: request.body.splitType as SplitType,
          createdBy: request.user.sub as string,
          recurringRule: request.body.recurringRule,
          participants: {
            create: split.map((participant) => ({
              userId: participant.userId,
              share: new Prisma.Decimal(participant.amount),
            })),
          },
        },
        include: {
          participants: true,
        },
      });

      if (request.body.recurringRule) {
        await scheduleRecurringExpense(expense.id, { repeat: { cron: "0 3 * * *" } });
      }

      return expense;
    }
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/groups/:id/expenses",
    {
      preHandler: app.authenticate,
      schema: { params: groupParamSchema, querystring: expensesQuerySchema },
    },
    async (request) => {
      const expenses = await app.prisma.expense.findMany({
        where: {
          groupId: request.params.id,
          ...(request.query.category ? { category: request.query.category } : {}),
          ...(request.query.payer ? { payerId: request.query.payer } : {}),
          ...(request.query.from || request.query.to
            ? {
                date: {
                  gte: request.query.from ? new Date(request.query.from) : undefined,
                  lte: request.query.to ? new Date(request.query.to) : undefined,
                },
              }
            : {}),
        },
        take: request.query.limit,
        include: { participants: true },
        orderBy: { date: "desc" },
      });
      return expenses;
    }
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/groups/:id/expenses/:expenseId",
    {
      preHandler: app.authenticate,
      schema: { params: expenseParamSchema },
    },
    async (request) => {
      const expense = await app.prisma.expense.findFirst({
        where: { id: request.params.expenseId, groupId: request.params.id },
        include: { participants: true, receipts: true },
      });

      if (!expense) {
        throw app.httpErrors.notFound();
      }

      return expense;
    }
  );

  app.withTypeProvider<ZodTypeProvider>().patch(
    "/groups/:id/expenses/:expenseId",
    {
      preHandler: app.authenticate,
      schema: { params: expenseParamSchema, body: updateExpenseSchema },
    },
    async (request) => {
      const updateData: Prisma.ExpenseUpdateInput = { ...request.body };
      if (request.body.amount !== undefined) {
        updateData.amount = new Prisma.Decimal(request.body.amount);
      }
      if (request.body.date) {
        updateData.date = new Date(request.body.date);
      }

      const expense = await app.prisma.expense.update({
        where: { id: request.params.expenseId },
        data: updateData,
      });

      return expense;
    }
  );

  app.withTypeProvider<ZodTypeProvider>().delete(
    "/groups/:id/expenses/:expenseId",
    {
      preHandler: app.authenticate,
      schema: { params: expenseParamSchema },
    },
    async (request, reply) => {
      await app.prisma.expense.delete({ where: { id: request.params.expenseId } });
      reply.code(204);
      return null;
    }
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    "/groups/:id/expenses/:expenseId/receipts",
    {
      preHandler: app.authenticate,
      schema: {
        params: expenseParamSchema,
        body: z.object({ filename: z.string(), mime: z.string(), size: z.number() }),
      },
    },
    async (request) => {
      validateReceiptUpload(request.body);
      // TODO post-MVP: store file in S3-compatible storage and run virus scan
      return app.prisma.receipt.create({
        data: {
          expenseId: request.params.expenseId,
          url: `https://example.com/${request.body.filename}`,
          mime: request.body.mime,
          size: request.body.size,
        },
      });
    }
  );
}
