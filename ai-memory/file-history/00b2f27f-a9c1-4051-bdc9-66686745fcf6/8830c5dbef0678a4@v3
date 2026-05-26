// Vercel Edge Middleware — IP-based rate limiting
// Runs on Vercel's edge network before any request reaches the app.
// Uses an in-memory sliding window per edge instance — lightweight first line
// of defence against bots and scraping without external dependencies.

export const config = {
  matcher: "/((?!.*\\.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map|webp|avif)).*)",
};

const WINDOW_MS = 60_000; // 1 minute sliding window

// Limits per IP per window
const LIMITS = {
  auth:    15,   // /auth — strict: login + signup attempts
  default: 200,  // everything else
};

// In-memory store keyed by "ip:bucket"
// Each edge instance has its own map; good enough to stop simple bots/scripts
const store = new Map<string, { count: number; resetAt: number }>();

function getLimit(pathname: string): { limit: number; bucket: string } {
  if (pathname.startsWith("/auth")) return { limit: LIMITS.auth, bucket: "auth" };
  return { limit: LIMITS.default, bucket: "default" };
}

export default function middleware(request: Request): Response | undefined {
  const url = new URL(request.url);
  const { limit, bucket } = getLimit(url.pathname);

  const ip =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown";

  const key = `${ip}:${bucket}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return undefined; // allow
  }

  entry.count++;
  if (entry.count > limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    // Structured log — visible in Vercel log drain and dashboard
    console.warn(JSON.stringify({
      level: "warn",
      event: "rate_limit_blocked",
      ip,
      bucket,
      path: url.pathname,
      count: entry.count,
      limit,
      retryAfter,
      ts: new Date().toISOString(),
    }));
    return new Response("Too Many Requests", {
      status: 429,
      headers: {
        "Content-Type": "text/plain",
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil(entry.resetAt / 1000)),
      },
    });
  }

  return undefined; // allow
}
