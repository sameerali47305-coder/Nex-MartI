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
      <div className="flex h-[500px] items-center justify-center rounded-xl border border-gray-200 bg-white p-8">

        <div className="relative h-full w-full">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain"
            priority
          />
        </div>

      </div>

      {/* Thumbnails (UI Only) */}
      <div className="grid grid-cols-4 gap-3">

        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="flex h-24 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white p-2 transition hover:border-blue-600"
          >
            <div className="relative h-16 w-16">
              <Image
                src={image}
                alt={name}
                fill
                sizes="64px"
                className="object-contain"
              />
            </div>
          </div>
        ))}

      </div>

    </div>
  );
}