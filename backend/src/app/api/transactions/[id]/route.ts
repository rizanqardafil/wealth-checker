import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UpdateTransactionSchema } from "@/lib/validation";
import { successResponse, errorResponse, HTTP_STATUS } from "@/lib/response";
import Decimal from "decimal.js";

/**
 * PUT /api/transactions/:id
 * Update transaction
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

    // Get existing transaction
    const existingTx = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: { account: true },
    });

    if (!existingTx) {
      return NextResponse.json(
        errorResponse("Transaksi tidak ditemukan"),
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = UpdateTransactionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        errorResponse(validation.error.issues[0].message),
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const {
      type: newType,
      category,
      amount: newAmount,
      description,
      date,
    } = validation.data;

    // If amount or type changed, recalculate balance
    let balanceAdjustment: Decimal | null = null;

    if (newAmount || newType) {
      const oldAmount = new Decimal(existingTx.amount);
      const oldType = existingTx.type;
      const actualNewAmount = newAmount ? new Decimal(newAmount) : oldAmount;
      const actualNewType = newType || oldType;

      // Calculate old impact
      let oldImpact: Decimal;
      if (oldType === "INCOME" || oldType === "ASSET") {
        oldImpact = oldAmount;
      } else {
        oldImpact = oldAmount.negated();
      }

      // Calculate new impact
      let newImpact: Decimal;
      if (actualNewType === "INCOME" || actualNewType === "ASSET") {
        newImpact = actualNewAmount;
      } else {
        newImpact = actualNewAmount.negated();
      }

      // Calculate adjustment (remove old, add new)
      balanceAdjustment = newImpact.minus(oldImpact);
    }

    // Update transaction and balance
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id: params.id },
        data: {
          ...(newType && { type: newType }),
          ...(category && { category }),
          ...(newAmount && { amount: newAmount }),
          ...(description !== undefined && { description }),
          ...(date && { date: new Date(date) }),
        },
      });

      // Update account balance if needed
      if (balanceAdjustment && !balanceAdjustment.isZero()) {
        const currentBalance = new Decimal(existingTx.account.balance);
        const newBalance = currentBalance.plus(balanceAdjustment);

        await tx.account.update({
          where: { id: existingTx.accountId },
          data: { balance: newBalance.toString() },
        });
      }

      return updated;
    });

    return NextResponse.json(
      successResponse({
        transaction: result,
        message: "Transaksi berhasil diperbarui",
      })
    );
  } catch (error) {
    console.error("Update transaction error:", error);
    return NextResponse.json(
      errorResponse("Gagal memperbarui transaksi"),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * DELETE /api/transactions/:id
 * Delete transaction
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

    // Get transaction
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: { account: true },
    });

    if (!transaction) {
      return NextResponse.json(
        errorResponse("Transaksi tidak ditemukan"),
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Calculate reverse impact on balance
    const amount = new Decimal(transaction.amount);
    let reverseImpact: Decimal;

    if (transaction.type === "INCOME" || transaction.type === "ASSET") {
      reverseImpact = amount.negated();
    } else {
      reverseImpact = amount;
    }

    const currentBalance = new Decimal(transaction.account.balance);
    const newBalance = currentBalance.plus(reverseImpact);

    // Delete transaction and update balance
    await prisma.$transaction(async (tx) => {
      await tx.transaction.delete({ where: { id: params.id } });

      await tx.account.update({
        where: { id: transaction.accountId },
        data: { balance: newBalance.toString() },
      });
    });

    return NextResponse.json(
      successResponse({
        message: "Transaksi berhasil dihapus",
      })
    );
  } catch (error) {
    console.error("Delete transaction error:", error);
    return NextResponse.json(
      errorResponse("Gagal menghapus transaksi"),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
