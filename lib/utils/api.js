/**
 * API 엔드포인트에서 데이터를 가져오는 함수
 * @param {string} endpoint - API 엔드포인트 경로
 * @returns {Promise<any>} - API 응답 데이터
 */
export async function fetchAPI(endpoint) {
  const response = await fetch(`/api/${endpoint}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '알 수 없는 오류가 발생했습니다')
  }

  return await response.json()
}

/**
 * 블로그 포스트 데이터를 가져오는 함수
 * @returns {Promise<Array>} - 포스트 배열
 */
export async function getPosts() {
  return await fetchAPI('posts')
}

/**
 * Supabase에서 직접 데이터를 가져오는 함수 (클라이언트 측에서 사용)
 * @param {string} table - 테이블 이름
 * @param {Object} options - Supabase 쿼리 옵션
 * @returns {Promise<Array>} - 데이터 배열
 */
export async function fetchFromSupabase(table, options = {}) {
  // 이 함수는 클라이언트 측에서만 사용해야 합니다
  const supabase = (await import('../supabase')).default

  let query = supabase.from(table).select('*')

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
    throw new Error(error.message)
  }

  return data
}
