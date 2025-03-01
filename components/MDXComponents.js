/* eslint-disable react/display-name */
import { useMemo } from 'react'
import { getMDXComponent } from 'mdx-bundler/client'
import Image from './Image'
import CustomLink from './Link'
import TOCInline from './TOCInline'
import Pre from './Pre'
import PageTitle from './PageTitle'
import { BlogNewsletterForm } from './NewsletterForm'

export const MDXComponents = {
  Image,
  TOCInline,
  PageTitle,
  a: CustomLink,
  pre: Pre,
  BlogNewsletterForm: BlogNewsletterForm,
  wrapper: ({ components, layout, ...rest }) => {
    if (layout) {
      const Layout = require(`../layouts/${layout}`).default
      return <Layout {...rest} />
    }
    return <div {...rest} />
  },
}

export const MDXLayoutRenderer = ({ layout, mdxSource, frontMatter, ...rest }) => {
  const MDXLayout = useMemo(() => getMDXComponent(mdxSource), [mdxSource])

  return (
    <MDXLayout layout={layout} components={MDXComponents} frontmatter={frontMatter} {...rest} />
  )
}
