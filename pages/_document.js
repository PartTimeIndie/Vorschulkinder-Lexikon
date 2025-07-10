import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="de">
      <Head>
        <link rel="icon" href="/websiteBaseImages/abzeichen.png" type="image/png" />
        <link rel="shortcut icon" href="/websiteBaseImages/abzeichen.png" type="image/png" />
        <link rel="apple-touch-icon" href="/websiteBaseImages/abzeichen.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 