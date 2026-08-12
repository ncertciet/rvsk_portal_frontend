import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';

export default function FormBuilder() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Form Builder</Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, textAlign: 'center', cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
            <AddIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6">Create New Form</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>Design a new form from scratch</Typography>
            <Button variant="contained" sx={{ mt: 2 }}>Create</Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, textAlign: 'center', cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
            <ListIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6">View Created Forms</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>Manage your existing forms and responses</Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>View All</Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
