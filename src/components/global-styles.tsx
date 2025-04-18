'use client';

export function GlobalStyles({ geistSans, geistMono }: { geistSans: any; geistMono: any }) {
  return (
    <style jsx global>{`
      :root {
        --font-geist-sans: ${geistSans.style.fontFamily};
        --font-geist-mono: ${geistMono.style.fontFamily};
      }
      body {
        font-family: var(--font-geist-sans);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    `}</style>
  );
} 