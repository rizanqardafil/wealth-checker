import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan password diperlukan" },
        { status: 400 }
      );
    }

    // Simple mock validation (in production, check against database)
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    // Mock successful login
    const user = {
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      email: email,
      name: email.split("@")[0],
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          user,
          message: "Login berhasil",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Login gagal. Coba lagi." },
      { status: 500 }
    );
  }
}
