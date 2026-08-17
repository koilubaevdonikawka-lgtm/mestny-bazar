export interface BannerDTO {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
}

export interface CreateBannerRequest {
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  sortOrder?: number;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
}

export interface UpdateBannerRequest {
  id: string;
  title?: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  sortOrder?: number;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
}
