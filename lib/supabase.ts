// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Centralized Supabase client for frontend usage
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,            // Your Supabase project URL
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! // Your client-side anon key
)

