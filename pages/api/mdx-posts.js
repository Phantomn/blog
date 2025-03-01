import supabase from '../../lib/supabase'
import { convertSupabasePostToMDX } from '../../lib/utils/mdx-converter'

export default async function handler(req, res) {
  // HTTP 메소드 확인
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '허용되지 않는 메소드입니다' })
  }

  const { slug, id } = req.query

  try {
    let query = supabase.from('posts').select('*')

    // ID로 특정 포스트 조회
    if (id) {
      query = query.eq('id', id)
    }
    // 슬러그로 특정 포스트 조회 (제목에서 생성된 슬러그와 일치하는지 확인)
    else if (slug) {
      // 슬러그는 제목에서 생성되므로 제목을 기반으로 검색
      // 정확한 매칭이 어려우므로 ilike를 사용하여 유사한 제목 검색
      query = query.ilike('title', `%${slug.replace(/-/g, '%')}%`)
    }

    // 최신순으로 정렬
    query = query.order('published_on', { ascending: false })

    // 단일 포스트가 아닌 경우 최대 10개만 가져옴
    if (!id && !slug) {
      query = query.limit(10)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: '포스트를 찾을 수 없습니다' })
    }

    // 단일 포스트인 경우 MDX로 변환
    if (id || slug) {
      const post = data[0]
      const mdxPost = await convertSupabasePostToMDX(post)
      return res.status(200).json(mdxPost)
    }

    // 여러 포스트인 경우 모두 MDX로 변환
    const mdxPosts = await Promise.all(
      data.map(async (post) => {
        const mdxPost = await convertSupabasePostToMDX(post)
        return {
          ...post,
          mdx: mdxPost,
        }
      })
    )

    return res.status(200).json(mdxPosts)
  } catch (error) {
    console.error('MDX 포스트를 가져오는 중 오류 발생:', error)
    return res.status(500).json({ message: '서버 오류가 발생했습니다', error: error.message })
  }
}
