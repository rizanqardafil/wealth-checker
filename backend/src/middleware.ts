import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// For Phase 1 (MVP), we'll skip auth middleware and implement it in individual routes
// This allows testing without full NextAuth setup
// TODO: Move auth checks to individual route handlers or implement NextAuth session properly
const protectedRoutes = [
  // Temporarily disabled - auth will be checked in individual route handlers
  // "/api/accounts",
  // "/api/transactions",
  // "/api/assets",
  // "/api/debts",
  // "/api/budgets",
  // "/api/reports",
];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add CORS headers
  const origin = request.headers.get("origin");
  if (origin && (origin.includes("localhost") || origin.includes("127.0.0.1"))) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return response;
  }

  // Allow public routes
  if (!protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    return response;
  }

  // Check authentication for protected routes
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401, headers: response.headers }
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
