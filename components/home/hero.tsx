import Link from "next/link";
import Container from "@/components/ui/Container";

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <Container>
        <div className="grid min-h-[550px] items-center gap-10 py-20 lg:grid-cols-2">

          {/* Left Content */}
          <div>

            <p className="mb-3 text-lg font-semibold text-orange-300">
              New Collection 2026
            </p>

            <h1 className="text-5xl font-extrabold leading-tight lg:text-6xl">
              Shop Smarter
              <br />
              Live Better
            </h1>

            <p className="mt-6 max-w-lg text-lg text-blue-100">
              Discover premium products at amazing prices.
              Fast delivery, secure payments and quality you can trust.
            </p>

            <Link
              href="/products"
              className="mt-8 inline-block rounded-full bg-orange-500 px-8 py-4 font-semibold transition hover:bg-orange-600"
            >
              Shop Now
            </Link>

          </div>

          {/* Right Content */}
          <div className="flex justify-center">

            <div className="flex h-96 w-96 items-center justify-center rounded-full bg-white/10 backdrop-blur">

              <span className="text-8xl">
                🛍️
              </span>

            </div>

          </div>

        </div>
      </Container>
    </section>
  );
}