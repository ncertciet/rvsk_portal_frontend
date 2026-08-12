import { Box, Typography, Grid, Container } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InsightsIcon from '@mui/icons-material/Insights';
import BadgeIcon from '@mui/icons-material/Badge';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import SyncIcon from '@mui/icons-material/Sync';
import HubIcon from '@mui/icons-material/Hub';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

/**
 * RVSK About Page — World-class design with Vision, Core Pillars,
 * NDEAR-Compliant Data Flow, and Key Benefits sections.
 */
export default function AboutPage() {
  return (
    <Box>
      {/* ─────────── SECTION 1: THE VISION ─────────── */}
      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            {/* Left — Text */}
            <Grid item xs={12} md={6}>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#D97706',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  mb: 1.5,
                }}
              >
                The Vision
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                  fontWeight: 800,
                  color: '#111827',
                  lineHeight: 1.2,
                  mb: 3,
                }}
              >
                Centralized tracking for decentralized empowerment.
              </Typography>
              <Typography
                sx={{
                  fontSize: '1rem',
                  color: '#4B5563',
                  lineHeight: 1.8,
                  mb: 2,
                }}
              >
                Rashtriya Vidya Samiksha Kendra (RVSK) is India&apos;s unified education monitoring
                platform, bridging the data divide between 14+ lakh schools, state agencies, and
                national policy makers. Built on NDEAR-compliant architecture, RVSK enables
                real-time visibility into every education initiative from PM SHRI to NIPUN Bharat.
              </Typography>
              <Typography
                sx={{
                  fontSize: '1rem',
                  color: '#4B5563',
                  lineHeight: 1.8,
                }}
              >
                By aggregating scheme-level data into actionable insights, RVSK empowers
                block-level officers, state education departments, and the Ministry of Education
                to make evidence-based decisions that improve learning outcomes for over 26 crore
                students across the nation.
              </Typography>
            </Grid>

            {/* Right — Futuristic Dashboard Placeholder */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  width: '100%',
                  height: { xs: 260, md: 360 },
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #0891B2 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 24px 64px rgba(30,58,138,0.25)',
                }}
              >
                {/* Decorative grid pattern */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.12,
                    backgroundImage:
                      'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                />
                {/* Floating dashboard elements */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '15%',
                    left: '10%',
                    width: '35%',
                    height: '30%',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '25%',
                    right: '8%',
                    width: '40%',
                    height: '45%',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: '12%',
                    left: '15%',
                    width: '50%',
                    height: '22%',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.18)',
                  }}
                />
                {/* Center icon */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <DashboardIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.8)' }} />
                  <Typography
                    sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}
                  >
                    RVSK Control Center
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ─────────── SECTION 2: CORE PILLARS ─────────── */}
      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: '#F8FAFC' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              sx={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#D97706',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                mb: 1.5,
              }}
            >
              Core Pillars
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '1.6rem', md: '2.2rem' },
                fontWeight: 800,
                color: '#111827',
              }}
            >
              Empowering Education Initiatives
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {CORE_PILLARS.map((pillar, index) => (
              <Grid item xs={12} sm={6} md={3} key={pillar.title}>
                <Box
                  sx={{
                    height: '100%',
                    p: 3,
                    borderRadius: '16px',
                    backgroundColor: '#FAFAF5',
                    border: '1px solid #E5E7EB',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.06)',
                    },
                  }}
                >
                  {/* Number */}
                  <Typography
                    sx={{
                      fontSize: '2rem',
                      fontWeight: 800,
                      color: '#E5E7EB',
                      position: 'absolute',
                      top: 16,
                      left: 20,
                      lineHeight: 1,
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </Typography>

                  {/* Icon */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      backgroundColor: '#4338CA14',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <pillar.icon sx={{ fontSize: 18, color: '#4338CA' }} />
                  </Box>

                  {/* Content */}
                  <Box sx={{ mt: 5 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: '#111827',
                        mb: 1.5,
                        lineHeight: 1.3,
                      }}
                    >
                      {pillar.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.83rem',
                        color: '#6B7280',
                        lineHeight: 1.7,
                      }}
                    >
                      {pillar.description}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─────────── SECTION 3: NDEAR DATA FLOW ─────────── */}
      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              sx={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#D97706',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                mb: 1.5,
              }}
            >
              Standard Data Architecture
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '1.6rem', md: '2.2rem' },
                fontWeight: 800,
                color: '#111827',
                mb: 1,
              }}
            >
              NDEAR-Compliant Data Flow
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', color: '#6B7280', maxWidth: 600, mx: 'auto' }}>
              Seamless data movement from grassroots schools to national dashboards, powered by
              interoperable standards.
            </Typography>
          </Box>

          {/* Flow Steps */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'stretch', md: 'stretch' },
              gap: { xs: 2, md: 0 },
            }}
          >
            {DATA_FLOW_STEPS.map((step, index) => (
              <Box
                key={step.title}
                sx={{
                  display: 'flex',
                  alignItems: 'stretch',
                  flex: 1,
                  flexDirection: { xs: 'column', md: 'row' },
                }}
              >
                {/* Step Card */}
                <Box
                  sx={{
                    flex: 1,
                    p: 3,
                    borderRadius: '14px',
                    backgroundColor: step.isDark ? '#1E3A8A' : '#F9FAFB',
                    border: step.isDark ? 'none' : '1px solid #E5E7EB',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    minHeight: 160,
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      backgroundColor: step.isDark ? 'rgba(255,255,255,0.15)' : '#E0E7FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1.5,
                    }}
                  >
                    <step.icon
                      sx={{ fontSize: 22, color: step.isDark ? '#FFFFFF' : '#4338CA' }}
                    />
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: step.isDark ? '#FFFFFF' : '#111827',
                      mb: 0.5,
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      color: step.isDark ? 'rgba(255,255,255,0.7)' : '#6B7280',
                      lineHeight: 1.5,
                    }}
                  >
                    {step.description}
                  </Typography>
                </Box>

                {/* Arrow */}
                {index < DATA_FLOW_STEPS.length - 1 && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', md: 'row' },
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: { xs: 0, md: 1 },
                      py: { xs: 1, md: 0 },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.25,
                      }}
                    >
                      <ArrowForwardIcon
                        sx={{
                          fontSize: 18,
                          color: '#9CA3AF',
                          transform: { xs: 'rotate(90deg)', md: 'none' },
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: '0.6rem',
                          color: '#9CA3AF',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {step.arrowLabel}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ─────────── SECTION 4: KEY BENEFITS ─────────── */}
      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: '#F8FAFC' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              sx={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#D97706',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                mb: 1.5,
              }}
            >
              Benefits
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '1.6rem', md: '2.2rem' },
                fontWeight: 800,
                color: '#111827',
              }}
            >
              Key Envisaged Benefits of RVSK
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {KEY_BENEFITS.map((benefit) => (
              <Grid item xs={12} sm={6} md={4} key={benefit.title}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: '14px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    height: '100%',
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#0891B2',
                      boxShadow: '0 4px 16px rgba(8,145,178,0.08)',
                    },
                  }}
                >
                  <CheckCircleIcon sx={{ color: '#0891B2', fontSize: 24, mt: 0.25, flexShrink: 0 }} />
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#111827', mb: 0.5 }}>
                      {benefit.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#6B7280', lineHeight: 1.6 }}>
                      {benefit.description}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

/* ─────────── DATA ─────────── */

const CORE_PILLARS = [
  {
    title: 'Real-time Visibility',
    description:
      'Live dashboards track student and teacher attendance, infrastructure gaps, and textbook distribution maps instantly.',
    icon: VisibilityIcon,
  },
  {
    title: 'Actionable Insights',
    description:
      'ML-driven analytics flag schools with high drop-out risks, enabling direct block-level academic intervention.',
    icon: InsightsIcon,
  },
  {
    title: 'Student Registry',
    description:
      'A unified, privacy-first ID registry tracks learning outcomes, transfer history, and scholarships seamlessly.',
    icon: BadgeIcon,
  },
  {
    title: 'Performance Improvement',
    description:
      'Standardized NAS and State Board assessments are mapped to localized curricula to identify weak concept areas.',
    icon: TrendingUpIcon,
  },
];

const DATA_FLOW_STEPS = [
  {
    title: 'Local Schools / State Apps',
    description: 'Data captured at source through mobile apps and MIS systems',
    icon: SchoolIcon,
    isDark: false,
    arrowLabel: 'API Sync',
  },
  {
    title: 'State VSK Centers',
    description: 'State-level aggregation, validation, and quality checks',
    icon: SyncIcon,
    isDark: false,
    arrowLabel: 'NDEAR Schema',
  },
  {
    title: 'Central RVSK Hub',
    description: 'National aggregation with NDEAR-compliant data interchange',
    icon: HubIcon,
    isDark: false,
    arrowLabel: 'Real-time Feed',
  },
  {
    title: 'National RVSK Portal',
    description: 'Unified dashboards, analytics, and decision support',
    icon: DashboardIcon,
    isDark: true,
    arrowLabel: '',
  },
];

const KEY_BENEFITS = [
  {
    title: 'Unified Data Lake',
    description: 'Single source of truth consolidating 12+ schemes, eliminating data silos across ministries.',
  },
  {
    title: 'Real-time Monitoring',
    description: 'Live dashboards with geospatial mapping for instant visibility into scheme progress.',
  },
  {
    title: 'Evidence-Based Policy',
    description: 'Data-driven insights enabling targeted interventions at block, district, and state levels.',
  },
  {
    title: 'Reduced Reporting Burden',
    description: 'Automated data sync eliminates manual reporting across 14+ lakh schools.',
  },
  {
    title: 'Interoperability',
    description: 'NDEAR-compliant APIs ensuring seamless data exchange between state and national systems.',
  },
  {
    title: 'Equity & Inclusion',
    description: 'Identify underserved regions and demographics for targeted resource allocation.',
  },
];
