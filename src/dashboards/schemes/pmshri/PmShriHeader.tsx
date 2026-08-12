import { Box, Typography } from '@mui/material';

export default function PmShriHeader() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: '#FFFFFF',
        px: 3,
        py: 1.5,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        borderBottom: '3px solid transparent',
        borderImage: 'linear-gradient(to right, #FF9933, #1A4F99, #138808) 1',
      }}
    >
      {/* Ministry of Education Logo placeholder */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1A4F99 0%, #2563EB 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 0 3px rgba(26,79,153,0.15), 0 2px 8px rgba(26,79,153,0.2)',
          }}
        >
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>MoE</Typography>
        </Box>
        <Box>
          <Typography variant="body2" fontWeight={600} color="text.primary">
            Ministry of Education
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Government of India
          </Typography>
        </Box>
      </Box>

      {/* NDEAR text */}
      <Typography
        variant="body1"
        sx={{ color: '#1A4F99', fontWeight: 800, letterSpacing: '2px' }}
      >
        NDEAR VIDYA SAMIKSHA KENDRA
      </Typography>
    </Box>
  );
}
