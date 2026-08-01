export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string | null;
          created_at: string;
          district: string | null;
          full_address: string;
          id: string;
          is_default: boolean;
          label: string | null;
          notes: string | null;
          updated_at: string;
          user_id: string;
          zone_id: string | null;
        };
        Insert: {
          city?: string | null;
          created_at?: string;
          district?: string | null;
          full_address: string;
          id?: string;
          is_default?: boolean;
          label?: string | null;
          notes?: string | null;
          updated_at?: string;
          user_id: string;
          zone_id?: string | null;
        };
        Update: {
          city?: string | null;
          created_at?: string;
          district?: string | null;
          full_address?: string;
          id?: string;
          is_default?: boolean;
          label?: string | null;
          notes?: string | null;
          updated_at?: string;
          user_id?: string;
          zone_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "addresses_zone_id_fkey";
            columns: ["zone_id"];
            isOneToOne: false;
            referencedRelation: "delivery_zones";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_log: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          entity_id: string;
          entity_type: string;
          id: string;
          occurred_at: string;
          payload: Json;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          entity_id: string;
          entity_type: string;
          id?: string;
          occurred_at: string;
          payload?: Json;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          occurred_at?: string;
          payload?: Json;
        };
        Relationships: [];
      };
      cart_items: {
        Row: {
          cart_id: string;
          created_at: string;
          currency: string;
          id: string;
          image_url: string | null;
          name: string;
          price: number;
          product_id: string | null;
          product_slug: string | null;
          quantity: number;
          updated_at: string;
        };
        Insert: {
          cart_id: string;
          created_at?: string;
          currency?: string;
          id?: string;
          image_url?: string | null;
          name: string;
          price: number;
          product_id?: string | null;
          product_slug?: string | null;
          quantity: number;
          updated_at?: string;
        };
        Update: {
          cart_id?: string;
          created_at?: string;
          currency?: string;
          id?: string;
          image_url?: string | null;
          name?: string;
          price?: number;
          product_id?: string | null;
          product_slug?: string | null;
          quantity?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey";
            columns: ["cart_id"];
            isOneToOne: false;
            referencedRelation: "carts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      carts: {
        Row: {
          created_at: string;
          currency: string;
          id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          currency?: string;
          id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          currency?: string;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          is_active: boolean;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      delivery_zones: {
        Row: {
          created_at: string;
          free_from: number | null;
          id: string;
          is_active: boolean;
          name: string;
          price: number;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          free_from?: number | null;
          id?: string;
          is_active?: boolean;
          name: string;
          price?: number;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          free_from?: number | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          price?: number;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          line_total: number;
          order_id: string;
          product_id: string | null;
          product_image_url: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          line_total: number;
          order_id: string;
          product_id?: string | null;
          product_image_url?: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          line_total?: number;
          order_id?: string;
          product_id?: string | null;
          product_image_url?: string | null;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      order_operational_cascades: {
        Row: {
          order_id: string;
          triggered_at: string;
        };
        Insert: {
          order_id: string;
          triggered_at?: string;
        };
        Update: {
          order_id?: string;
          triggered_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_operational_cascades_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: true;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          address_snapshot: string;
          assigned_courier_id: string | null;
          created_at: string;
          currency: string;
          customer_name: string;
          customer_phone: string;
          delivery_fee: number;
          finik_payment_id: string | null;
          finik_payment_url: string | null;
          id: string;
          idempotency_key: string | null;
          notes: string | null;
          order_number: number;
          paid_at: string | null;
          payment_status: Database["public"]["Enums"]["payment_status"];
          status: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          updated_at: string;
          user_id: string | null;
          zone_id: string | null;
        };
        Insert: {
          address_snapshot: string;
          assigned_courier_id?: string | null;
          created_at?: string;
          currency?: string;
          customer_name: string;
          customer_phone: string;
          delivery_fee?: number;
          finik_payment_id?: string | null;
          finik_payment_url?: string | null;
          id?: string;
          idempotency_key?: string | null;
          notes?: string | null;
          order_number?: number;
          paid_at?: string | null;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          status?: Database["public"]["Enums"]["order_status"];
          subtotal?: number;
          total?: number;
          updated_at?: string;
          user_id?: string | null;
          zone_id?: string | null;
        };
        Update: {
          address_snapshot?: string;
          assigned_courier_id?: string | null;
          created_at?: string;
          currency?: string;
          customer_name?: string;
          customer_phone?: string;
          delivery_fee?: number;
          finik_payment_id?: string | null;
          finik_payment_url?: string | null;
          id?: string;
          idempotency_key?: string | null;
          notes?: string | null;
          order_number?: number;
          paid_at?: string | null;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          status?: Database["public"]["Enums"]["order_status"];
          subtotal?: number;
          total?: number;
          updated_at?: string;
          user_id?: string | null;
          zone_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "orders_zone_id_fkey";
            columns: ["zone_id"];
            isOneToOne: false;
            referencedRelation: "delivery_zones";
            referencedColumns: ["id"];
          },
        ];
      };
      platform_settings: {
        Row: {
          category: string;
          key: string;
          updated_at: string;
          updated_by: string | null;
          value: Json;
        };
        Insert: {
          category: string;
          key: string;
          updated_at?: string;
          updated_by?: string | null;
          value: Json;
        };
        Update: {
          category?: string;
          key?: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: Json;
        };
        Relationships: [];
      };
      products: {
        Row: {
          category_id: string | null;
          created_at: string;
          currency: string;
          description: string | null;
          id: string;
          image_url: string | null;
          is_active: boolean;
          low_stock_threshold: number | null;
          name: string;
          price: number;
          publication_status: Database["public"]["Enums"]["product_publication_status"];
          seller_id: string | null;
          slug: string;
          stock: number;
          unit: string | null;
          updated_at: string;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string;
          currency?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          low_stock_threshold?: number | null;
          name: string;
          price: number;
          publication_status?: Database["public"]["Enums"]["product_publication_status"];
          seller_id?: string | null;
          slug: string;
          stock?: number;
          unit?: string | null;
          updated_at?: string;
        };
        Update: {
          category_id?: string | null;
          created_at?: string;
          currency?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          low_stock_threshold?: number | null;
          name?: string;
          price?: number;
          publication_status?: Database["public"]["Enums"]["product_publication_status"];
          seller_id?: string | null;
          slug?: string;
          stock?: number;
          unit?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          full_name: string | null;
          id: string;
          is_blocked: boolean;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          full_name?: string | null;
          id: string;
          is_blocked?: boolean;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          full_name?: string | null;
          id?: string;
          is_blocked?: boolean;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      admin_scopes: {
        Row: {
          created_at: string;
          scope: Database["public"]["Enums"]["admin_scope"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          scope: Database["public"]["Enums"]["admin_scope"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          scope?: Database["public"]["Enums"]["admin_scope"];
          user_id?: string;
        };
        Relationships: [];
      };
      seller_profiles: {
        Row: {
          contact_phone: string | null;
          created_at: string;
          payout_details: string | null;
          store_name: string;
          updated_at: string;
          user_id: string;
          verification_status: Database["public"]["Enums"]["seller_verification_status"];
        };
        Insert: {
          contact_phone?: string | null;
          created_at?: string;
          payout_details?: string | null;
          store_name: string;
          updated_at?: string;
          user_id: string;
          verification_status?: Database["public"]["Enums"]["seller_verification_status"];
        };
        Update: {
          contact_phone?: string | null;
          created_at?: string;
          payout_details?: string | null;
          store_name?: string;
          updated_at?: string;
          user_id?: string;
          verification_status?: Database["public"]["Enums"]["seller_verification_status"];
        };
        Relationships: [];
      };
      suppliers: {
        Row: {
          contact_person: string | null;
          contact_phone: string | null;
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          notes: string | null;
          updated_at: string;
        };
        Insert: {
          contact_person?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          notes?: string | null;
          updated_at?: string;
        };
        Update: {
          contact_person?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      supplies: {
        Row: {
          created_at: string;
          expected_at: string | null;
          id: string;
          status: Database["public"]["Enums"]["supply_status"];
          supplier_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          expected_at?: string | null;
          id?: string;
          status?: Database["public"]["Enums"]["supply_status"];
          supplier_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          expected_at?: string | null;
          id?: string;
          status?: Database["public"]["Enums"]["supply_status"];
          supplier_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "supplies_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          },
        ];
      };
      supply_items: {
        Row: {
          id: string;
          product_id: string;
          purchase_price: number;
          quantity: number;
          supply_id: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          purchase_price: number;
          quantity: number;
          supply_id: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          purchase_price?: number;
          quantity?: number;
          supply_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "supply_items_supply_id_fkey";
            columns: ["supply_id"];
            isOneToOne: false;
            referencedRelation: "supplies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "supply_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      courier_status: {
        Row: {
          courier_id: string;
          is_available: boolean;
          last_seen_at: string;
        };
        Insert: {
          courier_id: string;
          is_available?: boolean;
          last_seen_at?: string;
        };
        Update: {
          courier_id?: string;
          is_available?: boolean;
          last_seen_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      reserve_product_stock: {
        Args: { items: Json };
        Returns: undefined;
      };
      release_product_stock: {
        Args: { items: Json };
        Returns: undefined;
      };
      create_order_with_items: {
        Args: { order_data: Json; items: Json };
        Returns: string;
      };
      set_default_address: {
        Args: { p_user_id: string; p_address_id: string };
        Returns: undefined;
      };
      upsert_cart_items: {
        Args: { p_user_id: string; p_items: Json };
        Returns: {
          product_id: string | null;
          product_slug: string | null;
          quantity: number;
          name: string;
          price: number;
          currency: string;
          image_url: string | null;
        }[];
      };
    };
    Enums: {
      app_role: "admin" | "customer" | "seller" | "warehouse" | "courier";
      admin_scope: "finance" | "marketing";
      order_status:
        | "pending"
        | "paid"
        | "confirmed"
        | "preparing"
        | "ready_for_delivery"
        | "delivering"
        | "arrived"
        | "delivered"
        | "cancelled";
      payment_status: "unpaid" | "awaiting" | "paid" | "failed" | "refunded";
      product_publication_status: "DRAFT" | "PUBLISHED" | "HIDDEN";
      seller_verification_status: "PENDING" | "VERIFIED" | "REJECTED";
      supply_status: "DRAFT" | "SENT" | "CONFIRMED" | "RECEIVED" | "CANCELLED";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "customer", "seller", "warehouse", "courier"],
      admin_scope: ["finance", "marketing"],
      order_status: [
        "pending",
        "paid",
        "confirmed",
        "preparing",
        "ready_for_delivery",
        "delivering",
        "arrived",
        "delivered",
        "cancelled",
      ],
      payment_status: ["unpaid", "awaiting", "paid", "failed", "refunded"],
      product_publication_status: ["DRAFT", "PUBLISHED", "HIDDEN"],
      seller_verification_status: ["PENDING", "VERIFIED", "REJECTED"],
      supply_status: ["DRAFT", "SENT", "CONFIRMED", "RECEIVED", "CANCELLED"],
    },
  },
} as const;
