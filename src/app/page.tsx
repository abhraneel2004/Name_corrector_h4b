import Link from 'next/link';
import {
  ArrowRight,
  Database,
  FileSpreadsheet,
  History,
  ListChecks,
  Lock,
  MessageSquare,
  ScanText,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const PROBLEMS = [
  {
    title: 'Names drift across records',
    body: 'The same accused is spelled differently across FIRs, stations and languages, which breaks searches and cross-case linking.',
  },
  {
    title: 'Paper stays on paper',
    body: 'Most case files are handwritten, so the information in them never reaches a searchable system.',
  },
  {
    title: 'Corrections leave no trace',
    body: 'Edits made in spreadsheets do not record who changed a record, when, or what it said before.',
  },
];

const CAPABILITIES = [
  {
    icon: ScanText,
    title: 'Handwritten document OCR',
    body: 'Photograph or scan FIRs and case diaries. Records are extracted field by field, with names in Hindi and regional scripts transliterated and the original kept.',
  },
  {
    icon: ShieldCheck,
    title: 'Name auditing',
    body: 'AI review of accused and officer names flags misspellings, formatting errors and inconsistent transliterations across a dataset.',
  },
  {
    icon: ListChecks,
    title: 'Reviewed corrections',
    body: 'Every suggestion shows the original value, the proposed value and the reason. Apply them one at a time or all at once.',
  },
  {
    icon: MessageSquare,
    title: 'Plain-language queries',
    body: 'Ask questions of the loaded dataset, such as absconding accused by police station, and get answers drawn only from those records.',
  },
  {
    icon: Database,
    title: 'Secure case repository',
    body: 'Each officer’s case files are stored in the cloud under their own account, ready to reopen, export or remove.',
  },
  {
    icon: History,
    title: 'Audit trail',
    body: 'Each corrected or imported row records the date, the officer and what changed, inside the record itself.',
  },
];

const STEPS = [
  { title: 'Ingest', body: 'Upload a CSV export or scan handwritten case documents.' },
  { title: 'Review', body: 'Check extracted records against the original page. Low-confidence fields are highlighted.' },
  { title: 'Audit', body: 'Run the name audit and apply only the corrections you accept.' },
  { title: 'Store', body: 'Save to secure cloud storage or export a clean CSV.' },
];

const GOVERNANCE = [
  {
    icon: Lock,
    title: 'Authenticated access',
    body: 'Officers sign in with email or Google, and each account’s files are stored separately.',
  },
  {
    icon: UserCheck,
    title: 'An officer approves every change',
    body: 'Nothing is changed automatically. Every AI suggestion and every extracted record is reviewed before it is written.',
  },
  {
    icon: History,
    title: 'Traceable changes',
    body: 'Audit columns record when a row was changed, by whom, and the value it replaced.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Standard formats',
    body: 'Data moves in and out as CSV, using a fixed 14-field case record schema.',
  },
];

// Illustrative rows for the product preview in the hero
const PREVIEW_CORRECTIONS = [
  { row: 14, field: 'Accused First Name', from: 'Rmesh Kumar', to: 'Ramesh Kumar' },
  { row: 27, field: 'Accused Last Name', from: 'Chaterjee', to: 'Chatterjee' },
  { row: 31, field: 'Inspector In charge', from: 'Anirban Mukerjee', to: 'Anirban Mukherjee' },
  { row: 46, field: 'Accused Last Name', from: 'paswan', to: 'Paswan' },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="shrink-0">
            <img src="/long_logo.png" alt="Police Record Management System" className="h-8 w-auto" />
          </Link>
          <nav className="hidden items-center gap-7 text-[13px] text-muted-foreground md:flex">
            <a href="#capabilities" className="transition-colors hover:text-foreground">Capabilities</a>
            <a href="#workflow" className="transition-colors hover:text-foreground">Workflow</a>
            <a href="#governance" className="transition-colors hover:text-foreground">Governance</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/signin">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/app">
                Open console
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
          />
          <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:py-28">
            <div className="min-w-0">
              <p className="eyebrow">Records Audit Console · For Indian police departments</p>
              <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
                Accurate case records, from handwritten FIR to audited database.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
                Digitise handwritten case files, standardise accused and officer names across Indian languages,
                and keep a row-level audit trail of every correction, with an officer reviewing each change.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/app">
                    Open the console
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/signup">Create an account</Link>
                </Button>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-primary" />Secure sign-in</li>
                <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-primary" />Per-officer storage</li>
                <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-primary" />Officer review before every change</li>
              </ul>
            </div>

            <ProductPreview />
          </div>
        </section>

        {/* Problem */}
        <section className="border-b">
          <div className="mx-auto grid max-w-6xl gap-px bg-border px-0 md:grid-cols-3">
            {PROBLEMS.map((problem) => (
              <div key={problem.title} className="bg-background px-6 py-10">
                <h2 className="text-sm font-semibold">{problem.title}</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{problem.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Capabilities */}
        <section id="capabilities" className="scroll-mt-14 border-b">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <SectionHeading
              eyebrow="Capabilities"
              title="Everything needed to clean a case register"
              body="One console for getting records in, checking them, and keeping them consistent."
            />
            <div className="mt-12 grid gap-px overflow-hidden rounded-md border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {CAPABILITIES.map(({ icon: Icon, title, body }) => (
                <div key={title} className="bg-card p-6">
                  <div className="flex h-9 w-9 items-center justify-center rounded-sm border bg-background">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold">{title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section id="workflow" className="scroll-mt-14 border-b bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <SectionHeading
              eyebrow="Workflow"
              title="From case file to clean record in four steps"
            />
            <ol className="mt-12 grid gap-8 md:grid-cols-4 md:gap-6">
              {STEPS.map((step, index) => (
                <li key={step.title} className="border-t border-primary/50 pt-5">
                  <span className="font-mono text-xs text-primary">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="mt-2 text-sm font-semibold">{step.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Governance */}
        <section id="governance" className="scroll-mt-14 border-b">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <SectionHeading
              eyebrow="Governance"
              title="Built for records that carry legal weight"
              body="Case records are evidence. The console is designed so that AI assists the officer and never replaces their judgement, and so that every change can be traced afterwards."
            />
            <div className="grid gap-px overflow-hidden rounded-md border bg-border sm:grid-cols-2">
              {GOVERNANCE.map(({ icon: Icon, title, body }) => (
                <div key={title} className="bg-card p-6">
                  <Icon className="h-4 w-4 text-primary" />
                  <h3 className="mt-3 text-sm font-semibold">{title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing call to action */}
        <section>
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20 sm:px-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Bring your case records up to standard.</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to upload a register, scan case files and run your first audit.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/app">
                  Open the console
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/signin">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      {body && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>}
    </div>
  );
}

// Static, illustrative rendering of the console's corrections view
function ProductPreview() {
  return (
    <div aria-hidden className="relative min-w-0">
      <div className="overflow-hidden rounded-md border bg-card shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-border" />
            <span className="h-2 w-2 rounded-full bg-border" />
            <span className="h-2 w-2 rounded-full bg-border" />
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">records-audit-console / app</span>
        </div>

        <div className="grid grid-cols-3 gap-px border-b bg-border">
          {[
            { label: 'Records', value: '1,284' },
            { label: 'Corrections', value: '37', tone: 'text-warning' },
            { label: 'Status', value: 'In sync' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card px-4 py-3">
              <p className="eyebrow text-[10px]">{stat.label}</p>
              <p className={`mt-1 text-lg font-semibold tabular-nums ${stat.tone ?? ''}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="px-4 pb-1 pt-3">
          <p className="eyebrow text-[10px]">Review</p>
          <p className="mt-1 text-[13px] font-semibold">Name Corrections</p>
        </div>
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="border-b text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              <th className="px-4 py-2 font-medium">Row</th>
              <th className="hidden px-2 py-2 font-medium sm:table-cell">Field</th>
              <th className="px-2 py-2 font-medium">Original</th>
              <th className="px-4 py-2 font-medium">Suggested</th>
            </tr>
          </thead>
          <tbody>
            {PREVIEW_CORRECTIONS.map((c) => (
              <tr key={c.row} className="border-b last:border-0">
                <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">{c.row}</td>
                <td className="hidden whitespace-nowrap px-2 py-2.5 text-[11px] text-muted-foreground sm:table-cell">{c.field}</td>
                <td className="px-2 py-2.5 text-muted-foreground line-through decoration-destructive/60">{c.from}</td>
                <td className="px-4 py-2.5 font-medium text-success">{c.to}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end border-t px-4 py-2.5 sm:py-5">
          <span className="font-mono text-[10px] text-muted-foreground">4 of 37 shown</span>
        </div>
      </div>

      {/* OCR result card overlapping the preview's status bar */}
      <div className="relative -mt-9 ml-4 hidden w-64 rounded-md border bg-popover p-3 shadow-2xl shadow-black/60 sm:block">
        <div className="flex items-center gap-2">
          <ScanText className="h-3.5 w-3.5 text-primary" />
          <span className="truncate text-[12px] font-medium">FIR_214_2024.jpg</span>
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">2 records extracted · good legibility</p>
        <p className="mt-2 text-[12px]">
          <span className="font-[system-ui]">रमेश कुमार यादव</span>
          <span className="text-muted-foreground"> → </span>
          Ramesh Kumar Yadav
        </p>
      </div>
    </div>
  );
}

function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
        <div>
          <img src="/long_logo.png" alt="Police Record Management System" className="h-9 w-auto" />
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-muted-foreground">
            Case record auditing and name standardisation for Indian police departments.
          </p>
        </div>
        <FooterColumn
          title="Product"
          links={[
            { label: 'Open console', href: '/app' },
            { label: 'Sign in', href: '/signin' },
            { label: 'Create account', href: '/signup' },
          ]}
        />
        <FooterColumn
          title="Overview"
          links={[
            { label: 'Capabilities', href: '#capabilities' },
            { label: 'Workflow', href: '#workflow' },
            { label: 'Governance', href: '#governance' },
          ]}
        />
        <FooterColumn
          title="Support"
          links={[
            { label: 'support@indiannamecorrector.com', href: 'mailto:support@indiannamecorrector.com' },
            { label: 'Privacy Policy', href: '/' },
            { label: 'Terms of Service', href: '/' },
          ]}
        />
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© {currentYear} Records Audit Console</span>
          <span className="uppercase tracking-[0.08em]">For official use only</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <ul className="mt-3 space-y-2 text-[13px]">
        {links.map((link) => (
          <li key={link.label}>
            <a href={link.href} className="break-all text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
