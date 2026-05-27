"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Expand } from "lucide-react";

export function ProspektGallery({ images, imagesLabel }: { images: string[]; imagesLabel?: string }) {
  const [open, setOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  if (images.length === 0) return null;

  const openAt = (i: number) => {
    setStartIndex(i);
    setOpen(true);
  };

  const [hero, ...rest] = images;

  return (
    <>
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => openAt(0)}
          className="group relative block w-full overflow-hidden rounded-2xl border bg-nordic-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hero} alt="Bild 1" className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
          <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            <Expand className="h-3.5 w-3.5" />
            {imagesLabel ?? `${images.length} bilder`}
          </span>
        </button>

        {rest.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {rest.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => openAt(i + 1)}
                className="group overflow-hidden rounded-xl border bg-nordic-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Bild ${i + 2}`}
                  className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl border-0 bg-transparent p-0 shadow-none [&>button]:text-white [&>button]:opacity-90">
          <DialogTitle className="sr-only">Bildgalleri</DialogTitle>
          <Carousel setApi={setApi} opts={{ startIndex, loop: true }} className="w-full">
            <CarouselContent>
              {images.map((url, i) => (
                <CarouselItem key={i} className="flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Bild ${i + 1}`} className="max-h-[80vh] w-auto rounded-lg object-contain" />
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 && (
              <>
                <CarouselPrevious className="left-2 border-0 bg-white/90 text-nordic-900 hover:bg-white" />
                <CarouselNext className="right-2 border-0 bg-white/90 text-nordic-900 hover:bg-white" />
              </>
            )}
          </Carousel>
          <div className="mt-3 text-center text-sm text-white/90">
            {current + 1} / {images.length}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
