import { useRef, useState } from "react";
import { motion, useAnimationFrame } from "framer-motion";

export interface StripProps {
  start: { x: number; y: number };
  end: { x: number; y: number };
  speed?: number;
  className?: string;
  imgWidthTW?: string;
  imgHeightTW?: string;
}

export default function Strip({
  start,
  end,
  speed = 40,
  className = "",
  imgWidthTW = "w-40",
  imgHeightTW = "h-32",
}: StripProps) {
  if (!start || !end) return null;

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  const srcs = Array.from({ length: 9 }, (_, i) => `/strip/image${i + 1}.png`);
  const half = Math.ceil(srcs.length / 2);
  const topSet = srcs.slice(0, half);
  const botSet = srcs.slice(half).length ? srcs.slice(half) : topSet;

  const imgPx = 160; // w-40 ≈ 160 px, 8 px margin (mr-2)
  const tileW = imgPx + 8;

  const imgClasses = `${imgWidthTW} ${imgHeightTW} object-cover select-none shrink-0 opacity-20 md:opacity-30 rounded-xl mr-2`;

  const RowScroller = ({
    direction,
    images,
  }: {
    direction: "left" | "right";
    images: string[];
  }) => {
    const totalW = images.length * tileW;
    // start off‑screen depending on direction so the first image slides in smoothly
    const initial = direction === "left" ? 0 : -totalW;
    const [offset, setOffset] = useState(initial);
    const containerRef = useRef<HTMLDivElement>(null);

    useAnimationFrame((_, dt) => {
      setOffset((prev) => {
        const delta = (speed * dt) / 1000;
        let next = direction === "left" ? prev - delta : prev + delta;

        // wrap seamlessly without visible jump
        if (direction === "left" && next <= -totalW) next += totalW;
        if (direction === "right" && next >= 0) next -= totalW;
        return next;
      });
    });

    // render enough tiles to always cover the strip plus overflow on both ends
    const tilesToRender = Math.ceil(length / tileW) + images.length;
    const displayed = Array.from(
      { length: tilesToRender },
      (_, i) => images[i % images.length]
    );

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        ref={containerRef}
        className="flex whitespace-nowrap"
        style={{ transform: `translateX(${offset}px)` }}
      >
        {displayed.map((src, i) => (
          <img key={i} src={src} className={imgClasses} draggable={false} />
        ))}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className={`absolute pointer-events-none overflow-hidden ${className}`}
      style={{
        top: start.y,
        left: start.x,
        width: length,
        transform: `rotate(${angle}deg)`,
        transformOrigin: "0 0",
      }}
    >
      <RowScroller direction="right" images={topSet} />
      <div className="h-2" />
      <RowScroller direction="left" images={botSet} />
    </motion.div>
  );
}
