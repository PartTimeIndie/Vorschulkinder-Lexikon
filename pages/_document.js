import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html lang="de">
        <Head>
          <link rel="icon" href="/websiteBaseImages/lexiconFavIcon.png" type="image/png" />
          <link rel="shortcut icon" href="/websiteBaseImages/lexiconFavIcon.png" type="image/png" />
          <link rel="apple-touch-icon" href="/websiteBaseImages/lexiconFavIcon.png" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument 