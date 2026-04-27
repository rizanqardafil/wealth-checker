import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateTransactionSchema, TransactionQuerySchema } from "@/lib/validation";
import { successResponse, errorResponse, HTTP_STATUS } from "@/lib/response";
import Decimal from "decimal.js";

/**
 * GET /api/transactions
 * List transactions with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // For MVP Phase 1: Allow requests without session (use test userId)
    const userId = session?.user?.id || "test-user-id";

    if (!userId) {
      return NextResponse.json(
        errorResponse("Unauthorized"),
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get("accountId") || undefined;
    const type = searchParams.get("type") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId,
      ...(accountId && { accountId }),
      ...(type && { type }),
      ...(startDate || endDate) && {
        date: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        },
      },
    };

    const [transactions, count] = await Promise.all([
      prisma.transaction.findMany({
        where,
        select: {
          id: true,
          accountId: true,
          type: true,
          category: true,
          amount: true,
          description: true,
          date: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json(
      successResponse({
        transactions,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit),
        },
      })
    );
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      errorResponse("Gagal mengambil transaksi"),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * POST /api/transactions
 * Create new transaction
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // For MVP Phase 1: Allow requests without session (use test userId)
    const userId = session?.user?.id || "test-user-id";

    if (!userId) {
      return NextResponse.json(
        errorResponse("Unauthorized"),
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = CreateTransactionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        errorResponse(validation.error.issues[0].message),
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const { accountId, type, category, amount, description, date } = validation.data;

    // Check if account exists and belongs to user
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId,
      },
    });

    if (!account) {
      return NextResponse.json(
        errorResponse("Akun tidak ditemukan"),
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    const transactionAmount = new Decimal(amount);
    const currentBalance = new Decimal(account.balance);

    // Calculate new balance
    let newBalance: Decimal;
    if (type === "INCOME" || type === "ASSET") {
      newBalance = currentBalance.plus(transactionAmount);
    } else {
      // EXPENSE or DEBT
      newBalance = currentBalance.minus(transactionAmount);
    }

    // Create transaction and update account balance
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId,
          accountId,
          type,
          category,
          amount: transactionAmount.toString(),
          description,
          date: new Date(date),
        },
      });

      // Update account balance
      await tx.account.update({
        where: { id: accountId },
        data: { balance: newBalance.toString() },
      });

      return transaction;
    });

    return NextResponse.json(
      successResponse({
        transaction: result,
        message: "Transaksi berhasil dibuat",
      }),
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    console.error("Create transaction error:", error);
    return NextResponse.json(
      errorResponse("Gagal membuat transaksi"),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
