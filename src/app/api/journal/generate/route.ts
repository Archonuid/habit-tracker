import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { buildSystemPrompt, generateLore, type LoreResult } from "@/app/lib/lore";

const MAX_BODY = 4000;
const MODEL = "claude-haiku-4-5";

// POST /api/journal/generate
// Turns a raw journal entry into archetype-voiced lore, stores it, and refreshes
// the hero's summarized lore intro. Uses Claude when ANTHROPIC_API_KEY is set;
// otherwise (or on any API failure) falls back to the deterministic template.
export async function POST(request: Request) {
  const { body } = (await request.json().catch(() => ({}))) as { body?: string };
  const entry = (body ?? "").trim();
  if (!entry) {
    return NextResponse.json({ error: "Write something first." }, { status: 400 });
  }
  if (entry.length > MAX_BODY) {
    return NextResponse.json(
      { error: `Keep entries under ${MAX_BODY} characters.` },
      { status: 400 }
    );
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a context where cookies can't be set — safe to ignore.
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  // Load the hero's archetype voice + interests for flavor.
  const [profileRes, interestsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("archetypes(name)")
      .eq("id", user.id)
      .single(),
    supabase.from("user_interests").select("tag").eq("user_id", user.id),
  ]);

  const archetypeName =
    (profileRes.data?.archetypes as unknown as { name: string } | null)?.name ??
    null;
  const interests = (interestsRes.data ?? []).map((r) => r.tag as string);

  const { fragment, intro } = await produceLore(entry, archetypeName, interests);

  const [insertRes] = await Promise.all([
    supabase
      .from("journal_entries")
      .insert({ user_id: user.id, body: entry, lore: fragment })
      .select("id, user_id, body, lore, created_at")
      .single(),
    supabase.from("profiles").update({ lore_intro: intro }).eq("id", user.id),
  ]);

  if (insertRes.error) {
    return NextResponse.json({ error: insertRes.error.message }, { status: 500 });
  }

  return NextResponse.json({ entry: insertRes.data, intro });
}

/** Claude when a key is present, deterministic template otherwise or on failure. */
async function produceLore(
  entry: string,
  archetypeName: string | null,
  interests: string[]
): Promise<LoreResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (key) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1024,
          system: buildSystemPrompt(archetypeName, interests),
          messages: [{ role: "user", content: entry }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text: string =
          data?.content?.find((b: { type: string }) => b.type === "text")?.text ??
          "";
        const parsed = JSON.parse(text) as Partial<LoreResult>;
        if (parsed.fragment && parsed.intro) {
          return { fragment: parsed.fragment, intro: parsed.intro };
        }
      }
    } catch {
      // Fall through to the template engine below.
    }
  }
  return generateLore(entry, archetypeName, interests);
}
