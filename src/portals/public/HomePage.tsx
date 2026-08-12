import { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Typography, Button, CircularProgress, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import BarChartIcon from '@mui/icons-material/BarChart';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import QuizIcon from '@mui/icons-material/Quiz';
import ArticleIcon from '@mui/icons-material/Article';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import apiClient from '../../services/apiClient';

// ─── Banner Slides Data ─────────────────────────────────────────────────────
const BANNER_SLIDES = [
  {
    title: 'NISHTHA',
    tagline: 'Improving quality of school education through integrated teacher training.',
    bgColor: '#0E4DA4',
    circles: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
  },
  {
    title: 'PM SHRI',
    tagline: 'PM Schools for Rising India — Preparing Future Ready Citizens',
    bgColor: '#1A4F99',
    circles: ['#F7DC6F', '#82E0AA', '#BB8FCE'],
  },
  {
    title: 'DIKSHA',
    tagline: 'Way to unlimited digital resources for education',
    bgColor: '#059669',
    circles: ['#F1948A', '#85C1E9', '#F9E79F'],
  },
  {
    title: 'NIPUN Bharat',
    tagline: 'National Initiative for Proficiency in Reading with Understanding and Numeracy',
    bgColor: '#D97706',
    circles: ['#AED6F1', '#A3E4D7', '#F5B7B1'],
  },
  {
    title: 'UDISE+',
    tagline: 'Unified District Information System for Education',
    bgColor: '#7C3AED',
    circles: ['#FAD7A0', '#A9DFBF', '#D7BDE2'],
  },
];

// ─── Scheme Tiles Data ──────────────────────────────────────────────────────
const SCHEME_TILES = [
  {
    code: 'PM_SHRI',
    name: 'PM SHRI',
    description: 'PM Schools for Rising India — developing schools where every student feels welcomed and cared for.',
    color: '#7C3AED',
    path: '/dashboard/pm-shri',
    icon: SchoolIcon,
    kpi1Key: 'totalSchools',
    kpi1Label: 'Total PM SHRI Schools',
    kpi2Key: 'totalDistricts',
    kpi2Label: 'Total Districts',
  },
  {
    code: 'NAS',
    name: 'National Achievement Survey',
    description: 'Monitoring learning outcomes across states and districts through large-scale assessments.',
    color: '#0891B2',
    path: '/dashboard/nas',
    icon: BarChartIcon,
    kpi1Key: 'TOTAL_SCHOOLS',
    kpi1Label: 'Total Schools Surveyed',
    kpi2Key: 'TOTAL_STUDENTS',
    kpi2Label: 'Total Students Surveyed',
  },
  {
    code: 'DIKSHA_ETB',
    name: 'DIKSHA ETB & eContent',
    description: 'Energised Textbooks with QR codes enabling digital learning access for all students.',
    color: '#16A34A',
    path: '/dashboard/diksha-etb',
    icon: MenuBookIcon,
    kpi1Key: 'TOTAL_CONTENT',
    kpi1Label: 'Total Content',
    kpi2Key: 'TOTAL_LIVE_TEXTBOOKS',
    kpi2Label: 'Total ETBs',
  },
  {
    code: 'MICRO_IMPROVEMENT',
    name: 'Micro Improvements',
    description: 'Teacher-led continuous improvement activities promoting excellence in schools.',
    color: '#DC2626',
    path: '/dashboard/micro-improvement',
    icon: TrendingUpIcon,
    kpi1Key: 'TOTAL_STATES',
    kpi1Label: 'Total States Participating',
    kpi2Key: 'TOTAL_PROJECTS',
    kpi2Label: 'Total Projects',
  },
  {
    code: 'NISHTHA',
    name: 'NISHTHA',
    description: 'National teacher training and professional development programme for quality education.',
    color: '#2563EB',
    path: '/dashboard/nishtha',
    icon: GroupsIcon,
    kpi1Key: 'TOTAL_PROGRAMS',
    kpi1Label: 'No. of Programs',
    kpi2Key: 'TOTAL_PARTICIPANTS',
    kpi2Label: 'No. of Beneficiaries',
  },
  {
    code: 'PGI',
    name: 'Performance Grading Index',
    description: 'State-wise performance grading across multiple education quality dimensions.',
    color: '#4338CA',
    path: '/dashboard/pgi',
    icon: AssessmentIcon,
    kpi1Key: 'TOTAL_STATES',
    kpi1Label: 'Total States/UTs',
    kpi2Key: 'TOTAL_PARAMETERS',
    kpi2Label: 'Total Parameters',
  },
  {
    code: 'PM_POSHAN',
    name: 'PM POSHAN',
    description: 'Pradhan Mantri Poshan Shakti Nirman — mid-day meal programme ensuring nutrition.',
    color: '#EA580C',
    path: '/dashboard/pm-poshan',
    icon: RestaurantIcon,
    kpi1Key: 'TOTAL_STATES',
    kpi1Label: 'Total States',
    kpi2Key: 'TOTAL_SCHOOLS',
    kpi2Label: 'Total Schools',
  },
  {
    code: 'UDISE_PLUS',
    name: 'UDISE+',
    description: 'Unified District Information System for Education — comprehensive school data registry.',
    color: '#D97706',
    path: '/dashboard/udise',
    icon: AccountBalanceIcon,
    kpi1Key: 'TOTAL_SCHOOLS',
    kpi1Label: 'Total Schools Surveyed',
    kpi2Key: 'TOTAL_TEACHERS',
    kpi2Label: 'Total Teachers',
  },
  {
    code: 'NIPUN_BHARAT',
    name: 'NIPUN Bharat',
    description: 'National Initiative for Foundational Literacy & Numeracy for every child.',
    color: '#DB2777',
    path: '/dashboard/nipun-bharat',
    icon: AutoStoriesIcon,
    kpi1Key: 'TOTAL_SESSIONS',
    kpi1Label: 'Total Learning Sessions',
    kpi2Key: 'TOTAL_CONTENT',
    kpi2Label: 'Total Content',
  },
  {
    code: 'NCERT_QUIZ',
    name: 'NCERT Quizzes',
    description: 'National quiz competitions promoting knowledge assessment and learning motivation.',
    color: '#059669',
    path: '/dashboard/ncert-quiz',
    icon: QuizIcon,
    kpi1Key: 'TOTAL_ENROLMENTS',
    kpi1Label: 'Total Enrolment',
    kpi2Key: 'CERTIFICATES_ISSUED',
    kpi2Label: 'Total Certification',
  },
  {
    code: 'NCF',
    name: 'National Curriculum Framework',
    description: 'Consultative process for developing national curriculum frameworks across states.',
    color: '#0284C7',
    path: '/dashboard/ncf',
    icon: ArticleIcon,
    kpi1Key: 'STATES_PARTICIPATING',
    kpi1Label: 'Total States/UTs Participating',
    kpi2Key: 'TOTAL_POSITION_PAPERS',
    kpi2Label: 'Total State Position Paper',
  },
  {
    code: 'PRASHAST',
    name: 'PRASHAST',
    description: 'Pre Assessment Holistic Screening Tool for children with special needs identification.',
    color: '#6366F1',
    path: '/dashboard/prashast',
    icon: AccessibilityNewIcon,
    kpi1Key: 'TOTAL_USERS',
    kpi1Label: 'Total Registered Users',
    kpi2Key: 'TOTAL_STUDENTS',
    kpi2Label: 'Total Students',
  },
];

// ─── Government Logos Data ──────────────────────────────────────────────────
const GOV_LOGOS = [
  { name: 'Ministry of Education', icon: '🇮🇳' },
  { name: 'Digital India', icon: '🌐' },
  { name: 'MyGov', icon: '🏛️' },
  { name: 'DIKSHA', icon: '📱' },
  { name: 'ई-शिक्षा', icon: '📚' },
];

// ─── Helper: Format Indian Number ──────────────────────────────────────────
function formatIndianNumber(value: unknown): string {
  if (value === null || value === undefined) return '—';
  const num = Number(value);
  if (isNaN(num)) return String(value);
  if (num >= 10000000) return `${(num / 10000000).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(2).replace(/\.?0+$/, '')} L`;
  return num.toLocaleString('en-IN');
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOMEPAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function HomePage() {
  const navigate = useNavigate();

  // ─── Banner Carousel State ──────────────────────────────────────────────────
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = BANNER_SLIDES.length;

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide((index + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  // ─── Scheme Carousel State ─────────────────────────────────────────────────
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };
  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  // ─── KPI Data Fetching ──────────────────────────────────────────────────────
  const [kpiData, setKpiData] = useState<Record<string, Record<string, unknown>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const results: Record<string, Record<string, unknown>> = {};
      await Promise.allSettled(
        SCHEME_TILES.map(async (scheme) => {
          try {
            const res = await apiClient.get(`/schemes/${scheme.code}/kpis`);
            results[scheme.code] = res.data;
          } catch {
            results[scheme.code] = {};
          }
        })
      );
      setKpiData(results);
      setLoading(false);
    };
    fetchAll();
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════════
  return (
    <Box>
      {/* ═══ Section 1: Full-width Banner Carousel ═══ */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: 250, md: 400 },
          overflow: 'hidden',
        }}
      >
        {/* Slides Container */}
        <Box
          sx={{
            display: 'flex',
            width: `${totalSlides * 100}%`,
            height: '100%',
            transform: `translateX(-${(currentSlide * 100) / totalSlides}%)`,
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {BANNER_SLIDES.map((slide, index) => (
            <Box
              key={index}
              sx={{
                width: `${100 / totalSlides}%`,
                height: '100%',
                background: `linear-gradient(135deg, ${slide.bgColor} 0%, #0891B2 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                px: { xs: 3, md: 8 },
              }}
            >
              {/* Decorative circles (left side) */}
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  gap: 2,
                  alignItems: 'center',
                  mr: 6,
                }}
              >
                {slide.circles.map((color, ci) => (
                  <Box
                    key={ci}
                    sx={{
                      width: ci === 1 ? 100 : 70,
                      height: ci === 1 ? 100 : 70,
                      borderRadius: '50%',
                      backgroundColor: color,
                      opacity: 0.85,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    }}
                  />
                ))}
              </Box>

              {/* Slide content (right side) */}
              <Box sx={{ textAlign: { xs: 'center', md: 'left' }, maxWidth: 500 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    mb: 2,
                    mx: { xs: 'auto', md: 0 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: '1.5rem' }}>📘</Typography>
                </Box>
                <Typography
                  sx={{
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: { xs: '1.5rem', md: '2.5rem' },
                    lineHeight: 1.2,
                    mb: 1,
                  }}
                >
                  {slide.title}
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: { xs: '0.85rem', md: '1.1rem' },
                    lineHeight: 1.5,
                  }}
                >
                  {slide.tagline}
                </Typography>
              </Box>

              {/* Wavy bottom decoration */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 40,
                  background: 'linear-gradient(to top, rgba(255,255,255,0.1), transparent)',
                }}
              />
            </Box>
          ))}
        </Box>

        {/* Left Arrow */}
        <IconButton
          onClick={() => goToSlide(currentSlide - 1)}
          aria-label="Previous slide"
          sx={{
            position: 'absolute',
            left: { xs: 8, md: 20 },
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255,255,255,0.3)',
            color: '#FFFFFF',
            width: { xs: 36, md: 48 },
            height: { xs: 36, md: 48 },
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.5)' },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>

        {/* Right Arrow */}
        <IconButton
          onClick={() => goToSlide(currentSlide + 1)}
          aria-label="Next slide"
          sx={{
            position: 'absolute',
            right: { xs: 8, md: 20 },
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255,255,255,0.3)',
            color: '#FFFFFF',
            width: { xs: 36, md: 48 },
            height: { xs: 36, md: 48 },
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.5)' },
          }}
        >
          <ChevronRightIcon />
        </IconButton>

        {/* Navigation Dots */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
          }}
        >
          {BANNER_SLIDES.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentSlide(index)}
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: currentSlide === index ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
            />
          ))}
        </Box>
      </Box>

      {/* ═══ Section 2: "Schemes" Header with Carousel Navigation ═══ */}
      <Box
        sx={{
          background: 'linear-gradient(180deg, #EDF2F7 0%, #F0F9FF 100%)',
          pt: 5,
          pb: 1,
          px: { xs: 2, md: 4 },
        }}
      >
        <Box
          sx={{
            maxWidth: 1240,
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '1.75rem' }, color: '#111827' }}>
              Schemes
            </Typography>
            <Typography
              component="a"
              href="/schemes"
              sx={{
                color: '#D97706',
                fontWeight: 600,
                fontSize: '0.9rem',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              View All
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={scrollLeft}
              aria-label="Scroll schemes left"
              sx={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                width: 40,
                height: 40,
                '&:hover': { backgroundColor: '#F1F5F9' },
              }}
            >
              <ChevronLeftIcon sx={{ color: '#374151' }} />
            </IconButton>
            <IconButton
              onClick={scrollRight}
              aria-label="Scroll schemes right"
              sx={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                width: 40,
                height: 40,
                '&:hover': { backgroundColor: '#F1F5F9' },
              }}
            >
              <ChevronRightIcon sx={{ color: '#374151' }} />
            </IconButton>
          </Box>
        </Box>

        {/* ═══ Section 3: Horizontally Scrollable Scheme Tiles ═══ */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#0E7490' }} />
          </Box>
        ) : (
          <Box
            sx={{
              maxWidth: 1240,
              mx: 'auto',
              overflow: 'hidden',
              pb: 5,
            }}
          >
            <Box
              ref={carouselRef}
              sx={{
                display: 'flex',
                gap: 3,
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                pb: 2,
                px: 1,
                /* Hide scrollbar */
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {SCHEME_TILES.map((scheme) => {
                const data = kpiData[scheme.code] || {};
                const IconComponent = scheme.icon;

                return (
                  <Box
                    key={scheme.code}
                    sx={{
                      minWidth: { xs: 300, sm: 340, md: 380 },
                      maxWidth: { xs: 300, sm: 340, md: 380 },
                      scrollSnapAlign: 'start',
                      flexShrink: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '18px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderLeft: `4px solid ${scheme.color}`,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.03)',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: `0 16px 40px rgba(0,0,0,0.1), 0 0 0 1px ${scheme.color}30`,
                      },
                    }}
                  >
                    {/* Card Content */}
                    <Box sx={{ p: 3, pb: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Icon + Title Row */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            backgroundColor: `${scheme.color}14`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <IconComponent sx={{ fontSize: 22, color: scheme.color }} />
                        </Box>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: '1.05rem',
                            color: '#0E7490',
                            lineHeight: 1.3,
                          }}
                        >
                          {scheme.name}
                        </Typography>
                      </Box>

                      {/* Description */}
                      <Typography
                        sx={{
                          color: '#6B7280',
                          fontSize: '0.83rem',
                          lineHeight: 1.6,
                          mb: 2.5,
                          minHeight: 50,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {scheme.description}
                      </Typography>

                      {/* KPI Boxes */}
                      <Box sx={{ display: 'flex', gap: 1.5, mt: 'auto', mb: 2 }}>
                        <Box
                          sx={{
                            flex: 1,
                            border: '1px dashed #CBD5E1',
                            borderRadius: '10px',
                            p: 1.5,
                            textAlign: 'center',
                            backgroundColor: '#FAFBFC',
                          }}
                        >
                          <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#111827', lineHeight: 1.2 }}>
                            {formatIndianNumber(data[scheme.kpi1Key])}
                          </Typography>
                          <Typography sx={{ fontSize: '0.68rem', color: '#6B7280', mt: 0.5, fontWeight: 500, lineHeight: 1.3 }}>
                            {scheme.kpi1Label}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            flex: 1,
                            border: '1px solid #E2E8F0',
                            borderRadius: '10px',
                            p: 1.5,
                            textAlign: 'center',
                            backgroundColor: '#FAFBFC',
                          }}
                        >
                          <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#111827', lineHeight: 1.2 }}>
                            {formatIndianNumber(data[scheme.kpi2Key])}
                          </Typography>
                          <Typography sx={{ fontSize: '0.68rem', color: '#6B7280', mt: 0.5, fontWeight: 500, lineHeight: 1.3 }}>
                            {scheme.kpi2Label}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Explore Button */}
                    <Box sx={{ px: 3, pb: 3 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => navigate(scheme.path)}
                        sx={{
                          background: 'linear-gradient(135deg, #0E7490 0%, #0891B2 100%)',
                          borderRadius: '28px',
                          py: 1.25,
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          textTransform: 'none',
                          letterSpacing: '0.3px',
                          boxShadow: '0 4px 14px rgba(14,116,144,0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #0C6478 0%, #0E7490 100%)',
                            boxShadow: '0 6px 20px rgba(14,116,144,0.4)',
                            transform: 'translateY(-1px)',
                          },
                        }}
                      >
                        Explore
                      </Button>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>

      {/* ═══ Section 4: Government Logo Bar ═══ */}
      <Box
        sx={{
          backgroundColor: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          borderBottom: '1px solid #E2E8F0',
          py: 4,
          px: 3,
        }}
      >
        <Box
          sx={{
            maxWidth: 1000,
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 3, md: 6 },
            flexWrap: 'wrap',
          }}
        >
          {GOV_LOGOS.map((logo) => (
            <Box
              key={logo.name}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                filter: 'grayscale(80%)',
                opacity: 0.7,
                transition: 'all 0.3s',
                cursor: 'pointer',
                '&:hover': {
                  filter: 'grayscale(0%)',
                  opacity: 1,
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Typography sx={{ fontSize: '2.5rem', lineHeight: 1 }}>
                {logo.icon}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  color: '#6B7280',
                  fontWeight: 500,
                  textAlign: 'center',
                  maxWidth: 80,
                }}
              >
                {logo.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ═══ Section 5: Address Bar ═══ */}
      <Box
        sx={{
          backgroundColor: '#F1F5F9',
          py: 3,
          px: 3,
          textAlign: 'center',
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: '0.8rem', md: '0.9rem' },
            color: '#374151',
            fontWeight: 500,
            lineHeight: 1.6,
          }}
        >
          National Council of Educational Research And Training (NCERT), Sri Aurobindo Marg, New Delhi-110016
        </Typography>
      </Box>
    </Box>
  );
}
