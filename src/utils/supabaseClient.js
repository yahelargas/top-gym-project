import { createClient } from '@supabase/supabase-js'
import { PROJECT_URL, SUPABASE_ANON_KEY } from './config'
// In Vite, these must start with VITE_
const supabaseUrl = PROJECT_URL
const supabaseAnonKey = SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)