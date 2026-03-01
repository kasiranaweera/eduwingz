import React, { useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Card,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material'
import {
  BarChart as BarChartIcon,
  FilterList as FilterListIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Warning as AlertIcon,
  AutoGraph as AutoGraphIcon,
  PeopleAlt as PeopleAltIcon,
  School as SchoolIcon
} from '@mui/icons-material'
import analyticsApi from '../api/modules/analytics.api'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip as ChartJSTooltip,
  Legend,
  Filler
} from 'chart.js'
import sampleData from '../assets/analyticsSampleData'
import uiConfigs from '../configs/ui.config'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartJSTooltip,
  Legend,
  Filler
)

const SUBJECTS = ['All Subjects', 'Mathematics', 'Science', 'English', 'History', 'Geography']
const TIME_PERIODS = ['All Time', 'Last 7 Days', 'Last 30 Days', 'Last 3 Months']
const ASSESSMENT_TYPES = ['All', 'Quiz', 'Test', 'Assignment']

const DashboardAnalyticsPage = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const [overview, setOverview] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState('All Subjects')
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('All Time')
  const [assessmentType, setAssessmentType] = useState('All')
  const [loading, setLoading] = useState(true)

  // Menu anchors
  const [subjectAnchorEl, setSubjectAnchorEl] = useState(null)
  const [timePeriodAnchorEl, setTimePeriodAnchorEl] = useState(null)
  const [assessmentAnchorEl, setAssessmentAnchorEl] = useState(null)

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  })

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const { response } = await analyticsApi.getOverview()
        let data = response || {}

        // Fallback to sample data only if essential sections are entirely missing
        if (!data.competency_averages || data.competency_averages.length === 0) {
          data.competency_averages = sampleData.competency_averages
        }
        if (!data.quiz_performance || Object.keys(data.quiz_performance).length === 0) {
          data.quiz_performance = sampleData.quiz_performance
        }
        if (!data.students || data.students.length === 0) {
          data.students = sampleData.students
        }
        if (!data.class_snapshots || data.class_snapshots.length === 0) {
          data.class_snapshots = sampleData.class_snapshots
        }

        console.log('Analytics data loaded:', data)
        setOverview(data)
      } catch (e) {
        console.error('Failed to load analytics:', e)
        setOverview(sampleData)
        setSnackbar({
          open: true,
          message: 'Using sample data - could not fetch live analytics',
          severity: 'warning',
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getQuizData = () => {
    if (!overview?.quiz_performance) return []
    let subject = selectedSubject === 'All Subjects' ? Object.keys(overview.quiz_performance)[0] : selectedSubject
    if (!subject) return []
    const data = overview.quiz_performance[subject] || []

    let filtered = data
    if (selectedTimePeriod !== 'All Time') {
      const now = new Date()
      let cutoff = new Date()
      if (selectedTimePeriod === 'Last 7 Days') cutoff.setDate(now.getDate() - 7)
      else if (selectedTimePeriod === 'Last 30 Days') cutoff.setDate(now.getDate() - 30)
      else if (selectedTimePeriod === 'Last 3 Months') cutoff.setMonth(now.getMonth() - 3)
      filtered = data.filter(d => new Date(d.date) >= cutoff)
    }
    return filtered.length > 0 ? filtered : data
  }

  const getFilteredStudents = () => {
    if (!overview?.students) return []
    return overview.students
  }

  const getAtRiskStudents = () => {
    return (getFilteredStudents() || []).filter((s) => s.overall_score < 60)
  }

  const getAveragePerformance = () => {
    const quizData = getQuizData()
    if (!quizData || quizData.length === 0) return 0
    const sum = quizData.reduce((acc, q) => acc + (q.score ?? 0), 0)
    return (sum / quizData.length).toFixed(1)
  }

  const getClassAverage = () => {
    const snapshots = overview?.class_snapshots || []
    if (!snapshots || snapshots.length === 0) return 0
    let filtered = snapshots
    if (selectedTimePeriod !== 'All Time') {
      const now = new Date()
      let cutoff = new Date()
      if (selectedTimePeriod === 'Last 7 Days') cutoff.setDate(now.getDate() - 7)
      else if (selectedTimePeriod === 'Last 30 Days') cutoff.setDate(now.getDate() - 30)
      else if (selectedTimePeriod === 'Last 3 Months') cutoff.setMonth(now.getMonth() - 3)
      filtered = snapshots.filter(s => new Date(s.date) >= cutoff)
    }
    if (filtered.length === 0) return 0
    const sum = filtered.reduce((acc, s) => acc + (s.avg_score ?? 0), 0)
    return (sum / filtered.length).toFixed(1)
  }

  const glassCardSx = {
    backgroundColor: isDark ? alpha(theme.palette.background.paper, 0.6) : alpha('#ffffff', 0.8),
    backdropFilter: 'blur(16px)',
    border: `1px solid ${isDark ? alpha(theme.palette.common.white, 0.08) : alpha(theme.palette.primary.main, 0.1)}`,
    boxShadow: isDark ? '0 8px 32px 0 rgba(0,0,0,0.3)' : '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
    borderRadius: 4,
    transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease',
    overflow: 'visible',
    position: 'relative',
    '&:hover': {
      transform: 'translateY(-6px)',
      boxShadow: isDark ? '0 12px 40px 0 rgba(0,0,0,0.45)' : '0 12px 40px 0 rgba(31, 38, 135, 0.15)',
    },
    p: 3
  }

  const renderSubjectPerformance = () => {
    const competencies = overview?.competency_averages;
    if (!competencies || competencies.length === 0) {
      return <Typography color="text.secondary">No competency data available</Typography>
    }
    const entries = selectedSubject === 'All Subjects' ? competencies : competencies.filter(s => s.subject === selectedSubject)
    if (entries.length === 0) return <Typography color="text.secondary">No data for selected subject</Typography>
    const sortedEntries = [...entries].sort((a, b) => (b.avg_level ?? 0) - (a.avg_level ?? 0))

    const data = {
      labels: sortedEntries.map(s => s.subject || 'Unknown'),
      datasets: [{
        label: 'Competency Level (%)',
        data: sortedEntries.map(s => Math.round((typeof s.avg_level === 'number' ? s.avg_level : 0))),
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 400, 0);
          gradient.addColorStop(0, alpha(theme.palette.primary.main, 0.8));
          gradient.addColorStop(1, alpha(theme.palette.secondary.main, 0.8));
          return gradient;
        },
        borderRadius: 8,
        barPercentage: 0.6,
      }]
    }

    return <Bar data={data} options={{
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        x: { beginAtZero: true, max: 100, grid: { color: alpha(theme.palette.text.primary, 0.05) } },
        y: { grid: { display: false } }
      },
      plugins: { legend: { display: false } }
    }} />
  }

  const renderQuizPerformance = () => {
    const quizData = getQuizData();
    if (!quizData || quizData.length === 0) return <Typography color="text.secondary">No assessment data available for {selectedSubject}</Typography>

    const data = {
      labels: quizData.map(q => new Date(q.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: 'Your Score',
          data: quizData.map(q => q.score ?? 0),
          borderColor: theme.palette.primary.main,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, alpha(theme.palette.primary.main, 0.4));
            gradient.addColorStop(1, alpha(theme.palette.primary.main, 0.0));
            return gradient;
          },
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: theme.palette.primary.main,
        },
        {
          label: 'Class Avg',
          data: quizData.map(q => q.avg_class ?? 0),
          borderColor: theme.palette.secondary.main,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.4,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 4,
        }
      ]
    }

    return <Line data={data} options={{
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, max: 100, grid: { color: alpha(theme.palette.text.primary, 0.05) } },
        x: { grid: { display: false } }
      },
      plugins: {
        legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } },
        tooltip: {
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          titleColor: theme.palette.text.primary,
          bodyColor: theme.palette.text.secondary,
          borderColor: alpha(theme.palette.divider, 0.2),
          borderWidth: 1,
          padding: 10,
          boxPadding: 4
        }
      }
    }} />
  }

  const renderClassDistribution = () => {
    const snapshots = overview?.class_snapshots;
    if (!snapshots || snapshots.length === 0) return <Typography color="text.secondary">No class data available</Typography>

    let filtered = snapshots
    if (selectedTimePeriod !== 'All Time') {
      const now = new Date()
      let cutoff = new Date()
      if (selectedTimePeriod === 'Last 7 Days') cutoff.setDate(now.getDate() - 7)
      else if (selectedTimePeriod === 'Last 30 Days') cutoff.setDate(now.getDate() - 30)
      else if (selectedTimePeriod === 'Last 3 Months') cutoff.setMonth(now.getMonth() - 3)
      filtered = snapshots.filter(s => new Date(s.date) >= cutoff)
    }
    if (filtered.length === 0) return <Typography color="text.secondary">No data for selected period</Typography>

    const data = {
      labels: filtered.map(s => new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        label: 'Overall Class Avg (%)',
        data: filtered.map(s => s.avg_score ?? 0),
        borderColor: theme.palette.success.main,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, alpha(theme.palette.success.main, 0.3));
          gradient.addColorStop(1, alpha(theme.palette.success.main, 0.0));
          return gradient;
        },
        borderWidth: 3,
        tension: 0.5,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 6,
        segment: {
          borderColor: ctx => ctx.p0.parsed.y > ctx.p1.parsed.y ? theme.palette.error.main : theme.palette.success.main
        }
      }]
    }

    return <Line data={data} options={{
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, max: 100, grid: { color: alpha(theme.palette.text.primary, 0.05) } },
        x: { grid: { display: false } }
      },
      plugins: { legend: { display: false } }
    }} />
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', pb: 8, px: { xs: 2, sm: 4 }, pt: 3, position: 'relative' }}>

      {/* Subtle Background Glows */}
      <Box sx={{
        position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw',
        background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 60%)`,
        zIndex: 0, pointerEvents: 'none'
      }} />
      <Box sx={{
        position: 'absolute', bottom: '10%', right: '-5%', width: '50vw', height: '50vw',
        background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 60%)`,
        zIndex: 0, pointerEvents: 'none'
      }} />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 5, gap: 2, flexWrap: 'wrap', flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, background: `-webkit-linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>
                Performance Insights
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
                Track your progress, identify trends, and stay ahead.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Filters */}
            <Tooltip title="Subject">
              <Button variant="outlined" startIcon={<SchoolIcon />} onClick={(e) => setSubjectAnchorEl(e.currentTarget)} sx={{ borderRadius: 6, textTransform: 'none', borderWidth: 2, '&:hover': { borderWidth: 2 }, color: selectedSubject !== 'All Subjects' ? 'primary.main' : 'inherit' }}>
                {selectedSubject !== 'All Subjects' ? selectedSubject : 'All Subjects'}
              </Button>
            </Tooltip>
            <Menu anchorEl={subjectAnchorEl} open={Boolean(subjectAnchorEl)} onClose={() => setSubjectAnchorEl(null)} PaperProps={{ sx: { borderRadius: 3, mt: 1, boxShadow: isDark ? '0 8px 32px 0 rgba(0,0,0,0.5)' : '0 8px 32px 0 rgba(31, 38, 135, 0.15)', backgroundImage: 'none' } }}>
              {SUBJECTS.map((subject) => (
                <MenuItem key={subject} onClick={() => { setSelectedSubject(subject); setSubjectAnchorEl(null) }} selected={selectedSubject === subject} sx={{ borderRadius: 2, mx: 1 }}>{subject}</MenuItem>
              ))}
            </Menu>

            <Tooltip title="Time Period">
              <Button variant="outlined" startIcon={<FilterListIcon />} onClick={(e) => setTimePeriodAnchorEl(e.currentTarget)} sx={{ borderRadius: 6, textTransform: 'none', borderWidth: 2, '&:hover': { borderWidth: 2 }, color: selectedTimePeriod !== 'All Time' ? 'primary.main' : 'inherit' }}>
                {selectedTimePeriod !== 'All Time' ? selectedTimePeriod : 'All Time'}
              </Button>
            </Tooltip>
            <Menu anchorEl={timePeriodAnchorEl} open={Boolean(timePeriodAnchorEl)} onClose={() => setTimePeriodAnchorEl(null)} PaperProps={{ sx: { borderRadius: 3, mt: 1, boxShadow: isDark ? '0 8px 32px 0 rgba(0,0,0,0.5)' : '0 8px 32px 0 rgba(31, 38, 135, 0.15)', backgroundImage: 'none' } }}>
              {TIME_PERIODS.map((period) => (
                <MenuItem key={period} onClick={() => { setSelectedTimePeriod(period); setTimePeriodAnchorEl(null) }} selected={selectedTimePeriod === period} sx={{ borderRadius: 2, mx: 1 }}>{period}</MenuItem>
              ))}
            </Menu>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress size={60} thickness={4} />
          </Box>
        ) : !overview ? (
          <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 4, ...glassCardSx }}>
            <AutoGraphIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" fontWeight="600">No analytics data found</Typography>
            <Typography variant="body1" color="text.secondary" mt={1}>Keep learning to generate performance insights!</Typography>
          </Paper>
        ) : (
          <Grid container spacing={4}>
            {/* Top Stat Cards */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={glassCardSx} elevation={0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={1}>Top Subject</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: 'text.primary' }}>
                      {selectedSubject !== 'All Subjects' ? selectedSubject : (overview?.competency_averages?.[0]?.subject || 'N/A')}
                    </Typography>
                    <Chip size="small" label={`${selectedSubject !== 'All Subjects' ? overview?.competency_averages?.find(s => s.subject === selectedSubject)?.avg_level?.toFixed(1) : overview?.competency_averages?.[0]?.avg_level?.toFixed(1)}% avg`} color="success" sx={{ mt: 2, fontWeight: 'bold', borderRadius: 2 }} />
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: '50%', background: alpha(theme.palette.success.main, 0.15) }}>
                    <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 28 }} />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ ...glassCardSx, border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`, background: isDark ? alpha(theme.palette.primary.dark, 0.1) : alpha(theme.palette.primary.light, 0.1) }} elevation={0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="overline" color="primary.main" fontWeight={600} letterSpacing={1}>Your Average</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: 'text.primary' }}>
                      {getAveragePerformance()}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2.5, display: 'block', fontWeight: 500 }}>
                      Based on recent assessments
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: '50%', background: alpha(theme.palette.primary.main, 0.15) }}>
                    <AssessmentIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={glassCardSx} elevation={0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={1}>Class Average</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: 'text.primary' }}>
                      {getClassAverage()}%
                    </Typography>
                    <Chip size="small" variant="outlined" label={selectedTimePeriod} color="secondary" sx={{ mt: 2, fontWeight: 'bold', borderRadius: 2 }} />
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: '50%', background: alpha(theme.palette.secondary.main, 0.15) }}>
                    <PeopleAltIcon sx={{ color: theme.palette.secondary.main, fontSize: 28 }} />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ ...glassCardSx, border: getAtRiskStudents().length > 0 ? `1px solid ${alpha(theme.palette.warning.main, 0.4)}` : glassCardSx.border }} elevation={0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={1}>At-Risk Students</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: getAtRiskStudents().length > 0 ? 'warning.main' : 'text.primary' }}>
                      {getAtRiskStudents().length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2.5, display: 'block', fontWeight: 500 }}>
                      of {getFilteredStudents().length} total profiles
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: '50%', background: getAtRiskStudents().length > 0 ? alpha(theme.palette.warning.main, 0.15) : alpha(theme.palette.text.secondary, 0.1) }}>
                    <AlertIcon sx={{ color: getAtRiskStudents().length > 0 ? theme.palette.warning.main : theme.palette.text.secondary, fontSize: 28 }} />
                  </Box>
                </Box>
              </Card>
            </Grid>

            {/* Charts Section */}
            <Grid item xs={12} lg={8}>
              <Paper sx={{ ...glassCardSx, height: '420px', display: 'flex', flexDirection: 'column' }} elevation={0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="700">Evolution Tracker</Typography>
                  <Chip size="small" label={selectedSubject} color="primary" variant="outlined" />
                </Box>
                <Box sx={{ flexGrow: 1, position: 'relative' }}>
                  {overview ? renderQuizPerformance() : <CircularProgress />}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Paper sx={{ ...glassCardSx, height: '420px', display: 'flex', flexDirection: 'column' }} elevation={0}>
                <Typography variant="h6" fontWeight="700" mb={3}>Subject Mastery</Typography>
                <Box sx={{ flexGrow: 1, position: 'relative' }}>
                  {overview ? renderSubjectPerformance() : <CircularProgress />}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ ...glassCardSx, height: '380px', display: 'flex', flexDirection: 'column' }} elevation={0}>
                <Typography variant="h6" fontWeight="700" mb={3}>Class Overall Trajectory</Typography>
                <Box sx={{ flexGrow: 1, position: 'relative' }}>
                  {overview ? renderClassDistribution() : <CircularProgress />}
                </Box>
              </Paper>
            </Grid>

          </Grid>
        )}
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}

export default DashboardAnalyticsPage
