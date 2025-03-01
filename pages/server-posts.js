import Link from 'next/link'
import { PageSEO } from '../components/SEO'
import siteMetadata from '../data/siteMetadata'
import { fetchFromSupabaseServer } from '../lib/supabase-admin'

export default function ServerPosts({ posts, error }) {
  return (
    <>
      <PageSEO
        title={`서버 포스트 - ${siteMetadata.title}`}
        description="서버 측에서 가져온 블로그 포스트"
      />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            서버 포스트
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            서버 측에서 Supabase 데이터베이스에서 가져온 블로그 포스트 목록
          </p>
        </div>

        <div className="container py-12">
          {error ? (
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

// 서버 측에서 데이터 가져오기
export async function getServerSideProps() {
  try {
    // Supabase에서 posts 테이블의 데이터 가져오기
    const posts = await fetchFromSupabaseServer('posts', {
      orderBy: { column: 'created_at', ascending: false },
      limit: 10,
    })

    return {
      props: {
        posts,
        error: null,
      },
    }
  } catch (error) {
    console.error('서버 측에서 포스트를 가져오는 중 오류 발생:', error)
    return {
      props: {
        posts: [],
        error: error.message,
      },
    }
  }
}
