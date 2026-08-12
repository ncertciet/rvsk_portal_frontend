import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  Button,
  Stack,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DirectionsIcon from '@mui/icons-material/Directions';

export default function ContactPage() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        Contact Us
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        We'd love to hear from you. Visit us or reach out below.
      </Typography>

      <Grid container spacing={4}>
        {/* Map */}
        <Grid item xs={12} md={7}>
          <Paper
            elevation={3}
            sx={{
              height: 400,
              overflow: 'hidden',
              borderRadius: 3,
              transition: 'box-shadow 0.3s',
              '&:hover': { boxShadow: 6 },
            }}
          >
            <iframe
              title="NCERT New Delhi Location"
              src="https://www.google.com/maps?q=NCERT,+Sri+Aurobindo+Marg,+New+Delhi&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Paper>
        </Grid>

        {/* Info card */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              RVSK Office
            </Typography>

            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <LocationOnIcon color="primary" sx={{ mt: 0.3 }} />
                <Typography>
                  NCERT Campus, Sri Aurobindo Marg, New Delhi - 110016
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1.5} alignItems="center">
                <PhoneIcon color="primary" />
                <Typography>+91-11-2656-2XXX</Typography>
              </Stack>

              <Stack direction="row" spacing={1.5} alignItems="center">
                <EmailIcon color="primary" />
                <Typography>rvsk@ncert.nic.in</Typography>
              </Stack>

              <Stack direction="row" spacing={1.5} alignItems="center">
                <AccessTimeIcon color="primary" />
                <Typography>Mon - Fri, 9:30 AM - 5:30 PM</Typography>
              </Stack>
            </Stack>

            <Divider sx={{ my: 1 }} />

            <Button
              variant="contained"
              startIcon={<DirectionsIcon />}
              href="https://www.google.com/maps/dir/?api=1&destination=NCERT,+Sri+Aurobindo+Marg,+New+Delhi"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ borderRadius: 2, alignSelf: 'flex-start' }}
            >
              Get Directions
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}