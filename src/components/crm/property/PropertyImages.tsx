"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import useSWR from "swr";
import { toast } from "@/components/ui/use-toast";

interface Image {
  id: string;
  fileName: string | null;
  url: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function PropertyImages({ propertyId }: { propertyId: string }) {
  const { data: images = [], mutate } = useSWR<Image[]>(
    `/api/crm/properties/${propertyId}/images`,
    fetcher
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
          {images.map((img) => (
            <div key={img.id} className="relative group aspect-square rounded-md overflow-hidden border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.fileName ?? "Bostadsbild"} className="w-full h-full object-cover" />
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
    </div>
  );
}
