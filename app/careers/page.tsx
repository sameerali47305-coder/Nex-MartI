import Link from "next/link";
import { Briefcase, MapPin, Clock, ArrowRight } from "lucide-react";

import Container from "@/components/ui/Container";

const perks = [
  "Remote-friendly, async-first team",
  "Flexible hours around a shared core overlap",
  "Learning budget for courses and conferences",
  "A product team that actually ships what customers ask for",
];

const openRoles = [
  {
    title: "Frontend Engineer (Next.js)",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Backend Engineer (Node.js / MongoDB)",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Lahore, Pakistan",
    type: "Full-time",
  },
  {
    title: "Customer Support Specialist",
    department: "Operations",
    location: "Remote",
    type: "Part-time",
  },
];

export default function CareersPage() {
  return (
    <main className="bg-gray-50 py-10">
      <Container>

        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <span className="font-medium text-gray-900">Careers</span>
        </div>

        <div className="mb-12 max-w-2xl">
          <h1 className="text-4xl font-bold text-gray-900">Build NexMart with us</h1>
          <p className="mt-4 text-lg text-gray-600">
            We&apos;re a small team that ships fast and cares about getting
            the details right. If that sounds like your kind of work, take
            a look below.
          </p>
        </div>

        <div className="mb-12 grid gap-2 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm sm:grid-cols-2">
          {perks.map((perk) => (
            <div key={perk} className="flex items-start gap-2 py-1.5">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
              <p className="text-sm text-gray-600">{perk}</p>
            </div>
          ))}
        </div>

        <h2 className="mb-4 text-2xl font-bold text-gray-900">Open Positions</h2>
        <div className="space-y-4">
          {openRoles.map((role) => (
            <div
              key={role.title}
              className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{role.title}</h3>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Briefcase size={14} /> {role.department}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} /> {role.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} /> {role.type}
                  </span>
                </div>
              </div>

              <Link
                href={`/contact?subject=${encodeURIComponent(
                  `Application: ${role.title}`
                )}`}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Apply Now
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>

      </Container>
    </main>
  );
}