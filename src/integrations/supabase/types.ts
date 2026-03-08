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
            foreignKeyName: "brand_favorites_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_favorites_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_favorites_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
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
          {
            foreignKeyName: "brand_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      business_settings: {
        Row: {
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          business_address: string | null
          business_email: string | null
          business_name: string | null
          business_phone: string | null
          created_at: string
          default_currency: string | null
          default_payment_terms: string | null
          default_tax_rate: number | null
          id: string
          logo_url: string | null
          mpesa_till_number: string | null
          tax_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          business_address?: string | null
          business_email?: string | null
          business_name?: string | null
          business_phone?: string | null
          created_at?: string
          default_currency?: string | null
          default_payment_terms?: string | null
          default_tax_rate?: number | null
          id?: string
          logo_url?: string | null
          mpesa_till_number?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          business_address?: string | null
          business_email?: string | null
          business_name?: string | null
          business_phone?: string | null
          created_at?: string
          default_currency?: string | null
          default_payment_terms?: string | null
          default_tax_rate?: number | null
          id?: string
          logo_url?: string | null
          mpesa_till_number?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          {
            foreignKeyName: "campaign_applications_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
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
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string | null
          contract_id: string | null
          created_at: string
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          invoice_id: string | null
          is_encrypted: boolean
          message_type: string
          room_id: string
          sender_id: string
        }
        Insert: {
          content?: string | null
          contract_id?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          invoice_id?: string | null
          is_encrypted?: boolean
          message_type?: string
          room_id: string
          sender_id: string
        }
        Update: {
          content?: string | null
          contract_id?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          invoice_id?: string | null
          is_encrypted?: boolean
          message_type?: string
          room_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_read_receipts: {
        Row: {
          id: string
          last_read_at: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          last_read_at?: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          last_read_at?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_read_receipts_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_room_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string
          id: string
          is_group: boolean
          name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by: string
          id?: string
          is_group?: boolean
          name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string
          id?: string
          is_group?: boolean
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          client_email: string | null
          client_name: string
          client_signature: string | null
          client_signed_at: string | null
          content: string | null
          contract_type: string
          created_at: string
          creator_signature: string | null
          creator_signed_at: string | null
          currency: string | null
          deliverables: string[] | null
          end_date: string | null
          exclusivity: boolean | null
          exclusivity_details: string | null
          id: string
          payment_terms: string | null
          start_date: string | null
          status: string
          termination_clause: string | null
          title: string
          updated_at: string
          usage_rights: string | null
          user_id: string
          value: number | null
        }
        Insert: {
          client_email?: string | null
          client_name: string
          client_signature?: string | null
          client_signed_at?: string | null
          content?: string | null
          contract_type?: string
          created_at?: string
          creator_signature?: string | null
          creator_signed_at?: string | null
          currency?: string | null
          deliverables?: string[] | null
          end_date?: string | null
          exclusivity?: boolean | null
          exclusivity_details?: string | null
          id?: string
          payment_terms?: string | null
          start_date?: string | null
          status?: string
          termination_clause?: string | null
          title: string
          updated_at?: string
          usage_rights?: string | null
          user_id: string
          value?: number | null
        }
        Update: {
          client_email?: string | null
          client_name?: string
          client_signature?: string | null
          client_signed_at?: string | null
          content?: string | null
          contract_type?: string
          created_at?: string
          creator_signature?: string | null
          creator_signed_at?: string | null
          currency?: string | null
          deliverables?: string[] | null
          end_date?: string | null
          exclusivity?: boolean | null
          exclusivity_details?: string | null
          id?: string
          payment_terms?: string | null
          start_date?: string | null
          status?: string
          termination_clause?: string | null
          title?: string
          updated_at?: string
          usage_rights?: string | null
          user_id?: string
          value?: number | null
        }
        Relationships: []
      }
      creator_payout_methods: {
        Row: {
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          card_expiry: string | null
          card_holder_name: string | null
          card_last_four: string | null
          created_at: string
          creator_id: string
          id: string
          is_default: boolean | null
          method_type: string
          mpesa_name: string | null
          mpesa_phone: string | null
          updated_at: string
        }
        Insert: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          card_expiry?: string | null
          card_holder_name?: string | null
          card_last_four?: string | null
          created_at?: string
          creator_id: string
          id?: string
          is_default?: boolean | null
          method_type: string
          mpesa_name?: string | null
          mpesa_phone?: string | null
          updated_at?: string
        }
        Update: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          card_expiry?: string | null
          card_holder_name?: string | null
          card_last_four?: string | null
          created_at?: string
          creator_id?: string
          id?: string
          is_default?: boolean | null
          method_type?: string
          mpesa_name?: string | null
          mpesa_phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_payout_methods_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_payout_methods_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
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
          {
            foreignKeyName: "creator_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles_public"
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
      escrow_payments: {
        Row: {
          application_id: string | null
          brand_id: string
          campaign_id: string | null
          card_last_four: string | null
          created_at: string
          creator_id: string
          first_payment_amount: number
          first_payment_status: string | null
          id: string
          mpesa_phone: string | null
          payment_method: string | null
          second_payment_amount: number
          second_payment_status: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          application_id?: string | null
          brand_id: string
          campaign_id?: string | null
          card_last_four?: string | null
          created_at?: string
          creator_id: string
          first_payment_amount: number
          first_payment_status?: string | null
          id?: string
          mpesa_phone?: string | null
          payment_method?: string | null
          second_payment_amount: number
          second_payment_status?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          application_id?: string | null
          brand_id?: string
          campaign_id?: string | null
          card_last_four?: string | null
          created_at?: string
          creator_id?: string
          first_payment_amount?: number
          first_payment_status?: string | null
          id?: string
          mpesa_phone?: string | null
          payment_method?: string | null
          second_payment_amount?: number
          second_payment_status?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escrow_payments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "campaign_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_payments_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_payments_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_payments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_payments_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_payments_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          total: number
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_address: string | null
          client_email: string | null
          client_name: string
          created_at: string
          currency: string | null
          discount_amount: number | null
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          status: string
          subtotal: number
          tax_amount: number | null
          tax_rate: number | null
          terms: string | null
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          client_address?: string | null
          client_email?: string | null
          client_name: string
          created_at?: string
          currency?: string | null
          discount_amount?: number | null
          due_date: string
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          terms?: string | null
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          client_address?: string | null
          client_email?: string | null
          client_name?: string
          created_at?: string
          currency?: string | null
          discount_amount?: number | null
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          terms?: string | null
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      kira_conversations: {
        Row: {
          created_at: string
          id: string
          project_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kira_conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "kira_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      kira_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          file_name: string | null
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          file_name?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          file_name?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "kira_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "kira_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      kira_projects: {
        Row: {
          created_at: string
          custom_instructions: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_instructions?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_instructions?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
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
          {
            foreignKeyName: "link_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
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
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
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
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
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
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
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
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          escrow_id: string | null
          id: string
          payment_method: string | null
          payment_phase: string
          status: string | null
          transaction_reference: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          escrow_id?: string | null
          id?: string
          payment_method?: string | null
          payment_phase: string
          status?: string | null
          transaction_reference?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          escrow_id?: string | null
          id?: string
          payment_method?: string | null
          payment_phase?: string
          status?: string | null
          transaction_reference?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_escrow_id_fkey"
            columns: ["escrow_id"]
            isOneToOne: false
            referencedRelation: "escrow_payments"
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
      rate_card_services: {
        Row: {
          base_price: number
          category: string
          created_at: string
          description: string | null
          id: string
          order_index: number
          price_type: string | null
          rate_card_id: string
          service_name: string
          turnaround_days: number | null
        }
        Insert: {
          base_price: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          price_type?: string | null
          rate_card_id: string
          service_name: string
          turnaround_days?: number | null
        }
        Update: {
          base_price?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          price_type?: string | null
          rate_card_id?: string
          service_name?: string
          turnaround_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rate_card_services_rate_card_id_fkey"
            columns: ["rate_card_id"]
            isOneToOne: false
            referencedRelation: "rate_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_cards: {
        Row: {
          created_at: string
          currency: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          share_slug: string | null
          theme: string | null
          updated_at: string
          user_id: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          share_slug?: string | null
          theme?: string | null
          updated_at?: string
          user_id: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          share_slug?: string | null
          theme?: string | null
          updated_at?: string
          user_id?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      room_encrypted_keys: {
        Row: {
          created_at: string
          encrypted_by: string
          encrypted_key: string
          id: string
          room_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          encrypted_by: string
          encrypted_key: string
          id?: string
          room_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          encrypted_by?: string
          encrypted_key?: string
          id?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_encrypted_keys_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_encryption_keys: {
        Row: {
          created_at: string
          id: string
          public_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          public_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          public_key?: string
          updated_at?: string
          user_id?: string
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
          {
            foreignKeyName: "wishlist_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      profiles_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          handle: string | null
          id: string | null
          is_verified: boolean | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"] | null
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
          handle?: string | null
          id?: string | null
          is_verified?: boolean | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
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
          handle?: string | null
          id?: string | null
          is_verified?: boolean | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
          verification_method?:
            | Database["public"]["Enums"]["verification_method"]
            | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_room_member: {
        Args: { _room_id: string; _user_id: string }
        Returns: boolean
      }
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
