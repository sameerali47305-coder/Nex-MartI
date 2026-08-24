import Image from "next/image";

interface ProductGalleryProps {
  image: string;
  name: string;
}

export default function ProductGallery({
  image,
  name,
}: ProductGalleryProps) {
  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="flex h-[420px] w-full items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="relative h-full w-full">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 1024px) 100vw, 440px"
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Thumbnails (UI Only) */}
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-20 cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:border-blue-600 hover:shadow-sm"
          >
            <div className="relative h-full w-full">
              <Image
                src={image}
                alt={name}
                fill
                sizes="96px"
                className="object-cover"
                />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}