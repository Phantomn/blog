import supabase from '../../lib/supabase'

export default async function handler(req, res) {
  // HTTP 메소드 확인
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '허용되지 않는 메소드입니다' })
  }

  try {
    // Supabase에서 posts 테이블의 데이터 가져오기
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // 성공적으로 데이터를 가져왔을 때
    return res.status(200).json(data)
  } catch (error) {
    console.error('포스트를 가져오는 중 오류 발생:', error)
    return res.status(500).json({ message: '서버 오류가 발생했습니다', error: error.message })
  }
}
