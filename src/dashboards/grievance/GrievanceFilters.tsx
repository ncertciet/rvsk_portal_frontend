import React from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { STATUS_OPTIONS } from './constants';

interface Category {
  code: string;
  label: string;
}

interface GrievanceFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  categories: Category[];
  onClear: () => void;
}

const GrievanceFilters: React.FC<GrievanceFiltersProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
  categories,
  onClear,
}) => {
  const hasFilters = search || status || category;

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
      <TextField
        size="small"
        placeholder="Search by ID or subject..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ minWidth: 250 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Status</InputLabel>
        <Select value={status} label="Status" onChange={(e) => onStatusChange(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {STATUS_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Category</InputLabel>
        <Select value={category} label="Category" onChange={(e) => onCategoryChange(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.code} value={cat.code}>
              {cat.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {hasFilters && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={onClear}
        >
          Clear
        </Button>
      )}
    </Box>
  );
};

export default GrievanceFilters;
