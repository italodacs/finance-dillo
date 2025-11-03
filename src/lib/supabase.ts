// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Para CodeSandbox, use as URLs diretamente (não use import.meta.env)
const supabaseUrl = "https://hhmwcomnhelrbctgbegh.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhobXdjb21uaGVscmJjdGdiZWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0OTU0OTQsImV4cCI6MjA3NTA3MTQ5NH0.tbRqUBzHMQLvBDdOcZAe70ii5PJ9cYK7rUPnZEqtFe8";

// Criar cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Função para verificar a conexão (simplificada para CodeSandbox)
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
