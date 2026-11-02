"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AVATAR_EVENT } from "@/lib/profile/avatar";

// Kept between page changes, so the top bar doesn't flash initials on every navigation.
let cached: string | null | undefined;

/** The signed-in user's photo URL for the top bar; null when there is none or no session. */
export function useMyAvatar() {
  const [url, setUrl] = useState<string | null>(cached ?? null);

  useEffect(() => {
    let alive = true;
    const supabase = createClient();
    if (supabase) {
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
    }
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
