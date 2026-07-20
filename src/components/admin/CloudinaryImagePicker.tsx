"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, Trash2, Star } from "lucide-react";

type CloudinaryImagePickerProps = {
  title: string;
  description?: string;
  value: string[];
  onChange: (nextValue: string[]) => void;
  primaryIndex?: number;
  onPrimaryIndexChange?: (nextIndex: number) => void;
  maxImages?: number;
  disabled?: boolean;
};

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const maxFileSizeBytes = 5 * 1024 * 1024;

async function uploadFileDirectToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/cloudinary/upload", {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as { url?: string; message?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.message || "تعذر رفع الصورة إلى Cloudinary");
  }

  return payload?.url || "";
}

export default function CloudinaryImagePicker({
  title,
  description,
  value,
  onChange,
  primaryIndex,
  onPrimaryIndexChange,
  maxImages = 1,
  disabled = false,
}: CloudinaryImagePickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [currentFileName, setCurrentFileName] = useState("");

  const normalizedPrimaryIndex =
    typeof primaryIndex === "number" && primaryIndex >= 0 ? Math.min(primaryIndex, Math.max(0, value.length - 1)) : 0;
  const remainingSlots = Math.max(0, maxImages - value.length);

  const setPrimaryIndex = (nextIndex: number) => {
    if (!onPrimaryIndexChange) {
      return;
    }

    onPrimaryIndexChange(nextIndex);
  };

  const validateFiles = (files: File[]) => {
    if (files.length === 0) {
      throw new Error("لم يتم اختيار أي صورة.");
    }

    if (maxImages > 1 && files.length > remainingSlots) {
      throw new Error(`يمكنك رفع ${remainingSlots} صورة فقط إضافية.`);
    }

    if (maxImages === 1 && files.length > 1) {
      throw new Error("يمكن رفع صورة واحدة فقط في هذا الحقل.");
    }

    for (const file of files) {
      if (!allowedMimeTypes.includes(file.type)) {
        throw new Error(`الصيغة غير مدعومة للصورة ${file.name}. استخدم JPG أو PNG أو WebP.`);
      }

      if (file.size > maxFileSizeBytes) {
        throw new Error(`حجم الصورة ${file.name} أكبر من 5MB.`);
      }
    }
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (disabled || isUploading || !files || files.length === 0) {
      return;
    }

    const nextFiles = Array.from(files);

    try {
      validateFiles(nextFiles);
      setUploadError("");
      setIsUploading(true);

      const nextImages = maxImages === 1 ? [] : [...value];

      for (const file of nextFiles) {
        setCurrentFileName(file.name);
        const uploadedUrl = await uploadFileDirectToCloudinary(file);
        nextImages.push(uploadedUrl);
      }

      onChange(nextImages);

      if (typeof onPrimaryIndexChange === "function" && nextImages.length > 0 && value.length === 0) {
        onPrimaryIndexChange(0);
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "تعذر رفع الصورة.");
    } finally {
      setIsUploading(false);
      setCurrentFileName("");

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    if (disabled) {
      return;
    }

    const nextImages = value.filter((_, imageIndex) => imageIndex !== index);
    onChange(nextImages);

    if (!onPrimaryIndexChange || value.length === 0) {
      return;
    }

    if (index === normalizedPrimaryIndex) {
      onPrimaryIndexChange(Math.max(0, nextImages.length - 1));
      return;
    }

    if (index < normalizedPrimaryIndex) {
      onPrimaryIndexChange(Math.max(0, normalizedPrimaryIndex - 1));
    }
  };

  return (
    <div className="space-y-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4 sm:p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <ImagePlus className="h-4 w-4 text-amber-500" />
            {title}
          </p>
          {description ? <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p> : null}
        </div>
        <div className="text-xs text-slate-500">
          {value.length} / {maxImages} صور
        </div>
      </div>

      {value.length > 0 ? (
        <div className={`grid gap-3 ${maxImages === 1 ? "grid-cols-1" : "sm:grid-cols-2"}`}>
          {value.map((imageUrl, index) => (
            <div key={`${imageUrl}-${index}`} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative aspect-square bg-slate-100">
                <img src={imageUrl} alt={`${title}-${index + 1}`} className="h-full w-full object-cover" />
                {index === normalizedPrimaryIndex && (
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-slate-950 px-3 py-1 text-[10px] font-bold text-white shadow-lg">
                    <Star className="h-3 w-3 fill-current" />
                    الصورة الرئيسية
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs font-bold text-slate-600">
                <span className="truncate">{imageUrl}</span>
                <div className="flex items-center gap-2">
                  {onPrimaryIndexChange && maxImages > 1 && (
                    <button
                      type="button"
                      onClick={() => setPrimaryIndex(index)}
                      disabled={disabled || index === normalizedPrimaryIndex}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Star className="h-3.5 w-3.5" />
                      تعيين رئيسية
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    disabled={disabled}
                    className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          لا توجد صور مرفوعة بعد. ارفع صورة واحدة على الأقل للبدء.
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          <span>{isUploading ? `جاري رفع ${currentFileName || "الصورة"}...` : maxImages === 1 ? "اختيار صورة" : "إضافة صور"}</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple={maxImages > 1}
            onChange={(event) => void handleFilesSelected(event.target.files)}
            className="hidden"
            disabled={disabled || isUploading || (maxImages > 1 && remainingSlots === 0)}
          />
        </label>

        <p className="text-xs leading-5 text-slate-500">
          JPEG أو PNG أو WebP أو GIF، بحد أقصى 5MB لكل صورة.
          {maxImages > 1 ? ` يمكنك رفع حتى ${maxImages} صور.` : " الصورة المعروضة هنا سيتم حفظها كصورة المنتج الأساسية."}
        </p>
      </div>

      {uploadError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {uploadError}
        </div>
      ) : null}
    </div>
  );
}