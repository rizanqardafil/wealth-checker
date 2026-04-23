import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, password } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Semua field diperlukan" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password minimal 8 karakter" },
        { status: 400 }
      );
    }

    // Mock successful signup (in production, save to database)
    const user = {
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      email: email,
      name: fullName,
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          user,
          message: "Signup berhasil. Silakan login.",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Signup gagal. Coba lagi." },
      { status: 500 }
    );
  }
}
