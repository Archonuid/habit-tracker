import { NextResponse } from "next/server";

// POST /api/journal/generate
// Turns the day's completed quests into a narrative journal entry.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { entries } = body as { entries?: unknown[] };

  // TODO: generate a lore-styled journal entry from the day's activity.
  return NextResponse.json({
    entry: "Your chronicle awaits its first verse.",
    sourceCount: Array.isArray(entries) ? entries.length : 0,
  });
}
