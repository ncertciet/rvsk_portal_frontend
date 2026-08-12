import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';

const schemes = [
  { code: 'PM_SHRI', name: 'PM SHRI', desc: 'PM Schools for Rising India — developing schools where every student feels welcomed', color: '#1A4F99', path: '/dashboard/pm-shri' },
  { code: 'NAS', name: 'National Achievement Survey', desc: 'Monitoring learning outcomes across states and districts', color: '#7C3AED', path: '/dashboard/nas' },
  { code: 'DIKSHA_ETB', name: 'DIKSHA ETB & eContent', desc: 'Energised Textbooks with QR codes for digital learning', color: '#059669', path: '/dashboard/diksha-etb' },
  { code: 'MICRO_IMPROVEMENT', name: 'Micro Improvements', desc: 'Teacher-led continuous improvement activities in schools', color: '#DC2626', path: '/dashboard/micro-improvement' },
  { code: 'NISHTHA', name: 'NISHTHA', desc: 'National teacher training and professional development', color: '#D97706', path: '/dashboard/nishtha' },
  { code: 'PGI', name: 'Performance Grading Index', desc: 'State-wise performance grading across education dimensions', color: '#2563EB', path: '/dashboard/pgi' },
  { code: 'PM_POSHAN', name: 'PM POSHAN', desc: 'Pradhan Mantri Poshan Shakti Nirman — mid-day meals', color: '#16A34A', path: '/dashboard/pm-poshan' },
  { code: 'UDISE_PLUS', name: 'UDISE+', desc: 'Unified District Information System for Education', color: '#7C3AED', path: '/dashboard/udise' },
  { code: 'NIPUN_BHARAT', name: 'NIPUN Bharat', desc: 'National Initiative for Foundational Literacy & Numeracy', color: '#EC4899', path: '/dashboard/nipun-bharat' },
  { code: 'NCERT_QUIZ', name: 'NCERT Quizzes', desc: 'National quiz competitions promoting knowledge', color: '#F59E0B', path: '/dashboard/ncert-quiz' },
  { code: 'NCF', name: 'National Curriculum Framework', desc: 'Consultative process for developing curriculum frameworks', color: '#0891B2', path: '/dashboard/ncf' },
  { code: 'PRASHAST', name: 'PRASHAST', desc: 'Pre Assessment Holistic Screening Tool for special needs', color: '#6366F1', path: '/dashboard/prashast' },
];

export default function SchemesPage() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<Record<string, any>>({});

  useEffect(() => {
    schemes.forEach(s => {
      apiClient.get(`/schemes/${s.code}/kpis`).then(res => {
        setKpis(prev => ({ ...prev, [s.code]: res.data }));
      }).catch(() => {});
    });
  }, []);

  return (
    <Box sx={{ py: 5, px: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>National Education Schemes</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Explore data insights across 12 national education programs
      </Typography>

      <Grid container spacing={3}>
        {schemes.map(s => (
          <Grid item xs={12} sm={6} md={4} key={s.code}>
            <Paper sx={{
              p: 3, height: '100%', borderRadius: 3, border: '1px solid #E2E8F0',
              borderTop: `4px solid ${s.color}`, cursor: 'pointer',
              transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
            }} onClick={() => navigate(s.path)}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{s.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>{s.desc}</Typography>

              {kpis[s.code] && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {Object.entries(kpis[s.code]).slice(0, 3).map(([k, v]) => (
                    <Chip key={k} label={`${k.replace(/_/g, ' ')}: ${typeof v === 'number' ? Number(v).toLocaleString() : v}`}
                      size="small" sx={{ fontSize: 10 }} />
                  ))}
                </Box>
              )}

              <Button size="small" sx={{ color: s.color, fontWeight: 600 }}>
                Explore Dashboard →
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
