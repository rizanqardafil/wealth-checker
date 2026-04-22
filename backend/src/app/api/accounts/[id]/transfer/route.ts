import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TransferSchema } from "@/lib/validation";
import { successResponse, errorResponse, HTTP_STATUS } from "@/lib/response";
import Decimal from "decimal.js";

/**
 * POST /api/accounts/:id/transfer
 * Transfer money between accounts
 */
export async function POST(
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

    const body = await request.json();

    // Validate input
    const validation = TransferSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        errorResponse(validation.error.errors[0].message),
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const { toAccountId, amount, description } = validation.data;
    const fromAccountId = params.id;

    // Check if from account exists and belongs to user
    const fromAccount = await prisma.account.findFirst({
      where: {
        id: fromAccountId,
        userId: session.user.id,
      },
    });

    if (!fromAccount) {
      return NextResponse.json(
        errorResponse("Akun sumber tidak ditemukan"),
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Check if to account exists and belongs to user
    const toAccount = await prisma.account.findFirst({
      where: {
        id: toAccountId,
        userId: session.user.id,
      },
    });

    if (!toAccount) {
      return NextResponse.json(
        errorResponse("Akun tujuan tidak ditemukan"),
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Check if same account
    if (fromAccountId === toAccountId) {
      return NextResponse.json(
        errorResponse("Tidak bisa transfer ke akun yang sama"),
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Check sufficient balance
    const transferAmount = new Decimal(amount);
    const fromBalance = new Decimal(fromAccount.balance);

    if (fromBalance.lessThan(transferAmount)) {
      return NextResponse.json(
        errorResponse("Saldo tidak cukup"),
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Perform transfer using transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from source account
      const updatedFromAccount = await tx.account.update({
        where: { id: fromAccountId },
        data: {
          balance: fromBalance.minus(transferAmount).toString(),
        },
      });

      // Add to destination account
      const toBalance = new Decimal(toAccount.balance);
      const updatedToAccount = await tx.account.update({
        where: { id: toAccountId },
        data: {
          balance: toBalance.plus(transferAmount).toString(),
        },
      });

      // Create transfer record
      const transfer = await tx.transfer.create({
        data: {
          userId: session.user.id,
          fromAccountId,
          toAccountId,
          amount: transferAmount.toString(),
          description,
          date: new Date(),
        },
      });

      return {
        transfer,
        fromAccount: updatedFromAccount,
        toAccount: updatedToAccount,
      };
    });

    return NextResponse.json(
      successResponse({
        transfer: result.transfer,
        message: `Transfer Rp ${transferAmount.toString()} berhasil`,
      }),
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    console.error("Transfer error:", error);
    return NextResponse.json(
      errorResponse("Gagal melakukan transfer"),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
