"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { checklistKey, type ChecklistSaved, type VisaKind } from "@/lib/dashboard/checklist-template";
import { docCheckKey, type Answer } from "@/lib/document-check/score";
import { pickPrepSource } from "@/lib/dashboard/prep-merge";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Keeps the personal checklist and the document readiness test answers in
 * step with the signed-in account (table public.prep_states, RLS: own rows
 * only), so they follow the user to another device. The browser copy stays
 * the working copy: pages read and write localStorage as before, call
 * markPrepChanged() after a change, and pullPrepState() when they open.
 * Signed out or without Supabase, everything stays local and these do nothing.
 */

type AnyClient = SupabaseClient<any, any, any>;
type Row = {
  checklist_done: string[];
  checklist_custom: ChecklistSaved["custom"];
  test_answers: Record<string, Answer>;
  updated_at: string;
};

const metaKey = (dest: string, visa: string) => `vizar-prep-sync:${dest}:${visa}`;
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage blocked: stays in memory */
  }
}

async function signedInClient(): Promise<{ supabase: AnyClient; userId: string } | null> {
  // Demo mode (no Supabase): stay quiet and local
  if (!isSupabaseConfigured()) return null;
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient() as AnyClient | null;
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user.id;
  return userId ? { supabase, userId } : null;
}

async function push(dest: string, visa: VisaKind) {
  const auth = await signedInClient();
  if (!auth) return;
  const saved = read<ChecklistSaved>(checklistKey(dest, visa), { done: [], custom: [] });
  const answers = read<Record<string, Answer>>(docCheckKey(dest, visa), {});
  const changedAt = read<{ t: number } | null>(metaKey(dest, visa), null)?.t ?? Date.now();
  await auth.supabase.from("prep_states").upsert(
    {
      user_id: auth.userId,
      destination: dest,
      visa_kind: visa,
      checklist_done: saved.done.slice(0, 200),
      checklist_custom: saved.custom,
      test_answers: answers,
      updated_at: new Date(changedAt).toISOString(),
    },
    { onConflict: "user_id,destination,visa_kind" }
  );
}

/** Call after changing the checklist or test answers in localStorage; saves to the account shortly after. */
export function markPrepChanged(dest: string, visa: VisaKind) {
  write(metaKey(dest, visa), { t: Date.now() });
  const id = `${dest}:${visa}`;
  clearTimeout(timers.get(id));
  timers.set(
    id,
    setTimeout(() => {
      timers.delete(id);
      void push(dest, visa).catch(() => undefined);
    }, 800)
  );
}

/**
 * When a page opens: if the account's copy is newer, it replaces this
 * browser's copy and is returned so the page can show it; if this browser's
 * copy is newer, it is saved to the account. Returns null when nothing changes.
 */
export async function pullPrepState(
  dest: string,
  visa: VisaKind
): Promise<{ checklist: ChecklistSaved; answers: Record<string, Answer> } | null> {
  try {
    const auth = await signedInClient();
    if (!auth) return null;
    const { data } = await auth.supabase
      .from("prep_states")
      .select("checklist_done, checklist_custom, test_answers, updated_at")
      .eq("destination", dest)
      .eq("visa_kind", visa)
      .maybeSingle<Row>();
    const local = read<{ t: number } | null>(metaKey(dest, visa), null)?.t ?? null;
    const server = data ? Date.parse(data.updated_at) : null;
    const source = pickPrepSource(local, server);
    if (source === "local") {
      await push(dest, visa);
      return null;
    }
    if (source !== "server" || !data) return null;
    const checklist: ChecklistSaved = { done: data.checklist_done ?? [], custom: data.checklist_custom ?? [] };
    const answers = data.test_answers ?? {};
    write(checklistKey(dest, visa), checklist);
    write(docCheckKey(dest, visa), answers);
    write(metaKey(dest, visa), { t: server });
    return { checklist, answers };
  } catch {
    return null;
  }
}
