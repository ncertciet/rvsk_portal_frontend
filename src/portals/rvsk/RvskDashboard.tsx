import { Box, Typography, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

/**
 * 6A State Dashboard modules displayed after login.
 * Each card shows: Badge + Module Name, KPI, Description, Mini Viz, Launch Button.
 */

interface ModuleCard {
  badge: string;
  badgeColor: string;
  title: string;
  kpiValue: string;
  subtitle: string;
  vizType: 'sparkline' | 'bars' | 'progress' | 'linechart' | 'progressbar';
  vizLabel: string;
  path: string;
}

const MODULES: ModuleCard[] = [
  {
    badge: 'A1',
    badgeColor: '#0E7490',
    title: 'Attendance',
    kpiValue: '94.2%',
    subtitle: 'Daily Avg • 1.2M students tracked today',
    vizType: 'sparkline',
    vizLabel: 'Weekly trend',
    path: '/rvsk/dashboard/attendance',
  },
  {
    badge: 'A2',
    badgeColor: '#0E7490',
    title: 'Assessment',
    kpiValue: '78.5',
    subtitle: 'Avg Score • 4.8M assessments completed',
    vizType: 'sparkline',
    vizLabel: 'Score trend',
    path: '/rvsk/dashboard/assessment',
  },
  {
    badge: 'A3',
    badgeColor: '#92400E',
    title: 'Administration',
    kpiValue: '12,847',
    subtitle: 'Schools Active • District dashboards: 742',
    vizType: 'bars',
    vizLabel: 'Regional coverage',
    path: '/rvsk/dashboard/administration',
  },
  {
    badge: 'A4',
    badgeColor: '#D97706',
    title: 'Accreditation',
    kpiValue: '6,240',
    subtitle: 'Schools Audited • Latest Audit Cycle: Q2 2025',
    vizType: 'progress',
    vizLabel: 'Audit cycle progress',
    path: '/rvsk/dashboard/accreditation',
  },
  {
    badge: 'A5',
    badgeColor: '#059669',
    title: 'Adaptive Learning',
    kpiValue: '3.1M',
    subtitle: 'Active Learners • AI recommendations: 8.4M',
    vizType: 'linechart',
    vizLabel: 'Engagement trend',
    path: '/rvsk/dashboard/adaptive-learning',
  },
  {
    badge: 'A6',
    badgeColor: '#0E7490',
    title: 'APAAR',
    kpiValue: '14.2M',
    subtitle: 'Students Registered • Aadhaar-linked: 92.4%',
    vizType: 'progressbar',
    vizLabel: 'Registration growth',
    path: '/rvsk/dashboard/apaar',
  },
];

function MiniSparkline({ color = '#0E7490' }: { color?: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: 36, mt: 1 }}>
      {[40, 55, 35, 60, 45, 70, 50, 65].map((h, i) => (
        <Box key={i} sx={{ width: 6, height: `${h}%`, bgcolor: color, borderRadius: 1, opacity: 0.7 + i * 0.03 }} />
      ))}
    </Box>
  );
}

function MiniBarChart() {
  const regions = [
    { label: 'North', pct: 85 },
    { label: 'South', pct: 72 },
    { label: 'East', pct: 68 },
    { label: 'West', pct: 90 },
  ];
  return (
    <Box sx={{ mt: 1 }}>
      {regions.map((r) => (
        <Box key={r.label} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography sx={{ fontSize: '0.65rem', width: 32, color: '#6B7280' }}>{r.label}</Typography>
          <Box sx={{ flex: 1, height: 8, bgcolor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
            <Box sx={{ width: `${r.pct}%`, height: '100%', bgcolor: '#1E3A5F', borderRadius: 4 }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function MiniProgress({ value = 72 }: { value?: number }) {
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (value / 100) * circumference;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
      <Box sx={{ position: 'relative', width: 60, height: 60 }}>
        <svg width={60} height={60} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={30} cy={30} r={28} fill="none" stroke="#E5E7EB" strokeWidth={4} />
          <circle cx={30} cy={30} r={28} fill="none" stroke="#92400E" strokeWidth={4}
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#111827' }}>{value}%</Typography>
        </Box>
      </Box>
      <Typography sx={{ fontSize: '0.7rem', color: '#6B7280' }}>Completion</Typography>
    </Box>
  );
}

function MiniLineChart() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr'];
  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ height: 40, bgcolor: '#F3F4F6', borderRadius: 1, position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="40" viewBox="0 0 120 40" preserveAspectRatio="none">
          <polyline points="0,35 30,28 60,20 90,15 120,8" fill="none" stroke="#7C3AED" strokeWidth="2" />
          <polyline points="0,35 30,28 60,20 90,15 120,8" fill="url(#grad)" stroke="none" />
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points="0,35 30,28 60,20 90,15 120,8 120,40 0,40" fill="url(#grad)" />
        </svg>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        {months.map((m) => (
          <Typography key={m} sx={{ fontSize: '0.6rem', color: '#9CA3AF' }}>{m}</Typography>
        ))}
      </Box>
    </Box>
  );
}

function MiniProgressBar() {
  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ height: 10, bgcolor: '#E5E7EB', borderRadius: 5, overflow: 'hidden' }}>
        <Box sx={{ width: '92%', height: '100%', bgcolor: '#1E3A8A', borderRadius: 5 }} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Typography sx={{ fontSize: '0.6rem', color: '#9CA3AF' }}>Jan</Typography>
        <Typography sx={{ fontSize: '0.6rem', color: '#9CA3AF' }}>Today</Typography>
      </Box>
    </Box>
  );
}

export default function RvskDashboard() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={2.5}>
        {MODULES.map((mod) => (
          <Grid item xs={12} sm={6} md={4} key={mod.badge}>
            <Box
              onClick={() => navigate(mod.path)}
              sx={{
                borderRadius: '16px',
                p: 2.5,
                bgcolor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.25s ease',
                minHeight: 200,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                border: `1.5px solid ${mod.badgeColor}22`,
                borderTop: `4px solid ${mod.badgeColor}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                '&:hover': {
                  boxShadow: `0 8px 28px ${mod.badgeColor}20`,
                  transform: 'translateY(-3px)',
                  borderColor: `${mod.badgeColor}55`,
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 80,
                  height: 80,
                  background: `radial-gradient(circle at top right, ${mod.badgeColor}08, transparent 70%)`,
                  borderRadius: '0 16px 0 0',
                },
              }}
            >
              {/* Badge + Module Name */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    background: `linear-gradient(135deg, ${mod.badgeColor}, ${mod.badgeColor}CC)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 3px 8px ${mod.badgeColor}40`,
                  }}
                >
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: 0.5 }}>
                    {mod.badge}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>
                  {mod.title}
                </Typography>
              </Box>

              {/* KPI Value */}
              <Typography sx={{ fontSize: '2.2rem', fontWeight: 800, color: mod.badgeColor, lineHeight: 1.1, mb: 0.5 }}>
                {mod.kpiValue}
              </Typography>

              {/* Subtitle */}
              <Typography sx={{ fontSize: '0.76rem', color: '#6B7280', mb: 1.5, lineHeight: 1.4 }}>
                {mod.subtitle}
              </Typography>

              {/* Mini Visualization */}
              <Box sx={{ mt: 'auto' }}>
                {mod.vizType === 'sparkline' && <MiniSparkline color={mod.badgeColor} />}
                {mod.vizType === 'bars' && <MiniBarChart />}
                {mod.vizType === 'progress' && <MiniProgress />}
                {mod.vizType === 'linechart' && <MiniLineChart />}
                {mod.vizType === 'progressbar' && <MiniProgressBar />}
                <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', mt: 0.5 }}>
                  {mod.vizLabel}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
