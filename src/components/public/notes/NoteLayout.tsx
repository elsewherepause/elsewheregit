"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import Image from "next/image";

type NoteImage = {
  cloudinaryId: string;
  width: number;
  height: number;
  altText: string | null;
};

type Props = {
  title: string;
  readTime: string;
  content: string;
  headerImage?: NoteImage | null;
  footerImage?: NoteImage | null;
  headerImageUrl: string;
  headerBlurUrl: string;
  footerImageUrl: string;
  footerBlurUrl: string;
};

export default function NoteLayout({
  title,
  readTime,
  content,
  headerImage,
  footerImage,
  headerImageUrl,
  headerBlurUrl,
  footerImageUrl,
  footerBlurUrl,
}: Props) {
  const headerImgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const footerImgRef = useRef<HTMLDivElement>(null);

  const scaleRef = useRef(1);
  const pinnedRef = useRef(true);
  const lockTopRef = useRef(0);

  const [, forceRender] = useState(0);
  const rafRef = useRef(0);

  const handleScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!headerImage) return;
      const vh = window.innerHeight;
      let changed = false;

      if (contentRef.current) {
        const fixedImgTop = vh * 0.15;
        const imgHeight = 128;
        const imgBottom = fixedImgTop + imgHeight;
        const contentBottom = contentRef.current.getBoundingClientRect().bottom;

        const earlyStart = 300;
        if (contentBottom <= imgBottom + earlyStart) {
          const scrollPastTrigger = (imgBottom + earlyStart) - contentBottom;
          const scaleDistance = vh * 0.8;
          const progress = Math.min(1, scrollPastTrigger / scaleDistance);
          const vw = window.innerWidth;
          const maxScale = Math.min(5, vw / 128);
          const eased = progress * progress;
          const newScale = 1 + eased * (maxScale - 1);
          if (Math.abs(newScale - scaleRef.current) > 0.01) {
            scaleRef.current = newScale;
            changed = true;
          }
        } else if (scaleRef.current !== 1) {
          scaleRef.current = 1;
          changed = true;
        }
      }

      if (footerImgRef.current) {
        const footerTop = footerImgRef.current.getBoundingClientRect().top;
        const fixedHeaderTop = vh * 0.15;

        if (footerTop <= fixedHeaderTop) {
          if (pinnedRef.current) {
            pinnedRef.current = false;
            lockTopRef.current = window.scrollY + fixedHeaderTop;
            changed = true;
          }
        } else {
          if (!pinnedRef.current) {
            pinnedRef.current = true;
            changed = true;
          }
        }
      }

      if (changed) {
        forceRender((n) => n + 1);
      }
    });
  }, [headerImage]);

  useEffect(() => {
    if (!headerImage) return;
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [headerImage, handleScroll]);

  const scale = scaleRef.current;
  const pinned = pinnedRef.current;
  const lockTop = lockTopRef.current;

  return (
    <div className="relative">
      {headerImage && (
        <div
          ref={headerImgRef}
          className="left-1/2 z-20 pointer-events-none"
          style={{
            position: pinned ? "fixed" : "absolute",
            top: pinned ? "15%" : `${lockTop}px`,
            width: "8rem",
            transform: `translateX(-50%) scale(${scale})`,
            transformOrigin: "center top",
            willChange: "transform",
          }}
        >
          <Image
            src={headerImageUrl}
            alt={headerImage.altText ?? title}
            width={headerImage.width}
            height={headerImage.height}
            className="w-full h-auto"
            placeholder="blur"
            blurDataURL={headerBlurUrl}
            priority
          />
        </div>
      )}

      <article
        className="relative z-10 mx-auto px-6 pt-24 md:pt-36 pb-0"
        style={{ maxWidth: 640 }}
      >
        {headerImage && (
          <div className="flex justify-center mb-6 md:mb-4">
            <div className="w-32 invisible" aria-hidden="true">
              <Image
                src={headerImageUrl}
                alt=""
                width={headerImage.width}
                height={headerImage.height}
                className="w-full h-auto"
              />
            </div>
          </div>
        )}

        <header className="mb-10 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <span className="font-sans text-sm font-medium text-[var(--color-ink)]">
              Notes
            </span>
            <span className="font-sans text-sm text-[#848484]">|</span>
            <span className="font-sans text-sm uppercase text-[#848484]">
              {readTime}
            </span>
          </div>
          <h1
            className="text-xl md:text-2xl font-medium leading-snug tracking-wide uppercase"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {title}
          </h1>
        </header>

        <div
          ref={contentRef}
          className="font-sans text-base leading-[1.8] text-[var(--color-ink)] text-center space-y-8"
          style={{ fontWeight: 400 }}
          dangerouslySetInnerHTML={{ __html: content }}
        />

      </article>

      {headerImage && (
        <div className="relative" style={{ height: "80vh" }} />
      )}

      {footerImage && (
        <div ref={footerImgRef} className="relative z-20 mx-auto px-6 pb-16" style={{ maxWidth: 640 }}>
          <Image
            src={footerImageUrl}
            alt={footerImage.altText ?? ""}
            width={footerImage.width}
            height={footerImage.height}
            className="w-full h-auto"
            placeholder="blur"
            blurDataURL={footerBlurUrl}
          />
        </div>
      )}
    </div>
  );
}
