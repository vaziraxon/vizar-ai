import type { DestinationSlug, PopularCountry, ToolId } from "@/lib/site/registry";

type Three<T> = [T, T, T];
type Step = { title: string; desc: string };
type QA = { q: string; a: string };

/**
 * Typed copy for the public site. Every language file must satisfy this
 * shape, so a missing translation is a compile error rather than a blank.
 */
export interface SiteContent {
  nav: {
    home: string;
    tools: string;
    destinations: string;
    howItWorks: string;
    /** /knowledge-base — the premium visa library */
    library: string;
    pricing: string;
    signIn: string;
    getStarted: string;
    language: string;
    openMenu: string;
    closeMenu: string;
    homeAria: string;
    skip: string;
    toolsGroupPrepare: string;
    toolsGroupApply: string;
    allTools: string;
    allDestinations: string;
    featuredEyebrow: string;
    featuredTitle: string;
    featuredText: string;
    featuredCta: string;
    destinationsNote: string;
    themeToDark: string;
    themeToLight: string;
  };
  status: { available: string; beta: string; soon: string };
  common: {
    demo: string;
    demoData: string;
    notGuaranteed: string;
    ready: string;
    review: string;
    missing: string;
    current: string;
    learnMore: string;
    open: string;
    prepared: string;
  };
  tools: Record<
    ToolId,
    {
      name: string;
      menu: string;
      tagline: string;
      desc: string;
      benefits: Three<string>;
      cta: string;
      steps: Three<Step>;
    }
  >;
  destinations: Record<
    DestinationSlug,
    { name: string; region: string; menu: string; intro: string; visaTypes: string[] }
  >;
  countries: Record<PopularCountry, string>;
  home: {
    hero: {
      eyebrow: string;
      /** Line 1, then the italic line 2 wrapped around the VIZAR wordmark */
      headline: { line1: string; line2Pre: string; line2Post: string };
      subtitle: string;
      ctaPrimary: string;
      ctaSecondary: string;
      /** Screen-reader description of the mascot artwork */
      mascotAlt: string;
      panel: {
        route: string;
        tabs: Three<string>;
        scoreLabel: string;
        scoreNote: string;
        docsTitle: string;
        docsSummary: string;
        docs: { name: string; state: "ready" | "review" | "missing" }[];
        nextLabel: string;
        nextText: string;
        nextHint: string;
        aiNote: string;
        roadmap: { title: string; when: string; state: "done" | "current" | "todo" }[];
      };
    };
    /**
     * Customer stories. `title`/`subtitle` are for real, consented reviews;
     * until those exist the section shows labelled sample cards instead.
     */
    testimonials: {
      eyebrow: string;
      title: string;
      subtitle: string;
      sampleTitle: string;
      sampleSubtitle: string;
      sampleBadge: string;
      usedTool: string;
      prev: string;
      next: string;
      pause: string;
      play: string;
      samples: Three<{ persona: string; quote: string }>;
      /** Customers write their own review — free, signed-in, one per account */
      write: string;
      empty: string;
      /** "{n}" → number of published reviews */
      count: string;
      form: {
        title: string;
        note: string;
        loading: string;
        signInTitle: string;
        signInText: string;
        signIn: string;
        register: string;
        name: string;
        nameHint: string;
        destination: string;
        tool: string;
        rating: string;
        quote: string;
        quoteHint: string;
        choose: string;
        consent: string;
        submit: string;
        save: string;
        remove: string;
        close: string;
        sent: string;
        hidden: string;
        removed: string;
        errors: { signin: string; confirm: string; links: string; invalid: string; failed: string };
      };
    };
    tour: {
      label: string;
      title: string;
      subtitle: string;
      tabs: { id: "readiness" | "documents" | "checklist" | "roadmap" | "interview"; title: string; desc: string }[];
      open: string;
    };
    board: {
      label: string;
      title: string;
      subtitle: string;
      alerts: { title: string; time: string; tone: "warn" | "ok" | "info" }[];
    };
    more: { pricing: string; faq: string };
    destinations: { eyebrow: string; title: string; subtitle: string; all: string };
    cta: { title: string; subtitle: string; primary: string; secondary: string };
  };
  howPage: {
    eyebrow: string;
    title: string;
    subtitle: string;
    steps: Three<Step & { points: Three<string> }>;
    outcomesTitle: string;
    outcomes: Three<Step>;
    honestyTitle: string;
    honesty: Step[];
  };
  toolsPage: { eyebrow: string; title: string; subtitle: string };
  toolPage: {
    breadcrumb: string;
    whatYouGet: string;
    howTitle: string;
    relatedTitle: string;
    notice: Record<"available" | "beta" | "soon", string>;
    ctaTitle: string;
    ctaText: string;
  };
  destinationsPage: {
    eyebrow: string;
    title: string;
    subtitle: string;
    visaTypesTitle: string;
    docsTitle: string;
    docsNote: string;
    docs: string[];
    schengenExtra: string;
    statusAvailable: string;
    statusSoon: string;
    ctaTitle: string;
    ctaText: string;
    otherTitle: string;
  };
  pricing: {
    eyebrow: string;
    title: string;
    subtitle: string;
    popular: string;
    plans: Record<"standard" | "premium" | "pro" | "vip", { name: string; price: string; period: string; features: string[]; cta: string }>;
    note: string;
    b2b: { label: string; soon: string; items: [string, string, string] };
    faqTitle: string;
    faq: QA[];
  };
  faq: { eyebrow: string; title: string; subtitle: string; items: QA[] };
  demos: {
    readiness: { title: string; categories: { label: string; value: number }[]; nextLabel: string; nextText: string };
    documents: {
      dropTitle: string;
      dropHint: string;
      files: { name: string; state: "ready" | "review" | "missing" }[];
      noteTitle: string;
      note: string;
    };
    checklist: { title: string; progress: string; groups: { title: string; items: string[] }[] };
    interview: { title: string; counter: string; questions: string[]; placeholder: string; next: string; tipTitle: string; tips: string[] };
    tracker: { title: string; stages: Step[] };
    rejection: { prompt: string; actionsTitle: string; reasons: { label: string; actions: string[] }[] };
    experts: { topicLabel: string; topics: string[]; slotLabel: string; slots: string[]; cta: string; note: string; role: string };
  };
  footer: {
    tagline: string;
    product: string;
    company: string;
    account: string;
    faq: string;
    roadmap: string;
    trust: string;
    legal: string;
    rights: string;
    backToTop: string;
    disclaimer: string;
  };
}
