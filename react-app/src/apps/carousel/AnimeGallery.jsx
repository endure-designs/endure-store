import { useState, useRef } from "react";
import { motion } from "framer-motion";
import animeData from "../../data/anime-logos.json";
import "./AnimeGallery.css";

export default function AnimeGallery({ onSelectAnime }) {
  const [activeIndex, setActiveIndex] = useState(0);



  const dragTriggered = useRef(false);

  const total = animeData.length;

  const getOffset = (index) => {
    let offset = index - activeIndex;

    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    return offset;
  };

  const next = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const prev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  return (
    <div className="vitrina-container">
      <button className="nav-btn left" onClick={prev}>
        ‹
      </button>

      <motion.div
        className="vitrina"
        drag="x"
        dragMomentum={false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.05}
        onDrag={(e, info) => {

          if (dragTriggered.current) return;

          const threshold = 100;

          if (info.offset.x <= -threshold) {
            next();
            dragTriggered.current = true;
          }

          if (info.offset.x >= threshold) {
            prev();
            dragTriggered.current = true;
          }
        }}
        onDragEnd={() => {
          dragTriggered.current = false;
        }}
      >
        {animeData.map((anime, index) => {
          const offset = getOffset(index);

          const abs = Math.abs(offset);

          // NO renderizamos las muy lejanas
          if (abs > 4) return null;

          const x = offset * 220;

          const scale =
            offset === 0
              ? 1.30
              : abs === 1
                ? 0.92
                : abs === 2
                  ? 0.78
                  : abs === 3
                    ? 0.65
                    : 0.55;

          const opacity =
            abs === 0
              ? 1
              : abs === 1
                ? 0.9
                : abs === 2
                  ? 0.7
                  : abs === 3
                    ? 0.4
                    : 0.15;

          const blur =
            abs === 0
              ? 0
              : abs === 1
                ? 0
                : abs === 2
                  ? 1
                  : abs === 3
                    ? 2
                    : 4;

          const rotateY = offset * -22;

          const zIndex = 100 - abs;

          return (
            <motion.div
              key={anime.id}
              className="anime-card-wrapper"
              animate={{
                x,
                scale,
                opacity,
                rotateY
              }}
              transition={{
                duration: 0.60,
                ease: "easeInOut"
              }}
              style={{
                zIndex,
                filter: `blur(${blur}px)`
              }}
            >
              <button
                className={`anime-btn ${offset === 0 ? "active" : ""
                  }`}
                onClick={() => {
                  setActiveIndex(index);
                  onSelectAnime?.(anime);
                }}
              >
                <img
                  src={anime.url_path}
                  alt={anime.display_name}
                />
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      <button className="nav-btn right" onClick={next}>
        ›
      </button>
    </div>
  );
}