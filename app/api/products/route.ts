import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

let supabaseAdmin: ReturnType<typeof createClient> | null = null;

function getSupabaseAdmin() {
  if (supabaseAdmin) return supabaseAdmin;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase configuration");
  }
  
  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  return supabaseAdmin;
}

export async function GET(request: NextRequest) {
  try {
    let db;
    try {
      db = getSupabaseAdmin();
    } catch (dbError: any) {
      return NextResponse.json(
        { error: "Database not configured: " + dbError.message },
        { status: 500 }
      );
    }

    const { data: products, error } = await db
      .from("products")
      .select("*")
      .gt("stock", 0)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    return NextResponse.json({ products: products || [] });

  } catch (error: any) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
