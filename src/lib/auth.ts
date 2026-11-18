import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/validate";

export interface AuthenticatedUser {
  id: number;
  username: string;
  role: Role;
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const session = await getSession();
    if (!session.userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, username: true, role: true },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role as Role,
    };
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") {
      throw error;
    }
    return null;
  }
}
