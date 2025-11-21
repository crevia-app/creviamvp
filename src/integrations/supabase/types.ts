export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      brand_favorites: {
        Row: {
          brand_id: string
          created_at: string | null
          creator_id: string
          id: string
          notes: string | null
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          creator_id: string
          id?: string
          notes?: string | null
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          creator_id?: string
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_favorites_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_favorites_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_profiles: {
        Row: {
          business_type: string | null
          company_description: string | null
          created_at: string | null
          goals: string[] | null
          id: string
          logo_url: string | null
          profile_id: string
          social_links: Json | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          business_type?: string | null
          company_description?: string | null
          created_at?: string | null
          goals?: string[] | null
          id?: string
          logo_url?: string | null
          profile_id: string
          social_links?: Json | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          business_type?: string | null
          company_description?: string | null
          created_at?: string | null
          goals?: string[] | null
          id?: string
          logo_url?: string | null
          profile_id?: string
          social_links?: Json | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_applications: {
        Row: {
          ai_match_score: number | null
          campaign_id: string
          created_at: string | null
          creator_id: string
          id: string
          proposal: string | null
          proposed_price: number | null
          status: Database["public"]["Enums"]["application_status"] | null
          updated_at: string | null
        }
        Insert: {
          ai_match_score?: number | null
          campaign_id: string
          created_at?: string | null
          creator_id: string
          id?: string
          proposal?: string | null
          proposed_price?: number | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string | null
        }
        Update: {
          ai_match_score?: number | null
          campaign_id?: string
          created_at?: string | null
          creator_id?: string
          id?: string
          proposal?: string | null
          proposed_price?: number | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_applications_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_applications_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_milestones: {
        Row: {
          application_id: string
          campaign_id: string
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          application_id: string
          campaign_id: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          application_id?: string
          campaign_id?: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      campaign_payments: {
        Row: {
          amount: number
          application_id: string
          created_at: string | null
          id: string
          released_at: string | null
          status: string | null
        }
        Insert: {
          amount: number
          application_id: string
          created_at?: string | null
          id?: string
          released_at?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          application_id?: string
          created_at?: string | null
          id?: string
          released_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          applications_count: number | null
          brand_id: string
          budget: number | null
          created_at: string | null
          deadline: string | null
          deliverables: string[] | null
          description: string | null
          id: string
          industry: string | null
          platforms: string[] | null
          region: string | null
          requirements: string | null
          status: Database["public"]["Enums"]["campaign_status"] | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          applications_count?: number | null
          brand_id: string
          budget?: number | null
          created_at?: string | null
          deadline?: string | null
          deliverables?: string[] | null
          description?: string | null
          id?: string
          industry?: string | null
          platforms?: string[] | null
          region?: string | null
          requirements?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          applications_count?: number | null
          brand_id?: string
          budget?: number | null
          created_at?: string | null
          deadline?: string | null
          deliverables?: string[] | null
          description?: string | null
          id?: string
          industry?: string | null
          platforms?: string[] | null
          region?: string | null
          requirements?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_profiles: {
        Row: {
          campaign_clicks: number | null
          created_at: string | null
          creator_types: string[] | null
          engagement_rate: number | null
          follower_count: number | null
          goals: string[] | null
          id: string
          portfolio_url: string | null
          profile_id: string
          profile_views: number | null
          social_links: Json | null
          updated_at: string | null
        }
        Insert: {
          campaign_clicks?: number | null
          created_at?: string | null
          creator_types?: string[] | null
          engagement_rate?: number | null
          follower_count?: number | null
          goals?: string[] | null
          id?: string
          portfolio_url?: string | null
          profile_id: string
          profile_views?: number | null
          social_links?: Json | null
          updated_at?: string | null
        }
        Update: {
          campaign_clicks?: number | null
          created_at?: string | null
          creator_types?: string[] | null
          engagement_rate?: number | null
          follower_count?: number | null
          goals?: string[] | null
          id?: string
          portfolio_url?: string | null
          profile_id?: string
          profile_views?: number | null
          social_links?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverable_submissions: {
        Row: {
          created_at: string | null
          file_url: string
          id: string
          milestone_id: string
          notes: string | null
          reviewed_at: string | null
          revision_notes: string | null
          status: string | null
          submitted_at: string | null
        }
        Insert: {
          created_at?: string | null
          file_url: string
          id?: string
          milestone_id: string
          notes?: string | null
          reviewed_at?: string | null
          revision_notes?: string | null
          status?: string | null
          submitted_at?: string | null
        }
        Update: {
          created_at?: string | null
          file_url?: string
          id?: string
          milestone_id?: string
          notes?: string | null
          reviewed_at?: string | null
          revision_notes?: string | null
          status?: string | null
          submitted_at?: string | null
        }
        Relationships: []
      }
      link_buttons: {
        Row: {
          clicks: number | null
          created_at: string | null
          icon: string | null
          id: string
          order_index: number
          profile_id: string
          style: string | null
          subtitle: string | null
          title: string
          url: string
          visible: boolean | null
        }
        Insert: {
          clicks?: number | null
          created_at?: string | null
          icon?: string | null
          id?: string
          order_index: number
          profile_id: string
          style?: string | null
          subtitle?: string | null
          title: string
          url: string
          visible?: boolean | null
        }
        Update: {
          clicks?: number | null
          created_at?: string | null
          icon?: string | null
          id?: string
          order_index?: number
          profile_id?: string
          style?: string | null
          subtitle?: string | null
          title?: string
          url?: string
          visible?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "link_buttons_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "link_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      link_featured_work: {
        Row: {
          created_at: string | null
          id: string
          order_index: number
          profile_id: string
          thumbnail: string | null
          title: string | null
          type: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_index: number
          profile_id: string
          thumbnail?: string | null
          title?: string | null
          type: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_index?: number
          profile_id?: string
          thumbnail?: string | null
          title?: string | null
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "link_featured_work_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "link_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      link_profiles: {
        Row: {
          background: Json | null
          bio: string | null
          contact_email: string | null
          contact_enabled: boolean | null
          created_at: string | null
          display_name: string | null
          id: string
          layout: string | null
          profile_picture: string | null
          seo_description: string | null
          seo_image: string | null
          seo_title: string | null
          show_crevia_branding: boolean | null
          show_verified_badge: boolean | null
          theme: string | null
          total_visits: number | null
          updated_at: string | null
          user_id: string
          username: string
        }
        Insert: {
          background?: Json | null
          bio?: string | null
          contact_email?: string | null
          contact_enabled?: boolean | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          layout?: string | null
          profile_picture?: string | null
          seo_description?: string | null
          seo_image?: string | null
          seo_title?: string | null
          show_crevia_branding?: boolean | null
          show_verified_badge?: boolean | null
          theme?: string | null
          total_visits?: number | null
          updated_at?: string | null
          user_id: string
          username: string
        }
        Update: {
          background?: Json | null
          bio?: string | null
          contact_email?: string | null
          contact_enabled?: boolean | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          layout?: string | null
          profile_picture?: string | null
          seo_description?: string | null
          seo_image?: string | null
          seo_title?: string | null
          show_crevia_branding?: boolean | null
          show_verified_badge?: boolean | null
          theme?: string | null
          total_visits?: number | null
          updated_at?: string | null
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "link_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      link_social_icons: {
        Row: {
          created_at: string | null
          id: string
          order_index: number
          platform: string
          profile_id: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_index: number
          platform: string
          profile_id: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_index?: number
          platform?: string
          profile_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "link_social_icons_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "link_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          campaign_id: string | null
          content: string
          created_at: string | null
          id: string
          is_flagged: boolean | null
          receiver_id: string
          sender_id: string
          status: Database["public"]["Enums"]["message_status"] | null
        }
        Insert: {
          campaign_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_flagged?: boolean | null
          receiver_id: string
          sender_id: string
          status?: Database["public"]["Enums"]["message_status"] | null
        }
        Update: {
          campaign_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_flagged?: boolean | null
          receiver_id?: string
          sender_id?: string
          status?: Database["public"]["Enums"]["message_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          handle: string
          id: string
          is_verified: boolean | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"]
          verification_method:
            | Database["public"]["Enums"]["verification_method"]
            | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          handle: string
          id: string
          is_verified?: boolean | null
          updated_at?: string | null
          user_type: Database["public"]["Enums"]["user_type"]
          verification_method?:
            | Database["public"]["Enums"]["verification_method"]
            | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          handle?: string
          id?: string
          is_verified?: boolean | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
          verification_method?:
            | Database["public"]["Enums"]["verification_method"]
            | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          campaign_id: string
          created_at: string | null
          creator_id: string
          id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          creator_id: string
          id?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          creator_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      application_status: "pending" | "accepted" | "rejected" | "completed"
      campaign_status: "draft" | "active" | "completed" | "cancelled"
      message_status: "sent" | "delivered" | "read"
      user_type: "creator" | "brand"
      verification_method: "id" | "social"
      verification_status: "pending" | "verified" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      application_status: ["pending", "accepted", "rejected", "completed"],
      campaign_status: ["draft", "active", "completed", "cancelled"],
      message_status: ["sent", "delivered", "read"],
      user_type: ["creator", "brand"],
      verification_method: ["id", "social"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
