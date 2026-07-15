import { NextRequest, NextResponse } from "next/server";

const DEFAULT_MAX_JSON_BYTES = 32 * 1024;

export function validateJsonRequest(
  request: NextRequest,
  maxBytes = DEFAULT_MAX_JSON_BYTES,
): NextResponse | null {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return NextResponse.json(
      { message: "Content-Type must be application/json." },
      { status: 415 },
    );
  }

  const rawContentLength = request.headers.get("content-length");
  if (rawContentLength) {
    const contentLength = Number.parseInt(rawContentLength, 10);
    if (!Number.isFinite(contentLength) || contentLength < 0) {
      return NextResponse.json(
        { message: "Invalid Content-Length header." },
        { status: 400 },
      );
    }
    if (contentLength > maxBytes) {
      return NextResponse.json(
        { message: "Request body is too large." },
        { status: 413 },
      );
    }
  }

  return null;
}
