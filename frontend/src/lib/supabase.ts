import { createClient } from "@supabase/supabase-js";

// Both values are public by design (the publishable key only grants what Row Level Security allows:
// reading the catalog, and writing only for accounts listed in public.admins). Never put the
// secret / service_role key in frontend code.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "https://thdbbtbyrdvrxyxxsbgo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_47p2WpaEKiI3yIItZ-MwmA_ciICb0eG";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: "scoot-admin-auth" },
});

export interface ProductRow {
  id: string;
  name: string;
  price: number;
  opening_price: number | null;
  shopee_item_id: string | null;
  active: boolean;
  sort_index: number;
  updated_at?: string;
}

export interface VariantRow {
  product_id: string;
  code: string;
  color_name: string | null;
  stock: number;
  sort_index: number;
  updated_at?: string;
}

export interface PromoSetting {
  end: string;
  label: string;
}
