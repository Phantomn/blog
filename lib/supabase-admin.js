import { createClient } from '@supabase/supabase-js'

// 서버 측에서 사용할 Supabase 클라이언트 (관리자 권한)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// 서비스 롤 키를 사용하여 관리자 권한으로 Supabase에 접근
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

/**
 * 서버 측에서 Supabase 테이블에서 데이터를 가져오는 함수
 * @param {string} table - 테이블 이름
 * @param {Object} options - 쿼리 옵션
 * @returns {Promise<Array>} - 데이터 배열
 */
export async function fetchFromSupabaseServer(table, options = {}) {
  let query = supabaseAdmin.from(table).select('*')

  // 정렬 옵션 적용
  if (options.orderBy) {
    query = query.order(options.orderBy.column, {
      ascending: options.orderBy.ascending,
    })
  }

  // 필터 옵션 적용
  if (options.filter) {
    query = query.filter(options.filter.column, options.filter.operator, options.filter.value)
  }

  // 페이지네이션 적용
  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Supabase 쿼리 오류:', error)
    throw new Error(error.message)
  }

  return data
}

export default supabaseAdmin
