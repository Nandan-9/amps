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


      <div className="pointer-events-none absolute inset-0 z-30 flex -translate-y-16 flex-col items-center justify-center gap-0 sm:-translate-y-24 sm:gap-1 md:-translate-y-32">
        <Image
          src="/logo.png"
          alt="Logo"
          width={480}
          height={480}
          className="-mb-4 h-32 w-32 drop-shadow-lg sm:-mb-6 sm:h-56 sm:w-56 md:-mb-8 md:h-72 md:w-72 lg:-mb-10 lg:h-80 lg:w-80 2xl:-mb-12 2xl:h-96 2xl:w-96"
          priority
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30 flex flex-col items-center gap-5 px-4 pb-[env(safe-area-inset-bottom)] sm:bottom-10 sm:gap-6 md:bottom-16">
        <div className="pointer-events-auto flex flex-col items-center gap-2">
          <p className="text-center text-[10px] font-medium uppercase tracking-widest text-white/40 sm:text-xs">
            Join us
          </p>
          <a
            href="https://chat.whatsapp.com/CWenbt78ArmKQyu8MOMLKO"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/20 px-4 py-1.5 text-xs text-white/70 transition-colors hover:border-white/40 hover:text-white sm:text-sm"
          >
            WhatsApp Community
          </a>
        </div>

        <div className="pointer-events-auto flex flex-col items-center gap-2">
          <p className="text-center text-[10px] font-medium uppercase tracking-widest text-white/40 sm:text-xs">
            Follow us on
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-white/70 sm:text-sm">
            <a
              href="https://www.instagram.com/amps.amritapuri/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              @amps.amritapuri
            </a>
            <a
              href="https://www.instagram.com/ampsmovieupdates/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              @ampsmovieupdates
            </a>
            <a
              href="https://www.instagram.com/anicom.amps/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              @anicom.amps
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
