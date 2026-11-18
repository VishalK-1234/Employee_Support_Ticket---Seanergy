import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type SeedUser = {
  id: number;
  username: string;
  role: string;
};

async function main() {
  const defaultPassword = "password123";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  // 1. Seed Users (employee1, employee2, support1)
  const usersData = [
    { username: "employee1", role: "employee" },
    { username: "employee2", role: "employee" },
    { username: "support1", role: "support" },
  ];

  const createdUsers: Record<string, SeedUser> = {};

  for (const u of usersData) {
    const existing = await prisma.user.findUnique({
      where: { username: u.username },
    });

    if (!existing) {
      createdUsers[u.username] = await prisma.user.create({
        data: {
          username: u.username,
          passwordHash,
          role: u.role,
        },
      });
      console.log(`Created user ${u.username} with role ${u.role}`);
    } else {
      createdUsers[u.username] = existing;
      console.log(`User ${u.username} already exists`);
    }
  }

  // 2. Seed Sample Tickets if none exist
  const ticketCount = await prisma.ticket.count();
  if (ticketCount === 0) {
    const sampleTickets = [
      {
        title: "Laptop display flickering after waking from sleep",
        description:
          "The built-in display on the company laptop flickers continuously when waking up from sleep. Requires hard reboot.",
        category: "Hardware",
        priority: "Medium",
        status: "Open",
        createdById: createdUsers["employee1"].id,
      },
      {
        title: "Unable to launch development container",
        description:
          "Docker engine fails to start the development container with exit code 125 after system patch update.",
        category: "Software",
        priority: "High",
        status: "In Progress",
        createdById: createdUsers["employee1"].id,
      },
      {
        title: "VPN connection drops every 15 minutes",
        description:
          "Corporate VPN client frequently disconnects when working remotely, disrupting persistent SSH sessions.",
        category: "Network",
        priority: "High",
        status: "Resolved",
        createdById: createdUsers["employee2"].id,
      },
      {
        title: "Request access to deployment repository",
        description:
          "Need read and write access to the release deployment repository for the upcoming quarterly cycle.",
        category: "Access",
        priority: "Low",
        status: "Closed",
        createdById: createdUsers["employee2"].id,
      },
      {
        title: "Desk ergonomic monitor stand replacement",
        description:
          "The height adjustment latch on the current desk monitor arm is broken and cannot safely hold dual monitors.",
        category: "Other",
        priority: "Low",
        status: "Open",
        createdById: createdUsers["employee1"].id,
      },
    ];

    for (const ticket of sampleTickets) {
      await prisma.ticket.create({ data: ticket });
    }
    console.log(`Seeded ${sampleTickets.length} sample tickets.`);
  } else {
    console.log(`Tickets already exist (${ticketCount} tickets found).`);
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
