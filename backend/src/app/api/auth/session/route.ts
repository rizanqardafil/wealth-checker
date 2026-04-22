import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, HTTP_STATUS } from "@/lib/response";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        errorResponse("Tidak ada session aktif"),
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    return NextResponse.json(
      successResponse({
        user: {
          id: session.user.id,
          email: session.user.email,
        },
      })
    );
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      errorResponse("Gagal mengambil session"),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
