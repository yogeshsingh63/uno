import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Root HTML template for web.
 * Ensures html, body, and root elements stretch to 100% height
 * with the dark theme background to prevent any white flashes or gaps.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <title>UNO Multiplayer</title>
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root {
                height: 100%;
                min-height: 100%;
                width: 100%;
                margin: 0;
                padding: 0;
                background-color: #0c0a0f !important;
                background: #0c0a0f !important;
                overflow-x: hidden;
                color: #F5F0EB;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              }
              /* Ensure flex containers stretch properly on web */
              [data-radix-portal], #root > div {
                min-height: 100%;
                display: flex;
                flex-direction: column;
                background-color: #0c0a0f;
              }
            `,
          }}
        />
      </head>
      <body style={{ backgroundColor: '#0c0a0f', margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
