import { Box, Typography } from '@mui/material';

export default function DikshaEtbBanner() {
  return (
    <Box
      sx={{
        position: 'relative',
        background: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradientShift 8s ease infinite',
        borderRadius: 2,
        overflow: 'hidden',
        px: 5,
        py: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 180,
        '@keyframes gradientShift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      }}
    >
      {/* Glass overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(2px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Decorative scattered educational icons */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0.12,
          fontSize: 28,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: 12, left: 40 }}>📖</Box>
        <Box sx={{ position: 'absolute', top: 50, left: 180 }}>🔗</Box>
        <Box sx={{ position: 'absolute', top: 20, left: 320 }}>📱</Box>
        <Box sx={{ position: 'absolute', bottom: 20, left: 80 }}>💻</Box>
        <Box sx={{ position: 'absolute', bottom: 40, left: 260 }}>📚</Box>
        <Box sx={{ position: 'absolute', top: 60, right: 320 }}>🎓</Box>
        <Box sx={{ position: 'absolute', bottom: 15, right: 280 }}>📝</Box>
      </Box>

      {/* Decorative radial curve */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: '100%',
          background:
            'radial-gradient(ellipse at top right, rgba(255,255,255,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Bottom decorative wave */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 40,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <svg
          viewBox="0 0 1200 40"
          preserveAspectRatio="none"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <path
            d="M0,20 C300,40 600,0 900,20 C1050,30 1150,10 1200,20 L1200,40 L0,40 Z"
            fill="rgba(255,255,255,0.06)"
          />
        </svg>
      </Box>

      {/* Text Content */}
      <Box sx={{ zIndex: 1, maxWidth: '55%' }}>
        <Typography
          sx={{
            color: '#fff',
            fontWeight: 800,
            mb: 0.5,
            lineHeight: 1.2,
            fontSize: '2.5rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          DIKSHA - ETB &amp; eContent
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, mb: 1 }}
        >
          Way to unlimited resources
        </Typography>
      </Box>

      {/* Right side illustration placeholder */}
      <Box
        sx={{
          zIndex: 1,
          width: 200,
          height: 140,
          borderRadius: 2,
          bgcolor: 'rgba(255,255,255,0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 32, mb: 0.5 }}>
          📖📱💡
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, textAlign: 'center' }}>
          Digital Textbooks
        </Typography>
      </Box>
    </Box>
  );
}
