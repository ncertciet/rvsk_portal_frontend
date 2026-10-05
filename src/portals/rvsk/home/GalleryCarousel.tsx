import { useState, useEffect, useCallback } from "react";
import { Box, Typography, IconButton, Paper } from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ImageIcon from "@mui/icons-material/Image";

import { GalleryImage } from "./types";

interface GalleryCarouselProps {
  images: GalleryImage[];
  autoRotateInterval?: number;
  visibleCards?: number;
}

const getImageUrl = (filePath?: string): string => {
  if (!filePath) {
    return "";
  }

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  const fileName = filePath.split(/[\\/]/).pop();

  if (!fileName) {
    return "";
  }

  const baseUrl = import.meta.env.VITE_PORTAL_API_URL;

  return `${baseUrl.replace(/\/+$/, "")}/gallery/files/${encodeURIComponent(fileName)}`;
};

export default function GalleryCarousel({
  images,
  autoRotateInterval = 5000,
  visibleCards = 4,
}: GalleryCarouselProps) {
  const [startIndex, setStartIndex] = useState(0);

  const count = Math.min(images.length, visibleCards);

  const rotateNext = useCallback(() => {
    if (images.length <= count) return;

    setStartIndex((prev) => (prev + 1) % images.length);
  }, [images.length, count]);

  const rotatePrev = useCallback(() => {
    if (images.length <= count) return;

    setStartIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length, count]);

  useEffect(() => {
    if (images.length <= count) return;

    const interval = setInterval(rotateNext, autoRotateInterval);

    return () => clearInterval(interval);
  }, [rotateNext, autoRotateInterval, images.length, count]);

  /**
   * Reset slider position when API data changes.
   */
  useEffect(() => {
    setStartIndex(0);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 6,
          px: 2,
          bgcolor: "#F0F4F8",
          borderRadius: 3,
          border: "1px dashed #CBD5E1",
        }}
      >
        <ImageIcon
          sx={{
            color: "#94A3B8",
            mr: 1,
            fontSize: 32,
          }}
        />

        <Typography variant="body1" color="text.secondary">
          No VSK images available yet
        </Typography>
      </Box>
    );
  }

  const getVisibleImages = (): GalleryImage[] => {
    const result: GalleryImage[] = [];

    for (let i = 0; i < count; i++) {
      const idx = (startIndex + i) % images.length;

      result.push(images[idx]);
    }

    return result;
  };

  const visibleImages = getVisibleImages();

  return (
    <Box
      sx={{
        position: "relative",
        py: 3,
        px: 6,
        bgcolor: "#F0F7FF",
        borderRadius: 3,
        border: "1px solid #DBEAFE",
        overflow: "hidden",
      }}
    >
      {/* LEFT ARROW */}
      <IconButton
        onClick={rotatePrev}
        disabled={images.length <= count}
        sx={{
          position: "absolute",
          left: 8,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          bgcolor: "#0EA5E9",
          color: "#fff",
          width: 36,
          height: 36,

          "&:hover": {
            bgcolor: "#0284C7",
          },

          "&.Mui-disabled": {
            bgcolor: "#E2E8F0",
            color: "#94A3B8",
          },

          boxShadow: "0 2px 8px rgba(14,165,233,0.3)",
        }}
      >
        <ChevronLeftIcon />
      </IconButton>

      {/* IMAGES GRID */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${count}, 1fr)`,
          gap: 2.5,
          transition: "all 0.4s ease-in-out",
        }}
      >
        {visibleImages.map((img, idx) => {
          const imageUrl = getImageUrl(img.filePath);
          return (
            <Box
              key={`${img.id}-${idx}`}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  width: "100%",
                  paddingTop: "70%",
                  position: "relative",
                  borderRadius: 3,
                  overflow: "hidden",
                  cursor: "pointer",

                  transition: "transform 0.2s ease, box-shadow 0.2s ease",

                  "&:hover": {
                    transform: "scale(1.03)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  },
                }}
              >
                {imageUrl ? (
                  <Box
                    component="img"
                    src={imageUrl}
                    alt={img.caption || img.stateName || img.fileName}
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      const target = e.currentTarget;

                      target.style.display = "none";

                      const parent = target.parentElement;

                      if (parent) {
                        parent.style.background = "#CBD5E1";
                      }
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#CBD5E1",
                    }}
                  >
                    <ImageIcon
                      sx={{
                        color: "#64748B",
                        fontSize: 40,
                      }}
                    />
                  </Box>
                )}
              </Paper>
            </Box>
          );
        })}
      </Box>

      {/* RIGHT ARROW */}
      <IconButton
        onClick={rotateNext}
        disabled={images.length <= count}
        sx={{
          position: "absolute",
          right: 8,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          bgcolor: "#0EA5E9",
          color: "#fff",
          width: 36,
          height: 36,

          "&:hover": {
            bgcolor: "#0284C7",
          },

          "&.Mui-disabled": {
            bgcolor: "#E2E8F0",
            color: "#94A3B8",
          },

          boxShadow: "0 2px 8px rgba(14,165,233,0.3)",
        }}
      >
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
}
