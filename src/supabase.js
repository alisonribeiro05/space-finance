import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("URL SUPABASE:", supabaseUrl);
console.log("CHAVE SUPABASE:", supabaseAnonKey ? "OK" : "NÃO ENCONTRADA");

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);