import Link from "next/link";
import { acknowledgeSourceAction, checkSourceNowAction } from "@/lib/actions/knowledge";
import { getEditorContext, SOURCE_STATUS_LABEL, type SourceRow } from "@/lib/knowledge/admin";
import { Notice, Pill, formatDate, sourceTone } from "@/components/knowledge/admin-ui";

export default async function SourcesAdminPage({ searchParams }: { searchParams: { ok?: string; error?: string; status?: string } }) {
  const { supabase, isEditor } = await getEditorContext();
  if (!supabase) return null;

  let query = supabase
    .from("kb_sources")
    .select("id, code, title, url, chapters, check_status, last_checked_at, last_changed_at, last_http_status, check_error")
    .order("code");
  if (searchParams.status) query = query.eq("check_status", searchParams.status);
  const [{ data: sources }, { data: links }] = await Promise.all([
    query.returns<SourceRow[]>(),
    supabase.from("kb_rule_sources").select("source_id").returns<{ source_id: string }[]>(),
  ]);
  const ruleCount = new Map<string, number>();
  for (const l of links ?? []) ruleCount.set(l.source_id, (ruleCount.get(l.source_id) ?? 0) + 1);

  return (
    <>
      <Notice ok={searchParams.ok} error={searchParams.error} />
      <h2 className="font-display text-display-md text-ink-950">Rasmiy manbalar monitoringi</h2>
      <p className="mt-1 max-w-3xl text-body-sm text-ink-600">
        Kitobdagi har bir rasmiy havola har hafta avtomatik ochiladi, sahifaning ko‘rinadigan matni solishtiriladi. Birinchi tekshiruv asos sifatida saqlanadi;
        keyingi farq “O‘zgargan” deb belgilanadi va shu manbaga tayangan mamlakat qoidalari qayta ko‘rib chiqishga yuboriladi.
      </p>
      <nav className="mt-4 flex flex-wrap gap-2">
        <Link href="/admin/knowledge/sources" className="rounded-pill border border-surface-border bg-surface px-3 py-1.5 text-body-sm font-medium text-ink-700">Hammasi</Link>
        {Object.entries(SOURCE_STATUS_LABEL).map(([k, v]) => (
          <Link key={k} href={`?status=${k}`} className="rounded-pill px-3 py-1.5 text-body-sm text-ink-600 hover:bg-surface-muted">{v}</Link>
        ))}
      </nav>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-body-sm">
          <thead className="bg-surface-tint text-caption uppercase tracking-[0.06em] text-ink-500">
            <tr>
              <th className="px-4 py-2.5">Manba</th>
              <th className="px-4 py-2.5">Holat</th>
              <th className="px-4 py-2.5">Tekshirilgan</th>
              <th className="px-4 py-2.5">Qoidalar</th>
              {isEditor ? <th className="px-4 py-2.5" /> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {(sources ?? []).map((s) => (
              <tr key={s.id} className="align-top">
                <td className="max-w-md px-4 py-3">
                  <p className="font-medium text-ink-900">
                    <span className="text-ink-400">{s.code}</span> {s.title}
                  </p>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="break-all text-caption text-brand-700 underline underline-offset-2">
                    {s.url}
                  </a>
                  {s.chapters.length ? <p className="text-caption text-ink-500">Boblar: {s.chapters.join(", ")}</p> : null}
                </td>
                <td className="px-4 py-3">
                  <Pill tone={sourceTone(s.check_status)}>{SOURCE_STATUS_LABEL[s.check_status] ?? s.check_status}</Pill>
                  {s.check_error ? <p className="mt-1 text-caption text-ink-500">{s.check_error}</p> : null}
                  {s.last_changed_at ? <p className="mt-1 text-caption text-ink-500">O‘zgargan: {formatDate(s.last_changed_at)}</p> : null}
                </td>
                <td className="px-4 py-3 text-ink-700">{formatDate(s.last_checked_at)}</td>
                <td className="px-4 py-3 tabular-nums text-ink-700">{ruleCount.get(s.id) ?? 0}</td>
                {isEditor ? (
                  <td className="space-y-2 px-4 py-3">
                    <form action={checkSourceNowAction}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="return_to" value="/admin/knowledge/sources" />
                      <button type="submit" className="btn btn-secondary btn-sm w-full">Hozir tekshirish</button>
                    </form>
                    {s.check_status === "changed" ? (
                      <form action={acknowledgeSourceAction}>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="return_to" value="/admin/knowledge/sources" />
                        <button type="submit" className="btn btn-ghost btn-sm w-full">Ko‘rib chiqildi</button>
                      </form>
                    ) : null}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
