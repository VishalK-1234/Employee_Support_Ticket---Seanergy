import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  listTicketComments,
  createTicketComment,
} from "@/lib/tickets";

function parseTicketId(idParam: string) {
  const id = parseInt(idParam, 10);
  return Number.isNaN(id) ? null : id;
}

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
    const id = parseTicketId(idParam);
    if (id === null) {
      return NextResponse.json({ error: "Invalid ticket ID." }, { status: 400 });
    }

    const result = await listTicketComments(id, user);
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.comments);
  } catch (error) {
    console.error("GET /api/tickets/[id]/comments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idParam } = await context.params;
    const id = parseTicketId(idParam);
    if (id === null) {
      return NextResponse.json({ error: "Invalid ticket ID." }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const result = await createTicketComment(id, body, user);
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.comment, { status: 201 });
  } catch (error) {
    console.error("POST /api/tickets/[id]/comments error:", error);
    return NextResponse.json(
      { error: "Failed to add comment." },
      { status: 500 }
    );
  }
}
