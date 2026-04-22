import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// Protect routes that require authentication
const protectedRoutes = [
  "/api/accounts",
  "/api/transactions",
  "/api/assets",
  "/api/debts",
  "/api/budgets",
  "/api/reports",
];

export async function middleware(request: NextRequest) {
  // Allow public routes
  if (!protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
