import React, { useState } from 'react';
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
  TableSortLabel,
  TablePagination,
  Skeleton,
} from '@mui/material';

// ─── TYPES ───────────────────────────────────────────────────────────────────
export interface KpiTableColumn {
  /** Unique field key matching the row data property */
  field: string;
  /** Column header display name */
  headerName: string;
  /** Column width (optional) */
  width?: number | string;
  /** Minimum width (optional) */
  minWidth?: number;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Whether the column is sortable (default: true) */
  sortable?: boolean;
  /** Custom cell renderer */
  renderCell?: (value: any, row: Record<string, any>) => React.ReactNode;
}

export interface KpiTableProps {
  /** Column definitions */
  columns: KpiTableColumn[];
  /** Row data — each row is a key-value object */
  rows: Record<string, any>[];
  /** Table title (optional) */
  title?: string;
  /** Rows per page options */
  rowsPerPageOptions?: number[];
  /** Default rows per page */
  defaultRowsPerPage?: number;
  /** Whether to enable pagination (default: true) */
  paginated?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Maximum table height for scrollable body */
  maxHeight?: number | string;
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const AMBER_PRIMARY = '#D97706';
const EMPTY_MESSAGE = 'No data available';

type SortOrder = 'asc' | 'desc';

// ─── COMPONENT ───────────────────────────────────────────────────────────────
/**
 * KpiTable renders tabular KPI data using MUI Table components.
 * Supports sorting, pagination, custom cell rendering, and responsive layout.
 *
 * Validates: Requirements 16.3
 */
const KpiTable: React.FC<KpiTableProps> = ({
  columns,
  rows,
  title,
  rowsPerPageOptions = [5, 10, 25],
  defaultRowsPerPage = 10,
  paginated = true,
  loading = false,
  maxHeight,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // ─── SORTING ───────────────────────────────────────────────────────────────
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedRows = React.useMemo(() => {
    if (!sortField) return rows;

    return [...rows].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortOrder === 'asc' ? 1 : -1;
      if (bVal == null) return sortOrder === 'asc' ? -1 : 1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [rows, sortField, sortOrder]);

  // ─── PAGINATION ────────────────────────────────────────────────────────────
  const displayedRows = paginated
    ? sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : sortedRows;

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // ─── LOADING STATE ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Paper sx={{ p: 2 }}>
        {title && <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />}
        <Skeleton variant="rectangular" width="100%" height={200} />
      </Paper>
    );
  }

  // ─── EMPTY STATE ───────────────────────────────────────────────────────────
  if (!rows || rows.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        {title && (
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            {title}
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
          <Typography color="text.secondary">{EMPTY_MESSAGE}</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {title && (
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {title}
          </Typography>
        </Box>
      )}

      <TableContainer sx={{ maxHeight: maxHeight }}>
        <Table size="small" stickyHeader={!!maxHeight}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.field}
                  align={col.align || 'left'}
                  sx={{
                    fontWeight: 600,
                    fontSize: 12,
                    whiteSpace: 'nowrap',
                    bgcolor: AMBER_PRIMARY,
                    color: '#fff',
                    width: col.width,
                    minWidth: col.minWidth,
                  }}
                  sortDirection={sortField === col.field ? sortOrder : false}
                >
                  {col.sortable !== false ? (
                    <TableSortLabel
                      active={sortField === col.field}
                      direction={sortField === col.field ? sortOrder : 'asc'}
                      onClick={() => handleSort(col.field)}
                      sx={{
                        color: '#fff !important',
                        '& .MuiTableSortLabel-icon': { color: '#fff !important' },
                      }}
                    >
                      {col.headerName}
                    </TableSortLabel>
                  ) : (
                    col.headerName
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedRows.map((row, rowIndex) => (
              <TableRow key={rowIndex} hover>
                {columns.map((col) => (
                  <TableCell
                    key={col.field}
                    align={col.align || 'left'}
                    sx={{ fontSize: 12 }}
                  >
                    {col.renderCell
                      ? col.renderCell(row[col.field], row)
                      : row[col.field] ?? '—'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {paginated && rows.length > rowsPerPageOptions[0] && (
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
          sx={{ '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: 12 } }}
        />
      )}
    </Paper>
  );
};

export default KpiTable;
