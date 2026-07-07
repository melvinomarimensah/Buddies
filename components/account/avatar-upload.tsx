"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadAvatarAction } from "@/lib/actions/uploads";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AvatarUpload({
  fullName,
  value,
  onChange,
}: {
  fullName: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadAvatarAction(formData);
    setIsUploading(false);

    if (result.error || !result.url) {
      toast.error(result.error ?? "Couldn't upload your photo.");
      return;
    }

    onChange(result.url);
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative flex size-20 items-center justify-center rounded-full"
        aria-label="Change profile photo"
      >
        <Avatar className="size-20">
          <AvatarImage src={value || undefined} alt="" />
          <AvatarFallback className="text-lg">{initials(fullName || "?")}</AvatarFallback>
        </Avatar>
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
          {isUploading ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <Camera className="size-5" aria-hidden="true" />
          )}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
      </button>
      <div className="text-sm text-muted-foreground">
        <p>Click your photo to change it.</p>
        <p>Square images look best.</p>
      </div>
    </div>
  );
}
