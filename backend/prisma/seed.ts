import "../src/config/env";
import { UserRole } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/utils/password";

const PASSWORD = "Asdfghjk";

async function main() {
  for (const role of [UserRole.victim, UserRole.officer, UserRole.admin]) {
    const email = `${role}@gmail.com`;
    const password = hashPassword(PASSWORD);
    const user = await prisma.user.upsert({
      where: { email },
      update: { password, role, isActive: true },
      create: {
        name: `Demo ${role}`,
        email,
        password,
        phone: "01700000000",
        role,
      },
    });

    if (role === UserRole.victim) {
      await prisma.victim.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id, nid: "1234567890" },
      });
    } else if (role === UserRole.officer) {
      await prisma.officer.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          badgeNumber: "DEMO-001",
          department: "Cyber Crime Unit",
          specialization: "Digital Forensics",
        },
      });
    } else {
      await prisma.admin.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id, adminCode: "DEMO", position: "System Administrator" },
      });
    }
    console.log(`seeded ${email} (id ${user.id})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
