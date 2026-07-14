import { NextResponse } from "next/server";

// POST /api/familiar/chat
// Handles a message exchange with the user's AI familiar.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { message } = body as { message?: string };

  // TODO: wire up to the Claude API and return the familiar's reply.
  return NextResponse.json({
    reply: `The familiar stirs but has not yet found its voice.${
      message ? ` (you said: "${message}")` : ""
    }`,
  });
}
