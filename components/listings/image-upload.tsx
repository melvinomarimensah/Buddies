"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { uploadListingImageAction } from "@/lib/actions/uploads";
import { MAX_LISTING_IMAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ImageUpload({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((file) => file.type.startsWith("image/"));
      if (list.length === 0) return;

      const remainingSlots = MAX_LISTING_IMAGES - value.length;
      if (remainingSlots <= 0) {
        toast.error(`You can add up to ${MAX_LISTING_IMAGES} photos.`);
        return;
      }

      const toUpload = list.slice(0, remainingSlots);
      setUploadingCount((count) => count + toUpload.length);

      const uploadedUrls: string[] = [];

      for (const file of toUpload) {
        const formData = new FormData();
        formData.set("file", file);
        const result = await uploadListingImageAction(formData);

        if (result.error || !result.url) {
          toast.error(result.error ?? `Couldn't upload ${file.name}.`);
          continue;
        }

        uploadedUrls.push(result.url);
      }

      setUploadingCount((count) => count - toUpload.length);
      if (uploadedUrls.length > 0) {
        onChange([...value, ...uploadedUrls]);
      }
    },
    [onChange, value]
  );

  function handleRemove(url: string) {
    onChange(value.filter((image) => image !== url));
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          uploadFiles(event.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card px-6 py-10 text-center transition-colors",
          isDragging && "border-primary bg-primary/5"
        )}
      >
        <ImagePlus className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-medium">Drag photos here, or click to browse</p>
        <p className="text-xs text-muted-foreground">
          Up to {MAX_LISTING_IMAGES} photos · {value.length}/{MAX_LISTING_IMAGES} added
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => {
            if (event.target.files) uploadFiles(event.target.files);
            event.target.value = "";
          }}
          aria-label="Upload listing photos"
        />
      </div>

      {value.length > 0 || uploadingCount > 0 ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {value.map((url) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-xl bg-muted">
              <Image src={url} alt="" fill sizes="120px" className="object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                aria-label="Remove photo"
                className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-ink/70 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
          {Array.from({ length: uploadingCount }).map((_, index) => (
            <div
              key={`uploading-${index}`}
              className="flex aspect-square items-center justify-center rounded-xl border border-border bg-muted"
            >
              <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
