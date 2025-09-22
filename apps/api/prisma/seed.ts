import { PrismaClient, GroupRole, SplitType, SettlementStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      name: "Alice",
      locale: "de",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      name: "Bob",
      locale: "de",
    },
  });

  const carol = await prisma.user.upsert({
    where: { email: "carol@example.com" },
    update: {},
    create: {
      email: "carol@example.com",
      name: "Carol",
      locale: "en",
    },
  });

  const dave = await prisma.user.upsert({
    where: { email: "dave@example.com" },
    update: {},
    create: {
      email: "dave@example.com",
      name: "Dave",
      locale: "en",
    },
  });

  const group = await prisma.group.upsert({
    where: { id: "demo-group" },
    update: {},
    create: {
      id: "demo-group",
      name: "WG Sonnenallee",
      currency: "EUR",
      ownerId: alice.id,
    },
  });

  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: group.id, userId: alice.id } },
    update: { role: GroupRole.OWNER },
    create: {
      groupId: group.id,
      userId: alice.id,
      role: GroupRole.OWNER,
    },
  });

  for (const user of [bob, carol, dave]) {
    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: group.id, userId: user.id } },
      update: {},
      create: {
        groupId: group.id,
        userId: user.id,
        role: GroupRole.MEMBER,
      },
    });
  }

  await prisma.expense.create({
    data: {
      groupId: group.id,
      payerId: alice.id,
      amount: 90,
      currency: "EUR",
      date: new Date(),
      category: "Groceries",
      splitType: SplitType.EQUAL,
      createdBy: alice.id,
      participants: {
        create: [alice, bob, carol].map((participant) => ({
          userId: participant.id,
          share: 30,
        })),
      },
    },
    include: { participants: true },
  });

  await prisma.expense.create({
    data: {
      groupId: group.id,
      payerId: bob.id,
      amount: 1200,
      currency: "EUR",
      date: new Date(),
      category: "Rent",
      splitType: SplitType.SHARES,
      createdBy: bob.id,
      recurringRule: "FREQ=MONTHLY;BYMONTHDAY=1",
      participants: {
        create: [
          { userId: alice.id, share: 600 },
          { userId: bob.id, share: 360 },
          { userId: carol.id, share: 240 },
        ],
      },
    },
  });

  await prisma.settlement.create({
    data: {
      groupId: group.id,
      fromUserId: bob.id,
      toUserId: alice.id,
      amount: 30,
      currency: "EUR",
      status: SettlementStatus.OPEN,
    },
  });

  await prisma.auditLog.create({
    data: {
      groupId: group.id,
      actorId: alice.id,
      action: "GROUP_SEEDED",
      meta: { reason: "Initial seed" },
    },
  });

  console.info("Seed data created");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
