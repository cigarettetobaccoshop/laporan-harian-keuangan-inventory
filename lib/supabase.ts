import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://zgsbtexngystdmakqjyi.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_7wqbX7wUVFJZqinPyy8XLQ_SimByBEo";

export const supabase = createBrowserClient(url, key);
