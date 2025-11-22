import React, {useEffect, useState} from 'react'
import { Box, Grid, Paper, Typography } from '@mui/material'
import analyticsApi from '../api/modules/analytics.api'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
)

const DashboardAnalyticsPage = () => {
  const [overview, setOverview] = useState(null)

  useEffect(() => {
    const load = async () => {
      const { response, err } = await analyticsApi.getOverview()
      if (response) setOverview(response)
      // ignore error handling for now
    }
    load()
  }, [])

  const renderCompetencyChart = () => {
    const data = {
      labels: (overview?.competency_averages || []).map(s => s.subject),
      datasets: [
        {
          label: 'Average competency',
          data: (overview?.competency_averages || []).map(s => Math.round((s.avg_level || 0) * 100) / 100),
          backgroundColor: 'rgba(75,192,192,0.4)'
        }
      ]
    }
    return <Bar data={data} />
  }

  const renderSystemMetrics = () => {
    const metrics = overview?.system_metrics || {}
    const labels = Object.keys(metrics)
    const values = labels.map(k => metrics[k]?.value || 0)
    const data = {
      labels,
      datasets: [{ data: values, backgroundColor: ['#42a5f5', '#66bb6a', '#ffa726', '#ab47bc'] }]
    }
    return <Doughnut data={data} />
  }

  const renderClassSnapshots = () => {
    const snapshots = overview?.class_snapshots || []
    if (!snapshots.length) return <Typography>No class snapshots available</Typography>
    const labels = snapshots.map(s => s.date)
    const data = {
      labels,
      datasets: [
        {
          label: 'Avg score',
          data: snapshots.map(s => s.avg_score || 0),
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25,118,210,0.1)'
        }
      ]
    }
    return <Line data={data} />
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>Analytics Dashboard</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ padding: 2 }} elevation={2}>
            <Typography variant="h6" gutterBottom>Competency averages by subject</Typography>
            {overview ? renderCompetencyChart() : <Typography>Loading...</Typography>}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ padding: 2 }} elevation={2}>
            <Typography variant="h6" gutterBottom>System metrics (latest)</Typography>
            {overview ? renderSystemMetrics() : <Typography>Loading...</Typography>}
          </Paper>
        </Grid>

        <Grid item xs={12} md={12}>
          <Paper sx={{ padding: 2 }} elevation={2}>
            <Typography variant="h6" gutterBottom>Class averages over time</Typography>
            {overview ? renderClassSnapshots() : <Typography>Loading...</Typography>}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardAnalyticsPage
