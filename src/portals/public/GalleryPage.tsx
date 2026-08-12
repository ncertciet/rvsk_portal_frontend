import { Box, Typography, Grid, Card, CardMedia, CardContent, Chip } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface GalleryItem {
  title: string;
  date: string;
  image: string;
}

const galleryItems: GalleryItem[] = [
  {
    title: 'CPD Workshop',
    date: '9/23/2024',
    image: 'https://via.placeholder.com/400x280?text=CPD+Workshop',
  },
  {
    title: 'National Workshop VSK Gujarat',
    date: '9/23/2024',
    image: 'https://via.placeholder.com/400x280?text=VSK+Gujarat',
  },
  {
    title: 'State VSK Picture',
    date: '9/23/2024',
    image: 'https://via.placeholder.com/400x280?text=State+VSK',
  },
];

export default function GalleryPage() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        Gallery
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Highlights from our workshops and events.
      </Typography>

      <Grid container spacing={3}>
        {galleryItems.map((item, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'transform 0.25s, box-shadow 0.25s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardMedia
                component="img"
                height="220"
                image={item.image}
                alt={item.title}
                sx={{
                  transition: 'transform 0.4s',
                  '&:hover': { transform: 'scale(1.05)' },
                }}
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {item.title}
                </Typography>
                <Chip
                  icon={<CalendarTodayIcon sx={{ fontSize: '16px !important' }} />}
                  label={item.date}
                  size="small"
                  variant="outlined"
                  sx={{ color: 'text.secondary' }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}