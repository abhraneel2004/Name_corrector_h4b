'use client';

import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-4 text-[11px] text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <img src="/sq_logo.png" alt="" className="h-6 w-6 opacity-70" />
          <span>© {currentYear} Records Audit Console</span>
          <span className="hidden text-border sm:inline">|</span>
          <span className="hidden uppercase tracking-[0.08em] sm:inline">For official use only</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <a href="mailto:support@indiannamecorrector.com" className="hover:text-foreground transition-colors">
            support@indiannamecorrector.com
          </a>
          <Link href="/" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-foreground transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
