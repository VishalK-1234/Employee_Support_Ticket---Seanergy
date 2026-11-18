import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateTicketStatus } from "@/lib/tickets";

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
    if (!body || body.status === undefined) {
      return NextResponse.json(
        { error: "Status field is required." },
        { status: 400 }
      );
    }

    const result = await updateTicketStatus(id, body.status, user);
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.ticket);
  } catch (error) {
    console.error("PATCH /api/tickets/[id]/status error:", error);
    return NextResponse.json(
      { error: "Failed to update ticket status." },
      { status: 500 }
    );
  }
}
