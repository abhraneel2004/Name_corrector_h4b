// Shown instead of the site on phones and tablets
export function UnsupportedDevice() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background">
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <img src="/long_logo.png" alt="Police Record Management System" className="h-9 w-auto" />
          <div className="mt-10 border-t pt-8">
            <p className="eyebrow">Desktop required</p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight">
              This console is available on desktop computers only
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Records Audit Console handles sensitive case records and is built for desktop workstations.
              Open this address on a desktop or laptop computer with a keyboard and mouse.
            </p>
            <p className="mt-6 text-xs text-muted-foreground">
              Mobile phones and tablets are not supported.
            </p>
          </div>
        </div>
      </main>
      <footer className="border-t px-6 py-4 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        For official use only
      </footer>
    </div>
  );
}
