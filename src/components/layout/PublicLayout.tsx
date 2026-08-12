import { Outlet, Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box, Typography, Container, Grid } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function PublicLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: 'primary.dark' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 0, mr: 4 }}>RVSK 2.0</Typography>
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            <Button color="inherit" component={Link} to="/">Home</Button>
            <Button color="inherit" component={Link} to="/about">About</Button>
            <Button color="inherit" component={Link} to="/schemes">Schemes</Button>
            <Button color="inherit" component={Link} to="/gallery">Gallery</Button>
            <Button color="inherit" component={Link} to="/contact">Contact Us</Button>
          </Box>
          <Button variant="outlined" color="inherit" component={Link} to="/login">Login</Button>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>

      {/* ─────────── FOOTER ─────────── */}
      <Box
        component="footer"
        sx={{
          backgroundColor: '#1E3A8A',
          color: '#FFFFFF',
          pt: { xs: 5, md: 6 },
          pb: 3,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Left Column — Branding */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                  }}
                >
                  🇮🇳
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>
                    Vidya Samiksha Kendra
                  </Typography>
                  <Typography sx={{ fontSize: '0.68rem', opacity: 0.7, letterSpacing: '0.5px' }}>
                    MINISTRY OF EDUCATION, GOVT. OF INDIA
                  </Typography>
                </Box>
              </Box>
              <Typography
                sx={{
                  fontSize: '0.82rem',
                  opacity: 0.75,
                  lineHeight: 1.7,
                  maxWidth: 320,
                }}
              >
                Rashtriya Vidya Samiksha Kendra (RVSK) is India&apos;s national education monitoring
                platform enabling real-time data-driven decision making for quality education
                delivery across all states and UTs.
              </Typography>
            </Grid>

            {/* Middle Column — Useful Links */}
            <Grid item xs={12} sm={6} md={4}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  mb: 2.5,
                  opacity: 0.9,
                }}
              >
                Useful Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {FOOTER_LINKS.map((link) => (
                  <Typography
                    key={link.label}
                    component="a"
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      fontSize: '0.82rem',
                      color: 'rgba(255,255,255,0.75)',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                      '&:hover': { color: '#FFFFFF' },
                    }}
                  >
                    {link.label}
                  </Typography>
                ))}
              </Box>
            </Grid>

            {/* Right Column — Contact Support */}
            <Grid item xs={12} sm={6} md={4}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  mb: 2.5,
                  opacity: 0.9,
                }}
              >
                Contact Support
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <PhoneIcon sx={{ fontSize: 18, opacity: 0.7 }} />
                  <Typography sx={{ fontSize: '0.82rem', opacity: 0.85 }}>
                    +91 11 2686 3242
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <EmailIcon sx={{ fontSize: 18, opacity: 0.7 }} />
                  <Typography sx={{ fontSize: '0.82rem', opacity: 0.85 }}>
                    helpdesk-rvsk@ncert.nic.in
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <LocationOnIcon sx={{ fontSize: 18, opacity: 0.7, mt: 0.25 }} />
                  <Typography sx={{ fontSize: '0.82rem', opacity: 0.85, lineHeight: 1.6 }}>
                    NCERT, Sri Aurobindo Marg,
                    <br />
                    New Delhi - 110016, India
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Bottom Bar */}
          <Box
            sx={{
              mt: 5,
              pt: 3,
              borderTop: '1px solid rgba(255,255,255,0.12)',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography sx={{ fontSize: '0.75rem', opacity: 0.6 }}>
              © {new Date().getFullYear()} Ministry of Education, Government of India. All rights reserved.
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', opacity: 0.6 }}>
              Built with ❤️ for Bharat&apos;s Education
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

/* Footer links data */
const FOOTER_LINKS = [
  { label: 'DIKSHA Portal', url: 'https://diksha.gov.in' },
  { label: 'U-DISE+ Dashboard', url: 'https://udiseplus.gov.in' },
  { label: 'PRASHAST App', url: 'https://prashast.ncert.gov.in' },
  { label: 'NIPUN Bharat', url: 'https://nipunbharat.education.gov.in' },
  { label: 'PM SHRI Schools', url: 'https://pmshri.education.gov.in' },
];
