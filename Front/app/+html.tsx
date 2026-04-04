import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        <link rel="manifest" href="/app/manifest.json" />
        <meta name="theme-color" content="#1A1F2B" />
        <link rel="apple-touch-icon" sizes="180x180" href="/app/icons/apple-touch-icon.png" />

        <style dangerouslySetInnerHTML={{ __html: `
          @font-face {
            font-family: 'BukhariScript';
            src: url('/app/BukhariScript.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
        `}} />

        <ScrollViewStyleReset />
      </head>
      <body style={{ overflow: "hidden" }}>{children}</body>
    </html>
  );
}
