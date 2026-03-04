import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Box, Typography, Card, CardContent, Chip, Avatar, Button, Tabs, Tab,
  TextField, InputAdornment, Divider, Badge,
} from '@mui/material';
import {
  Search as SearchIcon, LocationOn, CalendarToday, WorkOutline,
  CheckCircleOutline, PlayArrow, Storefront,
} from '@mui/icons-material';
import { StatusBadge } from '../components/StatusBadge';
import type { TicketStatus } from '../types';

const NEXT_STATUS: Partial<Record<TicketStatus, TicketStatus>> = {
  assigned: 'in-progress',
  'in-progress': 'completed',
};

const NEXT_LABEL: Partial<Record<TicketStatus, string>> = {
  assigned: 'Start Work',
  'in-progress': 'Mark Complete',
};

export default function TechDashboard() {
  const { currentUser, tickets, users, claimTicket, updateTicketStatus } = useApp();
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');

  const openWorkOrders = useMemo(() =>
    tickets.filter(t => t.status === 'open'),
    [tickets]
  );

  const myJobs = useMemo(() =>
    tickets.filter(t => t.assignedTo === currentUser?.id),
    [tickets, currentUser]
  );

  const activeJobs = myJobs.filter(t => t.status !== 'completed');
  const completedJobs = myJobs.filter(t => t.status === 'completed');

  const filteredWorkOrders = useMemo(() => {
    if (!search.trim()) return openWorkOrders;
    const q = search.toLowerCase();
    return openWorkOrders.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.location.toLowerCase().includes(q)
    );
  }, [openWorkOrders, search]);

  const categoryColor: Record<string, string> = {
    'Server Setup': '#3b82f6',
    'Network Config': '#8b5cf6',
    'Hardware Install': '#f59e0b',
    'Software Install': '#10b981',
    'Maintenance': '#ef4444',
    'Other': '#64748b',
  };

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 52px)', bgcolor: '#0f172a' }}>
      {/* Left sidebar summary */}
      <Box sx={{ width: 240, flexShrink: 0, borderRight: '1px solid #1e293b', p: 2.5, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Avatar sx={{ bgcolor: '#3b82f6', width: 44, height: 44, fontSize: '1.1rem' }}>
            {currentUser?.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#f1f5f9' }}>{currentUser?.name}</Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>Field Technician</Typography>
          </Box>
        </Box>
        <Divider sx={{ borderColor: '#1e293b' }} />
        {[
          { label: 'Available Jobs', value: openWorkOrders.length, color: '#fbbf24', icon: <Storefront sx={{ fontSize: 18 }} /> },
          { label: 'Active Jobs', value: activeJobs.length, color: '#60a5fa', icon: <PlayArrow sx={{ fontSize: 18 }} /> },
          { label: 'Completed', value: completedJobs.length, color: '#34d399', icon: <CheckCircleOutline sx={{ fontSize: 18 }} /> },
        ].map(s => (
          <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: '#1e293b' }}>
            <Avatar sx={{ bgcolor: `${s.color}22`, color: s.color, width: 36, height: 36 }}>{s.icon}</Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>{s.label}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#f1f5f9' }}>Work Order Marketplace</Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.25 }}>Browse available jobs and manage your active work</Typography>
        </Box>

        <Tabs
          value={tab} onChange={(_, v) => setTab(v)}
          sx={{ mb: 3, '& .MuiTab-root': { color: '#64748b', textTransform: 'none', fontWeight: 500 }, '& .Mui-selected': { color: '#f1f5f9' }, '& .MuiTabs-indicator': { bgcolor: '#3b82f6' } }}
        >
          <Tab label={
            <Badge badgeContent={openWorkOrders.length} color="warning" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem' } }}>
              <Box sx={{ pr: 1.5 }}>Available Jobs</Box>
            </Badge>
          } />
          <Tab label={
            <Badge badgeContent={activeJobs.length} color="info" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem' } }}>
              <Box sx={{ pr: 1.5 }}>My Active Jobs</Box>
            </Badge>
          } />
          <Tab label="Completed" />
        </Tabs>

        {/* Available Jobs */}
        {tab === 0 && (
          <>
            <TextField
              fullWidth size="small" placeholder="Search by title, category, or location..."
              value={search} onChange={e => setSearch(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#64748b' }} /></InputAdornment> } }}
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { bgcolor: '#1e293b', color: '#f1f5f9', borderRadius: 2, '& fieldset': { borderColor: '#334155' }, '&:hover fieldset': { borderColor: '#475569' } } }}
            />
            {filteredWorkOrders.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8, color: '#64748b' }}>
                <Typography variant="h2">📭</Typography>
                <Typography variant="h6" sx={{ color: '#94a3b8', mt: 1 }}>No available work orders</Typography>
                <Typography variant="body2">Check back later for new jobs</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
                {filteredWorkOrders.map(t => {
                  const poster = users.find(u => u.id === t.submittedBy);
                  return (
                    <Card key={t.id} sx={{ bgcolor: '#1e293b', borderRadius: 3, border: '1px solid #334155', transition: 'border-color 0.2s', '&:hover': { borderColor: '#3b82f6' } }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Chip
                            label={t.category} size="small"
                            sx={{ bgcolor: `${categoryColor[t.category] ?? '#64748b'}22`, color: categoryColor[t.category] ?? '#94a3b8', fontWeight: 600, fontSize: '0.75rem' }}
                          />
                          <Chip label="Open" size="small" sx={{ bgcolor: '#fbbf2422', color: '#fbbf24', fontWeight: 600, fontSize: '0.75rem' }} />
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#f1f5f9', mb: 0.5 }}>{t.title}</Typography>
                        <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2, lineHeight: 1.6 }}>{t.description}</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <LocationOn sx={{ fontSize: 15, color: '#64748b' }} />
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>{t.location}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <CalendarToday sx={{ fontSize: 15, color: '#64748b' }} />
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>Posted {new Date(t.createdAt).toLocaleDateString()}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <WorkOutline sx={{ fontSize: 15, color: '#64748b' }} />
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>Posted by {poster?.name ?? 'Unknown'}</Typography>
                          </Box>
                        </Box>
                        <Button
                          fullWidth variant="contained" size="small"
                          onClick={() => claimTicket(t.id)}
                          sx={{ bgcolor: '#3b82f6', borderRadius: 2, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#2563eb' } }}
                        >
                          Claim Work Order
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            )}
          </>
        )}

        {/* Active Jobs */}
        {tab === 1 && (
          activeJobs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: '#64748b' }}>
              <Typography variant="h2">🔧</Typography>
              <Typography variant="h6" sx={{ color: '#94a3b8', mt: 1 }}>No active jobs</Typography>
              <Typography variant="body2">Claim a work order from the marketplace</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {activeJobs.map(t => {
                const poster = users.find(u => u.id === t.submittedBy);
                const next = NEXT_STATUS[t.status];
                return (
                  <Card key={t.id} sx={{ bgcolor: '#1e293b', borderRadius: 3, border: '1px solid #334155' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#f1f5f9' }}>{t.title}</Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>{t.category}</Typography>
                        </Box>
                        <StatusBadge status={t.status} />
                      </Box>
                      <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>{t.description}</Typography>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOn sx={{ fontSize: 14, color: '#64748b' }} />
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>{t.location}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <WorkOutline sx={{ fontSize: 14, color: '#64748b' }} />
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>Client: {poster?.name ?? 'Unknown'}</Typography>
                        </Box>
                      </Box>
                      {next && (
                        <Button
                          variant="contained" size="small"
                          onClick={() => updateTicketStatus(t.id, next)}
                          sx={{ bgcolor: next === 'completed' ? '#10b981' : '#3b82f6', borderRadius: 2, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: next === 'completed' ? '#059669' : '#2563eb' } }}
                        >
                          {NEXT_LABEL[t.status]}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )
        )}

        {/* Completed Jobs */}
        {tab === 2 && (
          completedJobs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: '#64748b' }}>
              <Typography variant="h2">✅</Typography>
              <Typography variant="h6" sx={{ color: '#94a3b8', mt: 1 }}>No completed jobs yet</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {completedJobs.map(t => {
                const poster = users.find(u => u.id === t.submittedBy);
                return (
                  <Card key={t.id} sx={{ bgcolor: '#1e293b', borderRadius: 3, border: '1px solid #1e293b', opacity: 0.8 }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#f1f5f9' }}>{t.title}</Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>{t.category} · {poster?.name ?? 'Unknown'} · {new Date(t.updatedAt).toLocaleDateString()}</Typography>
                        </Box>
                        <StatusBadge status={t.status} />
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )
        )}
      </Box>
    </Box>
  );
}
