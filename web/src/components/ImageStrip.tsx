import { useEffect, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

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

  const x = useMotionValue(start.x);
  const y = useMotionValue(start.y);
  const endX = useMotionValue(end.x);
  const endY = useMotionValue(end.y);

  // Animate start and end points
  const springX = useSpring(x, { damping: 40, stiffness: 10 });
  const springY = useSpring(y, { damping: 40, stiffness: 10 });
  const springEndX = useSpring(endX, { damping: 40, stiffness: 10 });
  const springEndY = useSpring(endY, { damping: 40, stiffness: 10 });

  useEffect(() => {
    x.stop();
    y.stop();
    endX.stop();
    endY.stop();

    x.set(x.get()); // Keep current value to avoid jump
    y.set(y.get());
    endX.set(endX.get());
    endY.set(endY.get());

    requestAnimationFrame(() => {
      x.set(start.x);
      y.set(start.y);
      endX.set(end.x);
      endY.set(end.y);
    });
  }, [start.x, start.y, end.x, end.y]);

  // Calculate derived values
  const dx = useTransform(
    [springX, springEndX],
    ([sx, ex]) => (ex as any) - (sx as any)
  );
  const dy = useTransform(
    [springY, springEndY],
    ([sy, ey]) => (ey as any) - (sy as any)
  );
  const length = useTransform([dx, dy], ([dx, dy]) =>
    Math.hypot(dx as any, dy as any)
  );
  const angle = useTransform(
    [dx, dy],
    ([dx, dy]) => Math.atan2(dy as any, dx as any) * (180 / Math.PI)
  );

  const srcs = Array.from({ length: 9 }, (_, i) => `/strip/image${i + 1}.png`);
  const half = Math.ceil(srcs.length / 2);
  const topSet = srcs.slice(0, half);
  const botSet = srcs.slice(half).length ? srcs.slice(half) : topSet;

  const imgPx = 160;
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
    const initial = direction === "left" ? 0 : -totalW;
    const [offset, setOffset] = useState(initial);
    useAnimationFrame((_, dt) => {
      setOffset((prev) => {
        const delta = (speed * dt) / 1000;
        let next = direction === "left" ? prev - delta : prev + delta;
        if (direction === "left" && next <= -totalW) next += totalW;
        if (direction === "right" && next >= 0) next -= totalW;
        return next;
      });
    });

    return (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex whitespace-nowrap"
        style={{ transform: `translateX(${offset}px)` }}
      >
        {Array.from({ length: 18 }, (_, i) => images[i % images.length]).map(
          (src, i) => (
            <img key={i} src={src} className={imgClasses} draggable={false} />
          )
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      className={`absolute pointer-events-none overflow-hidden ${className}`}
      style={{
        top: springY,
        left: springX,
        width: length,
        rotate: angle,
        transformOrigin: "0 0",
      }}
    >
      <RowScroller direction="right" images={topSet} />
      <div className="h-2" />
      <RowScroller direction="left" images={botSet} />
    </motion.div>
  );
}
