import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ ok: true, version: "1", hora: new Date().toISOString() });
}
