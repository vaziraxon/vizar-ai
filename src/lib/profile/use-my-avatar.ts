"use client";

import { useEffect, useState } from "react";
import { AVATAR_EVENT } from "@/lib/profile/avatar-event";

// Kept between page changes, so the top bar doesn't flash initials on every navigation.
let cached: string | null | undefined;

/** The signed-in user's photo URL for the top bar; null when there is none or no session. */
export function useMyAvatar() {
  const [url, setUrl] = useState<string | null>(cached ?? null);

  useEffect(() => {
    let alive = true;
    // The Supabase client is large; load it after the page is up rather than
    // with every dashboard page's first bundle (the photo is only decoration).
    void import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      if (!supabase || !alive) return;
      supabase.auth.getSession().then(async ({ data }) => {
        const id = data.session?.user.id;
        if (!id) return;
        const { data: row } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", id)
          .maybeSingle<{ avatar_url: string | null }>();
        cached = row?.avatar_url ?? null;
        if (alive) setUrl(cached);
      });
    });
    const onChange = (e: Event) => {
      cached = (e as CustomEvent<string | null>).detail;
      setUrl(cached);
    };
    window.addEventListener(AVATAR_EVENT, onChange);
    return () => {
      alive = false;
      window.removeEventListener(AVATAR_EVENT, onChange);
    };
  }, []);

  return url;
}
