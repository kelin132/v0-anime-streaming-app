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

  try {
    const res = await fetch(upstreamUrl, {
      headers: { Accept: "application/json" },
      // Cache upstream responses for 5 minutes.
      next: { revalidate: 300 },
    });

    const contentType = res.headers.get("content-type") || "application/json";
    const body = await res.text();

    return new NextResponse(body, {
      status: res.status,
      headers: { "content-type": contentType },
    });
  } catch (error) {
    console.error("[v0] Cinemind proxy error:", error);
    return NextResponse.json(
      { status: false, error: "Upstream request failed" },
      { status: 502 }
    );
  }
}
