import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getTicketById, updateTicketFields } from "@/lib/tickets";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idParam } = await context.params;
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ticket ID." }, { status: 400 });
    }

    const ticket = await getTicketById(id, user);
    if (!ticket) {
      // Returns 404 with empty or generic not-found message to prevent information disclosure
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("GET /api/tickets/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idParam } = await context.params;
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ticket ID." }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const result = await updateTicketFields(id, body, user);
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.ticket);
  } catch (error) {
    console.error("PATCH /api/tickets/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update ticket." },
      { status: 500 }
    );
  }
}
