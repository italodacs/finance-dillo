// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// 🧩 Agora usando variáveis de ambiente (seguras na Vercel)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

// Criar cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Teste de conexão opcional (pode remover se quiser)
export const testSupabaseConnection = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error && error.message !== "JWT expired") throw error;
    console.log("✅ Supabase conectado");
    return true;
  } catch (error) {
    console.error("❌ Erro na conexão com Supabase:", error);
    return false;
  }
};
