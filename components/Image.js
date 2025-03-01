import NextImage from 'next/image'

// eslint-disable-next-line jsx-a11y/alt-text
const Image = ({ fetchPriority, ...rest }) => {
  // fetchPriority 속성이 있으면 소문자 fetchpriority로 변환
  const props = fetchPriority ? { fetchpriority: fetchPriority, ...rest } : rest
  return <NextImage {...props} />
}

export default Image
