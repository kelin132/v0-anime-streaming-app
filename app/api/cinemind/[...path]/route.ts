import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE =
  process.env.NEXT_PUBLIC_CINEMIND_BASE_URL || "https://zstlab.cyou/api";
const API_KEY = process.env.NEXT_PUBLIC_CINEMIND_API_KEY || "Godszeal";

// Proxy requests to the Cinemind API from the server to avoid browser CORS
// restrictions and to keep the API key out of the client bundle.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const endpoint = path.join("/");

  // Forward all incoming query params, but always inject the server-side key.
  const search = new URLSearchParams(req.nextUrl.searchParams);
  search.set("apikey", API_KEY);

  const upstreamUrl = `${UPSTREAM_BASE}/${endpoint}?${search.toString()}`;

  // Abort slow upstream calls so a hanging/524 response never freezes the app.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(upstreamUrl, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
      // Only cache successful responses (set per-status below); never cache errors.
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") || "";
    const body = await res.text();

    // Upstream sometimes returns non-JSON error pages (e.g. "error code: 524").
    // Normalize those into a JSON error so the client can handle them cleanly.
    if (!res.ok || !contentType.includes("application/json")) {
      return NextResponse.json(
        {
          status: false,
          error: `Upstream returned ${res.status}`,
          detail: body.slice(0, 200),
        },
        { status: res.ok ? 502 : res.status }
      );
    }

    return new NextResponse(body, {
      status: res.status,
      headers: {
        "content-type": "application/json",
        // Cache good responses at the CDN for 5 min, serve stale while revalidating.
        "cache-control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    console.error("[v0] Cinemind proxy error:", error);
    return NextResponse.json(
      {
        status: false,
        error: aborted ? "Upstream request timed out" : "Upstream request failed",
      },
      { status: aborted ? 504 : 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
