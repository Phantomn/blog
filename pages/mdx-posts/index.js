import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PageSEO } from '../../components/SEO'
import siteMetadata from '../../data/siteMetadata'
import { fetchAPI } from '../../lib/utils/api'

export default function MDXPosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadPosts() {
      try {
        // MDX로 변환된 포스트 가져오기
        const data = await fetchAPI('mdx-posts')
        setPosts(data)
      } catch (err) {
        console.error('MDX 포스트를 가져오는 중 오류 발생:', err)
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
        title={`MDX 포스트 - ${siteMetadata.title}`}
        description="Supabase에서 가져와 MDX로 변환된 블로그 포스트"
      />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            MDX 포스트
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            Supabase에서 가져와 MDX로 변환된 블로그 포스트 목록
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
                            href={`/mdx-posts/${post.mdx.frontMatter.slug}`}
                            className="text-gray-900 dark:text-gray-100"
                          >
                            {post.title}
                          </Link>
                        </h3>
                        <div className="flex flex-wrap">
                          <time
                            className="text-base font-medium text-gray-500 dark:text-gray-400"
                            dateTime={post.published_on}
                          >
                            {new Date(post.published_on).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </time>
                          <span className="mx-2">•</span>
                          <span className="text-base font-medium text-gray-500 dark:text-gray-400">
                            {post.mdx.frontMatter.readingTime.text}
                          </span>
                          {post.platform && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="text-base font-medium text-gray-500 dark:text-gray-400">
                                {post.platform}
                              </span>
                            </>
                          )}
                        </div>
                        {post.mdx.frontMatter.tags && post.mdx.frontMatter.tags.length > 0 && (
                          <div className="flex flex-wrap mt-2">
                            {post.mdx.frontMatter.tags.map((tag) => (
                              <span
                                key={tag}
                                className="mr-2 mb-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded dark:bg-gray-700 dark:text-gray-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                        {post.summary}
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
