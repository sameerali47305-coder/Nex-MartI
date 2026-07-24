import Link from "next/link";
import Container from "@/components/ui/Container";

export interface LegalSection {
  id: string;
  heading: string;
  body: string[];
}

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}

export default function LegalLayout({
  title,
  lastUpdated,
  intro,
  sections,
}: LegalLayoutProps) {
  return (
    <main className="bg-gray-50 py-10">
      <Container>

        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <span className="font-medium text-gray-900">{title}</span>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: {lastUpdated}</p>
          <p className="mt-4 max-w-2xl text-gray-600">{intro}</p>
        </div>

        <div className="grid gap-10 lg:grid-cols-4">

          {/* Sticky table of contents — findability for a long, scannable
              legal doc rather than a dense wall of text (HCI: chunking) */}
          <nav className="hidden lg:col-span-1 lg:block">
            <div className="sticky top-24 space-y-1 rounded-xl border border-gray-200 bg-white p-4 text-sm">
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                On this page
              </p>
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block rounded-lg px-2 py-1.5 text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
                >
                  {section.heading}
                </a>
              ))}
            </div>
          </nav>

          <div className="space-y-10 rounded-xl border border-gray-200 bg-white p-8 shadow-sm lg:col-span-3">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="mb-3 text-xl font-semibold text-gray-900">
                  {section.heading}
                </h2>
                {section.body.map((paragraph, i) => (
                  <p key={i} className="mb-3 leading-relaxed text-gray-600">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>

        </div>

      </Container>
    </main>
  );
}
