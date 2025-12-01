import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const redirectUri = url.searchParams.get("redirect_uri");

  if (!redirectUri) {
    return new NextResponse("Missing redirect_uri", { status: 400 });
  }

  // Basic validation: only allow Chrome extension redirect URLs
  if (!redirectUri.startsWith("https://") || !redirectUri.includes("chromiumapp.org")) {
    return new NextResponse("Invalid redirect_uri", { status: 400 });
  }

  let extensionRedirectUrl: URL;
  try {
    extensionRedirectUrl = new URL(redirectUri);
  } catch {
    return new NextResponse("Invalid redirect_uri", { status: 400 });
  }

  const origin = url.origin;

  // After sign-in, Clerk should send the user to this URL,
  // which will then forward the JWT to the extension's redirect URL.
  const afterSignInUrl = new URL("/extension-auth/after-sign-in", origin);
  afterSignInUrl.searchParams.set("redirect_uri", extensionRedirectUrl.toString());

  const signInUrl = new URL("/sign-in", origin);
  signInUrl.searchParams.set("redirect_url", afterSignInUrl.toString());

  return NextResponse.redirect(signInUrl.toString());
}
