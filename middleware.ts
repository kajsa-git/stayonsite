import { auth } from "@/lib/crm/auth";
import { NextResponse } from "next/server";

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/crm")) return NextResponse.next();

  if (pathname === "/crm/login" || pathname === "/crm/pending") return NextResponse.next();

  if (!req.auth) {
    return NextResponse.redirect(new URL("/crm/login", req.url));
  }

  const user = req.auth.user as typeof req.auth.user & { approved?: boolean };
  if (!user?.approved) {
    return NextResponse.redirect(new URL("/crm/pending", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/crm/:path*", "/api/crm/:path*"],
};
