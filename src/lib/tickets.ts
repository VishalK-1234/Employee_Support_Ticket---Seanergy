import { prisma } from "@/lib/prisma";
import type { AuthenticatedUser } from "@/lib/auth";
import {
  validateTitle,
  validateDescription,
  validateCategory,
  validatePriority,
  validateStatus,
  type Category,
  type Priority,
  type Status,
} from "@/lib/validate";

export interface TicketListItem {
  id: number;
  title: string;
  category: string;
  priority: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: number;
  createdBy?: {
    username: string;
  };
}

export interface TicketDetail {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: number;
  createdBy: {
    username: string;
  };
}

export async function listTickets(
  user: AuthenticatedUser
): Promise<TicketListItem[]> {
  if (user.role === "employee") {
    return prisma.ticket.findMany({
      where: { createdById: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        category: true,
        priority: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        createdById: true,
      },
    });
  }

  // Support staff sees all tickets including creator username
  return prisma.ticket.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      category: true,
      priority: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      createdById: true,
      createdBy: {
        select: {
          username: true,
        },
      },
    },
  });
}

export async function getTicketById(
  id: number,
  user: AuthenticatedUser
): Promise<TicketDetail | null> {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          username: true,
        },
      },
    },
  });

  if (!ticket) {
    return null;
  }

  // If employee, can only view own tickets. Return null (404) for any other employee's ticket
  if (user.role === "employee" && ticket.createdById !== user.id) {
    return null;
  }

  return ticket;
}

export async function createTicket(
  input: {
    title: unknown;
    description: unknown;
    category: unknown;
    priority: unknown;
  },
  user: AuthenticatedUser
) {
  if (user.role !== "employee") {
    return {
      error: "Only employees can create support tickets.",
      status: 403,
    };
  }

  const titleVal = validateTitle(input.title);
  if (!titleVal.valid) {
    return { error: titleVal.error, status: 400 };
  }

  const descVal = validateDescription(input.description);
  if (!descVal.valid) {
    return { error: descVal.error, status: 400 };
  }

  const catVal = validateCategory(input.category);
  if (!catVal.valid) {
    return { error: catVal.error, status: 400 };
  }

  const prioVal = validatePriority(input.priority);
  if (!prioVal.valid) {
    return { error: prioVal.error, status: 400 };
  }

  const ticket = await prisma.ticket.create({
    data: {
      title: titleVal.value!,
      description: descVal.value!,
      category: catVal.value!,
      priority: prioVal.value!,
      status: "Open", // Always starts as Open
      createdById: user.id,
    },
    include: {
      createdBy: {
        select: {
          username: true,
        },
      },
    },
  });

  return { ticket, status: 201 };
}

export async function updateTicketFields(
  id: number,
  input: {
    title?: unknown;
    description?: unknown;
    category?: unknown;
    priority?: unknown;
  },
  user: AuthenticatedUser
) {
  const existing = await prisma.ticket.findUnique({
    where: { id },
  });

  if (!existing) {
    return { error: "Ticket not found.", status: 404 };
  }

  // Employee requesting another employee's ticket receives 404
  if (user.role === "employee" && existing.createdById !== user.id) {
    return { error: "Ticket not found.", status: 404 };
  }

  // Only the creator can edit fields. Support cannot edit ticket fields.
  if (user.role !== "employee" || existing.createdById !== user.id) {
    return {
      error: "Only the creating employee can edit ticket details.",
      status: 403,
    };
  }

  // Closed tickets cannot have fields edited
  if (existing.status === "Closed") {
    return {
      error: "Closed tickets cannot be edited.",
      status: 400,
    };
  }

  const updateData: {
    title?: string;
    description?: string;
    category?: Category;
    priority?: Priority;
  } = {};

  if (input.title !== undefined) {
    const val = validateTitle(input.title);
    if (!val.valid) return { error: val.error, status: 400 };
    updateData.title = val.value!;
  }

  if (input.description !== undefined) {
    const val = validateDescription(input.description);
    if (!val.valid) return { error: val.error, status: 400 };
    updateData.description = val.value!;
  }

  if (input.category !== undefined) {
    const val = validateCategory(input.category);
    if (!val.valid) return { error: val.error, status: 400 };
    updateData.category = val.value!;
  }

  if (input.priority !== undefined) {
    const val = validatePriority(input.priority);
    if (!val.valid) return { error: val.error, status: 400 };
    updateData.priority = val.value!;
  }

  if (Object.keys(updateData).length === 0) {
    return { error: "No valid fields provided for update.", status: 400 };
  }

  const updated = await prisma.ticket.update({
    where: { id },
    data: updateData,
    include: {
      createdBy: {
        select: {
          username: true,
        },
      },
    },
  });

  return { ticket: updated, status: 200 };
}

export async function updateTicketStatus(
  id: number,
  statusInput: unknown,
  user: AuthenticatedUser
) {
  if (user.role !== "support") {
    return {
      error: "Only support staff can change ticket status.",
      status: 403,
    };
  }

  const statusVal = validateStatus(statusInput);
  if (!statusVal.valid) {
    return { error: statusVal.error, status: 400 };
  }

  const existing = await prisma.ticket.findUnique({
    where: { id },
  });

  if (!existing) {
    return { error: "Ticket not found.", status: 404 };
  }

  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      status: statusVal.value!,
    },
    include: {
      createdBy: {
        select: {
          username: true,
        },
      },
    },
  });

  return { ticket: updated, status: 200 };
}
