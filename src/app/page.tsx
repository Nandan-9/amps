"use client";

import Image from "next/image";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";

const marqueeImages = [
  "/media/poster-01.jpg",
  "/media/poster-02.jpeg",
  "/media/poster-03.jpeg",
  "/media/poster-04.jpg",
  "/media/poster-05.jpg",
  "/media/poster-06.jpeg",
  "/media/poster-07.jpeg",
  "/media/poster-08.jpeg",
  "/media/poster-09.jpeg",
  "/media/poster-10.jpeg",
  "/media/poster-11.jpg",
  "/media/poster-12.jpeg",
  "/media/poster-13.jpeg",
  "/media/poster-14.jpg",
  "/media/poster-15.jpg",
  "/media/poster-16.jpg",
  "/media/poster-17.jpg",
  "/media/poster-18.jpg",
  "/media/poster-19.jpg",
  "/media/poster-20.jpeg",
];

export default function Home() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-black">
      <ThreeDMarquee images={marqueeImages} className="h-dvh w-full rounded-none max-sm:h-dvh" />

      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 10%, rgba(0,0,0,1) 80%)",
        }}
      />


      <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="Logo"
          width={480}
          height={480}
          className="h-32 w-32 drop-shadow-lg sm:h-56 sm:w-56 md:h-72 md:w-72 lg:h-80 lg:w-80 2xl:h-96 2xl:w-96"
          priority
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30 flex justify-center px-4 pb-[env(safe-area-inset-bottom)] sm:bottom-10 md:bottom-16">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-white/50 drop-shadow-lg sm:text-sm md:text-base">
          Coming Soon
        </p>
      </div>
    </main>
  );
}
