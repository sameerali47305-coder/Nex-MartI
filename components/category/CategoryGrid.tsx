import CategoryCard from "./CategoryCard";
import { listCategories } from "@/services/category.service";
import { serializeCategory } from "@/lib/serializers";

export default async function CategoryGrid() {
  const categories = await listCategories();
  const uiCategories = categories.map(serializeCategory);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {uiCategories.map((category) => (
        <CategoryCard key={category.slug} category={category} />
      ))}
    </div>
  );
}
