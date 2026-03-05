import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Box, Typography, Chip, Avatar, Card, CardContent, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  LinearProgress, IconButton, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, Divider, useMediaQuery, useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon, ConfirmationNumber as TicketIcon,
  Group as TeamIcon, Search as SearchIcon, Menu as MenuIcon,
  TrendingUp, AccessTime, CheckCircle, Assignment,
} from '@mui/icons-material';
import { StatusBadge } from '../components/StatusBadge';

const SIDEBAR_WIDTH = 260;

const sidebarSections = [
  { key: 'overview', label: 'Overview', icon: <DashboardIcon /> },
  { key: 'tickets', label: 'Tickets', icon: <TicketIcon /> },
  { key: 'team', label: 'Team', icon: <TeamIcon /> },
] as const;

type Section = typeof sidebarSections[number]['key'];

export default function AdminDashboard() {
  const { tickets, users } = useApp();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [section, setSection] = useState<Section>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const counts = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    assigned: tickets.filter(t => t.status === 'assigned').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    completed: tickets.filter(t => t.status === 'completed').length,
  }), [tickets]);

  const completionRate = counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;

  const filtered = useMemo(() => {
    let list = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tickets, filter, search]);

  const recentTickets = useMemo(() =>
    [...tickets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [tickets]
  );

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'var(--surface)' }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: '#3b82f6', width: 36, height: 36, fontSize: '1rem' }}>⚡</Avatar>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--text)' }}>Command Center</Typography>
      </Box>
      <Divider sx={{ borderColor: 'var(--surface2)' }} />
      <List sx={{ px: 1.5, py: 1 }}>
        {sidebarSections.map(s => (
          <ListItemButton
            key={s.key}
            selected={section === s.key}
            onClick={() => { setSection(s.key); if (isMobile) setMobileOpen(false); }}
            sx={{
              borderRadius: 2, mb: 0.5, color: 'var(--text-muted)',
              '&.Mui-selected': { bgcolor: 'var(--surface2)', color: 'var(--text)' },
              '&:hover': { bgcolor: 'var(--surface2)' },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{s.icon}</ListItemIcon>
            <ListItemText primary={s.label} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ mt: 'auto', p: 2.5 }}>
        <Typography variant="caption" sx={{ color: '#64748b', mb: 1, display: 'block' }}>Completion Rate</Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--text)' }}>{completionRate}%</Typography>
        <LinearProgress
          variant="determinate" value={completionRate}
          sx={{ mt: 1, height: 6, borderRadius: 3, bgcolor: 'var(--surface2)', '& .MuiLinearProgress-bar': { bgcolor: '#34d399', borderRadius: 3 } }}
        />
      </Box>
    </Box>
  );

  const kpiCards = [
    { label: 'Total Tickets', value: counts.total, icon: <Assignment />, color: '#3b82f6' },
    { label: 'Open', value: counts.open, icon: <AccessTime />, color: '#fbbf24' },
    { label: 'In Progress', value: counts.inProgress, icon: <TrendingUp />, color: '#a78bfa' },
    { label: 'Completed', value: counts.completed, icon: <CheckCircle />, color: '#34d399' },
  ];

  const statusBars = [
    { label: 'Open', count: counts.open, color: '#fbbf24' },
    { label: 'Assigned', count: counts.assigned, color: '#60a5fa' },
    { label: 'In Progress', count: counts.inProgress, color: '#a78bfa' },
    { label: 'Completed', count: counts.completed, color: '#34d399' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 52px)' }}>
      {/* Sidebar */}
      {isMobile ? (
        <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} PaperProps={{ sx: { width: SIDEBAR_WIDTH, bgcolor: 'var(--surface)', borderRight: '1px solid var(--surface2)' } }}>
          {sidebarContent}
        </Drawer>
      ) : (
        <Box sx={{ width: SIDEBAR_WIDTH, flexShrink: 0, borderRight: '1px solid var(--surface2)' }}>
          {sidebarContent}
        </Box>
      )}

      {/* Main */}
      <Box sx={{ flex: 1, p: { xs: 2, md: 3.5 }, overflow: 'auto' }}>
        {/* Top bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} sx={{ color: 'var(--text)' }}><MenuIcon /></IconButton>
            )}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--text)' }}>
                {section === 'overview' ? 'Dashboard Overview' : section === 'tickets' ? 'Ticket Management' : 'Team Overview'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 0.25 }}>
                {section === 'overview' ? 'Monitor and manage all service requests' : section === 'tickets' ? 'View, filter, and assign tickets' : 'Manage your technician team'}
              </Typography>
            </Box>
          </Box>
          {section === 'tickets' && (
            <TextField
              size="small" placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#64748b' }} /></InputAdornment> } }}
              sx={{ width: 280, '& .MuiOutlinedInput-root': { bgcolor: 'var(--surface)', color: 'var(--text)', borderRadius: 2, '& fieldset': { borderColor: 'var(--surface2)' }, '&:hover fieldset': { borderColor: 'var(--border)' } } }}
            />
          )}
        </Box>

        {/* Overview */}
        {section === 'overview' && (
          <>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
              {kpiCards.map(k => (
                <Card key={k.label} sx={{ bgcolor: 'var(--surface)', borderRadius: 3, border: '1px solid var(--surface2)' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Avatar sx={{ bgcolor: `${k.color}22`, color: k.color, width: 48, height: 48 }}>{k.icon}</Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{k.value}</Typography>
                      <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>{k.label}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              {/* Status Distribution */}
              <Card sx={{ bgcolor: 'var(--surface)', borderRadius: 3, border: '1px solid var(--surface2)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--text)', mb: 2 }}>Status Distribution</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {statusBars.map(s => (
                      <Box key={s.label}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
                            <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>{s.label}</Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: 'var(--text)', fontWeight: 600 }}>{s.count}</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate" value={counts.total ? (s.count / counts.total) * 100 : 0}
                          sx={{ height: 6, borderRadius: 3, bgcolor: 'var(--surface2)', '& .MuiLinearProgress-bar': { bgcolor: s.color, borderRadius: 3 } }}
                        />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card sx={{ bgcolor: 'var(--surface)', borderRadius: 3, border: '1px solid var(--surface2)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--text)', mb: 2 }}>Recent Activity</Typography>
                  {recentTickets.length === 0 ? (
                    <Typography sx={{ color: 'var(--text-muted)', textAlign: 'center', py: 4 }}>No recent tickets</Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {recentTickets.map(t => {
                        const submitter = users.find(u => u.id === t.submittedBy);
                        return (
                          <Box key={t.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: 2, '&:hover': { bgcolor: 'var(--surface2)' } }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, bgcolor: t.status === 'open' ? '#fbbf24' : t.status === 'assigned' ? '#60a5fa' : t.status === 'in-progress' ? '#a78bfa' : '#34d399' }} />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" sx={{ color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</Typography>
                              <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>{submitter?.name ?? 'Unknown'} · {new Date(t.createdAt).toLocaleDateString()}</Typography>
                            </Box>
                            <StatusBadge status={t.status} />
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </>
        )}

        {/* Tickets */}
        {section === 'tickets' && (
          <>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
              {['all', 'open', 'assigned', 'in-progress', 'completed'].map(f => (
                <Chip
                  key={f}
                  label={f === 'all' ? 'All Tickets' : f.charAt(0).toUpperCase() + f.slice(1)}
                  onClick={() => setFilter(f)}
                  variant={filter === f ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: 500,
                    borderColor: '#334155',
                    color: filter === f ? '#fff' : '#94a3b8',
                    bgcolor: filter === f ? '#3b82f6' : 'transparent',
                    '&:hover': { bgcolor: filter === f ? '#2563eb' : '#1e293b' },
                  }}
                />
              ))}
            </Box>

            {filtered.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8, color: '#64748b' }}>
                <Typography variant="h2" sx={{ mb: 1 }}>📭</Typography>
                <Typography variant="h6" sx={{ color: '#94a3b8' }}>No tickets found</Typography>
                <Typography variant="body2">Try adjusting your filters or search query</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ bgcolor: 'var(--surface)', borderRadius: 3, border: '1px solid var(--surface2)' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      {['Ticket', 'Category', 'Status', 'Submitted By', 'Date', 'Assignee'].map(h => (
                        <TableCell key={h} sx={{ color: 'var(--text-muted)', borderColor: 'var(--surface2)', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map(t => {
                      const submitter = users.find(u => u.id === t.submittedBy);
                      const assignee = users.find(u => u.id === t.assignedTo);
                      return (
                        <TableRow key={t.id} sx={{ '&:hover': { bgcolor: 'var(--surface2)' }, '& td': { borderColor: 'var(--surface2)' } }}>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: 'var(--text)', fontWeight: 500 }}>{t.title}</Typography>
                            <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>{t.description.slice(0, 60)}{t.description.length > 60 ? '…' : ''}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={t.category} size="small" sx={{ bgcolor: 'var(--surface2)', color: 'var(--text-muted)', fontSize: '0.75rem', height: 24 }} />
                          </TableCell>
                          <TableCell><StatusBadge status={t.status} /></TableCell>
                          <TableCell sx={{ color: 'var(--text-muted)' }}>{submitter?.name ?? 'Unknown'}</TableCell>
                          <TableCell sx={{ color: 'var(--text-muted)' }}>{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {assignee ? (
                              <Chip avatar={<Avatar sx={{ bgcolor: '#3b82f6', width: 24, height: 24, fontSize: '0.7rem' }}>{assignee.name.charAt(0)}</Avatar>} label={assignee.name} size="small" sx={{ bgcolor: 'var(--surface2)', color: 'var(--text)' }} />
                            ) : (
                              <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Awaiting claim</Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}

        {/* Team */}
        {section === 'team' && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {users.filter(u => u.role === 'tech').map(tech => {
              const techTickets = tickets.filter(t => t.assignedTo === tech.id);
              const active = techTickets.filter(t => t.status !== 'completed').length;
              const done = techTickets.filter(t => t.status === 'completed').length;
              return (
                <Card key={tech.id} sx={{ bgcolor: 'var(--surface)', borderRadius: 3, border: '1px solid var(--surface2)' }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Avatar sx={{ bgcolor: '#3b82f6', width: 56, height: 56, fontSize: '1.4rem', mx: 'auto', mb: 1.5 }}>{tech.name.charAt(0)}</Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--text)' }}>{tech.name}</Typography>
                    <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>Technician</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2, pt: 2, borderTop: '1px solid var(--surface2)' }}>
                      {[
                        { label: 'Active', value: active, color: '#fbbf24' },
                        { label: 'Done', value: done, color: '#34d399' },
                        { label: 'Total', value: techTickets.length, color: '#60a5fa' },
                      ].map(s => (
                        <Box key={s.label} sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                          <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>{s.label}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}
