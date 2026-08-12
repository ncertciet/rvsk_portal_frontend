import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormGroup, FormControlLabel, Checkbox, Box, Typography,
} from '@mui/material';
import { INDIAN_STATES } from './types';

interface PublishDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (states: string[], dueDate: string) => void;
  formId?: string | null;
}

export default function PublishDialog({ open, onClose, onConfirm }: PublishDialogProps) {
  const [selectedStates, setSelectedStates] = useState<string[]>([]);

  const handleToggleState = (state: string) => {
    setSelectedStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
  };

  const handleSelectAll = () => {
    if (selectedStates.length === INDIAN_STATES.length) {
      setSelectedStates([]);
    } else {
      setSelectedStates([...INDIAN_STATES]);
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedStates, '');
    setSelectedStates([]);
  };

  const handleClose = () => {
    setSelectedStates([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Publish Form</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2" sx={{ mb: 1, mt: 1 }}>
          Select States/UTs to assign ({selectedStates.length}/{INDIAN_STATES.length})
        </Typography>

        <FormControlLabel
          control={
            <Checkbox
              checked={selectedStates.length === INDIAN_STATES.length}
              indeterminate={selectedStates.length > 0 && selectedStates.length < INDIAN_STATES.length}
              onChange={handleSelectAll}
            />
          }
          label={<Typography variant="body2" fontWeight={600}>Select All</Typography>}
        />

        <Box sx={{ maxHeight: 300, overflowY: 'auto', pl: 1 }}>
          <FormGroup>
            {INDIAN_STATES.map((state) => (
              <FormControlLabel
                key={state}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedStates.includes(state)}
                    onChange={() => handleToggleState(state)}
                  />
                }
                label={<Typography variant="body2">{state}</Typography>}
              />
            ))}
          </FormGroup>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={selectedStates.length === 0}
        >
          Confirm & Publish
        </Button>
      </DialogActions>
    </Dialog>
  );
}
