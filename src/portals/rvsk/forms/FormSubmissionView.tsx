import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, TextField, RadioGroup, Radio, FormControlLabel,
  FormGroup, Checkbox, Select, MenuItem, FormControl, InputLabel, Button, Divider, Link,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import { DUMMY_FORMS, DUMMY_SUBMISSION_ANSWERS } from './dummyData';
import { FormQuestion, FormAnswer } from './types';

function renderReadOnlyQuestion(question: FormQuestion, answer: FormAnswer | undefined, index: number) {
  const label = `${index + 1}. ${question.questionText}${question.required ? ' *' : ''}`;
  const value = answer?.value;

  switch (question.fieldType) {
    case 'SHORT_TEXT':
      return (
        <TextField
          label={label}
          fullWidth
          size="small"
          value={(value as string) || ''}
          disabled
        />
      );
    case 'LONG_TEXT':
      return (
        <TextField
          label={label}
          fullWidth
          multiline
          rows={4}
          size="small"
          value={(value as string) || ''}
          disabled
        />
      );
    case 'NUMBER':
      return (
        <TextField
          label={label}
          fullWidth
          type="number"
          size="small"
          value={(value as string) || ''}
          disabled
        />
      );
    case 'DATE':
      return (
        <TextField
          label={label}
          fullWidth
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={(value as string) || ''}
          disabled
        />
      );
    case 'DROPDOWN':
      return (
        <FormControl fullWidth size="small" disabled>
          <InputLabel>{label}</InputLabel>
          <Select label={label} value={(value as string) || ''}>
            {(question.options || []).map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    case 'RADIO':
      return (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{label}</Typography>
          <RadioGroup value={(value as string) || ''}>
            {(question.options || []).map((opt) => (
              <FormControlLabel key={opt} value={opt} control={<Radio disabled size="small" />} label={opt} />
            ))}
          </RadioGroup>
        </Box>
      );
    case 'CHECKBOX':
      return (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{label}</Typography>
          <FormGroup>
            {(question.options || []).map((opt) => (
              <FormControlLabel
                key={opt}
                control={
                  <Checkbox
                    disabled
                    size="small"
                    checked={((value as string[]) || []).includes(opt)}
                  />
                }
                label={opt}
              />
            ))}
          </FormGroup>
        </Box>
      );
    case 'FILE':
      return (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{label}</Typography>
          {answer?.fileName ? (
            <Link
              href="#"
              underline="hover"
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
              onClick={(e) => {
                e.preventDefault();
                // TODO: Download file
              }}
            >
              <DownloadIcon fontSize="small" />
              {answer.fileName}
            </Link>
          ) : (
            <Typography variant="body2" color="text.secondary">No file uploaded</Typography>
          )}
        </Box>
      );
    default:
      return null;
  }
}

export default function FormSubmissionView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // TODO: Fetch submitted form from API
  // const { form, answers } = await apiClient.get(`/forms/${id}/my-response`);
  const form = DUMMY_FORMS.find((f) => f.id === id) || DUMMY_FORMS[0];
  const submittedAnswers = DUMMY_SUBMISSION_ANSWERS;

  const getAnswer = (questionId: string) => {
    return submittedAnswers.find((a) => a.questionId === questionId);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/rvsk/my-forms')} sx={{ mb: 2 }}>
        Back to My Forms
      </Button>

      <Paper sx={{ p: 4 }} variant="outlined">
        <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>{form.title}</Typography>
        <Typography variant="body2" color="success.main" fontWeight={500} sx={{ mb: 2 }}>
          ✓ Submitted on 2025-08-15
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>{form.description}</Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {form.questions.map((question, index) => (
            <Box key={question.id}>
              {renderReadOnlyQuestion(question, getAnswer(question.id), index)}
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
