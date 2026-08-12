import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ImageIcon from '@mui/icons-material/Image';
import { GalleryImage } from './types';

interface GalleryCarouselProps {
  images: GalleryImage[];
  autoRotateInterval?: number;
  visibleCards?: number;
}

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

  if (!images || images.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 6,
          px: 2,
          bgcolor: '#F0F4F8',
          borderRadius: 3,
          border: '1px dashed #CBD5E1',
        }}
      >
        <ImageIcon sx={{ color: '#94A3B8', mr: 1, fontSize: 32 }} />
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
        position: 'relative',
        py: 3,
        px: 6,
        bgcolor: '#F0F7FF',
        borderRadius: 3,
        border: '1px solid #DBEAFE',
        overflow: 'hidden',
      }}
    >
      {/* Left Arrow */}
      <IconButton
        onClick={rotatePrev}
        disabled={images.length <= count}
        sx={{
          position: 'absolute',
          left: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          bgcolor: '#0EA5E9',
          color: '#fff',
          width: 36,
          height: 36,
          '&:hover': { bgcolor: '#0284C7' },
          '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' },
          boxShadow: '0 2px 8px rgba(14,165,233,0.3)',
        }}
      >
        <ChevronLeftIcon />
      </IconButton>

      {/* Images Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${count}, 1fr)`,
          gap: 2.5,
          transition: 'all 0.4s ease-in-out',
        }}
      >
        {visibleImages.map((img, idx) => (
          <Box
            key={`${img.id}-${idx}`}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Paper
              elevation={3}
              sx={{
                width: '100%',
                paddingTop: '70%', // 10:7 aspect ratio
                position: 'relative',
                borderRadius: 3,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.03)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                },
              }}
            >
              <Box
                component="img"
                src={img.imageUrl || img.thumbnailUrl}
                alt={img.caption || img.stateName}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  // Show placeholder on image load error
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.style.background = '#CBD5E1';
                  target.parentElement!.innerHTML = `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#64748B;font-size:14px;text-align:center">${img.stateName}</div>`;
                }}
              />
            </Paper>
            <Typography
              variant="body2"
              sx={{
                color: '#1E293B',
                fontWeight: 600,
                textAlign: 'center',
                fontSize: '0.85rem',
              }}
            >
              {img.stateName}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Right Arrow */}
      <IconButton
        onClick={rotateNext}
        disabled={images.length <= count}
        sx={{
          position: 'absolute',
          right: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          bgcolor: '#0EA5E9',
          color: '#fff',
          width: 36,
          height: 36,
          '&:hover': { bgcolor: '#0284C7' },
          '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' },
          boxShadow: '0 2px 8px rgba(14,165,233,0.3)',
        }}
      >
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
}
