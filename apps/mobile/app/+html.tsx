import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Root HTML template for web.
 * Includes comprehensive SEO metadata, OpenGraph, Twitter Cards,
 * Schema.org JSON-LD structured data, and performance optimizations.
 */
export default function Root({ children }: PropsWithChildren) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'UNO Online Multiplayer',
    alternateName: 'UNO Card Game Online',
    description: 'Play official UNO card game online for free! Real-time multiplayer rooms for up to 10 players, classic 112-card deck, Wild Draw 4 challenges, 7-0 swaps, customizable house rules, and instant browser play.',
    genre: ['Card Game', 'Party Game', 'Multiplayer'],
    applicationCategory: 'GameApplication',
    operatingSystem: 'All modern web browsers, iOS, Android',
    inLanguage: 'en',
    playMode: 'MultiPlayer',
    numberOfPlayers: {
      '@type': 'QuantitativeValue',
      minValue: 2,
      maxValue: 10,
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        
        {/* SEO Primary Meta */}
        <title>UNO Online — Free Multiplayer Card Game with Friends &amp; Bots</title>
        <meta name="description" content="Play official UNO card game online for free! Real-time multiplayer rooms for up to 10 players, classic 112-card deck, Wild Draw 4 challenges, 7-0 swaps, customizable house rules, and instant browser play." />
        <meta name="keywords" content="uno online, free uno game, multiplayer card game, play uno with friends, uno web game, official uno rules, uno card game online, browser uno, uno bot game" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="application-name" content="UNO Online" />
        <meta name="theme-color" content="#0c0a0f" />

        {/* Apple / PWA Meta */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="UNO Online" />

        {/* OpenGraph (Facebook, WhatsApp, Discord, LinkedIn) */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="UNO Online — Free Multiplayer Card Game with Friends" />
        <meta property="og:description" content="Play the iconic card game in your browser. Real-time multiplayer rooms, bots, official 112-card deck, Wild challenges, and custom house rules." />
        <meta property="og:site_name" content="UNO Online" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="UNO Online — Free Multiplayer Card Game" />
        <meta name="twitter:description" content="Play official UNO online in your browser with friends or bots. Instant room codes, 10-player support, and official rules." />

        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Preconnect & Performance Hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

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
