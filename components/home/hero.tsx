import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Truck, Star, ArrowRight } from "lucide-react";

import Container from "@/components/ui/Container";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white">

      {/* Decorative background layer */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-orange-400/10 blur-3xl" />
        <svg className="absolute inset-0 h-full w-full opacity-[0.06]" aria-hidden="true">
          <defs>
            <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 0H40V40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      <Container>
        <div className="relative grid min-h-[600px] items-center gap-16 py-20 lg:grid-cols-2">

          {/* Left Content */}
          <div className="relative z-10">

            <div className="mb-5 inline-flex animate-in fade-in slide-in-from-top-4 fill-mode-both items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-orange-200 ring-1 ring-white/20 backdrop-blur duration-700">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
              New Collection 2026
            </div>

            <h1 className="animate-in fade-in slide-in-from-bottom-6 fill-mode-both text-5xl font-extrabold leading-[1.1] tracking-tight duration-700 delay-150 lg:text-6xl">
              Shop Smarter,
              <br />
              <span className="text-orange-300">Live Better</span>
            </h1>

            <p className="mt-6 max-w-lg animate-in fade-in slide-in-from-bottom-6 fill-mode-both text-lg text-blue-100 duration-700 delay-300">
              Discover premium products at amazing prices. Fast delivery,
              secure payments, and quality you can trust.
            </p>

            <div className="mt-9 flex animate-in fade-in slide-in-from-bottom-6 fill-mode-both flex-wrap items-center gap-4 duration-700 delay-500">

              <Link
                href="/products"
                className="group inline-flex items-center gap-2 rounded-lg bg-orange-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-orange-900/30 transition hover:bg-orange-600"
              >
                Shop Now
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </Link>

              <Link
                href="/deals"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-7 py-3.5 font-semibold text-white transition hover:bg-white/10"
              >
                Explore Deals
              </Link>

            </div>

            {/* Trust stats */}
            <div className="mt-12 flex animate-in fade-in fill-mode-both flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/10 pt-6 text-sm text-blue-100 duration-700 delay-700">

              <div className="flex items-center gap-2">
                <Truck size={18} className="text-orange-300" />
                Free delivery over $50
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-orange-300" />
                Secure payments
              </div>

              <div className="flex items-center gap-2">
                <Star size={18} className="fill-orange-300 text-orange-300" />
                4.9/5 from 10k+ customers
              </div>

            </div>

          </div>

          {/* Right Visual */}
          <div className="relative z-10 hidden justify-self-center lg:block">

            <div className="relative h-[420px] w-[420px]">

              {/* Main floating product card */}
              <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 -rotate-3 animate-in fade-in zoom-in-90 fill-mode-both rounded-3xl bg-white p-4 shadow-2xl duration-700 delay-200">
                <div className="relative h-full w-full overflow-hidden rounded-2xl">
                  <Image
                    src="/products/hero.2.png"
                    alt="Featured headphones"
                    fill
                    sizes="256px"
                    className="object-cover"
                    //priority
                  />
                </div>
              </div>

              {/* Secondary offset product card */}
              <div className="absolute -right-4 bottom-8 h-36 w-36 rotate-6 animate-in fade-in slide-in-from-bottom-10 fill-mode-both rounded-2xl bg-white p-2.5 shadow-xl duration-700 delay-500">
                <div className="relative h-full w-full overflow-hidden rounded-xl">
                  <Image
                    src="/products/hero.i.png"
                    alt="Featured watch"
                    fill
                    sizes="144px"
                    className="object-cover"
                     // priority
                  />
                </div>
              </div>

              {/* Discount badge — drops in from above */}
              <div className="absolute -left-6 top-6 flex animate-in fade-in slide-in-from-top-16 fill-mode-both flex-col items-center justify-center rounded-2xl bg-orange-500 px-5 py-4 text-center shadow-xl duration-700 delay-700 ease-out">
                <span className="text-2xl font-extrabold leading-none text-white">50%</span>
                <span className="text-[11px] font-medium uppercase tracking-wide text-white">
                  Off Today
                </span>
              </div>

              {/* Rating card — drops in from above, last */}
              <div className="absolute -bottom-3 left-4 flex animate-in fade-in slide-in-from-top-16 fill-mode-both items-center gap-3 rounded-2xl bg-white px-4 py-3 text-gray-900 shadow-xl duration-700 delay-[900ms] ease-out">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100">
                  <Star size={18} className="fill-orange-400 text-orange-400" />
                </div>
                <div className="text-xs font-semibold leading-tight">
                  4.9 Rating
                  <br />
                  <span className="text-gray-500">10k+ Reviews</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </Container>
    </section>
  );
}