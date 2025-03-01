import { useState, useEffect } from 'react'
import Link from 'next/link'
import { fetchFromSupabase } from '../lib/utils/api'
import { PageSEO } from '../components/SEO'
import siteMetadata from '../data/siteMetadata'

export default function SupabasePosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadPosts() {
      try {
        // Supabase에서 posts 테이블의 데이터 가져오기
        const data = await fetchFromSupabase('posts', {
          orderBy: { column: 'created_at', ascending: false },
          limit: 10,
        })
        setPosts(data)
      } catch (err) {
        console.error('포스트를 가져오는 중 오류 발생:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

  return (
    <>
      <PageSEO
        title={`Supabase 포스트 - ${siteMetadata.title}`}
        description="Supabase에서 가져온 블로그 포스트"
      />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Supabase 포스트
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            Supabase 데이터베이스에서 가져온 블로그 포스트 목록
          </p>
        </div>

        <div className="container py-12">
          {loading ? (
            <p className="text-lg text-gray-600 dark:text-gray-400">포스트를 불러오는 중...</p>
          ) : error ? (
            <p className="text-lg text-red-600 dark:text-red-400">오류: {error}</p>
          ) : posts.length === 0 ? (
            <p className="text-lg text-gray-600 dark:text-gray-400">포스트가 없습니다.</p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {posts.map((post) => (
                <li key={post.id} className="py-4">
                  <article className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                    <div className="space-y-3 xl:col-span-3">
                      <div>
                        <h3 className="text-2xl font-bold leading-8 tracking-tight">
                          <Link
                            href={`/posts/${post.slug}`}
                            className="text-gray-900 dark:text-gray-100"
                          >
                            {post.title}
                          </Link>
                        </h3>
                        <div className="flex flex-wrap">
                          <time
                            className="text-base font-medium text-gray-500 dark:text-gray-400"
                            dateTime={post.created_at}
                          >
                            {new Date(post.created_at).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </time>
                        </div>
                      </div>
                      <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                        {post.summary || post.excerpt}
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}
