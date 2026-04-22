import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/hash";
import { successResponse, errorResponse, HTTP_STATUS } from "@/lib/response";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = LoginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        errorResponse("Email dan password diperlukan"),
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        errorResponse("User tidak ditemukan"),
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        errorResponse("Password salah"),
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    return NextResponse.json(
      successResponse({
        user: {
          id: user.id,
          email: user.email,
        },
        message: "Login berhasil",
      })
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      errorResponse("Login gagal"),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
