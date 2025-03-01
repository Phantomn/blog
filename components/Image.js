import NextImage from 'next/image'

// eslint-disable-next-line jsx-a11y/alt-text
const Image = ({ fetchPriority, ...rest }) => {
  // fetchPriority 속성을 완전히 제거
  return <NextImage {...rest} />
}

export default Image
