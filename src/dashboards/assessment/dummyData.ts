// ─── ASSESSMENT DASHBOARD DUMMY DATA ─────────────────────────────────────────

// ─── Page 1: Executive Overview ──────────────────────────────────────────────
export const overviewKpis = [
  { title: 'TOTAL ASSESSMENTS', value: '2,847', subtitle: '+12.3% YoY', color: '#1E3A8A' },
  { title: 'STUDENTS ASSESSED', value: '24.8M', subtitle: '+4.5% YoY', color: '#1E3A8A' },
  { title: 'SCHOOLS COVERED', value: '148,903', subtitle: '98.4% Onboarded', color: '#10B981' },
  { title: 'AVG PERFORMANCE SCORE', value: '67.4%', subtitle: '-0.8% MoM', color: '#F59E0B' },
  { title: 'PARTICIPATION RATE', value: '92.4%', subtitle: '+1.2% MoM', color: '#10B981' },
  { title: 'LEARNING OUTCOME INDEX', value: '0.73', subtitle: '+0.05 vs target', color: '#7C3AED' },
];

export const assessmentTrendData = {
  years: ['2019', '2020', '2021', '2022', '2023', '2024'],
  elementary: [58, 55, 60, 63, 65, 67],
  secondary: [62, 60, 64, 66, 68, 70],
};

export const assessmentTypeDistribution = [
  { name: 'Formative', value: 45 },
  { name: 'Summative', value: 30 },
  { name: 'Diagnostic', value: 15 },
  { name: 'Baseline', value: 10 },
];

export const topStatesByPerformance = [
  { state: 'Kerala', score: 84.2 },
  { state: 'Tamil Nadu', score: 81.5 },
  { state: 'Himachal Pradesh', score: 79.0 },
  { state: 'Maharashtra', score: 78.2 },
  { state: 'Karnataka', score: 76.5 },
  { state: 'Gujarat', score: 75.0 },
  { state: 'Rajasthan', score: 73.8 },
  { state: 'Madhya Pradesh', score: 72.1 },
  { state: 'West Bengal', score: 70.5 },
  { state: 'Punjab', score: 69.2 },
];

export const classPerformanceMatrix = [
  { class: 'Class 3', language: 78, math: 65, science: null, social: null },
  { class: 'Class 5', language: 74, math: 60, science: 68, social: 70 },
  { class: 'Class 8', language: 70, math: 55, science: 62, social: 65 },
  { class: 'Class 10', language: 68, math: 52, science: 58, social: 62 },
];

export const diagnosticInsights = [
  { type: 'critical', title: 'Math Proficiency Gap Widening', description: 'Class 8 math scores declined 3.2pp in bottom quintile districts. 127 districts need immediate intervention with remedial math programs.', borderColor: '#EF4444' },
  { type: 'info', title: 'Language Learning Improvement', description: 'Foundation literacy programs showing +4.2pp improvement in Class 3 language scores across 18 states. NIPUN Bharat alignment effective.', borderColor: '#1E3A8A' },
  { type: 'success', title: 'Participation Rate at Historic High', description: '92.4% national participation rate — highest since 2019. Digital assessment adoption driving 12% increase in remote/rural areas.', borderColor: '#10B981' },
];

// ─── Page 2: Student Demographics ───────────────────────────────────────────
export const demographicKpis = [
  { title: 'TOTAL STUDENTS', value: '24.8 Million', subtitle: '92.4% Verified', color: '#1E3A8A' },
  { title: 'MALE ENROLLMENT', value: '52.3%', subtitle: '12.9M Active', color: '#1E3A8A' },
  { title: 'FEMALE ENROLLMENT', value: '47.2%', subtitle: '11.7M Active', color: '#7C3AED' },
  { title: 'OTHER ENROLLMENT', value: '0.5%', subtitle: '124K Active', color: '#F59E0B' },
  { title: 'SC/ST COVERAGE', value: '34.2%', subtitle: 'Targeted Grant Cap', color: '#10B981' },
  { title: 'BELOW POVERTY LINE (BPL)', value: '28.7%', subtitle: 'Free Materials Active', color: '#EF4444' },
];

export const genderPerformanceByClass = [
  { class: 'Class 3', male: 72, female: 74 },
  { class: 'Class 5', male: 68, female: 70 },
  { class: 'Class 8', male: 63, female: 65 },
  { class: 'Class 10', male: 60, female: 58 },
];

export const socialCategoryPerformance = [
  { category: 'General', score: 74.5 },
  { category: 'OBC', score: 69.1 },
  { category: 'SC', score: 63.8 },
  { category: 'ST', score: 60.4 },
];

export const bottomDistricts = [
  { district: 'Malkangiri', state: 'Odisha', enrollment: '45,230', participation: '52.3%' },
  { district: 'Dantewada', state: 'Chhattisgarh', enrollment: '38,120', participation: '54.1%' },
  { district: 'Kupwara', state: 'J&K', enrollment: '62,450', participation: '56.8%' },
  { district: 'Nandurbar', state: 'Maharashtra', enrollment: '51,890', participation: '58.2%' },
  { district: 'Jaisalmer', state: 'Rajasthan', enrollment: '34,560', participation: '59.4%' },
  { district: 'Shrawasti', state: 'Uttar Pradesh', enrollment: '72,100', participation: '60.1%' },
  { district: 'Gadchiroli', state: 'Maharashtra', enrollment: '28,900', participation: '61.5%' },
  { district: 'Bijapur', state: 'Chhattisgarh', enrollment: '31,200', participation: '62.0%' },
  { district: 'Kinnaur', state: 'Himachal Pradesh', enrollment: '12,800', participation: '62.8%' },
  { district: 'Champhai', state: 'Mizoram', enrollment: '18,400', participation: '63.2%' },
  { district: 'Tamenglong', state: 'Manipur', enrollment: '15,600', participation: '63.9%' },
  { district: 'Tirap', state: 'Arunachal Pradesh', enrollment: '22,100', participation: '64.1%' },
  { district: 'Kalahandi', state: 'Odisha', enrollment: '89,200', participation: '64.5%' },
  { district: 'Sirohi', state: 'Rajasthan', enrollment: '41,300', participation: '65.0%' },
  { district: 'Korba', state: 'Chhattisgarh', enrollment: '56,700', participation: '65.3%' },
  { district: 'Bastar', state: 'Chhattisgarh', enrollment: '67,800', participation: '65.8%' },
  { district: 'Latehar', state: 'Jharkhand', enrollment: '43,500', participation: '66.1%' },
  { district: 'Gumla', state: 'Jharkhand', enrollment: '52,300', participation: '66.4%' },
  { district: 'Pakur', state: 'Jharkhand', enrollment: '38,900', participation: '66.7%' },
  { district: 'Nuapada', state: 'Odisha', enrollment: '29,400', participation: '67.0%' },
];

// ─── Page 3: Subject & Curriculum ────────────────────────────────────────────
export const subjectKpis = [
  { title: 'SUBJECTS ASSESSED', value: '8', subtitle: 'Disciplines', color: '#1E3A8A' },
  { title: 'AVG MATH SCORE', value: '58.2%', subtitle: 'Below Target', color: '#EF4444' },
  { title: 'AVG LANGUAGE SCORE', value: '71.4%', subtitle: 'On Track', color: '#10B981' },
  { title: 'SCIENCE SCORE', value: '63.8%', subtitle: 'Improving', color: '#F59E0B' },
  { title: 'SOCIAL STUDIES', value: '69.1%', subtitle: 'Stable', color: '#1E3A8A' },
  { title: 'ENVIRONMENTAL STUDIES', value: '74.2%', subtitle: 'Above Target', color: '#10B981' },
];

export const subjectCompetencyProfile = [
  { subject: 'Language', actual: 71, target: 80 },
  { subject: 'Mathematics', actual: 58, target: 75 },
  { subject: 'Science', actual: 64, target: 70 },
  { subject: 'Social Studies', actual: 69, target: 70 },
  { subject: 'EVS', actual: 74, target: 70 },
];

export const subjectByClassGroup = {
  categories: ['Primary (1-5)', 'Middle (6-8)', 'Secondary (9-10)', 'Sr. Secondary (11-12)'],
  language: [78, 72, 68, 65],
  math: [68, 58, 52, 48],
  science: [72, 64, 60, 56],
  social: [74, 69, 65, 62],
};

export const detailedSubjectBreakdown = [
  { subject: 'Hindi', class: 'Class 5', students: '3.2M', avgScore: '74.2%', passPercent: '88%', improvement: 'Comprehension' },
  { subject: 'English', class: 'Class 5', students: '3.2M', avgScore: '68.5%', passPercent: '82%', improvement: 'Grammar & Writing' },
  { subject: 'Mathematics', class: 'Class 8', students: '2.8M', avgScore: '55.1%', passPercent: '71%', improvement: 'Algebra & Geometry' },
  { subject: 'Science', class: 'Class 8', students: '2.8M', avgScore: '62.4%', passPercent: '78%', improvement: 'Practical Application' },
  { subject: 'Social Studies', class: 'Class 10', students: '2.1M', avgScore: '65.8%', passPercent: '80%', improvement: 'Map Work' },
  { subject: 'Mathematics', class: 'Class 10', students: '2.1M', avgScore: '51.2%', passPercent: '68%', improvement: 'Trigonometry' },
  { subject: 'EVS', class: 'Class 3', students: '3.5M', avgScore: '76.8%', passPercent: '91%', improvement: 'Local Context' },
  { subject: 'Hindi', class: 'Class 3', students: '3.5M', avgScore: '78.1%', passPercent: '92%', improvement: 'Reading Fluency' },
];

// ─── Page 4: Trends & Progression ───────────────────────────────────────────
export const trendsKpis = [
  { title: 'ASSESSMENTS THIS YEAR', value: '847', subtitle: 'Conducted', color: '#1E3A8A' },
  { title: 'YOY ENROLLMENT GROWTH', value: '+4.5%', subtitle: 'vs 2023-24', color: '#10B981' },
  { title: 'AVG SCORE IMPROVEMENT', value: '+3.2 pp', subtitle: 'National Avg', color: '#10B981' },
  { title: 'CONSISTENT PERFORMERS', value: '68%', subtitle: 'Schools Above Avg', color: '#7C3AED' },
  { title: 'DECLINING SCHOOLS', value: '2,341', subtitle: 'Need Attention', color: '#EF4444' },
  { title: 'NEW ASSESSMENTS ADDED', value: '23', subtitle: 'This Quarter', color: '#F59E0B' },
];

export const performanceTrend = {
  years: ['2019', '2020', '2021', '2022', '2023', '2024'],
  topQuartile: [78, 76, 79, 81, 83, 85],
  nationalAverage: [64, 62, 65, 66, 67, 69],
  bottomQuartile: [48, 45, 49, 50, 52, 53],
};

export const participationGrowth = {
  years: ['2019', '2020', '2021', '2022', '2023', '2024'],
  values: [72, 68, 75, 82, 88, 92],
};

export const yoyScoreChangeByState = [
  { state: 'Bihar', change: 8.3 },
  { state: 'Uttar Pradesh', change: 5.1 },
  { state: 'Rajasthan', change: 4.2 },
  { state: 'Madhya Pradesh', change: 3.8 },
  { state: 'Odisha', change: 3.5 },
  { state: 'Jharkhand', change: 3.2 },
  { state: 'Chhattisgarh', change: 2.9 },
  { state: 'West Bengal', change: 2.5 },
  { state: 'Assam', change: 2.1 },
  { state: 'Gujarat', change: 1.8 },
];

export const subjectWiseTrends = [
  { subject: 'Language', change: '+4.2%', color: '#10B981' },
  { subject: 'Math', change: '-1.5%', color: '#EF4444' },
  { subject: 'Science', change: '+2.8%', color: '#10B981' },
  { subject: 'Social Studies', change: '+1.9%', color: '#10B981' },
  { subject: 'EVS', change: '+3.1%', color: '#10B981' },
  { subject: 'English', change: '+2.4%', color: '#10B981' },
  { subject: 'Hindi', change: '+1.1%', color: '#10B981' },
  { subject: 'Computer Science', change: '-0.3%', color: '#EF4444' },
];

export const assessmentCalendar = [
  { framework: 'NIPUN Bharat (FLN)', classes: 'Class 1-3', targetDate: 'Oct 2025', schools: '1,20,000', status: 'Completed' },
  { framework: 'NAS Cycle-6', classes: 'Class 3,5,8,10', targetDate: 'Nov 2025', schools: '1,48,000', status: 'In Progress' },
  { framework: 'PARAKH Baseline', classes: 'Class 6-8', targetDate: 'Jan 2026', schools: '98,000', status: 'Scheduled' },
  { framework: 'SAFAL (CBSE)', classes: 'Class 3,5,8', targetDate: 'Feb 2026', schools: '22,500', status: 'Planned' },
  { framework: 'State SA-II', classes: 'Class 1-12', targetDate: 'Mar 2026', schools: '1,42,000', status: 'Planned' },
];

// ─── Page 5: Rankings ────────────────────────────────────────────────────────
export const rankingsKpis = [
  { title: 'STATES COVERED', value: '36', subtitle: 'States/UTs', color: '#1E3A8A' },
  { title: 'BEST PERFORMING STATE', value: 'Kerala', subtitle: '82.1%', color: '#10B981' },
  { title: 'MOST IMPROVED STATE', value: 'Bihar', subtitle: '+8.3pp', color: '#7C3AED' },
  { title: 'LOWEST PERFORMING', value: 'Jharkhand', subtitle: '48.2%', color: '#EF4444' },
  { title: 'DISTRICTS BELOW THRESHOLD', value: '127', subtitle: '<50% Score', color: '#F59E0B' },
  { title: 'BLOCKS NEEDING INTERVENTION', value: '892', subtitle: 'Priority List', color: '#EF4444' },
];

export const stateRankings = [
  { rank: 1, state: 'Kerala', score: 82.1, color: '#10B981' },
  { rank: 2, state: 'Tamil Nadu', score: 79.4, color: '#10B981' },
  { rank: 3, state: 'Himachal Pradesh', score: 78.2, color: '#10B981' },
  { rank: 4, state: 'Maharashtra', score: 76.8, color: '#1E3A8A' },
  { rank: 5, state: 'Karnataka', score: 75.5, color: '#1E3A8A' },
  { rank: 6, state: 'Gujarat', score: 74.2, color: '#1E3A8A' },
  { rank: 7, state: 'Rajasthan', score: 71.8, color: '#F59E0B' },
  { rank: 8, state: 'Madhya Pradesh', score: 68.5, color: '#F59E0B' },
  { rank: 9, state: 'Uttar Pradesh', score: 65.2, color: '#F59E0B' },
  { rank: 10, state: 'Bihar', score: 62.8, color: '#EF4444' },
];

export const districtDrillDown = [
  { district: 'Ernakulam', state: 'Kerala', enrollment: '2,34,500', performance: '88.2%', trend: 'up' },
  { district: 'Coimbatore', state: 'Tamil Nadu', enrollment: '3,12,800', performance: '85.1%', trend: 'up' },
  { district: 'Pune', state: 'Maharashtra', enrollment: '4,56,200', performance: '82.4%', trend: 'stable' },
  { district: 'Bangalore Urban', state: 'Karnataka', enrollment: '5,21,000', performance: '80.8%', trend: 'up' },
  { district: 'Ahmedabad', state: 'Gujarat', enrollment: '3,89,600', performance: '78.5%', trend: 'stable' },
  { district: 'Jaipur', state: 'Rajasthan', enrollment: '4,12,300', performance: '72.1%', trend: 'up' },
  { district: 'Lucknow', state: 'Uttar Pradesh', enrollment: '5,67,800', performance: '68.4%', trend: 'down' },
  { district: 'Patna', state: 'Bihar', enrollment: '4,89,100', performance: '64.2%', trend: 'up' },
];

export const scatterData = [
  { name: 'Kerala', x: 96, y: 82 },
  { name: 'Tamil Nadu', x: 94, y: 79 },
  { name: 'Maharashtra', x: 92, y: 77 },
  { name: 'Karnataka', x: 90, y: 76 },
  { name: 'Gujarat', x: 88, y: 74 },
  { name: 'Rajasthan', x: 85, y: 72 },
  { name: 'MP', x: 82, y: 69 },
  { name: 'UP', x: 78, y: 65 },
  { name: 'Bihar', x: 75, y: 63 },
  { name: 'Jharkhand', x: 68, y: 48 },
  { name: 'Odisha', x: 72, y: 60 },
  { name: 'Chhattisgarh', x: 70, y: 55 },
];

export const priorityInterventionZones = [
  { district: 'Malkangiri', state: 'Odisha', score: '42.1%', issue: 'Lowest participation + performance combination. 68% teacher vacancies.', severity: 'critical', color: '#EF4444' },
  { district: 'Dantewada', state: 'Chhattisgarh', score: '44.8%', issue: 'Conflict-affected area. Assessment completion only 38%. Infrastructure gaps.', severity: 'critical', color: '#F59E0B' },
  { district: 'Kupwara', state: 'J&K', score: '47.2%', issue: 'Seasonal disruptions reducing effective assessment days. Digital infra needed.', severity: 'warning', color: '#F59E0B' },
];

// ─── Page 6: Data Quality ────────────────────────────────────────────────────
export const qualityKpis = [
  { title: 'DATA COMPLETENESS', value: '94.7%', subtitle: 'Target: 98%', color: '#10B981' },
  { title: 'SCHOOLS REPORTING', value: '142K/148K', subtitle: '95.9% Active', color: '#1E3A8A' },
  { title: 'DUPLICATE RECORDS', value: '0.3%', subtitle: 'Below Threshold', color: '#10B981' },
  { title: 'DATA FRESHNESS INDEX', value: '2.1 days', subtitle: 'Avg Lag', color: '#F59E0B' },
  { title: 'ANOMALIES DETECTED', value: '47', subtitle: 'This Month', color: '#EF4444' },
  { title: 'SYSTEM QUALITY SCORE', value: 'A+', subtitle: 'DQAF Rating', color: '#10B981' },
];

export const integrityMetrics = [
  { label: 'Completeness', value: 94.7, color: '#10B981' },
  { label: 'Accuracy', value: 99.1, color: '#1E3A8A' },
  { label: 'Timeliness', value: 88.4, color: '#F59E0B' },
];

export const reportingCompliance = [
  { state: 'Kerala', value: 99.8 },
  { state: 'Tamil Nadu', value: 98.2 },
  { state: 'Maharashtra', value: 95.5 },
  { state: 'Karnataka', value: 94.1 },
  { state: 'Gujarat', value: 92.8 },
  { state: 'Rajasthan', value: 89.5 },
  { state: 'UP', value: 86.2 },
  { state: 'Bihar', value: 82.4 },
];

export const anomalyLog = [
  { id: 'ANM-001', location: 'Bihar / Patna', description: 'Duplicate student records across 3 schools', severity: 'High' },
  { id: 'ANM-002', location: 'UP / Lucknow', description: 'Score distribution anomaly — uniform 85% across 47 schools', severity: 'Critical' },
  { id: 'ANM-003', location: 'Maharashtra / Nashik', description: 'Missing attendance data for assessment day', severity: 'Medium' },
  { id: 'ANM-004', location: 'Rajasthan / Jaisalmer', description: 'Assessment completion in 4 minutes (avg 45 min)', severity: 'High' },
  { id: 'ANM-005', location: 'MP / Bhopal', description: 'Timestamp inconsistency — future dates logged', severity: 'Low' },
  { id: 'ANM-006', location: 'Gujarat / Surat', description: 'Bulk submission from single IP address', severity: 'Medium' },
];

export const pipelineHealth = [
  { service: 'Central Gateway API', latency: '24ms', status: 'healthy' },
  { service: 'APAAR Sync Service', latency: '1.2s', status: 'healthy' },
  { service: 'State Data Ingestion', latency: '340ms', status: 'healthy' },
  { service: 'UDISE+ Bridge', latency: '890ms', status: 'warning' },
  { service: 'Analytics Engine', latency: '156ms', status: 'healthy' },
  { service: 'Report Generator', latency: '2.4s', status: 'warning' },
  { service: 'Anomaly Detection ML', latency: '45ms', status: 'healthy' },
  { service: 'Backup & Archive', latency: '—', status: 'healthy' },
];

export const qualityDiagnostics = [
  { type: 'CRITICAL', title: 'Score Manipulation Detected', description: 'Uniform 85% scores across 47 schools in UP suggest data fabrication. Immediate audit recommended.', color: '#EF4444' },
  { type: 'WARNING', title: 'UDISE+ Sync Delay', description: 'State data ingestion from 4 states showing >48hr delay. May affect weekly reports.', color: '#F59E0B' },
  { type: 'INFO', title: 'New Validation Rules Deployed', description: 'v2.4 validation pipeline active — catches 23% more anomalies. False positive rate reduced to 0.8%.', color: '#1E3A8A' },
  { type: 'NORMAL', title: 'Backup Verification Complete', description: 'All assessment data backed up successfully. Recovery point objective (RPO): 15 minutes.', color: '#10B981' },
];
