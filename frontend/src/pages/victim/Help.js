import React from "react";
import {
  Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails, GridLegacy as Grid, Card, CardContent, List, ListItem, ListItemIcon, ListItemText, Link
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import ChatIcon from '@mui/icons-material/Chat';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';

const faqs = [
  {
    q: "How do I report a cybercrime?",
    a: "Go to the 'Report a Crime' section, fill out the form with details and evidence, and submit."
  },
  {
    q: "What types of cybercrimes can I report?",
    a: "You can report various types of cybercrimes including phishing, identity theft, cyberbullying, online fraud, hacking, ransomware, social media harassment, credit card fraud, email scams, fake websites, and other cyber-related incidents."
  },
  {
    q: "How long does it take to get a response?",
    a: "Response times may vary, but you will typically receive an update within a few business days."
  },
  {
    q: "Can I track the status of my report?",
    a: "Yes, you can track your report status in the 'My Reports' section."
  },
  {
    q: "What information should I include in my report?",
    a: "Include as much detail as possible: dates, times, descriptions, evidence, and any communications related to the incident."
  },
  {
    q: "Can I update my report after submission?",
    a: "If you have additional information, contact support or add evidence through the case details page."
  },
  {
    q: "What should I do immediately after a cyber attack?",
    a: "Disconnect affected devices, change passwords, and report the incident as soon as possible."
  },
  {
    q: "Will I be contacted during the investigation?",
    a: "You may be contacted for more information or updates. Keep your contact details up to date."
  },
  {
    q: "What happens after my case is resolved?",
    a: "You will be notified of the outcome and provided with any relevant recommendations."
  }
];

const tips = [
  {
    icon: <ShieldOutlinedIcon color="success" sx={{ fontSize: 32 }} />,
    title: "Document Everything",
    desc: "Take screenshots, save emails, and record any evidence immediately. Don't delete anything that might be relevant to your case."
  },
  {
    icon: <InfoOutlinedIcon color="info" sx={{ fontSize: 32 }} />,
    title: "Act Quickly",
    desc: "Report cybercrimes as soon as possible. Quick reporting can help prevent further damage and improve investigation chances."
  },
  {
    icon: <CheckCircleOutlineIcon color="primary" sx={{ fontSize: 32 }} />,
    title: "Be Detailed",
    desc: "Provide comprehensive information in your report. Include dates, times, financial impact, and step-by-step description of what happened."
  },
  {
    icon: <AccessTimeIcon color="secondary" sx={{ fontSize: 32 }} />,
    title: "Stay in Contact",
    desc: "Respond promptly to any requests from investigators and keep your contact information up to date."
  }
];

const resources = [
  { label: "Cybersecurity Best Practices", url: "#" },
  { label: "How to Secure Your Accounts", url: "#" },
  { label: "Recognizing Phishing Attempts", url: "#" },
  { label: "Identity Theft Prevention", url: "#" },
  { label: "Safe Online Shopping Guide", url: "#" },
];

export default function Help() {
  return (
    <Box sx={{ background: '#f8fafc', minHeight: '100vh', p: { xs: 2, md: 6 } }}>
      <Box mb={2}>
        <Typography variant="h5" fontWeight={700}>Help & Support</Typography>
        <Typography color="text.secondary" mb={3}>Find answers to common questions and get support</Typography>
      </Box>
      <Grid container spacing={3}>
        {/* FAQ and Emergency/Support */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Frequently Asked Questions</Typography>
            {faqs.map((faq, idx) => (
              <Accordion key={idx} sx={{ mb: 1, boxShadow: 'none', borderRadius: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={600}>{faq.q}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">{faq.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3, background: '#fff5f5', border: '1px solid #fed7d7' }}>
            <Typography variant="h6" fontWeight={700} color="#b91c1c" mb={1}>Emergency Contact</Typography>
            <Box display="flex" alignItems="center" mb={1}>
              <PhoneIcon sx={{ color: '#b91c1c', mr: 1 }} />
              <Typography fontWeight={700} color="#b91c1c">Emergency Hotline</Typography>
            </Box>
            <Typography fontWeight={700} color="#b91c1c" mb={1}>1-800-CYBER-911</Typography>
            <Typography color="#b91c1c" fontSize={15}>
              Call immediately if you're experiencing an active cyber attack or if financial theft is in progress.
            </Typography>
          </Paper>
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={1}>General Support</Typography>
            <List>
              <ListItem disablePadding>
                <ListItemIcon><PhoneIcon color="primary" /></ListItemIcon>
                <ListItemText primary="1-800-CYBER-HELP" secondary="Mon-Fri, 9AM-5PM EST" />
              </ListItem>
              <ListItem disablePadding>
                <ListItemIcon><EmailIcon color="success" /></ListItemIcon>
                <ListItemText primary="support@cybercrime.gov" secondary="Response within 24 hours" />
              </ListItem>
              <ListItem disablePadding>
                <ListItemIcon><ChatIcon color="secondary" /></ListItemIcon>
                <ListItemText primary="Live Chat" secondary="Available on website" />
              </ListItem>
            </List>
          </Paper>
          <Paper sx={{ p: 3, borderRadius: 3, background: '#f0f7ff' }}>
            <Typography variant="h6" fontWeight={700} mb={1}>Helpful Resources</Typography>
            <List>
              {resources.map((r, idx) => (
                <ListItem key={idx} disablePadding>
                  <Link href={r.url} underline="hover" color="#2563eb">→ {r.label}</Link>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
      {/* Tips for Reporting */}
      <Box mt={6}>
        <Typography variant="h6" fontWeight={700} mb={2}>Tips for Reporting</Typography>
        <Grid container spacing={2}>
          {tips.map((tip, idx) => (
            <Grid item xs={12} md={3} key={idx}>
              <Card sx={{ borderRadius: 3, boxShadow: 0, background: '#fff' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>{tip.icon}</Box>
                  <Typography fontWeight={700} mb={0.5}>{tip.title}</Typography>
                  <Typography color="text.secondary" fontSize={15}>{tip.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
} 