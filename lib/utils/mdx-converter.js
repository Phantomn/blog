import { bundleMDX } from 'mdx-bundler'
import path from 'path'
import readingTime from 'reading-time'

// Remark packages
import remarkGfm from 'remark-gfm'
import remarkFootnotes from 'remark-footnotes'
import remarkMath from 'remark-math'
import remarkCodeTitles from '../remark-code-title'
import remarkTocHeadings from '../remark-toc-headings'
import remarkImgToJsx from '../remark-img-to-jsx'

// Rehype packages
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatex from 'rehype-katex'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypePresetMinify from 'rehype-preset-minify'

const root = process.cwd()

/**
 * 평문 콘텐츠를 MDX로 변환하는 함수
 * @param {string} content - 변환할 평문 콘텐츠
 * @param {Object} metadata - 메타데이터 (frontmatter)
 * @returns {Promise<Object>} - MDX 소스 코드와 메타데이터
 */
export async function convertToMDX(content, metadata = {}) {
  // https://github.com/kentcdodds/mdx-bundler#nextjs-esbuild-enoent
  if (process.platform === 'win32') {
    process.env.ESBUILD_BINARY_PATH = path.join(root, 'node_modules', 'esbuild', 'esbuild.exe')
  } else {
    process.env.ESBUILD_BINARY_PATH = path.join(root, 'node_modules', 'esbuild', 'bin', 'esbuild')
  }

  let toc = []

  try {
    const { code } = await bundleMDX({
      source: content,
      // mdx imports can be automatically source from the components directory
      cwd: path.join(root, 'components'),
      xdmOptions(options) {
        // this is the recommended way to add custom remark/rehype plugins:
        // The syntax might look weird, but it protects you in case we add/remove
        // plugins in the future.
        options.remarkPlugins = [
          ...(options.remarkPlugins ?? []),
          [remarkTocHeadings, { exportRef: toc }],
          remarkGfm,
          remarkCodeTitles,
          [remarkFootnotes, { inlineNotes: true }],
          remarkMath,
          remarkImgToJsx,
        ]
        options.rehypePlugins = [
          ...(options.rehypePlugins ?? []),
          rehypeSlug,
          rehypeAutolinkHeadings,
          rehypeKatex,
          [rehypePrismPlus, { ignoreMissing: true }],
          rehypePresetMinify,
        ]
        return options
      },
      esbuildOptions: (options) => {
        options.loader = {
          ...options.loader,
          '.js': 'jsx',
        }
        return options
      },
    })

    return {
      mdxSource: code,
      toc,
      frontMatter: {
        readingTime: readingTime(code),
        ...metadata,
        date: metadata.date ? new Date(metadata.date).toISOString() : new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error('MDX 변환 중 오류 발생:', error)
    throw new Error(`MDX 변환 실패: ${error.message}`)
  }
}

/**
 * Supabase 포스트 데이터를 MDX로 변환하는 함수
 * @param {Object} post - Supabase에서 가져온 포스트 데이터
 * @returns {Promise<Object>} - MDX 소스 코드와 메타데이터
 */
export async function convertSupabasePostToMDX(post) {
  // 포스트 콘텐츠를 MDX로 변환
  const metadata = {
    title: post.title,
    date: post.published_on,
    summary: post.summary,
    tags: extractTagsFromHierarchical(post.hierarchical_tags),
    platform: post.platform,
    link: post.link,
    slug: generateSlugFromTitle(post.title),
  }

  return await convertToMDX(post.content, metadata)
}

/**
 * 계층적 태그에서 태그 배열을 추출하는 함수
 * @param {Object} hierarchicalTags - 계층적 태그 객체
 * @returns {Array} - 태그 배열
 */
function extractTagsFromHierarchical(hierarchicalTags) {
  if (!hierarchicalTags) return []

  // 모든 레벨의 태그를 하나의 배열로 합침
  const allTags = [
    ...(hierarchicalTags.top || []),
    ...(hierarchicalTags.middle || []),
    ...(hierarchicalTags.sub || []),
  ]

  // 중복 제거
  return [...new Set(allTags)]
}

/**
 * 제목에서 슬러그를 생성하는 함수
 * @param {string} title - 포스트 제목
 * @returns {string} - 생성된 슬러그
 */
export function generateSlugFromTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^가-힣a-z0-9\s]/g, '') // 한글, 영문, 숫자, 공백만 남김
    .replace(/\s+/g, '-') // 공백을 하이픈으로 변경
    .replace(/-+/g, '-') // 연속된 하이픈을 하나로 변경
}
