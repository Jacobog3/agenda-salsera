import { NextRequest, NextResponse } from "next/server";

export function requireAdmin(request: NextRequest | Request): NextResponse | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const hasSession = cookieHeader.includes("admin_session=authenticated");
  if (!hasSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
