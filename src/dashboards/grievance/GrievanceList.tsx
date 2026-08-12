import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import apiClient from '../../services/apiClient';
import { SPOC_ROLES } from './constants';
import StatusBadge from './StatusBadge';
import GrievanceFilters from './GrievanceFilters';

interface RootState {
  auth: {
    user: {
      id: string;
      username: string;
      displayName: string;
      role: string;
      stateCode: string | null;
      districtCode: string | null;
    } | null;
  };
}

interface GrievanceRow {
  id: string;
  grievanceId: string;
  subject: string;
  category: string;
  subCategory?: string;
  status: string;
  createdAt: string;
  assignedTo?: string;
}

interface Category {
  code: string;
  label: string;
}

const GrievanceList: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const [grievances, setGrievances] = useState<GrievanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchGrievances();
  }, [page, rowsPerPage, search, status, category]);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/grievances/categories');
      const cats = res.data.map((c: any) => ({ code: c.code, label: c.label }));
      setCategories(cats);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const fetchGrievances = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('size', String(rowsPerPage));
      if (search) params.append('search', search);
      if (status && status !== '') params.append('status', status);
      if (category && category !== '') params.append('category', category);

      const res = await apiClient.get(`/grievances?${params.toString()}`);
      setGrievances(res.data.content || []);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch grievances', err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, status, category]);

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setCategory('');
    setPage(0);
  };

  const isSpocOrAdmin = user && SPOC_ROLES.includes(user.role);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          {isSpocOrAdmin ? 'Manage Grievances' : 'My Grievances'}
        </Typography>
        {!isSpocOrAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/rvsk/grievances/raise')}
          >
            Raise Grievance
          </Button>
        )}
      </Box>

      {/* Filters */}
      <GrievanceFilters
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(0); }}
        status={status}
        onStatusChange={(val) => { setStatus(val); setPage(0); }}
        category={category}
        onCategoryChange={(val) => { setCategory(val); setPage(0); }}
        categories={categories}
        onClear={handleClearFilters}
      />

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Grievance ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : grievances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No grievances found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                grievances.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/rvsk/grievances/${row.id}`)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary">
                        {row.grievanceId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                        {row.subject}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.category}</Typography>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(row.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/rvsk/grievances/${row.id}`);
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>
    </Box>
  );
};

export default GrievanceList;
