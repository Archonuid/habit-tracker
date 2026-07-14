import { NextResponse } from "next/server";

// POST /api/xp/update
// Awards XP for completed quests and reports the new total/level.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { amount = 0 } = body as { amount?: number };

  // TODO: persist XP changes and compute level progression.
  return NextResponse.json({
    awarded: amount,
    total: amount,
    level: 1,
  });
}
