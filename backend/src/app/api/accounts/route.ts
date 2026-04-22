import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateAccountSchema } from "@/lib/validation";
import { successResponse, errorResponse, HTTP_STATUS } from "@/lib/response";

/**
 * GET /api/accounts
 * List all user accounts
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponse("Unauthorized"),
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const accounts = await prisma.account.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        type: true,
        balance: true,
        currency: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      successResponse({
        accounts,
        count: accounts.length,
      })
    );
  } catch (error) {
    console.error("Get accounts error:", error);
    return NextResponse.json(
      errorResponse("Gagal mengambil akun"),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * POST /api/accounts
 * Create new account
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponse("Unauthorized"),
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = CreateAccountSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        errorResponse(validation.error.errors[0].message),
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const { name, type } = validation.data;

    // Create account
    const account = await prisma.account.create({
      data: {
        userId: session.user.id,
        name,
        type,
        balance: "0",
        currency: "IDR",
      },
      select: {
        id: true,
        name: true,
        type: true,
        balance: true,
        currency: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      successResponse({
        account,
        message: "Akun berhasil dibuat",
      }),
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    console.error("Create account error:", error);
    return NextResponse.json(
      errorResponse("Gagal membuat akun"),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
