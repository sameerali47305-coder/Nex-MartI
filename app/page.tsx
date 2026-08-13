import Hero from "@/components/home/hero";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import WhyChooseUs from "@/components/home/WhyChooseUs";
export const revalidate = 0;
export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <FeaturedProducts />
      <WhyChooseUs />
    </>
  );
}