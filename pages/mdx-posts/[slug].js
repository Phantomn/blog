import { MDXLayoutRenderer } from '../../components/MDXComponents'
import { PageSEO } from '../../components/SEO'
import siteMetadata from '../../data/siteMetadata'
import { fetchFromSupabaseServer } from '../../lib/supabase-admin'
import { convertSupabasePostToMDX } from '../../lib/utils/mdx-converter'
import { generateSlugFromTitle } from '../../lib/utils/mdx-converter'

export default function Post({ post, mdxSource, frontMatter, toc }) {
  return (
    <>
      <PageSEO
        title={`${frontMatter.title} - ${siteMetadata.title}`}
        description={frontMatter.summary}
      />
      <article>
        <div className="xl:divide-y xl:divide-gray-200 xl:dark:divide-gray-700">
          <header className="pt-6 xl:pb-6">
            <div className="space-y-1 text-center">
              <dl className="space-y-10">
                <div>
                  <dt className="sr-only">게시일</dt>
                  <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                    <time dateTime={frontMatter.date}>
                      {new Date(frontMatter.date).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </dd>
                </div>
              </dl>
              <div>
                <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14">
                  {frontMatter.title}
                </h1>
              </div>
              <div className="flex justify-center gap-5 py-4">
                <span className="text-gray-500 dark:text-gray-400">
                  {frontMatter.readingTime.text}
                </span>
                {frontMatter.platform && (
                  <span className="text-gray-500 dark:text-gray-400">
                    플랫폼: {frontMatter.platform}
                  </span>
                )}
                {frontMatter.link && (
                  <a
                    href={frontMatter.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    원본 링크
                  </a>
                )}
              </div>
              {frontMatter.tags && frontMatter.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 py-2">
                  {frontMatter.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded dark:bg-gray-700 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </header>
          <div className="divide-y divide-gray-200 pb-8 dark:divide-gray-700 xl:grid xl:grid-cols-4 xl:gap-x-6 xl:divide-y-0">
            <dl className="pt-6 pb-10 xl:border-b xl:border-gray-200 xl:pt-11 xl:dark:border-gray-700">
              <dt className="sr-only">작성자</dt>
              <dd>
                <ul className="flex justify-center space-x-8 sm:space-x-12 xl:block xl:space-x-0 xl:space-y-8">
                  <li className="flex items-center space-x-2">
                    <dl className="whitespace-nowrap text-sm font-medium leading-5">
                      <dt className="sr-only">이름</dt>
                      <dd className="text-gray-900 dark:text-gray-100">{siteMetadata.author}</dd>
                    </dl>
                  </li>
                </ul>
              </dd>
            </dl>
            <div className="divide-y divide-gray-200 dark:divide-gray-700 xl:col-span-3 xl:row-span-2 xl:pb-0">
              <div className="prose max-w-none pt-10 pb-8 dark:prose-dark">
                <MDXLayoutRenderer mdxSource={mdxSource} frontmatter={frontMatter} toc={toc} />
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  )
}

export async function getStaticProps({ params }) {
  try {
    const { slug } = params

    // Supabase에서 슬러그와 일치하는 포스트 찾기
    const posts = await fetchFromSupabaseServer('posts', {
      orderBy: { column: 'published_on', ascending: false },
    })

    // 슬러그와 일치하는 포스트 찾기
    const post = posts.find((post) => {
      const postSlug = generateSlugFromTitle(post.title)
      return postSlug === slug
    })

    if (!post) {
      return {
        notFound: true,
      }
    }

    // MDX로 변환
    const { mdxSource, frontMatter, toc } = await convertSupabasePostToMDX(post)

    return {
      props: {
        post,
        mdxSource,
        frontMatter,
        toc,
      },
      // 1시간마다 재생성
      revalidate: 3600,
    }
  } catch (error) {
    console.error('포스트를 가져오는 중 오류 발생:', error)
    return {
      notFound: true,
    }
  }
}

export async function getStaticPaths() {
  try {
    // Supabase에서 모든 포스트 가져오기
    const posts = await fetchFromSupabaseServer('posts', {
      orderBy: { column: 'published_on', ascending: false },
      limit: 20, // 최근 20개 포스트만 미리 생성
    })

    // 슬러그 생성
    const paths = posts.map((post) => ({
      params: {
        slug: generateSlugFromTitle(post.title),
      },
    }))

    return {
      paths,
      fallback: 'blocking', // 요청 시 생성되지 않은 페이지 생성
    }
  } catch (error) {
    console.error('경로를 생성하는 중 오류 발생:', error)
    return {
      paths: [],
      fallback: 'blocking',
    }
  }
}
