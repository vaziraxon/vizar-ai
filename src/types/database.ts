/**
 * Manually written to mirror `supabase/schema.sql`.
 *
 * Once a real Supabase project exists, regenerate this file from the
 * live schema instead of hand-editing it further:
 *
 *   npx supabase gen types typescript --project-id <your-project-id> \
 *     --schema public > src/types/database.ts
 *
 * That command is documented here for later use — it has NOT been run
 * against a real project as part of this delivery (no project exists
 * yet in this environment).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          preferred_language: string;
          account_type: string;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          preferred_language?: string;
          account_type?: string;
          onboarding_completed?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      visa_applications: {
        Row: {
          id: string;
          user_id: string;
          destination_country: string;
          visa_type: string;
          travel_purpose: string | null;
          travel_date: string | null;
          status: string;
          readiness_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          destination_country: string;
          visa_type: string;
          travel_purpose?: string | null;
          travel_date?: string | null;
          status?: string;
          readiness_score?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["visa_applications"]["Insert"]>;
        Relationships: [];
      };
      assessments: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          answers: Json;
          score: number | null;
          risk_level: string | null;
          result_summary: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id: string;
          answers?: Json;
          score?: number | null;
          risk_level?: string | null;
          result_summary?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["assessments"]["Insert"]>;
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          document_type: string;
          original_filename: string | null;
          storage_path: string | null;
          mime_type: string | null;
          file_size: number | null;
          status: string;
          analysis_summary: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id: string;
          document_type: string;
          original_filename?: string | null;
          storage_path?: string | null;
          mime_type?: string | null;
          file_size?: number | null;
          status?: string;
          analysis_summary?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>;
        Relationships: [];
      };
      interview_sessions: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          country: string | null;
          visa_type: string | null;
          difficulty: string | null;
          answers: Json;
          score: number | null;
          feedback: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id: string;
          country?: string | null;
          visa_type?: string | null;
          difficulty?: string | null;
          answers?: Json;
          score?: number | null;
          feedback?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["interview_sessions"]["Insert"]>;
        Relationships: [];
      };
      recommendations: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          title: string;
          description: string | null;
          priority: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id: string;
          title: string;
          description?: string | null;
          priority?: string | null;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["recommendations"]["Insert"]>;
        Relationships: [];
      };
      consultations: {
        Row: {
          id: string;
          user_id: string;
          application_id: string | null;
          specialist_name: string | null;
          scheduled_at: string | null;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id?: string | null;
          specialist_name?: string | null;
          scheduled_at?: string | null;
          status?: string;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["consultations"]["Insert"]>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string | null;
          title: string;
          message: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type?: string | null;
          title: string;
          message?: string | null;
          is_read?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          report_type: string | null;
          title: string | null;
          report_data: Json;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id: string;
          report_type?: string | null;
          title?: string | null;
          report_data?: Json;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reports"]["Insert"]>;
        Relationships: [];
      };
      agency_members: {
        Row: {
          id: string;
          agency_owner_id: string;
          member_user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          agency_owner_id: string;
          member_user_id: string;
          role?: string;
        };
        Update: Partial<Database["public"]["Tables"]["agency_members"]["Insert"]>;
        Relationships: [];
      };
      agency_clients: {
        Row: {
          id: string;
          agency_owner_id: string;
          full_name: string;
          email: string | null;
          destination_country: string | null;
          visa_type: string | null;
          readiness_score: number | null;
          status: string;
          assigned_specialist: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agency_owner_id: string;
          full_name: string;
          email?: string | null;
          destination_country?: string | null;
          visa_type?: string | null;
          readiness_score?: number | null;
          status?: string;
          assigned_specialist?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["agency_clients"]["Insert"]>;
        Relationships: [];
      };
      /* ---- Knowledge base (supabase/knowledge.sql) ---- */
      kb_books: {
        Row: {
          id: string;
          slug: string;
          title: string;
          author: string | null;
          edition_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          author?: string | null;
          edition_date?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["kb_books"]["Insert"]>;
        Relationships: [];
      };
      kb_chapters: {
        Row: {
          id: string;
          book_id: string;
          position: number;
          slug: string;
          kind: string;
          number: number | null;
          label: string;
          title: string;
          display_title: string;
          status: string;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          position: number;
          slug: string;
          kind?: string;
          number?: number | null;
          label: string;
          title: string;
          display_title: string;
          status?: string;
          updated_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["kb_chapters"]["Insert"]>;
        Relationships: [];
      };
      kb_sections: {
        Row: {
          id: string;
          chapter_id: string;
          position: number;
          slug: string;
          number: string | null;
          title: string;
          is_intro: boolean;
          content_md: string;
          status: string;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          position: number;
          slug: string;
          number?: string | null;
          title: string;
          is_intro?: boolean;
          content_md?: string;
          status?: string;
          updated_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["kb_sections"]["Insert"]>;
        Relationships: [];
      };
      kb_section_revisions: {
        Row: {
          id: number;
          section_id: string;
          number: string | null;
          title: string;
          content_md: string;
          edited_by: string | null;
          edited_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      kb_chunks: {
        Row: {
          id: string;
          section_id: string;
          chunk_index: number;
          heading_path: string;
          content: string;
          content_hash: string;
          embedding: string | null;
          embedded_at: string | null;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      kb_sources: {
        Row: {
          id: string;
          code: string | null;
          title: string;
          url: string;
          chapters: string[];
          check_status: string;
          last_checked_at: string | null;
          last_http_status: number | null;
          last_content_hash: string | null;
          last_changed_at: string | null;
          last_text: string | null;
          check_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code?: string | null;
          title: string;
          url: string;
          chapters?: string[];
          check_status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["kb_sources"]["Insert"]>;
        Relationships: [];
      };
      kb_source_checks: {
        Row: {
          id: number;
          source_id: string;
          checked_at: string;
          http_status: number | null;
          content_hash: string | null;
          changed: boolean;
          previous_text: string | null;
          error: string | null;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      kb_country_rules: {
        Row: {
          id: string;
          country_code: string;
          country_name: string;
          region: string;
          topic: string;
          rule_text: string;
          volatility: string;
          section_id: string | null;
          source_match: string;
          as_of: string | null;
          status: string;
          last_verified_at: string | null;
          verified_by: string | null;
          review_note: string | null;
          next_review_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          country_code: string;
          country_name: string;
          region: string;
          topic: string;
          rule_text: string;
          volatility?: string;
          section_id?: string | null;
          source_match?: string;
          as_of?: string | null;
          status?: string;
          last_verified_at?: string | null;
          verified_by?: string | null;
          review_note?: string | null;
          next_review_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["kb_country_rules"]["Insert"]>;
        Relationships: [];
      };
      kb_rule_sources: {
        Row: { rule_id: string; source_id: string };
        Insert: { rule_id: string; source_id: string };
        Update: Partial<Database["public"]["Tables"]["kb_rule_sources"]["Insert"]>;
        Relationships: [];
      };
      kb_country_sections: {
        Row: { id: number; country_code: string; section_id: string; anchor: string | null };
        Insert: { country_code: string; section_id: string; anchor?: string | null };
        Update: Partial<Database["public"]["Tables"]["kb_country_sections"]["Insert"]>;
        Relationships: [];
      };
      // supabase/kb_library_access.sql — users can only read their own rows.
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: "standard" | "premium" | "pro" | "vip";
          status: "active" | "canceled" | "refunded";
          starts_at: string;
          expires_at: string;
          source: "manual" | "payment" | "promo";
          payment_ref: string | null;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          plan: "standard" | "premium" | "pro" | "vip";
          status?: "active" | "canceled" | "refunded";
          starts_at?: string;
          expires_at: string;
          source?: "manual" | "payment" | "promo";
          payment_ref?: string | null;
          note?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
