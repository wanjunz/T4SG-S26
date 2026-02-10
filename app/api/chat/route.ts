/* eslint-disable */
import { NextResponse } from "next/server";
import { generateResponse } from "@/lib/services/species-chat";

export async function POST(req: Request) {
  // validate body, message must be string
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const msg = (body as any)?.message;

  if (typeof msg !== "string" || msg.trim().length === 0) {
    return NextResponse.json({ error: "Missing or invalid 'message'." }, { status: 400 });
  }

  try {
    const response = await generateResponse(msg);
    return NextResponse.json({ response }, { status: 200 });
  } catch {
    // upstream/provider issues
    return NextResponse.json({ error: "Upstream provider error." }, { status: 502 });
  }
}
