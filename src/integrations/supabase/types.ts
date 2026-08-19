export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
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
      attribute_groups: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      attribute_values: {
        Row: {
          attribute_id: string;
          created_at: string;
          id: string;
          sort_order: number;
          value: string;
        };
        Insert: {
          attribute_id: string;
          created_at?: string;
          id?: string;
          sort_order?: number;
          value: string;
        };
        Update: {
          attribute_id?: string;
          created_at?: string;
          id?: string;
          sort_order?: number;
          value?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attribute_values_attribute_id_fkey";
            columns: ["attribute_id"];
            isOneToOne: false;
            referencedRelation: "attributes";
            referencedColumns: ["id"];
          },
        ];
      };
      attributes: {
        Row: {
          created_at: string;
          group_id: string | null;
          id: string;
          is_active: boolean;
          is_filterable: boolean;
          name: string;
          slug: string;
          sort_order: number;
          unit: string | null;
          updated_at: string;
          value_type: Database["public"]["Enums"]["attribute_value_type"];
        };
        Insert: {
          created_at?: string;
          group_id?: string | null;
          id?: string;
          is_active?: boolean;
          is_filterable?: boolean;
          name: string;
          slug: string;
          sort_order?: number;
          unit?: string | null;
          updated_at?: string;
          value_type: Database["public"]["Enums"]["attribute_value_type"];
        };
        Update: {
          created_at?: string;
          group_id?: string | null;
          id?: string;
          is_active?: boolean;
          is_filterable?: boolean;
          name?: string;
          slug?: string;
          sort_order?: number;
          unit?: string | null;
          updated_at?: string;
          value_type?: Database["public"]["Enums"]["attribute_value_type"];
        };
        Relationships: [
          {
            foreignKeyName: "attributes_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "attribute_groups";
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
      banners: {
        Row: {
          created_at: string;
          ends_at: string | null;
          id: string;
          image_url: string | null;
          is_active: boolean;
          link_url: string | null;
          sort_order: number;
          starts_at: string | null;
          subtitle: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          ends_at?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          link_url?: string | null;
          sort_order?: number;
          starts_at?: string | null;
          subtitle?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          ends_at?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          link_url?: string | null;
          sort_order?: number;
          starts_at?: string | null;
          subtitle?: string | null;
          title?: string;
          updated_at?: string;
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
          name_kg: string | null;
          parent_id: string | null;
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
          name_kg?: string | null;
          parent_id?: string | null;
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
          name_kg?: string | null;
          parent_id?: string | null;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      category_attributes: {
        Row: {
          attribute_id: string;
          category_id: string;
          is_required: boolean;
          sort_order: number;
        };
        Insert: {
          attribute_id: string;
          category_id: string;
          is_required?: boolean;
          sort_order?: number;
        };
        Update: {
          attribute_id?: string;
          category_id?: string;
          is_required?: boolean;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "category_attributes_attribute_id_fkey";
            columns: ["attribute_id"];
            isOneToOne: false;
            referencedRelation: "attributes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "category_attributes_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      cities: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          slug: string;
          sort_order: number;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          slug: string;
          sort_order?: number;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          slug?: string;
          sort_order?: number;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      coupons: {
        Row: {
          code: string;
          created_at: string;
          discount_type: Database["public"]["Enums"]["coupon_discount_type"];
          discount_value: number;
          expires_at: string | null;
          id: string;
          is_active: boolean;
          max_uses: number | null;
          min_order_total: number;
          updated_at: string;
          uses_count: number;
        };
        Insert: {
          code: string;
          created_at?: string;
          discount_type: Database["public"]["Enums"]["coupon_discount_type"];
          discount_value: number;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          max_uses?: number | null;
          min_order_total?: number;
          updated_at?: string;
          uses_count?: number;
        };
        Update: {
          code?: string;
          created_at?: string;
          discount_type?: Database["public"]["Enums"]["coupon_discount_type"];
          discount_value?: number;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          max_uses?: number | null;
          min_order_total?: number;
          updated_at?: string;
          uses_count?: number;
        };
        Relationships: [];
      };
      courier_profiles: {
        Row: {
          admin_comment: string | null;
          created_at: string;
          created_by: string | null;
          first_name: string;
          hired_at: string | null;
          last_name: string;
          middle_name: string | null;
          phone: string;
          photo_url: string | null;
          plate_number: string | null;
          service_zone_id: string | null;
          status: Database["public"]["Enums"]["courier_profile_status"];
          updated_at: string;
          user_id: string;
          vehicle_type: Database["public"]["Enums"]["courier_vehicle_type"];
        };
        Insert: {
          admin_comment?: string | null;
          created_at?: string;
          created_by?: string | null;
          first_name: string;
          hired_at?: string | null;
          last_name: string;
          middle_name?: string | null;
          phone: string;
          photo_url?: string | null;
          plate_number?: string | null;
          service_zone_id?: string | null;
          status?: Database["public"]["Enums"]["courier_profile_status"];
          updated_at?: string;
          user_id: string;
          vehicle_type?: Database["public"]["Enums"]["courier_vehicle_type"];
        };
        Update: {
          admin_comment?: string | null;
          created_at?: string;
          created_by?: string | null;
          first_name?: string;
          hired_at?: string | null;
          last_name?: string;
          middle_name?: string | null;
          phone?: string;
          photo_url?: string | null;
          plate_number?: string | null;
          service_zone_id?: string | null;
          status?: Database["public"]["Enums"]["courier_profile_status"];
          updated_at?: string;
          user_id?: string;
          vehicle_type?: Database["public"]["Enums"]["courier_vehicle_type"];
        };
        Relationships: [
          {
            foreignKeyName: "courier_profiles_service_zone_id_fkey";
            columns: ["service_zone_id"];
            isOneToOne: false;
            referencedRelation: "delivery_zones";
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
      delivery_districts: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          updated_at: string;
          zone_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          updated_at?: string;
          zone_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          updated_at?: string;
          zone_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "delivery_districts_zone_id_fkey";
            columns: ["zone_id"];
            isOneToOne: false;
            referencedRelation: "delivery_zones";
            referencedColumns: ["id"];
          },
        ];
      };
      delivery_tariffs: {
        Row: {
          base_price: number;
          created_at: string;
          eta_max_minutes: number | null;
          eta_min_minutes: number | null;
          id: string;
          is_active: boolean;
          min_order_amount: number | null;
          min_order_for_free_delivery: number | null;
          name: string;
          price_per_km: number | null;
          pricing_model: Database["public"]["Enums"]["delivery_pricing_model"];
          priority: number;
          tariff_type: Database["public"]["Enums"]["delivery_tariff_type"];
          updated_at: string;
          valid_from: string | null;
          valid_to: string | null;
          weight_extra_fee_per_kg: number | null;
          zone_id: string | null;
        };
        Insert: {
          base_price?: number;
          created_at?: string;
          eta_max_minutes?: number | null;
          eta_min_minutes?: number | null;
          id?: string;
          is_active?: boolean;
          min_order_amount?: number | null;
          min_order_for_free_delivery?: number | null;
          name: string;
          price_per_km?: number | null;
          pricing_model?: Database["public"]["Enums"]["delivery_pricing_model"];
          priority?: number;
          tariff_type?: Database["public"]["Enums"]["delivery_tariff_type"];
          updated_at?: string;
          valid_from?: string | null;
          valid_to?: string | null;
          weight_extra_fee_per_kg?: number | null;
          zone_id?: string | null;
        };
        Update: {
          base_price?: number;
          created_at?: string;
          eta_max_minutes?: number | null;
          eta_min_minutes?: number | null;
          id?: string;
          is_active?: boolean;
          min_order_amount?: number | null;
          min_order_for_free_delivery?: number | null;
          name?: string;
          price_per_km?: number | null;
          pricing_model?: Database["public"]["Enums"]["delivery_pricing_model"];
          priority?: number;
          tariff_type?: Database["public"]["Enums"]["delivery_tariff_type"];
          updated_at?: string;
          valid_from?: string | null;
          valid_to?: string | null;
          weight_extra_fee_per_kg?: number | null;
          zone_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "delivery_tariffs_zone_id_fkey";
            columns: ["zone_id"];
            isOneToOne: false;
            referencedRelation: "delivery_zones";
            referencedColumns: ["id"];
          },
        ];
      };
      delivery_zones: {
        Row: {
          city_id: string;
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          sort_order: number;
          store_id: string | null;
          updated_at: string;
        };
        Insert: {
          city_id: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          sort_order?: number;
          store_id?: string | null;
          updated_at?: string;
        };
        Update: {
          city_id?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          sort_order?: number;
          store_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "delivery_zones_city_id_fkey";
            columns: ["city_id"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "delivery_zones_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      marketplace_catalog_snapshots: {
        Row: {
          id: string;
          snapshot: Json;
          updated_at: string;
        };
        Insert: {
          id: string;
          snapshot: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          snapshot?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      marketplace_category_snapshots: {
        Row: {
          catalog_id: string;
          id: string;
          snapshot: Json;
          updated_at: string;
        };
        Insert: {
          catalog_id: string;
          id: string;
          snapshot: Json;
          updated_at?: string;
        };
        Update: {
          catalog_id?: string;
          id?: string;
          snapshot?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      marketplace_domain_events: {
        Row: {
          aggregate_id: string;
          aggregate_type: string;
          created_at: string;
          event_name: string;
          id: string;
          occurred_at: string;
          payload: Json;
        };
        Insert: {
          aggregate_id: string;
          aggregate_type: string;
          created_at?: string;
          event_name: string;
          id?: string;
          occurred_at: string;
          payload?: Json;
        };
        Update: {
          aggregate_id?: string;
          aggregate_type?: string;
          created_at?: string;
          event_name?: string;
          id?: string;
          occurred_at?: string;
          payload?: Json;
        };
        Relationships: [];
      };
      marketplace_order_snapshots: {
        Row: {
          id: string;
          order_number: string;
          snapshot: Json;
          updated_at: string;
        };
        Insert: {
          id: string;
          order_number: string;
          snapshot: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          snapshot?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      marketplace_product_snapshots: {
        Row: {
          id: string;
          snapshot: Json;
          updated_at: string;
        };
        Insert: {
          id: string;
          snapshot: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          snapshot?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      marketplace_seller_snapshots: {
        Row: {
          id: string;
          snapshot: Json;
          updated_at: string;
        };
        Insert: {
          id: string;
          snapshot: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          snapshot?: Json;
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
          variant_id: string | null;
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
          variant_id?: string | null;
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
          variant_id?: string | null;
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
          {
            foreignKeyName: "order_items_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
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
          coupon_code: string | null;
          created_at: string;
          currency: string;
          customer_name: string;
          customer_phone: string;
          delivery_eta_max_minutes: number | null;
          delivery_eta_min_minutes: number | null;
          delivery_fee: number;
          delivery_tariff_id: string | null;
          discount_amount: number;
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
          coupon_code?: string | null;
          created_at?: string;
          currency?: string;
          customer_name: string;
          customer_phone: string;
          delivery_eta_max_minutes?: number | null;
          delivery_eta_min_minutes?: number | null;
          delivery_fee?: number;
          delivery_tariff_id?: string | null;
          discount_amount?: number;
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
          coupon_code?: string | null;
          created_at?: string;
          currency?: string;
          customer_name?: string;
          customer_phone?: string;
          delivery_eta_max_minutes?: number | null;
          delivery_eta_min_minutes?: number | null;
          delivery_fee?: number;
          delivery_tariff_id?: string | null;
          discount_amount?: number;
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
            foreignKeyName: "orders_delivery_tariff_id_fkey";
            columns: ["delivery_tariff_id"];
            isOneToOne: false;
            referencedRelation: "delivery_tariffs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_zone_id_fkey";
            columns: ["zone_id"];
            isOneToOne: false;
            referencedRelation: "delivery_zones";
            referencedColumns: ["id"];
          },
        ];
      };
      ownership_transfers: {
        Row: {
          accepted_at: string | null;
          cancelled_at: string | null;
          completed_at: string | null;
          created_at: string;
          full_handover: boolean;
          id: string;
          initiator_user_id: string;
          status: Database["public"]["Enums"]["ownership_transfer_status"];
          target_user_id: string;
        };
        Insert: {
          accepted_at?: string | null;
          cancelled_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          full_handover?: boolean;
          id?: string;
          initiator_user_id: string;
          status?: Database["public"]["Enums"]["ownership_transfer_status"];
          target_user_id: string;
        };
        Update: {
          accepted_at?: string | null;
          cancelled_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          full_handover?: boolean;
          id?: string;
          initiator_user_id?: string;
          status?: Database["public"]["Enums"]["ownership_transfer_status"];
          target_user_id?: string;
        };
        Relationships: [];
      };
      payment_events: {
        Row: {
          created_at: string;
          event_type: Database["public"]["Enums"]["payment_event_type"];
          id: string;
          metadata: Json | null;
          payment_id: string;
        };
        Insert: {
          created_at?: string;
          event_type: Database["public"]["Enums"]["payment_event_type"];
          id?: string;
          metadata?: Json | null;
          payment_id: string;
        };
        Update: {
          created_at?: string;
          event_type?: Database["public"]["Enums"]["payment_event_type"];
          id?: string;
          metadata?: Json | null;
          payment_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_events_payment_id_fkey";
            columns: ["payment_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          amount: number;
          created_at: string;
          currency: string;
          expires_at: string | null;
          failure_reason: string | null;
          id: string;
          idempotency_key: string;
          order_id: string;
          payment_url: string | null;
          provider: string;
          provider_payment_id: string | null;
          status: Database["public"]["Enums"]["payment_record_status"];
          updated_at: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          currency: string;
          expires_at?: string | null;
          failure_reason?: string | null;
          id?: string;
          idempotency_key: string;
          order_id: string;
          payment_url?: string | null;
          provider?: string;
          provider_payment_id?: string | null;
          status?: Database["public"]["Enums"]["payment_record_status"];
          updated_at?: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          currency?: string;
          expires_at?: string | null;
          failure_reason?: string | null;
          id?: string;
          idempotency_key?: string;
          order_id?: string;
          payment_url?: string | null;
          provider?: string;
          provider_payment_id?: string | null;
          status?: Database["public"]["Enums"]["payment_record_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      platform_ownership: {
        Row: {
          created_at: string;
          role: Database["public"]["Enums"]["platform_ownership_role"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          role: Database["public"]["Enums"]["platform_ownership_role"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          role?: Database["public"]["Enums"]["platform_ownership_role"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
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
      product_attribute_values: {
        Row: {
          attribute_id: string;
          attribute_value_id: string | null;
          created_at: string;
          id: string;
          product_id: string;
          updated_at: string;
          value_boolean: boolean | null;
          value_number: number | null;
          value_text: string | null;
        };
        Insert: {
          attribute_id: string;
          attribute_value_id?: string | null;
          created_at?: string;
          id?: string;
          product_id: string;
          updated_at?: string;
          value_boolean?: boolean | null;
          value_number?: number | null;
          value_text?: string | null;
        };
        Update: {
          attribute_id?: string;
          attribute_value_id?: string | null;
          created_at?: string;
          id?: string;
          product_id?: string;
          updated_at?: string;
          value_boolean?: boolean | null;
          value_number?: number | null;
          value_text?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "product_attribute_values_attribute_id_fkey";
            columns: ["attribute_id"];
            isOneToOne: false;
            referencedRelation: "attributes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_attribute_values_attribute_value_id_fkey";
            columns: ["attribute_value_id"];
            isOneToOne: false;
            referencedRelation: "attribute_values";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_attribute_values_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variant_attribute_values: {
        Row: {
          attribute_id: string;
          attribute_value_id: string | null;
          created_at: string;
          id: string;
          updated_at: string;
          value_boolean: boolean | null;
          value_number: number | null;
          value_text: string | null;
          variant_id: string;
        };
        Insert: {
          attribute_id: string;
          attribute_value_id?: string | null;
          created_at?: string;
          id?: string;
          updated_at?: string;
          value_boolean?: boolean | null;
          value_number?: number | null;
          value_text?: string | null;
          variant_id: string;
        };
        Update: {
          attribute_id?: string;
          attribute_value_id?: string | null;
          created_at?: string;
          id?: string;
          updated_at?: string;
          value_boolean?: boolean | null;
          value_number?: number | null;
          value_text?: string | null;
          variant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_variant_attribute_values_attribute_id_fkey";
            columns: ["attribute_id"];
            isOneToOne: false;
            referencedRelation: "attributes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_variant_attribute_values_attribute_value_id_fkey";
            columns: ["attribute_value_id"];
            isOneToOne: false;
            referencedRelation: "attribute_values";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_variant_attribute_values_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variant_stock: {
        Row: {
          created_at: string;
          low_stock_threshold: number | null;
          stock: number;
          updated_at: string;
          variant_id: string;
        };
        Insert: {
          created_at?: string;
          low_stock_threshold?: number | null;
          stock?: number;
          updated_at?: string;
          variant_id: string;
        };
        Update: {
          created_at?: string;
          low_stock_threshold?: number | null;
          stock?: number;
          updated_at?: string;
          variant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_variant_stock_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: true;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variants: {
        Row: {
          created_at: string;
          id: string;
          image_url: string | null;
          price: number | null;
          product_id: string;
          publication_status: Database["public"]["Enums"]["product_publication_status"];
          sku: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          price?: number | null;
          product_id: string;
          publication_status?: Database["public"]["Enums"]["product_publication_status"];
          sku: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          price?: number | null;
          product_id?: string;
          publication_status?: Database["public"]["Enums"]["product_publication_status"];
          sku?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          category_id: string | null;
          country_of_origin: string | null;
          created_at: string;
          currency: string;
          description: string | null;
          id: string;
          image_url: string | null;
          image_urls: string[];
          is_active: boolean;
          low_stock_threshold: number | null;
          manufacturer: string | null;
          name: string;
          price: number;
          publication_status: Database["public"]["Enums"]["product_publication_status"];
          seller_id: string | null;
          sku: string | null;
          slug: string;
          stock: number;
          unit: string | null;
          updated_at: string;
          weight_kg: number | null;
        };
        Insert: {
          category_id?: string | null;
          country_of_origin?: string | null;
          created_at?: string;
          currency?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          image_urls?: string[];
          is_active?: boolean;
          low_stock_threshold?: number | null;
          manufacturer?: string | null;
          name: string;
          price: number;
          publication_status?: Database["public"]["Enums"]["product_publication_status"];
          seller_id?: string | null;
          sku?: string | null;
          slug: string;
          stock?: number;
          unit?: string | null;
          updated_at?: string;
          weight_kg?: number | null;
        };
        Update: {
          category_id?: string | null;
          country_of_origin?: string | null;
          created_at?: string;
          currency?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          image_urls?: string[];
          is_active?: boolean;
          low_stock_threshold?: number | null;
          manufacturer?: string | null;
          name?: string;
          price?: number;
          publication_status?: Database["public"]["Enums"]["product_publication_status"];
          seller_id?: string | null;
          sku?: string | null;
          slug?: string;
          stock?: number;
          unit?: string | null;
          updated_at?: string;
          weight_kg?: number | null;
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
      rbac_permissions: {
        Row: {
          action: string;
          created_at: string;
          description: string | null;
          id: string;
          is_system: boolean;
          module: string;
        };
        Insert: {
          action: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_system?: boolean;
          module: string;
        };
        Update: {
          action?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_system?: boolean;
          module?: string;
        };
        Relationships: [];
      };
      rbac_role_permissions: {
        Row: {
          permission_id: string;
          role_id: string;
        };
        Insert: {
          permission_id: string;
          role_id: string;
        };
        Update: {
          permission_id?: string;
          role_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rbac_role_permissions_permission_id_fkey";
            columns: ["permission_id"];
            isOneToOne: false;
            referencedRelation: "rbac_permissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rbac_role_permissions_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "rbac_roles";
            referencedColumns: ["id"];
          },
        ];
      };
      rbac_roles: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_system: boolean;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_system?: boolean;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_system?: boolean;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      rbac_user_roles: {
        Row: {
          assigned_at: string;
          assigned_by: string | null;
          role_id: string;
          user_id: string;
        };
        Insert: {
          assigned_at?: string;
          assigned_by?: string | null;
          role_id: string;
          user_id: string;
        };
        Update: {
          assigned_at?: string;
          assigned_by?: string | null;
          role_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rbac_user_roles_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "rbac_roles";
            referencedColumns: ["id"];
          },
        ];
      };
      seller_payouts: {
        Row: {
          commission_amount: number;
          commission_rate: number;
          completed_at: string | null;
          created_at: string;
          gross_revenue: number;
          id: string;
          payout_amount: number;
          period_end: string;
          period_start: string;
          seller_id: string;
          status: Database["public"]["Enums"]["payout_status"];
        };
        Insert: {
          commission_amount: number;
          commission_rate: number;
          completed_at?: string | null;
          created_at?: string;
          gross_revenue: number;
          id?: string;
          payout_amount: number;
          period_end: string;
          period_start: string;
          seller_id: string;
          status?: Database["public"]["Enums"]["payout_status"];
        };
        Update: {
          commission_amount?: number;
          commission_rate?: number;
          completed_at?: string | null;
          created_at?: string;
          gross_revenue?: number;
          id?: string;
          payout_amount?: number;
          period_end?: string;
          period_start?: string;
          seller_id?: string;
          status?: Database["public"]["Enums"]["payout_status"];
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
      stores: {
        Row: {
          address: string;
          city_id: string;
          created_at: string;
          id: string;
          is_active: boolean;
          lat: number | null;
          lng: number | null;
          name: string;
          updated_at: string;
        };
        Insert: {
          address: string;
          city_id: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          lat?: number | null;
          lng?: number | null;
          name: string;
          updated_at?: string;
        };
        Update: {
          address?: string;
          city_id?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          lat?: number | null;
          lng?: number | null;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stores_city_id_fkey";
            columns: ["city_id"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["id"];
          },
        ];
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
            foreignKeyName: "supply_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "supply_items_supply_id_fkey";
            columns: ["supply_id"];
            isOneToOne: false;
            referencedRelation: "supplies";
            referencedColumns: ["id"];
          },
        ];
      };
      translation_cache: {
        Row: {
          created_at: string;
          id: string;
          source_language: string;
          source_text: string;
          source_text_hash: string;
          target_language: string;
          translated_text: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          source_language: string;
          source_text: string;
          source_text_hash: string;
          target_language: string;
          translated_text: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          source_language?: string;
          source_text?: string;
          source_text_hash?: string;
          target_language?: string;
          translated_text?: string;
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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      claim_root_owner: { Args: { p_user_id: string }; Returns: undefined };
      complete_ownership_transfer: {
        Args: { p_transfer_id: string };
        Returns: undefined;
      };
      create_order_with_items: {
        Args: { items: Json; order_data: Json };
        Returns: string;
      };
      increment_coupon_uses: {
        Args: { p_coupon_id: string };
        Returns: undefined;
      };
      release_product_stock: { Args: { items: Json }; Returns: undefined };
      release_variant_stock: { Args: { items: Json }; Returns: undefined };
      reserve_product_stock: { Args: { items: Json }; Returns: undefined };
      reserve_variant_stock: { Args: { items: Json }; Returns: undefined };
      set_default_address: {
        Args: { p_address_id: string; p_user_id: string };
        Returns: undefined;
      };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
      upsert_cart_items: {
        Args: { p_items: Json; p_user_id: string };
        Returns: {
          currency: string;
          image_url: string;
          name: string;
          price: number;
          product_id: string;
          product_slug: string;
          quantity: number;
        }[];
      };
    };
    Enums: {
      admin_scope: "finance" | "marketing";
      app_role: "admin" | "customer" | "warehouse" | "courier" | "seller";
      attribute_value_type: "TEXT" | "NUMBER" | "BOOLEAN" | "LIST";
      coupon_discount_type: "PERCENTAGE" | "FIXED";
      courier_profile_status: "ACTIVE" | "BLOCKED";
      courier_vehicle_type: "ON_FOOT" | "BICYCLE" | "MOTORCYCLE" | "CAR" | "OTHER";
      delivery_pricing_model: "FIXED" | "BY_ZONE" | "BY_DISTANCE";
      delivery_tariff_type: "STANDARD" | "HOLIDAY" | "CORPORATE" | "PROMOTIONAL";
      order_status:
        | "pending"
        | "paid"
        | "preparing"
        | "delivering"
        | "delivered"
        | "cancelled"
        | "confirmed"
        | "ready_for_delivery"
        | "arrived";
      ownership_transfer_status: "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELLED";
      payment_event_type:
        | "created"
        | "redirect_issued"
        | "webhook_received"
        | "signature_invalid"
        | "confirmed"
        | "failed"
        | "expired"
        | "status_rechecked"
        | "rollback";
      payment_record_status: "pending" | "awaiting" | "paid" | "failed" | "expired" | "refunded";
      payment_status: "unpaid" | "awaiting" | "paid" | "failed" | "refunded";
      payout_status: "PENDING" | "COMPLETED";
      platform_ownership_role: "ROOT_OWNER" | "OWNER";
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      admin_scope: ["finance", "marketing"],
      app_role: ["admin", "customer", "warehouse", "courier", "seller"],
      attribute_value_type: ["TEXT", "NUMBER", "BOOLEAN", "LIST"],
      coupon_discount_type: ["PERCENTAGE", "FIXED"],
      courier_profile_status: ["ACTIVE", "BLOCKED"],
      courier_vehicle_type: ["ON_FOOT", "BICYCLE", "MOTORCYCLE", "CAR", "OTHER"],
      delivery_pricing_model: ["FIXED", "BY_ZONE", "BY_DISTANCE"],
      delivery_tariff_type: ["STANDARD", "HOLIDAY", "CORPORATE", "PROMOTIONAL"],
      order_status: [
        "pending",
        "paid",
        "preparing",
        "delivering",
        "delivered",
        "cancelled",
        "confirmed",
        "ready_for_delivery",
        "arrived",
      ],
      ownership_transfer_status: ["PENDING", "ACCEPTED", "COMPLETED", "CANCELLED"],
      payment_event_type: [
        "created",
        "redirect_issued",
        "webhook_received",
        "signature_invalid",
        "confirmed",
        "failed",
        "expired",
        "status_rechecked",
        "rollback",
      ],
      payment_record_status: ["pending", "awaiting", "paid", "failed", "expired", "refunded"],
      payment_status: ["unpaid", "awaiting", "paid", "failed", "refunded"],
      payout_status: ["PENDING", "COMPLETED"],
      platform_ownership_role: ["ROOT_OWNER", "OWNER"],
      product_publication_status: ["DRAFT", "PUBLISHED", "HIDDEN"],
      seller_verification_status: ["PENDING", "VERIFIED", "REJECTED"],
      supply_status: ["DRAFT", "SENT", "CONFIRMED", "RECEIVED", "CANCELLED"],
    },
  },
} as const;
