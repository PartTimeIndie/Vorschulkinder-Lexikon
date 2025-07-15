import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }
  render() {
    return (
      <Html lang="de">
        <Head>
          {/* Favicon und Apple-Touch-Icon werden im CSR dynamisch gesetzt */}
          <link rel="icon" id="dynamic-favicon" />
          <link rel="apple-touch-icon" id="dynamic-appleicon" />
          <link rel="shortcut icon" id="dynamic-shortcuticon" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#b8860b" />
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