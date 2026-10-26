import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getLatestApplication } from "@/lib/data/applications";
import { listDocumentsForApplication } from "@/lib/data/documents";
import { TestBench, type TestBenchProps } from "./TestBench";

export const metadata: Metadata = {
  title: "Sinov sahifasi",
  robots: { index: false, follow: false },
};

// Always read the live session — never a cached snapshot.
export const dynamic = "force-dynamic";

/**
 * Self-check page: connection, sign-in (email + Google) and document upload,
 * in one place. Read-only on the server side — it only uses the existing
 * data functions (session, latest application, its documents).
 */
export default async function TestPage() {
  const configured = isSupabaseConfigured();
  const props: TestBenchProps = { configured, user: null, application: null, documents: [] };

  if (configured) {
    const supabase = createClient();
    const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
    if (data.user) {
      props.user = {
        email: data.user.email ?? "—",
        provider: (data.user.app_metadata?.provider as string | undefined) ?? "email",
      };
      const app = await getLatestApplication();
      if (app.ok && app.data) {
        props.application = {
          id: app.data.id,
          destination: app.data.destination_country,
          visaType: app.data.visa_type,
        };
        const docs = await listDocumentsForApplication(app.data.id);
        if (docs.ok) {
          props.documents = docs.data.map((d) => ({
            id: d.id,
            type: d.document_type,
            filename: d.original_filename ?? "—",
            status: d.status,
            storagePath: d.storage_path,
            createdAt: d.created_at,
          }));
        }
      }
    }
  }

  return <TestBench {...props} />;
}
