import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html className="html">
      <Head>
      <link rel="icon" type="image/svg+xml" href="/icon.svg"/>
      </Head>
        <body className=".body">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
