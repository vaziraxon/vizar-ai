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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
