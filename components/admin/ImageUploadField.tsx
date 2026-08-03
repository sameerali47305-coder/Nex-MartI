"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Upload, Pencil } from "lucide-react";

import { uploadProductImage } from "@/helpers/adminApi";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUploadField({ value, onChange }: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadProductImage(file);
      onChange(res.data.url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">Product Image</label>
      <label className="flex w-fit cursor-pointer items-center gap-4">
        {value && (
          <span className="group relative h-20 w-20">
            <img
              src={value}
              alt="Preview"
              className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
              <Pencil size={18} className="text-white" />
            </span>
          </span>
        )}
        <span className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 text-gray-400 transition hover:border-blue-500 hover:text-blue-600">
          {isUploading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              <Upload size={18} />
              <span className="text-[10px]">Upload</span>
            </>
          )}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFile}
          disabled={isUploading}
          className="hidden"
        />
      </label>
    </div>
  );
}