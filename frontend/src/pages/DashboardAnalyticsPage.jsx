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
  IconButton,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  BarChart as BarChartIcon,
  FilterList as FilterListIcon,
  SwapVert as SortIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Warning as AlertIcon,
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
  Legend
)

const SUBJECTS = ['All Subjects', 'Mathematics', 'Science', 'English', 'History', 'Geography']
const TIME_PERIODS = ['All Time', 'Last 7 Days', 'Last 30 Days', 'Last 3 Months']
const ASSESSMENT_TYPES = ['All', 'Quiz', 'Test', 'Assignment']

const DashboardAnalyticsPage = () => {
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

        // Merge with sample data if any required field is missing
        if (!data.competency_averages || !Array.isArray(data.competency_averages) || data.competency_averages.length === 0) {
          data.competency_averages = sampleData.competency_averages
        }
        if (!data.class_snapshots || !Array.isArray(data.class_snapshots) || data.class_snapshots.length === 0) {
          data.class_snapshots = sampleData.class_snapshots
        }
        if (!data.quiz_performance || typeof data.quiz_performance !== 'object') {
          data.quiz_performance = sampleData.quiz_performance
        }
        if (!data.students || !Array.isArray(data.students)) {
          data.students = sampleData.students
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
  }, [selectedSubject, selectedTimePeriod, assessmentType])

  // Get quiz performance data for selected subject and time period
  const getQuizData = () => {
    if (!overview?.quiz_performance) return []

    // Use selectedSubject if 'All Subjects', otherwise use selected subject
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

  // Filter data based on selected assessment type
  const getFilteredStudents = () => {
    if (!overview?.students) return []

    let filtered = overview.students

    // Filter by assessment performance if specific type is selected
    if (assessmentType !== 'All') {
      // This would need backend support for assessment type tracking
      // For now, we'll just return all students (backend should filter)
      filtered = overview.students
    }

    return filtered
  }

  // Get at-risk students count
  const getAtRiskStudents = () => {
    return (getFilteredStudents() || []).filter((s) => s.overall_score < 60)
  }

  // Get average performance for visible data
  const getAveragePerformance = () => {
    const quizData = getQuizData()
    if (!quizData || quizData.length === 0) return 0
    const sum = quizData.reduce((acc, q) => acc + (q.score ?? 0), 0)
    return (sum / quizData.length).toFixed(1)
  }

  // Get class average for selected period
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

  // Chart: Subject Performance Comparison
  const renderSubjectPerformance = () => {
    const competencies = overview?.competency_averages;

    if (!competencies || competencies.length === 0) {
      return <Typography color="text.secondary">No competency data available</Typography>
    }

    const entries = selectedSubject === 'All Subjects'
      ? competencies
      : competencies.filter(s => s.subject === selectedSubject)

    if (entries.length === 0) {
      return <Typography color="text.secondary">No data for selected subject</Typography>
    }

    // Sort by performance descending
    const sortedEntries = [...entries].sort((a, b) => (b.avg_level ?? 0) - (a.avg_level ?? 0))

    const data = {
      labels: sortedEntries.map(s => s.subject || 'Unknown'),
      datasets: [
        {
          label: 'Competency Level (%)',
          data: sortedEntries.map(s => {
            const level = s.avg_level || 0;
            return Math.round((typeof level === 'number' ? level : 0) * 100);
          }),
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 2,
          borderRadius: 4,
        }
      ]
    }

    return <Bar data={data} options={{
      responsive: true,
      maintainAspectRatio: true,
      indexAxis: 'y',
      scales: {
        x: {
          beginAtZero: true,
          max: 100
        }
      }
    }} />
  }

  // Chart: Quiz Performance Over Time
  const renderQuizPerformance = () => {
    const quizData = getQuizData();

    if (!quizData || quizData.length === 0) {
      return <Typography color="text.secondary">No assessment data available for {selectedSubject}</Typography>
    }

    const data = {
      labels: quizData.map(q => {
        const date = new Date(q.date)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }),
      datasets: [
        {
          label: 'Your Score',
          data: quizData.map(q => q.score ?? 0),
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointBackgroundColor: '#1976d2',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
        {
          label: 'Class Average',
          data: quizData.map(q => q.avg_class ?? 0),
          borderColor: '#d32f2f',
          backgroundColor: 'rgba(211, 47, 47, 0.05)',
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.4,
          fill: false,
          pointRadius: 4,
          pointBackgroundColor: '#d32f2f',
        }
      ]
    }

    return <Line data={data} options={{
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      }
    }} />
  }

  // Chart: Class Performance Distribution
  const renderClassDistribution = () => {
    const snapshots = overview?.class_snapshots;

    if (!snapshots || snapshots.length === 0) {
      return <Typography color="text.secondary">No class data available</Typography>
    }

    // Filter by time period
    let filtered = snapshots
    if (selectedTimePeriod !== 'All Time') {
      const now = new Date()
      let cutoff = new Date()
      if (selectedTimePeriod === 'Last 7 Days') cutoff.setDate(now.getDate() - 7)
      else if (selectedTimePeriod === 'Last 30 Days') cutoff.setDate(now.getDate() - 30)
      else if (selectedTimePeriod === 'Last 3 Months') cutoff.setMonth(now.getMonth() - 3)

      filtered = snapshots.filter(s => new Date(s.date) >= cutoff)
    }

    if (filtered.length === 0) {
      return <Typography color="text.secondary">No data for selected period</Typography>
    }

    const data = {
      labels: filtered.map(s => {
        const date = new Date(s.date)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }),
      datasets: [
        {
          label: 'Class Average Score (%)',
          data: filtered.map(s => s.avg_score ?? 0),
          borderColor: '#66bb6a',
          backgroundColor: 'rgba(102, 187, 106, 0.2)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointBackgroundColor: '#66bb6a',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        }
      ]
    }

    return <Line data={data} options={{
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }} />
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', pb: 4 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        {/* Left: Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{  }}>
              Analytics
            </Typography>
            {/* <Typography variant="body2" color="text.secondary">
              Performance & Insights
            </Typography> */}
          </Box>
        </Box>

        {/* Right: Control Buttons */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* Subject Button */}
          <Tooltip title="Select Subject">
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={(e) => setSubjectAnchorEl(e.currentTarget)}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                border: 1,
                borderColor: 'graycolor.two',
                color: selectedSubject !== 'All Subjects' ? 'primary.main' : 'inherit',
              }}
            >
              Subject
            </Button>
          </Tooltip>
          <Menu
            anchorEl={subjectAnchorEl}
            open={Boolean(subjectAnchorEl)}
            onClose={() => setSubjectAnchorEl(null)}
            PaperProps={{
              sx: {
                borderRadius: 2,
                border: 1,
                borderColor: 'graycolor.two',
              },
            }}
          >
            {SUBJECTS.map((subject) => (
              <MenuItem
                key={subject}
                onClick={() => {
                  setSelectedSubject(subject)
                  setSubjectAnchorEl(null)
                }}
                selected={selectedSubject === subject}
              >
                {subject}
              </MenuItem>
            ))}
          </Menu>

          {/* Time Period Button */}
          <Tooltip title="Select Time Period">
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={(e) => setTimePeriodAnchorEl(e.currentTarget)}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                border: 1,
                borderColor: 'graycolor.two',
                color: selectedTimePeriod !== 'All Time' ? 'primary.main' : 'inherit',
              }}
            >
              Period
            </Button>
          </Tooltip>
          <Menu
            anchorEl={timePeriodAnchorEl}
            open={Boolean(timePeriodAnchorEl)}
            onClose={() => setTimePeriodAnchorEl(null)}
            PaperProps={{
              sx: {
                borderRadius: 2,
                border: 1,
                borderColor: 'graycolor.two',
              },
            }}
          >
            {TIME_PERIODS.map((period) => (
              <MenuItem
                key={period}
                onClick={() => {
                  setSelectedTimePeriod(period)
                  setTimePeriodAnchorEl(null)
                }}
                selected={selectedTimePeriod === period}
              >
                {period}
              </MenuItem>
            ))}
          </Menu>

          {/* Assessment Type Button */}
          <Tooltip title="Select Assessment Type">
            <Button
              variant="outlined"
              startIcon={<AssessmentIcon />}
              onClick={(e) => setAssessmentAnchorEl(e.currentTarget)}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                border: 1,
                borderColor: 'graycolor.two',
                color: assessmentType !== 'All' ? 'primary.main' : 'inherit',
              }}
            >
              Type
            </Button>
          </Tooltip>
          <Menu
            anchorEl={assessmentAnchorEl}
            open={Boolean(assessmentAnchorEl)}
            onClose={() => setAssessmentAnchorEl(null)}
            PaperProps={{
              sx: {
                borderRadius: 2,
                border: 1,
                borderColor: 'graycolor.two',
              },
            }}
          >
            {ASSESSMENT_TYPES.map((type) => (
              <MenuItem
                key={type}
                onClick={() => {
                  setAssessmentType(type)
                  setAssessmentAnchorEl(null)
                }}
                selected={assessmentType === type}
              >
                {type}
              </MenuItem>
            ))}
          </Menu>

          {/* Refresh Button */}
          <Tooltip title="Refresh Data">
            <Button
              variant="contained"
              startIcon={<TrendingUpIcon />}
              onClick={() => {
                setLoading(true)
                setTimeout(() => setLoading(false), 500)
              }}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                background: uiConfigs.style.mainGradient.color,
              }}
            >
              Refresh
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Active Filters Display */}
      {(selectedSubject !== 'All Subjects' || selectedTimePeriod !== 'All Time' || assessmentType !== 'All') && (
        <Box sx={{ display: 'flex', gap: 1, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            Active Filters:
          </Typography>
          {selectedSubject !== 'All Subjects' && (
            <Chip
              label={selectedSubject}
              onDelete={() => setSelectedSubject('All Subjects')}
              size="small"
              variant="outlined"
            />
          )}
          {selectedTimePeriod !== 'All Time' && (
            <Chip
              label={selectedTimePeriod}
              onDelete={() => setSelectedTimePeriod('All Time')}
              size="small"
              variant="outlined"
            />
          )}
          {assessmentType !== 'All' && (
            <Chip
              label={`Type: ${assessmentType}`}
              onDelete={() => setAssessmentType('All')}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      )}

      {/* Loading State */}
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
          }}
        >
          <CircularProgress />
        </Box>
      ) : !overview ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            border: 1,
            borderColor: 'graycolor.two',
            borderRadius: 3,
          }}
        >
          <BarChartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No analytics data available
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} sm={6} size={3}>
            <Card
              sx={{
                p: 2,
                border: 1,
                borderColor: 'graycolor.two',
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Top Subject
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {selectedSubject !== 'All Subjects' ? selectedSubject : (overview?.competency_averages?.[0]?.subject || 'N/A')}
                  </Typography>
                  <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
                    {selectedSubject !== 'All Subjects'
                      ? overview?.competency_averages?.find(s => s.subject === selectedSubject)?.avg_level?.toFixed(1)
                      : overview?.competency_averages?.[0]?.avg_level?.toFixed(1)
                    }% avg
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ color: 'success.main', fontSize: 24 }} />
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} size={3}>
            <Card
              sx={{
                p: 2,
                border: 1,
                borderColor: 'graycolor.two',
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Your Performance
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {getAveragePerformance()}%
                  </Typography>
                  <Typography variant="caption" color="info.main" sx={{ mt: 0.5, display: 'block' }}>
                    on {selectedSubject === 'All Subjects' ? 'Latest' : selectedSubject}
                  </Typography>
                </Box>
                <AssessmentIcon sx={{ color: 'info.main', fontSize: 24 }} />
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} size={3}>
            <Card
              sx={{
                p: 2,
                border: 1,
                borderColor: 'graycolor.two',
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Class Average
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {getClassAverage()}%
                  </Typography>
                  <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
                    {selectedTimePeriod === 'All Time' ? 'All Time' : selectedTimePeriod}
                  </Typography>
                </Box>
                <BarChartIcon sx={{ color: 'warning.main', fontSize: 24 }} />
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} size={3}>
            <Card
              sx={{
                p: 2,
                border: 1,
                borderColor: 'graycolor.two',
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    At-Risk Students
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5, color: 'error.main' }}>
                    {getAtRiskStudents().length}
                  </Typography>
                  <Typography variant="caption" color="error.main" sx={{ mt: 0.5, display: 'block' }}>
                    of {getFilteredStudents().length} students
                  </Typography>
                </Box>
                <AlertIcon sx={{ color: 'error.main', fontSize: 24 }} />
              </Box>
            </Card>
          </Grid>

          {/* Charts - Second Row */}
          <Grid item xs={12} size={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: 1,
                borderColor: 'graycolor.two',
                borderRadius: 3,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Subject Performance
              </Typography>
              <Divider sx={{ mb: 3 }} />
              {overview ? renderSubjectPerformance() : <Typography>Loading...</Typography>}
            </Paper>
          </Grid>

          <Grid item xs={12} size={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: 1,
                borderColor: 'graycolor.two',
                borderRadius: 3,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {assessmentType === 'All' ? 'Assessment' : assessmentType} Performance
              </Typography>
              <Divider sx={{ mb: 3 }} />
              {overview ? renderQuizPerformance() : <Typography>Loading...</Typography>}
            </Paper>
          </Grid>

          <Grid item size={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: 1,
                borderColor: 'graycolor.two',
                borderRadius: 3,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Class Distribution
              </Typography>
              <Divider sx={{ mb: 3 }} />
              {overview ? renderClassDistribution() : <Typography>Loading...</Typography>}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}

export default DashboardAnalyticsPage
