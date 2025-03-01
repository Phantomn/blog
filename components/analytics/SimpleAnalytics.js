import Script from 'next/script'

const SimpleAnalyticsScript = () => {
  return (
    <>
      <Script strategy="afterInteractive" id="sa-script">
        {`
            window.sa_event=window.sa_event||function(){var a=[].slice.call(arguments);window.sa_event.q?window.sa_event.q.push(a):window.sa_event.q=[a]};
        `}
      </Script>
      <Script strategy="afterInteractive" src="https://scripts.simpleanalyticscdn.com/latest.js" />
    </>
  )
}

// https://docs.simpleanalytics.com/events
export const logEvent = (eventName, callback) => {
  if (callback) {
    return window.sa_event?.(eventName, callback)
  } else {
    return window.sa_event?.(eventName)
  }
}

export default SimpleAnalyticsScript
