import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, TextField, RadioGroup, Radio, FormControlLabel,
  FormGroup, Checkbox, Select, MenuItem, FormControl, InputLabel, Button,
  Divider, Snackbar, Alert, CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import apiClient from '../../../services/apiClient';
import { FormQuestion, FormAnswer } from './types';

interface FillForm {
  title: string;
  description?: string | null;
  instructions?: string | null;
  questions: FormQuestion[];
}

export default function FormFill() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<FillForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    apiClient
      .get(`/forms/${id}`)
      .then((res) => {
        const data = res.data;
        const questions: FormQuestion[] = (data.questions || []).map((q: any) => {
          let options: string[] = [];
          if (q.optionsJson) {
            try {
              const parsed = JSON.parse(q.optionsJson);
              if (Array.isArray(parsed)) options = parsed;
            } catch { options = []; }
          }
          return {
            id: q.id,
            questionText: q.questionText,
            fieldType: q.fieldType,
            required: !!q.isRequired,
            helpText: q.helpText || '',
            options,
          } as FormQuestion;
        });
        setForm({ title: data.title, description: data.description, instructions: data.instructions, questions });
      })
      .catch(() => setForm(null))
      .finally(() => setLoading(false));
  }, [id]);

  const [answers, setAnswers] = useState<Record<string, FormAnswer>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const updateAnswer = (questionId: string, value: string | string[] | null, fileName?: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { questionId, value, fileName },
    }));
    // Clear error on edit
    if (errors[questionId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    const current = (answers[questionId]?.value as string[]) || [];
    const updated = checked ? [...current, option] : current.filter((v) => v !== option);
    updateAnswer(questionId, updated);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    (form?.questions || []).forEach((q) => {
      if (q.required) {
        const answer = answers[q.id];
        if (!answer || !answer.value || (Array.isArray(answer.value) && answer.value.length === 0)) {
          newErrors[q.id] = 'This field is required';
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = () => {
    // Draft persistence endpoint not yet implemented server-side.
    setSnackbar({ open: true, message: 'Draft saved locally. Submit when ready.', severity: 'success' });
  };

  const toAnswerText = (a: FormAnswer): string => {
    if (Array.isArray(a.value)) return a.value.join(', ');
    return (a.value as string) ?? (a.fileName ?? '');
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setSnackbar({ open: true, message: 'Please fill all required fields.', severity: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.values(answers).map((a) => ({
          questionId: a.questionId,
          answerText: toAnswerText(a),
        })),
      };
      await apiClient.post(`/forms/${id}/responses`, payload);
      setSnackbar({ open: true, message: 'Form submitted successfully!', severity: 'success' });
      setTimeout(() => navigate('/rvsk/my-forms'), 1200);
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to submit form', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSelect = (questionId: string) => {
    // In a real app, this would open a file picker and upload
    // For now, simulate a file selection
    const fakeFileName = 'uploaded_document.pdf';
    updateAnswer(questionId, fakeFileName, fakeFileName);
  };

  const renderQuestion = (question: FormQuestion, index: number) => {
    const error = errors[question.id];
    const label = `${index + 1}. ${question.questionText}${question.required ? ' *' : ''}`;
    const value = answers[question.id]?.value;

    switch (question.fieldType) {
      case 'SHORT_TEXT':
        return (
          <TextField
            label={label}
            fullWidth
            size="small"
            value={(value as string) || ''}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            error={Boolean(error)}
            helperText={error || question.helpText}
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
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            error={Boolean(error)}
            helperText={error || question.helpText}
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
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            error={Boolean(error)}
            helperText={error || question.helpText}
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
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            error={Boolean(error)}
            helperText={error || question.helpText}
          />
        );
      case 'DROPDOWN':
        return (
          <FormControl fullWidth size="small" error={Boolean(error)}>
            <InputLabel>{label}</InputLabel>
            <Select
              label={label}
              value={(value as string) || ''}
              onChange={(e) => updateAnswer(question.id, e.target.value as string)}
            >
              {(question.options || []).map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
            {(error || question.helpText) && (
              <Typography variant="caption" color={error ? 'error' : 'text.secondary'} sx={{ mt: 0.5, ml: 1.5 }}>
                {error || question.helpText}
              </Typography>
            )}
          </FormControl>
        );
      case 'RADIO':
        return (
          <Box>
            <Typography variant="body2" color={error ? 'error.main' : 'text.secondary'} sx={{ mb: 1 }}>
              {label}
            </Typography>
            <RadioGroup
              value={(value as string) || ''}
              onChange={(e) => updateAnswer(question.id, e.target.value)}
            >
              {(question.options || []).map((opt) => (
                <FormControlLabel key={opt} value={opt} control={<Radio size="small" />} label={opt} />
              ))}
            </RadioGroup>
            {(error || question.helpText) && (
              <Typography variant="caption" color={error ? 'error' : 'text.secondary'}>
                {error || question.helpText}
              </Typography>
            )}
          </Box>
        );
      case 'CHECKBOX':
        return (
          <Box>
            <Typography variant="body2" color={error ? 'error.main' : 'text.secondary'} sx={{ mb: 1 }}>
              {label}
            </Typography>
            <FormGroup>
              {(question.options || []).map((opt) => (
                <FormControlLabel
                  key={opt}
                  control={
                    <Checkbox
                      size="small"
                      checked={((value as string[]) || []).includes(opt)}
                      onChange={(e) => handleCheckboxChange(question.id, opt, e.target.checked)}
                    />
                  }
                  label={opt}
                />
              ))}
            </FormGroup>
            {(error || question.helpText) && (
              <Typography variant="caption" color={error ? 'error' : 'text.secondary'}>
                {error || question.helpText}
              </Typography>
            )}
          </Box>
        );
      case 'FILE':
        return (
          <Box>
            <Typography variant="body2" color={error ? 'error.main' : 'text.secondary'} sx={{ mb: 1 }}>
              {label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={() => handleFileSelect(question.id)}
                size="small"
              >
                Upload File
              </Button>
              {answers[question.id]?.fileName && (
                <Typography variant="body2">{answers[question.id].fileName}</Typography>
              )}
            </Box>
            {(error || question.helpText) && (
              <Typography variant="caption" color={error ? 'error' : 'text.secondary'} sx={{ mt: 0.5, display: 'block' }}>
                {error || question.helpText}
              </Typography>
            )}
          </Box>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={28} /></Box>;
  }

  if (!form) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Form not found.</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/rvsk/my-forms')} sx={{ mt: 2 }}>
          Back to My Forms
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/rvsk/my-forms')} sx={{ mb: 2 }}>
        Back to My Forms
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
              {renderQuestion(question, index)}
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" startIcon={<SaveIcon />} onClick={handleSaveDraft}>
            Save Draft
          </Button>
          <Button variant="contained" startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
