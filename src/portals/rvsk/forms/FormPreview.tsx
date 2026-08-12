import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, TextField, RadioGroup, Radio, FormControlLabel,
  FormGroup, Checkbox, Select, MenuItem, FormControl, InputLabel, Button, Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DUMMY_FORMS } from './dummyData';
import { FormQuestion } from './types';

function renderQuestionPreview(question: FormQuestion, index: number) {
  const label = `${index + 1}. ${question.questionText}${question.required ? ' *' : ''}`;

  switch (question.fieldType) {
    case 'SHORT_TEXT':
      return (
        <TextField label={label} fullWidth disabled size="small" helperText={question.helpText} />
      );
    case 'LONG_TEXT':
      return (
        <TextField label={label} fullWidth disabled multiline rows={4} size="small" helperText={question.helpText} />
      );
    case 'NUMBER':
      return (
        <TextField label={label} fullWidth disabled type="number" size="small" helperText={question.helpText} />
      );
    case 'DATE':
      return (
        <TextField label={label} fullWidth disabled type="date" size="small" InputLabelProps={{ shrink: true }} helperText={question.helpText} />
      );
    case 'DROPDOWN':
      return (
        <FormControl fullWidth size="small" disabled>
          <InputLabel>{label}</InputLabel>
          <Select label={label} value="">
            {(question.options || []).map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
          {question.helpText && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.5 }}>
              {question.helpText}
            </Typography>
          )}
        </FormControl>
      );
    case 'RADIO':
      return (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{label}</Typography>
          <RadioGroup>
            {(question.options || []).map((opt) => (
              <FormControlLabel key={opt} value={opt} control={<Radio disabled size="small" />} label={opt} />
            ))}
          </RadioGroup>
          {question.helpText && (
            <Typography variant="caption" color="text.secondary">{question.helpText}</Typography>
          )}
        </Box>
      );
    case 'CHECKBOX':
      return (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{label}</Typography>
          <FormGroup>
            {(question.options || []).map((opt) => (
              <FormControlLabel key={opt} control={<Checkbox disabled size="small" />} label={opt} />
            ))}
          </FormGroup>
          {question.helpText && (
            <Typography variant="caption" color="text.secondary">{question.helpText}</Typography>
          )}
        </Box>
      );
    case 'FILE':
      return (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{label}</Typography>
          <Button variant="outlined" disabled size="small">Upload File</Button>
          {question.helpText && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>{question.helpText}</Typography>
          )}
        </Box>
      );
    default:
      return null;
  }
}

export default function FormPreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // TODO: Fetch form from API
  // const form = await apiClient.get(`/forms/${id}`);
  const form = DUMMY_FORMS.find((f) => f.id === id);

  if (!form) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Form not found.</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/rvsk/form-builder')} sx={{ mt: 2 }}>
          Back to Forms
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Paper sx={{ p: 4 }} variant="outlined">
        <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>{form.title}</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>{form.description}</Typography>

        {form.instructions && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: '#FFF8E1' }} variant="outlined">
            <Typography variant="subtitle2" color="warning.dark">Instructions:</Typography>
            <Typography variant="body2">{form.instructions}</Typography>
          </Paper>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {form.questions.map((question, index) => (
            <Box key={question.id}>
              {renderQuestionPreview(question, index)}
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
          This is a preview. Form submission is disabled.
        </Typography>
      </Paper>
    </Box>
  );
}
