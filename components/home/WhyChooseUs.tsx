import { Truck, ShieldCheck, Award, Headset } from "lucide-react";

const features = [
  { icon: Truck, title: "Fast Shipping", desc: "Quick and reliable delivery so your order arrives on time." },
  { icon: ShieldCheck, title: "Secure Payments", desc: "Your payments are protected with safe, trusted checkout." },
  { icon: Award, title: "Premium Quality", desc: "Carefully selected products built to last." },
  { icon: Headset, title: "24/7 Support", desc: "Our team is always ready to help whenever you need us." },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto w-full max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">Why Choose Us</p>
        <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">Shop With Confidence</h2>
        <p className="mx-auto mt-3 max-w-xl text-gray-500">
          We're committed to great products, secure shopping, and service you can rely on.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <f.icon size={26} />
              </div>
              <h3 className="font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}