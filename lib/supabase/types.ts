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
      notes: {
        Row: {
          id: string;
          title: string;
          content: string;
          tags: string[] | null;
          topic: string | null;
          emotion: string | null;
          summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          tags?: string[] | null;
          topic?: string | null;
          emotion?: string | null;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          tags?: string[] | null;
          topic?: string | null;
          emotion?: string | null;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      relationships: {
        Row: {
          id: string;
          note_id: string;
          related_note_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          note_id: string;
          related_note_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          note_id?: string;
          related_note_id?: string;
          created_at?: string;
        };
      };
      weekly_insights: {
        Row: {
          id: string;
          week: string;
          summary: string | null;
          insights: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          week: string;
          summary?: string | null;
          insights?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          week?: string;
          summary?: string | null;
          insights?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      daily_inspiration: {
        Row: {
          id: string;
          date: string;
          content_json: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          content_json: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          content_json?: Json;
          created_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          inspiration_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          inspiration_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          inspiration_id?: string;
          created_at?: string;
        };
      };
      letters: {
        Row: {
          id: string;
          user_id: string;
          child_name: string;
          child_label: string | null;
          title: string | null;
          raw_text: string;
          ai_letter: string;
          ai_summary: string | null;
          tone: string | null;
          tags: string[] | null;
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          child_name: string;
          child_label?: string | null;
          title?: string | null;
          raw_text: string;
          ai_letter: string;
          ai_summary?: string | null;
          tone?: string | null;
          tags?: string[] | null;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          child_name?: string;
          child_label?: string | null;
          title?: string | null;
          raw_text?: string;
          ai_letter?: string;
          ai_summary?: string | null;
          tone?: string | null;
          tags?: string[] | null;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      verification_codes: {
        Row: {
          id: string;
          email: string;
          code: string;
          expires_at: string;
          used: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          code: string;
          expires_at: string;
          used?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          code?: string;
          expires_at?: string;
          used?: boolean;
          created_at?: string;
        };
      };
    };
  };
}

// Convenience types
export type Note = Database['public']['Tables']['notes']['Row'];
export type NoteInsert = Database['public']['Tables']['notes']['Insert'];
export type NoteUpdate = Database['public']['Tables']['notes']['Update'];

export type Relationship = Database['public']['Tables']['relationships']['Row'];
export type RelationshipInsert = Database['public']['Tables']['relationships']['Insert'];

export type WeeklyInsight = Database['public']['Tables']['weekly_insights']['Row'];
export type WeeklyInsightInsert = Database['public']['Tables']['weekly_insights']['Insert'];
export type WeeklyInsightUpdate = Database['public']['Tables']['weekly_insights']['Update'];

