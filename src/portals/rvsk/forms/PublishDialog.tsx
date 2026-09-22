import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormGroup, FormControlLabel, Checkbox, Box, Typography, CircularProgress,
} from '@mui/material';
import apiClient from '../../../services/apiClient';

interface StateOption {
  key: string;
  code?: string;
  name: string;
}

interface PublishDialogProps {
  open: boolean;
  onClose: () => void;
  /** Returns the selected state keys (bigint as string) and an optional due date. */
  onConfirm: (stateKeys: string[], dueDate: string) => void;
  formId?: string | null;
}

export default function PublishDialog({ open, onClose, onConfirm }: PublishDialogProps) {
  const [states, setStates] = useState<StateOption[]>([]);
  const [loading, setLoading] = useState(false);
  // Track selection by state key (the value persisted as a form assignment).
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    apiClient
      .get('/portal-masters/states')
      .then((r) => setStates(r.data || []))
      .catch(() => setStates([]))
      .finally(() => setLoading(false));
  }, [open]);

  const handleToggle = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAll = () => {
    if (selectedKeys.length === states.length) {
      setSelectedKeys([]);
    } else {
      setSelectedKeys(states.map((s) => s.key));
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedKeys, '');
    setSelectedKeys([]);
  };

  const handleClose = () => {
    setSelectedKeys([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Publish Form</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2" sx={{ mb: 1, mt: 1 }}>
          Select States/UTs to assign ({selectedKeys.length}/{states.length})
        </Typography>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={states.length > 0 && selectedKeys.length === states.length}
                  indeterminate={selectedKeys.length > 0 && selectedKeys.length < states.length}
                  onChange={handleSelectAll}
                />
              }
              label={<Typography variant="body2" fontWeight={600}>Select All</Typography>}
            />

            <Box sx={{ maxHeight: 300, overflowY: 'auto', pl: 1 }}>
              <FormGroup>
                {states.map((state) => (
                  <FormControlLabel
                    key={state.key}
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedKeys.includes(state.key)}
                        onChange={() => handleToggle(state.key)}
                      />
                    }
                    label={<Typography variant="body2">{state.name}</Typography>}
                  />
                ))}
              </FormGroup>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={selectedKeys.length === 0}
        >
          Confirm &amp; Publish
        </Button>
      </DialogActions>
    </Dialog>
  );
}
