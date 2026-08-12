import { Box, Typography, Paper, Chip } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import { useLocation } from 'react-router-dom';

/**
 * Generic placeholder page shown when a menu route exists in the database
 * but the frontend page hasn't been implemented yet.
 * Extracts the module/page name from the URL path.
 */
export default function ComingSoon() {
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  
  // Derive a readable name from the URL path
  const pageName = pathParts[pathParts.length - 1]
    ?.replace(/-/g, ' ')
    ?.replace(/\b\w/g, c => c.toUpperCase()) || 'Page';
  
  const moduleName = pathParts.length > 2
    ? pathParts[pathParts.length - 2]?.replace(/-/g, ' ')?.replace(/\b\w/g, c => c.toUpperCase())
    : null;

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '60vh',
      p: 3 
    }}>
      <Paper sx={{ 
        p: 5, 
        textAlign: 'center', 
        maxWidth: 500, 
        borderRadius: 3,
        border: '1px solid #E2E8F0'
      }}>
        <ConstructionIcon sx={{ fontSize: 64, color: '#7C3AED', mb: 2 }} />
        
        <Typography variant="h5" fontWeight={700} color="#1E293B" gutterBottom>
          {pageName}
        </Typography>
        
        {moduleName && (
          <Chip 
            label={moduleName} 
            size="small" 
            sx={{ mb: 2, bgcolor: '#F3E8FF', color: '#7C3AED' }} 
          />
        )}
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          This page is currently under development and will be available soon.
        </Typography>
        
        <Typography variant="caption" color="text.disabled">
          Route: {location.pathname}
        </Typography>
      </Paper>
    </Box>
  );
}
