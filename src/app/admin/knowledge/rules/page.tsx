import Link from "next/link";
import { addRuleSourceAction, updateRuleAction, verifyRuleAction } from "@/lib/actions/knowledge";
import { getEditorContext, RULE_STATUS_LABEL, SOURCE_STATUS_LABEL, type RuleRow, type RuleSourceRow, type SourceRow } from "@/lib/knowledge/admin";
import { Notice, Pill, formatDate, ruleTone, sourceTone } from "@/components/knowledge/admin-ui";
import { cn } from "@/lib/utils";

const REGIONS: Record<string, string> = {
  schengen: "Shengen",
  europe_other: "Shengendan tashqari Yevropa",
  americas_oceania: "AQSh, Kanada, Avstraliya, Yangi Zelandiya",
  asia_middle_east: "Osiyo va Yaqin Sharq",
  general: "Umumiy",
};

export default async function RulesAdminPage({
  searchParams,
}: {
  searchParams: { ok?: string; error?: string; status?: string; region?: string; country?: string };
}) {
  const { supabase, isEditor } = await getEditorContext();
  if (!supabase) return null;

  let query = supabase.from("kb_country_rules").select("*").order("region").order("country_name").order("topic");
  if (searchParams.status === "due") query = query.or(`next_review_at.is.null,next_review_at.lt.${new Date().toISOString()}`).neq("status", "outdated");
  else if (searchParams.status) query = query.eq("status", searchParams.status);
  if (searchParams.region) query = query.eq("region", searchParams.region);
  if (searchParams.country) query = query.eq("country_code", searchParams.country.toUpperCase());

  const [{ data: rules }, { data: links }, { data: sources }] = await Promise.all([
    query.returns<RuleRow[]>(),
    supabase.from("kb_rule_sources").select("rule_id, source_id").returns<RuleSourceRow[]>(),
    supabase.from("kb_sources").select("id, title, url, check_status, last_checked_at").returns<Pick<SourceRow, "id" | "title" | "url" | "check_status" | "last_checked_at">[]>(),
  ]);
  const sourceById = new Map((sources ?? []).map((s) => [s.id, s]));
  const sourcesByRule = new Map<string, NonNullable<typeof sources>>();
  for (const l of links ?? []) {
    const s = sourceById.get(l.source_id);
    if (s) sourcesByRule.set(l.rule_id, [...(sourcesByRule.get(l.rule_id) ?? []), s]);
  }

  const filters = [
    { label: "Hammasi", href: "/admin/knowledge/rules" },
    { label: "Muddati kelgan", href: "?status=due" },
    { label: "Qayta ko‘rish kerak", href: "?status=needs_review" },
    { label: "Tasdiqlanmagan", href: "?status=unverified" },
    { label: "Tasdiqlangan", href: "?status=verified" },
  ];
  const now = Date.now();

  return (
    <>
      <Notice ok={searchParams.ok} error={searchParams.error} />
      <h2 className="font-display text-display-md text-ink-950">Mamlakatlar bo‘yicha viza qoidalari</h2>
      <p className="mt-1 max-w-3xl text-body-sm text-ink-600">
        Kitobdan so‘zma-so‘z olingan qoidalar. Rasmiy manba sahifasi o‘zgarsa, unga bog‘liq qoidalar avtomatik “Qayta ko‘rish kerak” holatiga o‘tadi.
        Rasmiy sahifani o‘qib, matn hali to‘g‘ri bo‘lsa “Tasdiqlash”ni bosing; o‘zgargan bo‘lsa, matnni yangilang.
      </p>
      <nav className="mt-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link key={f.label} href={f.href} className="rounded-pill border border-surface-border bg-surface px-3 py-1.5 text-body-sm font-medium text-ink-700 hover:border-brand-300">
            {f.label}
          </Link>
        ))}
        {Object.entries(REGIONS).map(([key, label]) => (
          <Link key={key} href={`?region=${key}`} className="rounded-pill px-3 py-1.5 text-body-sm text-ink-600 hover:bg-surface-muted">
            {label}
          </Link>
        ))}
      </nav>

      <p className="mt-4 text-body-sm text-ink-500">{rules?.length ?? 0} ta qoida</p>
      <ul className="mt-2 space-y-3">
        {(rules ?? []).map((r) => {
          const due = !r.next_review_at || new Date(r.next_review_at).getTime() < now;
          const ruleSources = sourcesByRule.get(r.id) ?? [];
          return (
            <li key={r.id} className="card p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`?country=${r.country_code}`} className="font-semibold text-ink-950 hover:text-brand-700">
                  {r.country_name} <span className="text-ink-400">({r.country_code})</span>
                </Link>
                <span className="text-ink-300">·</span>
                <span className="text-body-sm font-medium text-ink-700">{r.topic}</span>
                <Pill tone={ruleTone(r.status)}>{RULE_STATUS_LABEL[r.status] ?? r.status}</Pill>
                {r.volatility === "high" ? <Pill tone="blue">tez o‘zgaruvchan</Pill> : null}
                {due && r.status !== "outdated" ? <Pill tone="amber">tekshiruv muddati kelgan</Pill> : null}
              </div>
              <p className="mt-2 whitespace-pre-line text-body-sm text-ink-800">{r.rule_text}</p>
              <p className="mt-2 text-caption text-ink-500">
                Kitob sanasi: {r.as_of ?? "—"} · Oxirgi tasdiq: {formatDate(r.last_verified_at)} · Keyingi tekshiruv: {formatDate(r.next_review_at)}
                {r.review_note ? ` · Izoh: ${r.review_note}` : ""}
              </p>
              <ul className="mt-2 space-y-1">
                {ruleSources.length === 0 ? (
                  <li className="text-caption text-amber-800 dark:text-amber-300">Rasmiy manba biriktirilmagan.</li>
                ) : (
                  ruleSources.map((s) => (
                    <li key={s.id} className="flex flex-wrap items-center gap-2 text-caption">
                      <Pill tone={sourceTone(s.check_status)}>{SOURCE_STATUS_LABEL[s.check_status] ?? s.check_status}</Pill>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="break-all text-brand-700 underline underline-offset-2">
                        {s.title}
                      </a>
                    </li>
                  ))
                )}
                {r.source_match === "inferred" && ruleSources.length > 0 ? (
                  <li className="text-caption text-ink-500">Manbalar bob ro‘yxatidan mamlakat nomi bo‘yicha avtomatik bog‘langan — tekshiring.</li>
                ) : null}
              </ul>

              {isEditor ? (
                <div className="mt-3 flex flex-wrap items-start gap-3">
                  <form action={verifyRuleAction} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="return_to" value="/admin/knowledge/rules" />
                    <input name="review_note" placeholder="Izoh (ixtiyoriy)" className="input h-9 w-56 py-1 text-body-sm" />
                    <button type="submit" className="btn btn-secondary btn-sm">Rasmiy manba bilan tasdiqlash</button>
                  </form>
                  <details className="w-full">
                    <summary className="cursor-pointer text-body-sm font-medium text-ink-600">Tahrirlash / manba qo‘shish</summary>
                    <form action={updateRuleAction} className="mt-3 grid gap-3 md:grid-cols-4">
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="return_to" value="/admin/knowledge/rules" />
                      <input name="topic" defaultValue={r.topic} className="input md:col-span-2" />
                      <select name="volatility" defaultValue={r.volatility} className="input">
                        <option value="high">tez o‘zgaradi (30 kun)</option>
                        <option value="medium">o‘rtacha (90 kun)</option>
                        <option value="low">barqaror (180 kun)</option>
                      </select>
                      <select name="status" defaultValue={r.status} className="input">
                        {Object.entries(RULE_STATUS_LABEL).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                      <textarea name="rule_text" defaultValue={r.rule_text} rows={4} className={cn("input md:col-span-4", "text-body-sm")} />
                      <input name="review_note" defaultValue={r.review_note ?? ""} placeholder="Izoh" className="input md:col-span-3" />
                      <button type="submit" className="btn btn-primary btn-sm">Saqlash</button>
                    </form>
                    <form action={addRuleSourceAction} className="mt-3 grid gap-3 md:grid-cols-4">
                      <input type="hidden" name="rule_id" value={r.id} />
                      <input type="hidden" name="return_to" value="/admin/knowledge/rules" />
                      <input name="url" type="url" required placeholder="https://rasmiy-sahifa…" className="input md:col-span-2" />
                      <input name="title" placeholder="Manba nomi" className="input" />
                      <button type="submit" className="btn btn-secondary btn-sm">Manba biriktirish</button>
                    </form>
                  </details>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </>
  );
}
