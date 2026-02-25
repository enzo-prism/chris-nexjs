import { NextResponse } from "next/server";

export function jsonError(status: number, message: string): Response {
  return NextResponse.json({ message }, { status });
}

export function jsonOk<T>(payload: T, status = 200): Response {
  return NextResponse.json(payload, { status });
}
