/**
 * Gold-foil card frame of the landing look: a lemon→gold gradient with a bright
 * top edge and a warm shadow. Add the radius and padding where it is used.
 * In a plain module so server components can read it as a string.
 */
export const GOLD_FOIL =
  "bg-gradient-to-br from-lemon-200 via-lemon-300 to-gold-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_22px_44px_-14px_rgba(222,186,10,0.7),0_6px_16px_-6px_rgba(222,186,10,0.45)] transition-[transform,box-shadow] duration-300 ease-premium hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_30px_56px_-14px_rgba(222,186,10,0.85),0_8px_20px_-6px_rgba(222,186,10,0.55)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_18px_40px_-16px_rgba(247,227,90,0.4)] dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_26px_52px_-16px_rgba(247,227,90,0.55)]";

/** The soft violet→lemon panel that holds a group of cards. */
export const VIOLET_LEMON_STAGE =
  "bg-gradient-to-br from-violet-100/80 via-surface/70 to-lemon-200/50 ring-1 ring-violet-200/70 dark:from-violet-100/60 dark:via-surface/40 dark:to-lemon-300/[0.06] dark:ring-white/10";
