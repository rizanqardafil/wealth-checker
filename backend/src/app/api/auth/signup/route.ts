import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";
import { SignupSchema } from "@/lib/validation";
import { successResponse, errorResponse, HTTP_STATUS } from "@/lib/response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = SignupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        errorResponse(validation.error.issues[0].message),
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const { email, password } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        errorResponse("Email sudah terdaftar"),
        { status: HTTP_STATUS.CONFLICT }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      successResponse({
        user,
        message: "Signup berhasil! Silakan login.",
      }),
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      errorResponse("Signup gagal. Silakan coba lagi."),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
