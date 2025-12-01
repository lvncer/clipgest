import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const redirectUri = url.searchParams.get("redirect_uri");

  if (!redirectUri) {
    return new NextResponse("Missing redirect_uri", { status: 400 });
  }

  if (!redirectUri.startsWith("https://") || !redirectUri.includes("chromiumapp.org")) {
    return new NextResponse("Invalid redirect_uri", { status: 400 });
  }

  let redirectUrl: URL;
  try {
    redirectUrl = new URL(redirectUri);
  } catch {
    return new NextResponse("Invalid redirect_uri", { status: 400 });
  }

  const { getToken, userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const token = await getToken();

  if (!token) {
    return new NextResponse("Failed to obtain token", { status: 500 });
  }

  redirectUrl.searchParams.set("jwt", token);

  return NextResponse.redirect(redirectUrl.toString());
}
