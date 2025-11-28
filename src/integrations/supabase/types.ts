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
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_post_tags: {
        Row: {
          blog_post_id: string
          blog_tag_id: string
          created_at: string
        }
        Insert: {
          blog_post_id: string
          blog_tag_id: string
          created_at?: string
        }
        Update: {
          blog_post_id?: string
          blog_tag_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_blog_tag_id_fkey"
            columns: ["blog_tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          created_at: string
          excerpt: string
          featured_image_url: string | null
          id: string
          is_published: boolean
          meta_description: string | null
          meta_keywords: string | null
          published_at: string | null
          show_on_homepage: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string
          excerpt: string
          featured_image_url?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_keywords?: string | null
          published_at?: string | null
          show_on_homepage?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string
          featured_image_url?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_keywords?: string | null
          published_at?: string | null
          show_on_homepage?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      cantons: {
        Row: {
          created_at: string | null
          entity_id: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "cantons_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          created_at: string | null
          file_name: string | null
          file_url: string
          id: string
          profile_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          file_url: string
          id?: string
          profile_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          file_url?: string
          id?: string
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          canton_id: string | null
          created_at: string | null
          entity_id: string | null
          id: string
          name: string
          postal_code: string
        }
        Insert: {
          canton_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          id?: string
          name: string
          postal_code: string
        }
        Update: {
          canton_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          id?: string
          name?: string
          postal_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_canton_id_fkey"
            columns: ["canton_id"]
            isOneToOne: false
            referencedRelation: "cantons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cities_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      client_references: {
        Row: {
          client_name: string
          created_at: string | null
          description: string | null
          id: string
          profile_id: string | null
        }
        Insert: {
          client_name: string
          created_at?: string | null
          description?: string | null
          id?: string
          profile_id?: string | null
        }
        Update: {
          client_name?: string
          created_at?: string | null
          description?: string | null
          id?: string
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_references_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_references_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      entities: {
        Row: {
          code: Database["public"]["Enums"]["entity_type"]
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          code: Database["public"]["Enums"]["entity_type"]
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: Database["public"]["Enums"]["entity_type"]
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          profile_id: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          profile_id?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_images_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_services: {
        Row: {
          created_at: string | null
          profile_id: string
          service_id: string
        }
        Insert: {
          created_at?: string | null
          profile_id: string
          service_id: string
        }
        Update: {
          created_at?: string | null
          profile_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_services_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_services_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accepting_new_clients: boolean | null
          business_city_id: string | null
          business_street: string | null
          business_type: Database["public"]["Enums"]["business_type"] | null
          company_name: string | null
          created_at: string | null
          email: string
          facebook_url: string | null
          first_name: string
          google_maps_url: string | null
          has_physical_office: boolean | null
          id: string
          instagram_url: string | null
          is_active: boolean | null
          is_license_verified: boolean | null
          last_name: string
          latitude: number | null
          license_number: string | null
          license_type: Database["public"]["Enums"]["license_type"] | null
          linkedin_url: string | null
          long_description: string | null
          longitude: number | null
          personal_city_id: string | null
          personal_street: string | null
          phone: string | null
          professional_organizations: string | null
          profile_image_url: string | null
          registration_completed: boolean | null
          short_description: string | null
          slug: string | null
          tax_id: string | null
          updated_at: string | null
          website: string | null
          works_locally_only: boolean | null
          works_online: boolean | null
          years_experience: number | null
        }
        Insert: {
          accepting_new_clients?: boolean | null
          business_city_id?: string | null
          business_street?: string | null
          business_type?: Database["public"]["Enums"]["business_type"] | null
          company_name?: string | null
          created_at?: string | null
          email: string
          facebook_url?: string | null
          first_name: string
          google_maps_url?: string | null
          has_physical_office?: boolean | null
          id: string
          instagram_url?: string | null
          is_active?: boolean | null
          is_license_verified?: boolean | null
          last_name: string
          latitude?: number | null
          license_number?: string | null
          license_type?: Database["public"]["Enums"]["license_type"] | null
          linkedin_url?: string | null
          long_description?: string | null
          longitude?: number | null
          personal_city_id?: string | null
          personal_street?: string | null
          phone?: string | null
          professional_organizations?: string | null
          profile_image_url?: string | null
          registration_completed?: boolean | null
          short_description?: string | null
          slug?: string | null
          tax_id?: string | null
          updated_at?: string | null
          website?: string | null
          works_locally_only?: boolean | null
          works_online?: boolean | null
          years_experience?: number | null
        }
        Update: {
          accepting_new_clients?: boolean | null
          business_city_id?: string | null
          business_street?: string | null
          business_type?: Database["public"]["Enums"]["business_type"] | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          facebook_url?: string | null
          first_name?: string
          google_maps_url?: string | null
          has_physical_office?: boolean | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          is_license_verified?: boolean | null
          last_name?: string
          latitude?: number | null
          license_number?: string | null
          license_type?: Database["public"]["Enums"]["license_type"] | null
          linkedin_url?: string | null
          long_description?: string | null
          longitude?: number | null
          personal_city_id?: string | null
          personal_street?: string | null
          phone?: string | null
          professional_organizations?: string | null
          profile_image_url?: string | null
          registration_completed?: boolean | null
          short_description?: string | null
          slug?: string | null
          tax_id?: string | null
          updated_at?: string | null
          website?: string | null
          works_locally_only?: boolean | null
          works_online?: boolean | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_business_city_id_fkey"
            columns: ["business_city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_personal_city_id_fkey"
            columns: ["personal_city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string | null
          google_analytics_id: string | null
          id: string
          require_admin_approval: boolean | null
          show_availability_filter: boolean | null
          show_map_search: boolean | null
          show_verified_filter: boolean | null
          updated_at: string | null
          verification_display_mode: string | null
        }
        Insert: {
          created_at?: string | null
          google_analytics_id?: string | null
          id?: string
          require_admin_approval?: boolean | null
          show_availability_filter?: boolean | null
          show_map_search?: boolean | null
          show_verified_filter?: boolean | null
          updated_at?: string | null
          verification_display_mode?: string | null
        }
        Update: {
          created_at?: string | null
          google_analytics_id?: string | null
          id?: string
          require_admin_approval?: boolean | null
          show_availability_filter?: boolean | null
          show_map_search?: boolean | null
          show_verified_filter?: boolean | null
          updated_at?: string | null
          verification_display_mode?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      working_hours: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string | null
          id: string
          is_closed: boolean | null
          profile_id: string | null
          start_time: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time?: string | null
          id?: string
          is_closed?: boolean | null
          profile_id?: string | null
          start_time?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string | null
          id?: string
          is_closed?: boolean | null
          profile_id?: string | null
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "working_hours_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "working_hours_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          accepting_new_clients: boolean | null
          business_city_id: string | null
          business_type: Database["public"]["Enums"]["business_type"] | null
          company_name: string | null
          created_at: string | null
          facebook_url: string | null
          first_name: string | null
          has_physical_office: boolean | null
          id: string | null
          instagram_url: string | null
          is_active: boolean | null
          is_license_verified: boolean | null
          last_name: string | null
          latitude: number | null
          license_type: Database["public"]["Enums"]["license_type"] | null
          linkedin_url: string | null
          long_description: string | null
          longitude: number | null
          professional_organizations: string | null
          profile_image_url: string | null
          registration_completed: boolean | null
          short_description: string | null
          slug: string | null
          updated_at: string | null
          website: string | null
          works_locally_only: boolean | null
          works_online: boolean | null
          years_experience: number | null
        }
        Insert: {
          accepting_new_clients?: boolean | null
          business_city_id?: string | null
          business_type?: Database["public"]["Enums"]["business_type"] | null
          company_name?: string | null
          created_at?: string | null
          facebook_url?: string | null
          first_name?: string | null
          has_physical_office?: boolean | null
          id?: string | null
          instagram_url?: string | null
          is_active?: boolean | null
          is_license_verified?: boolean | null
          last_name?: string | null
          latitude?: number | null
          license_type?: Database["public"]["Enums"]["license_type"] | null
          linkedin_url?: string | null
          long_description?: string | null
          longitude?: number | null
          professional_organizations?: string | null
          profile_image_url?: string | null
          registration_completed?: boolean | null
          short_description?: string | null
          slug?: string | null
          updated_at?: string | null
          website?: string | null
          works_locally_only?: boolean | null
          works_online?: boolean | null
          years_experience?: number | null
        }
        Update: {
          accepting_new_clients?: boolean | null
          business_city_id?: string | null
          business_type?: Database["public"]["Enums"]["business_type"] | null
          company_name?: string | null
          created_at?: string | null
          facebook_url?: string | null
          first_name?: string | null
          has_physical_office?: boolean | null
          id?: string | null
          instagram_url?: string | null
          is_active?: boolean | null
          is_license_verified?: boolean | null
          last_name?: string | null
          latitude?: number | null
          license_type?: Database["public"]["Enums"]["license_type"] | null
          linkedin_url?: string | null
          long_description?: string | null
          longitude?: number | null
          professional_organizations?: string | null
          profile_image_url?: string | null
          registration_completed?: boolean | null
          short_description?: string | null
          slug?: string | null
          updated_at?: string | null
          website?: string | null
          works_locally_only?: boolean | null
          works_online?: boolean | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_business_city_id_fkey"
            columns: ["business_city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_rate_limit: {
        Args: { p_email: string; p_max_attempts?: number; p_window_minutes?: number }
        Returns: boolean
      }
      generate_unique_slug: {
        Args: { first_name: string; last_name: string }
        Returns: string
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_admin_secure: { Args: Record<PropertyKey, never>; Returns: boolean }
      log_admin_action: {
        Args: { 
          p_action: string; 
          p_table_name?: string; 
          p_record_id?: string; 
          p_old_values?: Json; 
          p_new_values?: Json 
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
      business_type: "company" | "individual"
      entity_type: "fbih" | "rs" | "brcko"
      license_type: "certified_accountant" | "certified_accounting_technician"
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
      app_role: ["admin", "user"],
      business_type: ["company", "individual"],
      entity_type: ["fbih", "rs", "brcko"],
      license_type: ["certified_accountant", "certified_accounting_technician"],
    },
  },
} as const
