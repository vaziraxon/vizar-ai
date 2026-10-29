"use client";

import { useCallback, useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PenLine, Star, X } from "lucide-react";
import { deleteMyReviewAction, getMyReviewAction, submitMyReviewAction, type MyReviewState } from "@/lib/actions/my-review";
import { useSite } from "@/lib/i18n/site";
import { useLanguage } from "@/lib/language-context";
import { DESTINATIONS, TOOL_BY_ID } from "@/lib/site/registry";
import { REVIEW_SPAM, REVIEWABLE_TOOLS } from "@/lib/site/testimonials";
import { cn } from "@/lib/utils";

/** Where sign-in sends the customer back: the landing page reopens this dialog. */
const RETURN_TO = "/?review=1";
const EMPTY = { name: "", destination: "", tool: "", rating: 0, quote: "", consent: false };

/**
 * "Write a review" button + dialog. Free for any signed-in customer, one
 * review per account (editable, deletable); it goes live at once and editors
 * can hide it in /admin/testimonials.
 */
export function ReviewComposer({ className }: { className?: string }) {
  const site = useSite();
  const t = site.home.testimonials;
  const f = t.form;
  const { language } = useLanguage();
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<MyReviewState | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const set = (patch: Partial<typeof EMPTY>) => setForm((prev) => ({ ...prev, ...patch }));

  const open = useCallback(() => {
    dialog.current?.showModal();
    setStatus(null);
    setState(null);
    getMyReviewAction()
      .then((s) => {
        setState(s);
        if (!s.signedIn) return;
        const r = s.review;
        setForm(
          r
            ? { name: r.name, destination: r.destination, tool: r.tool, rating: r.rating, quote: r.quote, consent: true }
            : { ...EMPTY, name: s.suggestedName }
        );
      })
      .catch(() => setState({ signedIn: false }));
  }, []);

  // Back from sign-in (/?review=1): reopen the dialog and tidy the address bar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("review") !== "1") return;
    params.delete("review");
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
    open();
  }, [open]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (REVIEW_SPAM.test(form.quote) || REVIEW_SPAM.test(form.name)) {
      setStatus({ tone: "error", text: f.errors.links });
      return;
    }
    startTransition(async () => {
      const res = await submitMyReviewAction({ ...form, locale: language });
      if (!res.ok) {
        setStatus({ tone: "error", text: f.errors[res.error] });
        return;
      }
      setStatus({ tone: "ok", text: res.published ? f.sent : f.hidden });
      setState((s) => (s?.signedIn ? { ...s, review: { ...form, published: res.published } } : s));
      router.refresh();
    });
  };

  const remove = () => {
    if (!window.confirm(`${f.remove}?`)) return;
    startTransition(async () => {
      const res = await deleteMyReviewAction();
      if (!res.ok) {
        setStatus({ tone: "error", text: f.errors.failed });
        return;
      }
      setStatus({ tone: "ok", text: f.removed });
      setState((s) => (s?.signedIn ? { ...s, review: null } : s));
      setForm((prev) => ({ ...EMPTY, name: prev.name }));
      router.refresh();
    });
  };

  const field = "input";
  const editing = state?.signedIn && state.review;

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={cn(
          "btn btn-charcoal btn-sheen h-12 gap-2 px-6 text-body-sm hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-16px_rgba(113,56,236,0.55)]",
          className
        )}
      >
        <PenLine size={16} strokeWidth={2.2} />
        {t.write}
      </button>

      <dialog
        ref={dialog}
        aria-labelledby="review-dialog-title"
        className="m-auto w-[min(92vw,560px)] rounded-[28px] border border-surface-border bg-surface p-0 text-ink-900 shadow-float backdrop:bg-night/50 backdrop:backdrop-blur-sm"
      >
        <div className="max-h-[88vh] overflow-y-auto p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <h2 id="review-dialog-title" className="font-luxe text-[28px] font-semibold leading-tight tracking-[-0.01em] text-ink-950">
              {f.title}
            </h2>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label={f.close}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-surface-border text-ink-700 hover:bg-surface-tint"
            >
              <X size={18} />
            </button>
          </div>
          <p className="mt-2 text-body-sm text-ink-600">{f.note}</p>

          {status ? (
            <p
              role="status"
              className={cn(
                "mt-5 rounded-2xl border px-4 py-3 text-body-sm",
                status.tone === "ok"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200"
                  : "border-red-200 bg-red-50 text-red-800 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200"
              )}
            >
              {status.text}
            </p>
          ) : null}

          {state === null ? (
            <p className="mt-6 text-body-sm text-ink-500">{f.loading}</p>
          ) : !state.signedIn ? (
            <div className="mt-6 rounded-2xl bg-surface-tint p-5">
              <p className="font-semibold text-ink-950">{f.signInTitle}</p>
              <p className="mt-1 text-body-sm text-ink-600">{f.signInText}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={`/login?next=${encodeURIComponent(RETURN_TO)}`} className="btn btn-charcoal h-11 px-6 text-body-sm">
                  {f.signIn}
                </Link>
                <Link href="/register" className="btn h-11 border border-surface-border bg-surface px-6 text-body-sm text-ink-900 hover:bg-surface-tint">
                  {f.register}
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-body-sm font-semibold text-ink-900">{f.name}</span>
                <input value={form.name} onChange={(e) => set({ name: e.target.value })} required minLength={2} maxLength={40} className={field} />
                <span className="mt-1 block text-caption text-ink-500">{f.nameHint}</span>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-body-sm font-semibold text-ink-900">{f.destination}</span>
                  <select value={form.destination} onChange={(e) => set({ destination: e.target.value })} required className={field}>
                    <option value="" disabled>
                      {f.choose}
                    </option>
                    {DESTINATIONS.map((d) => (
                      <option key={d.slug} value={d.slug}>
                        {site.destinations[d.slug].name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-body-sm font-semibold text-ink-900">{f.tool}</span>
                  <select value={form.tool} onChange={(e) => set({ tool: e.target.value })} required className={field}>
                    <option value="" disabled>
                      {f.choose}
                    </option>
                    {REVIEWABLE_TOOLS.map((id) => (
                      <option key={id} value={id}>
                        {TOOL_BY_ID[id].emoji} {site.tools[id].name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <fieldset>
                <legend className="mb-1.5 text-body-sm font-semibold text-ink-900">{f.rating}</legend>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <label key={n} className="cursor-pointer rounded-lg p-0.5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-violet-400">
                      <input type="radio" name="rating" value={n} checked={form.rating === n} onChange={() => set({ rating: n })} required className="sr-only" />
                      <Star size={30} className={cn("transition-colors", n <= form.rating ? "fill-gold-300 text-gold-400" : "text-ink-300")} />
                      <span className="sr-only">{n}/5</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="block">
                <span className="mb-1.5 flex items-baseline justify-between gap-3 text-body-sm font-semibold text-ink-900">
                  {f.quote}
                  <span className="text-caption font-normal tabular-nums text-ink-500">{form.quote.trim().length}/600</span>
                </span>
                <textarea
                  value={form.quote}
                  onChange={(e) => set({ quote: e.target.value })}
                  required
                  minLength={10}
                  maxLength={600}
                  rows={4}
                  className={cn(field, "min-h-[112px] py-2.5")}
                />
                <span className="mt-1 block text-caption text-ink-500">{f.quoteHint}</span>
              </label>
              <label className="flex items-start gap-3 text-body-sm text-ink-800">
                <input type="checkbox" checked={form.consent} onChange={(e) => set({ consent: e.target.checked })} required className="mt-1 h-4 w-4 shrink-0" />
                {f.consent}
              </label>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button type="submit" disabled={pending} className="btn btn-charcoal h-12 px-7 text-body-sm disabled:opacity-60">
                  {editing ? f.save : f.submit}
                </button>
                {editing ? (
                  <button type="button" onClick={remove} disabled={pending} className="text-body-sm font-medium text-red-700 underline-offset-4 hover:underline dark:text-red-300">
                    {f.remove}
                  </button>
                ) : null}
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
