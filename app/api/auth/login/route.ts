import { NextRequest, NextResponse } from "next/server";
import { signSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/document";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    const expectedEmail = process.env.ADMIN_EMAIL || "admin@digitallibrary.local";
    const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (
      email.toLowerCase() === expectedEmail.toLowerCase() &&
      password === expectedPassword
    ) {
      const user = {
        id: "admin-system",
        email: expectedEmail,
        name: "System Administrator",
        role: "ADMIN" as const,
      };

      const token = await signSession({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      const response = NextResponse.json({
        success: true,
        user,
      });

      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
