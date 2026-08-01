import type { BannerDTO, CreateBannerRequest, UpdateBannerRequest } from "@shared/contracts/banner";
import type { IBannerRepository } from "@server/ports/banner.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";

interface BannerRow {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  sort_order: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
}

export function mapBannerRow(row: BannerRow): BannerDTO {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    imageUrl: row.image_url,
    linkUrl: row.link_url,
    sortOrder: row.sort_order,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    isActive: row.is_active,
  };
}

const BANNER_SELECT =
  "id, title, subtitle, image_url, link_url, sort_order, starts_at, ends_at, is_active";

export class SupabaseBannerRepository implements IBannerRepository {
  async listAll(): Promise<BannerDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("banners")
      .select(BANNER_SELECT)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to list banners: ${error.message}`);
    return (data ?? []).map(mapBannerRow);
  }

  async listActive(): Promise<BannerDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("banners")
      .select(BANNER_SELECT)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to list active banners: ${error.message}`);
    return (data ?? []).map(mapBannerRow);
  }

  async create(data: CreateBannerRequest): Promise<BannerDTO> {
    const { data: row, error } = await supabaseAdmin
      .from("banners")
      .insert({
        title: data.title,
        subtitle: data.subtitle ?? null,
        image_url: data.imageUrl ?? null,
        link_url: data.linkUrl ?? null,
        sort_order: data.sortOrder ?? 0,
        starts_at: data.startsAt ?? null,
        ends_at: data.endsAt ?? null,
        is_active: data.isActive ?? true,
      })
      .select(BANNER_SELECT)
      .single();

    if (error || !row) throw new Error(`Failed to create banner: ${error?.message ?? "unknown"}`);
    return mapBannerRow(row);
  }

  async update(data: UpdateBannerRequest): Promise<BannerDTO> {
    const patch: {
      title?: string;
      subtitle?: string | null;
      image_url?: string | null;
      link_url?: string | null;
      sort_order?: number;
      starts_at?: string | null;
      ends_at?: string | null;
      is_active?: boolean;
    } = {};
    if (data.title !== undefined) patch.title = data.title;
    if (data.subtitle !== undefined) patch.subtitle = data.subtitle;
    if (data.imageUrl !== undefined) patch.image_url = data.imageUrl;
    if (data.linkUrl !== undefined) patch.link_url = data.linkUrl;
    if (data.sortOrder !== undefined) patch.sort_order = data.sortOrder;
    if (data.startsAt !== undefined) patch.starts_at = data.startsAt;
    if (data.endsAt !== undefined) patch.ends_at = data.endsAt;
    if (data.isActive !== undefined) patch.is_active = data.isActive;

    const { data: row, error } = await supabaseAdmin
      .from("banners")
      .update(patch)
      .eq("id", data.id)
      .select(BANNER_SELECT)
      .single();

    if (error || !row) throw new Error(`Failed to update banner: ${error?.message ?? "unknown"}`);
    return mapBannerRow(row);
  }
}
