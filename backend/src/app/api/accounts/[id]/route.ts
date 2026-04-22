import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UpdateAccountSchema } from "@/lib/validation";
import { successResponse, errorResponse, HTTP_STATUS } from "@/lib/response";

/**
 * GET /api/accounts/:id
 * Get account detail
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponse("Unauthorized"),
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const account = await prisma.account.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
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

    if (!account) {
      return NextResponse.json(
        errorResponse("Akun tidak ditemukan"),
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    return NextResponse.json(successResponse({ account }));
  } catch (error) {
    console.error("Get account error:", error);
    return NextResponse.json(
      errorResponse("Gagal mengambil detail akun"),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * PUT /api/accounts/:id
 * Update account
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponse("Unauthorized"),
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // Check if account exists and belongs to user
    const existingAccount = await prisma.account.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingAccount) {
      return NextResponse.json(
        errorResponse("Akun tidak ditemukan"),
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = UpdateAccountSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        errorResponse(validation.error.errors[0].message),
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const { name, type } = validation.data;

    // Update account
    const account = await prisma.account.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
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
        message: "Akun berhasil diperbarui",
      })
    );
  } catch (error) {
    console.error("Update account error:", error);
    return NextResponse.json(
      errorResponse("Gagal memperbarui akun"),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * DELETE /api/accounts/:id
 * Delete account
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponse("Unauthorized"),
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // Check if account exists and belongs to user
    const existingAccount = await prisma.account.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingAccount) {
      return NextResponse.json(
        errorResponse("Akun tidak ditemukan"),
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Check if account has transactions
    const transactionCount = await prisma.transaction.count({
      where: { accountId: params.id },
    });

    if (transactionCount > 0) {
      return NextResponse.json(
        errorResponse("Akun memiliki transaksi dan tidak dapat dihapus"),
        { status: HTTP_STATUS.CONFLICT }
      );
    }

    // Delete account
    await prisma.account.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      successResponse({
        message: "Akun berhasil dihapus",
      })
    );
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      errorResponse("Gagal menghapus akun"),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
