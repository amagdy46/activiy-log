import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  for (let i = 0; i < 300; i++) {
    const actorName = faker.person.fullName();
    const targetName = faker.internet.email();
    const actionName = faker.hacker.verb();
    const actionId = `action_${faker.string.uuid()}`;
    const metadata = {
      description: faker.lorem.sentence(),
      redirect: faker.internet.url(),
      x_request_id: `req_${faker.string.uuid()}`,
    };

    // Create action if it doesn't exist
    let action = await prisma.action.findUnique({
      where: { id: actionId },
    });

    if (!action) {
      action = await prisma.action.create({
        data: {
          id: actionId,
          name: actionName,
        },
      });
    }

    // Create event
    await prisma.event.create({
      data: {
        actorId: `user_${faker.string.uuid()}`,
        actorName: actorName,
        group: "instatus.com",
        actionId: action.id,
        targetId: `user_${faker.string.uuid()}`,
        targetName: targetName,
        location: faker.internet.ip(),
        occurredAt: faker.date.past().toISOString(),
        metadata: metadata,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
