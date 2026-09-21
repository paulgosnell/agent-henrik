import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { MAINTENANCE_MESSAGE, MAINTENANCE_MODE } from "@/lib/maintenance";

// The only pages on this site that render with no Supabase call at all
// (verified: no import of lib/supabase/server or lib/supabase/client in
// any of these page.tsx files). Every other page, including "/", reads
// its content from Supabase, so it is rewritten to /maintenance below.
const STATIC_PAGES_EXEMPT_FROM_MAINTENANCE = [
  "/legal/terms",
  "/legal/data-protection",
  "/legal/imprint",
  "/about/story",
  "/about/booking-process",
  "/about/pricing-faq",
];

const STAGING_OFF_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Staging Unavailable</title>
  <style>
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: #000; color: #fff; font-family: system-ui, sans-serif; text-align: center; padding: 2rem; }
    h1 { font-weight: 300; font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #a0a0a0; font-size: 0.95rem; max-width: 28rem; line-height: 1.6; }
  </style>
</head>
<body>
  <div>
    <h1>Staging temporarily unavailable</h1>
    <p>This preview environment is offline. Contact P0STMAN to restore access.</p>
  </div>
</body>
</html>`;

export async function middleware(request: NextRequest) {
  if (process.env.STAGING_DISABLED === "true") {
    return new NextResponse(STAGING_OFF_HTML, {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const { pathname } = request.nextUrl;

  // Maintenance mode: the database is down, so never call Supabase.
  // Runs before the admin-auth check below, since that check itself
  // calls Supabase (supabase.auth.getUser()).
  if (MAINTENANCE_MODE) {
    if (pathname === "/maintenance" || STATIC_PAGES_EXEMPT_FROM_MAINTENANCE.includes(pathname)) {
      return NextResponse.next();
    }
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: MAINTENANCE_MESSAGE, maintenance: true },
        { status: 503, headers: { "Retry-After": "3600" } }
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = "/maintenance";
    url.search = "";
    return NextResponse.rewrite(url);
  }

  // Only protect /admin routes (except login)
  if (!pathname.startsWith("/admin") || pathname === "/admin/login") {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response = NextResponse.next({
              request: { headers: request.headers },
            });
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|ico|svg)$).*)"],
};
