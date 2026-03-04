import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Box, Typography, Card, CardContent, Button, Chip, TextField, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider, Avatar,
} from '@mui/material';
import { Add, LocationOn, CalendarToday, PersonOutline } from '@mui/icons-material';
import { StatusBadge } from '../components/StatusBadge';

const CATEGORIES = ['Server Setup', 'Network Config', 'Hardware Install', 'Software Install', 'Maintenance', 'Other'];

const statusColor: Record<string, string> = {
  open: '#fbbf24', assigned: '#60a5fa', 'in-progress': '#a78bfa', completed: '#34d399',
};

export default function UserDashboard() {
  const { currentUser, tickets, users, addTicket } = useApp();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState('');

  const myTickets = tickets.filter(t => t.submittedBy === currentUser?.id);
  const activeCount = myTickets.filter(t => t.status !== 'completed').length;
  const completedCount = myTickets.filter(t => t.status === 'completed').length;

  const handleSubmit = () => {
    if (!currentUser || !title.trim() || !location.trim() || !description.trim()) return;
    addTicket({ title, description, category, location, submittedBy: currentUser.id });
    setTitle(''); setDescription(''); setLocation(''); setCategory(CATEGORIES[0]);
    setOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 52px)', bgcolor: '#0f172a' }}>
      {/* Sidebar */}
      <Box sx={{ width: 240, flexShrink: 0, borderRight: '1px solid #1e293b', p: 2.5, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Avatar sx={{ bgcolor: '#3b82f6', width: 44, height: 44 }}>{currentUser?.name.charAt(0)}</Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#f1f5f9' }}>{currentUser?.name}</Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>Service Company</Typography>
          </Box>
        </Box>
        <Divider sx={{ borderColor: '#1e293b' }} />
        {[
          { label: 'Total Orders', value: myTickets.length, color: '#60a5fa' },
          { label: 'Active', value: activeCount, color: '#fbbf24' },
          { label: 'Completed', value: completedCount, color: '#34d399' },
        ].map(s => (
          <Box key={s.label} sx={{ p: 1.5, borderRadius: 2, bgcolor: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>{s.label}</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: s.color }}>{s.value}</Typography>
          </Box>
        ))}
        <Button
          variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} fullWidth
          sx={{ mt: 'auto', bgcolor: '#3b82f6', borderRadius: 2, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#2563eb' } }}
        >
          Post Work Order
        </Button>
      </Box>

      {/* Main */}
      <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#f1f5f9' }}>My Work Orders</Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.25 }}>Track the status of your posted service requests</Typography>
          </Box>
          <Button
            variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}
            sx={{ display: { md: 'none' }, bgcolor: '#3b82f6', borderRadius: 2, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#2563eb' } }}
          >
            Post Work Order
          </Button>
        </Box>

        {myTickets.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10, color: '#64748b' }}>
            <Typography variant="h2">📋</Typography>
            <Typography variant="h6" sx={{ color: '#94a3b8', mt: 1 }}>No work orders yet</Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>Post your first work order to find a technician</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} sx={{ bgcolor: '#3b82f6', borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
              Post Work Order
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {myTickets.map(t => {
              const assignee = users.find(u => u.id === t.assignedTo);
              return (
                <Card key={t.id} sx={{ bgcolor: '#1e293b', borderRadius: 3, border: `1px solid ${statusColor[t.status]}33`, transition: 'border-color 0.2s' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Chip label={t.category} size="small" sx={{ bgcolor: '#334155', color: '#94a3b8', fontSize: '0.75rem' }} />
                        <StatusBadge status={t.status} />
                      </Box>
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#f1f5f9', mb: 0.5 }}>{t.title}</Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2, lineHeight: 1.6 }}>{t.description}</Typography>
                    <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn sx={{ fontSize: 14, color: '#64748b' }} />
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>{t.location}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarToday sx={{ fontSize: 14, color: '#64748b' }} />
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>{new Date(t.createdAt).toLocaleDateString()}</Typography>
                      </Box>
                      {assignee && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PersonOutline sx={{ fontSize: 14, color: '#64748b' }} />
                          <Typography variant="caption" sx={{ color: '#60a5fa' }}>Assigned to {assignee.name}</Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Post Work Order Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#1e293b', borderRadius: 3, border: '1px solid #334155' } }}>
        <DialogTitle sx={{ color: '#f1f5f9', fontWeight: 700, pb: 1 }}>Post a Work Order</DialogTitle>
        <Divider sx={{ borderColor: '#334155' }} />
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
          {[
            { label: 'Title', value: title, setter: setTitle, placeholder: 'Brief summary of the work needed', multiline: false },
            { label: 'Location', value: location, setter: setLocation, placeholder: 'Site address or office', multiline: false },
            { label: 'Description', value: description, setter: setDescription, placeholder: 'Describe the work in detail', multiline: true },
          ].map(f => (
            <TextField
              key={f.label} label={f.label} value={f.value} onChange={e => f.setter(e.target.value)}
              placeholder={f.placeholder} multiline={f.multiline} rows={f.multiline ? 4 : 1} fullWidth size="small"
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#0f172a', color: '#f1f5f9', borderRadius: 2, '& fieldset': { borderColor: '#334155' }, '&:hover fieldset': { borderColor: '#475569' } }, '& .MuiInputLabel-root': { color: '#64748b' }, '& .MuiInputBase-input::placeholder': { color: '#475569' } }}
            />
          ))}
          <TextField
            select label="Category" value={category} onChange={e => setCategory(e.target.value)} fullWidth size="small"
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#0f172a', color: '#f1f5f9', borderRadius: 2, '& fieldset': { borderColor: '#334155' } }, '& .MuiInputLabel-root': { color: '#64748b' }, '& .MuiSvgIcon-root': { color: '#64748b' } }}
          >
            {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: '#64748b', textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained" onClick={handleSubmit}
            disabled={!title.trim() || !location.trim() || !description.trim()}
            sx={{ bgcolor: '#3b82f6', borderRadius: 2, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#2563eb' } }}
          >
            Post Work Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
