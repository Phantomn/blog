import { createClient } from '@supabase/supabase-js'

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 클라이언트가 한 번만 생성되도록 보장
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
