import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Typography, TextField, MenuItem, Select, InputLabel, FormControl, GridLegacy as Grid, Paper, Alert
} from '@mui/material';
import { apiFetch } from "../../utils/api";

const ACTIONS = [
  'Interview Conducted',
  'Evidence Collected',
  'Analysis Performed',
  'External Agency Coordinated',
  'Other'
];

const TIPS = [
  'Document everything with precise timestamps',
  'Preserve digital evidence immediately',
  'Interview victims and witnesses separately',
  'Follow proper chain of custody procedures',
  'Coordinate with relevant external agencies',
  'Keep detailed records of all communications'
];

export default function AddLogEntry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [action, setAction] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [caseSummary, setCaseSummary] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    apiFetch(`/officer/case/${id}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setCaseSummary(data.case))
      .catch(() => setCaseSummary(null));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!action || !notes) {
      setError('Action and notes are required.');
      return;
    }
    
    const payload = { action, notes };
    console.log('Submitting log entry:', payload);
    
    try {
      const res = await apiFetch(`/officer/case/${id}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      console.log('Response:', data);
      
      if (res.ok) {
        setSuccess('Log entry saved!');
        setTimeout(() => navigate(`/case/${id}`), 1000);
      } else {
        setError(data.error || 'Failed to save log entry.');
      }
    } catch (error) {
      console.error('Error submitting log entry:', error);
      setError('Network error. Please try again.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Link to={`/case/${id}`} style={{ textDecoration: 'none', color: '#1976d2' }}>&lt; Back to Case</Link>
      <Typography variant="h5" fontWeight={600} mt={2} mb={2}>Add Investigation Log</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Action Taken *</InputLabel>
                  <Select
                    value={action}
                    label="Action Taken *"
                    onChange={e => setAction(e.target.value)}
                  >
                    {ACTIONS.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                  </Select>
                </FormControl>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                  Date will be automatically set to current date and time
                </Typography>
                <TextField
                  label="Investigation Notes *"
                  placeholder={`Provide detailed notes about the investigation action taken. Include:\n- What was done during this investigation step\n- Key findings or observations\n- Evidence collected or analyzed\n- Interviews conducted\n- Next steps planned\n- Any challenges encountered`}
                  multiline
                  minRows={5}
                  fullWidth
                  margin="normal"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  required
                />
                <Box sx={{ background: '#e3f0ff', p: 2, borderRadius: 2, mb: 2 }}>
                  <Typography fontWeight={600} mb={1}>Investigation Guidelines:</Typography>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>Be specific and detailed in your notes</li>
                    <li>Document all evidence collected and actions taken</li>
                    <li>Include timestamps and relevant parties involved</li>
                    <li>Maintain chain of custody for all evidence</li>
                    <li>Follow departmental investigation protocols</li>
                  </ul>
                </Box>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button type="submit" variant="contained" sx={{ flex: 1, background: 'linear-gradient(90deg, #3bb2f6, #0b63ce)' }}>
                    Save Log Entry
                  </Button>
                  <Button variant="outlined" color="inherit" onClick={() => navigate(`/case/${id}`)}>
                    Cancel
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography fontWeight={600} mb={1}>Case Summary</Typography>
            {caseSummary ? (
              <>
                <Typography>Case ID: <b>#{String(caseSummary.id).padStart(3, '0')}</b></Typography>
                <Typography>Crime Type: {caseSummary.crime_type}</Typography>
                <Typography>Victim: {caseSummary.victim_name}</Typography>
                <Typography>Status: <span style={{ color: '#f5a623', fontWeight: 600 }}>{caseSummary.status}</span></Typography>
                <Typography>Date Reported: {caseSummary.date_reported}</Typography>
              </>
            ) : (
              <Typography color="text.secondary">Loading...</Typography>
            )}
          </Paper>
          <Paper sx={{ p: 2, background: '#eafaf1' }}>
            <Typography fontWeight={600} mb={1}>Investigation Tips</Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {TIPS.map(tip => <li key={tip}>{tip}</li>)}
            </ul>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 