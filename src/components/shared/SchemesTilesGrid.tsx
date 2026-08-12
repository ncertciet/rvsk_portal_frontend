import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Button, CircularProgress } from '@mui/material';
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
import apiClient from '../../services/apiClient';

/**
 * Scheme tile configuration with color coding from the RVSK design system.
 */
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

/**
 * Format a number in Indian numbering system (Lakh/Crore).
 */
function formatIndianNumber(value: unknown): string {
  if (value === null || value === undefined) return '—';
  const num = Number(value);
  if (isNaN(num)) return String(value);
  if (num >= 10000000) return `${(num / 10000000).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(2).replace(/\.?0+$/, '')} L`;
  return num.toLocaleString('en-IN');
}

export default function SchemesTilesGrid() {
  const navigate = useNavigate();
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: '#0E7490' }} />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {SCHEME_TILES.map((scheme) => {
        const data = kpiData[scheme.code] || {};
        const IconComponent = scheme.icon;

        return (
          <Grid item xs={12} sm={6} md={4} key={scheme.code}>
            <Box
              sx={{
                height: '100%',
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
                  {/* KPI Box 1 */}
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
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: '1.25rem',
                        color: '#111827',
                        lineHeight: 1.2,
                      }}
                    >
                      {formatIndianNumber(data[scheme.kpi1Key])}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.68rem',
                        color: '#6B7280',
                        mt: 0.5,
                        fontWeight: 500,
                        lineHeight: 1.3,
                      }}
                    >
                      {scheme.kpi1Label}
                    </Typography>
                  </Box>

                  {/* KPI Box 2 */}
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
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: '1.25rem',
                        color: '#111827',
                        lineHeight: 1.2,
                      }}
                    >
                      {formatIndianNumber(data[scheme.kpi2Key])}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.68rem',
                        color: '#6B7280',
                        mt: 0.5,
                        fontWeight: 500,
                        lineHeight: 1.3,
                      }}
                    >
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
          </Grid>
        );
      })}
    </Grid>
  );
}
