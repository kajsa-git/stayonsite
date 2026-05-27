"use client";

import { ChevronLeft, ChevronRight, ImagePlus, Loader2, Star, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { toast } from "@/components/ui/use-toast";

interface Image {
  id: string;
  fileName: string | null;
  url: string;
  isPrimary?: boolean;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function PropertyImages({ propertyId }: { propertyId: string }) {
  const { data: images = [], mutate } = useSWR<Image[]>(
    `/api/crm/properties/${propertyId}/images`,
    fetcher
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (lightbox === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(null);
      else if (e.key === "ArrowLeft") setLightbox((i) => (i === null ? i : (i - 1 + images.length) % images.length));
      else if (e.key === "ArrowRight") setLightbox((i) => (i === null ? i : (i + 1) % images.length));
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightbox, images.length]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    let failed = false;
    const count = files.length;
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch(`/api/crm/properties/${propertyId}/images`, { method: "POST", body: fd });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setError(j.error ?? "Uppladdning misslyckades");
          failed = true;
        }
      }
      mutate();
      if (failed) toast({ title: "Någon bild kunde inte laddas upp", variant: "destructive" });
      else toast({ title: count > 1 ? `${count} bilder uppladdade` : "Bild uppladdad" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function setPrimary(id: string) {
    try {
      const res = await fetch(`/api/crm/property-images/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      });
      if (!res.ok) throw new Error(String(res.status));
      mutate();
      toast({ title: "Huvudbild satt — visas först i prospektet" });
    } catch {
      toast({ title: "Kunde inte sätta huvudbild", variant: "destructive" });
    }
  }

  async function remove(id: string) {
    try {
      const res = await fetch(`/api/crm/property-images/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(String(res.status));
      mutate();
      toast({ title: "Bild borttagen" });
    } catch {
      toast({ title: "Kunde inte ta bort bilden", variant: "destructive" });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Bilder ({images.length})</p>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-input hover:bg-muted transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
          {uploading ? "Laddar upp…" : "Ladda upp"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && <p className="text-xs text-destructive mb-2">{error}</p>}

      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">Inga bilder ännu.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div
              key={img.id}
              className={`relative group aspect-square rounded-md overflow-hidden border bg-muted ${
                img.isPrimary ? "ring-2 ring-[#ff6300] ring-offset-1" : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.fileName ?? "Bostadsbild"}
                className="w-full h-full object-cover cursor-zoom-in"
                onClick={() => setLightbox(i)}
              />
              {img.isPrimary && (
                <span className="absolute top-1 left-1 inline-flex items-center gap-1 rounded-full bg-[#ff6300] px-1.5 py-0.5 text-[10px] font-medium text-white">
                  <Star className="h-3 w-3 fill-current" /> Huvudbild
                </span>
              )}
              {!img.isPrimary && (
                <button
                  onClick={() => setPrimary(img.id)}
                  className="absolute bottom-1 left-1 inline-flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  title="Sätt som huvudbild"
                >
                  <Star className="h-3 w-3" /> Huvudbild
                </button>
              )}
              <button
                onClick={() => remove(img.id)}
                className="absolute top-1 right-1 h-6 w-6 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                title="Ta bort bild"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {lightbox !== null && images[lightbox] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            title="Stäng (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + images.length) % images.length); }}
              className="absolute left-4 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              title="Föregående (←)"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[lightbox].url}
            alt={images[lightbox].fileName ?? "Bostadsbild"}
            className="max-h-[90vh] max-w-[92vw] object-contain rounded"
            onClick={(e) => e.stopPropagation()}
          />
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % images.length); }}
              className="absolute right-4 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              title="Nästa (→)"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
          <div className="absolute bottom-4 text-xs text-white/80">{lightbox + 1} / {images.length}</div>
        </div>
      )}
    </div>
  );
}
