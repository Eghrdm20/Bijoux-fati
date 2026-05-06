export type Product = {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number;
  rating: number | null;
  reviews: number | null;
  category: string;
  is_active: boolean;
  created_at?: string;
};

export type CartItem = Product & { quantity: number };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jatizfpvxvxlnzonljew.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_7wKoZGuJ9Ey-e9dL_Ozd2w_93z0ptkx';

function assertSupabaseEnv() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Check lib/supabase.ts or add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
}

async function supabaseFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  assertSupabaseEnv();

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: supabaseAnonKey!,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase request failed with ${response.status}`);
  }

  return response.status === 204 ? ([] as T) : response.json();
}

export async function fetchProducts(): Promise<Product[]> {
  return supabaseFetch<Product[]>(
    "products?select=*&is_active=eq.true&order=created_at.desc"
  );
}

export async function createOrder(input: {
  customer_name?: string;
  customer_phone?: string;
  pi_username?: string;
  total: number;
  items: Array<{ product_id: string; name: string; price: number; quantity: number }>;
}) {
  const [order] = await supabaseFetch<any[]>("orders", {
    method: "POST",
    body: JSON.stringify({
      customer_name: input.customer_name || null,
      customer_phone: input.customer_phone || null,
      pi_username: input.pi_username || null,
      total: input.total,
      status: "pending",
    }),
  });

  if (order?.id && input.items.length > 0) {
    await supabaseFetch("order_items", {
      method: "POST",
      body: JSON.stringify(
        input.items.map((item) => ({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.name,
          price: item.price,
          quantity: item.quantity,
        }))
      ),
    });
  }

  return order;
}
