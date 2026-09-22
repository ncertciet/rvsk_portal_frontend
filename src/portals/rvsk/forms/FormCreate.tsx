import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Card, CardContent, Select, MenuItem,
  FormControl, InputLabel, Switch, FormControlLabel, IconButton, Fab,
  Collapse, Divider, Paper, SelectChangeEvent, Snackbar, Alert, CircularProgress,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SaveIcon from '@mui/icons-material/Save';
import PreviewIcon from '@mui/icons-material/Preview';
import PublishIcon from '@mui/icons-material/Publish';
import { FieldType, FormQuestion } from './types';
import PublishDialog from './PublishDialog';
import apiClient from '../../../services/apiClient';

const FIELD_TYPE_OPTIONS: { value: FieldType; label: string }[] = [
  { value: 'SHORT_TEXT', label: 'Short Text' },
  { value: 'LONG_TEXT', label: 'Long Text' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'DATE', label: 'Date' },
  { value: 'DROPDOWN', label: 'Dropdown' },
  { value: 'RADIO', label: 'Radio' },
  { value: 'CHECKBOX', label: 'Checkbox' },
  { value: 'FILE', label: 'File Upload' },
];

const HAS_OPTIONS: FieldType[] = ['DROPDOWN', 'RADIO', 'CHECKBOX'];

function generateId() {
  return 'q_' + Math.random().toString(36).substring(2, 9);
}

export default function FormCreate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [questions, setQuestions] = useState<FormQuestion[]>([
    { id: generateId(), questionText: '', fieldType: 'SHORT_TEXT', required: false, options: [] },
  ]);
  const [expandedHelp, setExpandedHelp] = useState<Record<string, boolean>>({});
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [formId, setFormId] = useState<string | null>(id || null);
  const [formStatus, setFormStatus] = useState<string>('DRAFT');

  // Load existing form in edit mode
  useEffect(() => {
    if (isEdit && id) {
      apiClient.get(`/forms/${id}`).then((res) => {
        const form = res.data;
        setTitle(form.title || '');
        setDescription(form.description || '');
        setInstructions(form.instructions || '');
        setDueDate(form.dueDate ? form.dueDate.substring(0, 10) : '');
        setFormStatus(form.status || 'DRAFT');
        if (form.questions && form.questions.length > 0) {
          setQuestions(form.questions.map((q: any) => ({
            id: q.id,
            questionText: q.questionText || '',
            fieldType: q.fieldType || 'SHORT_TEXT',
            required: q.isRequired === 1 || q.required === true,
            helpText: q.helpText || '',
            options: q.optionsJson ? JSON.parse(q.optionsJson) : [],
          })));
        }
      }).catch(() => {
        setSnackbar({ open: true, message: 'Failed to load form', severity: 'error' });
      });
    }
  }, [isEdit, id]);

  const updateQuestion = (index: number, updates: Partial<FormQuestion>) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...updates } : q)));
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { id: generateId(), questionText: '', fieldType: 'SHORT_TEXT', required: false, options: [] },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;
    [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
    setQuestions(newQuestions);
  };

  const addOption = (qIndex: number) => {
    const q = questions[qIndex];
    updateQuestion(qIndex, { options: [...(q.options || []), ''] });
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const q = questions[qIndex];
    const newOptions = [...(q.options || [])];
    newOptions[optIndex] = value;
    updateQuestion(qIndex, { options: newOptions });
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const q = questions[qIndex];
    const newOptions = (q.options || []).filter((_, i) => i !== optIndex);
    updateQuestion(qIndex, { options: newOptions });
  };

  const toggleHelpText = (questionId: string) => {
    setExpandedHelp((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  /** Save form + questions to backend */
  const handleSaveDraft = async () => {
    if (!title.trim()) {
      setSnackbar({ open: true, message: 'Form title is required', severity: 'error' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        instructions: instructions.trim() || null,
        dueDate: dueDate ? `${dueDate}T23:59:59` : null,
      };

      let savedFormId = formId;

      // Create or update form
      if (isEdit && formId) {
        await apiClient.put(`/forms/${formId}`, payload);
      } else {
        const res = await apiClient.post('/forms', payload);
        savedFormId = res.data.id;
        setFormId(savedFormId);
      }

      // Save questions — delete existing and re-add for simplicity
      if (savedFormId) {
        // Get current questions from server to know which to delete
        const existingRes = await apiClient.get(`/forms/${savedFormId}`);
        const existingQuestions = existingRes.data.questions || [];

        // Delete existing questions
        for (const eq of existingQuestions) {
          try {
            await apiClient.delete(`/forms/${savedFormId}/questions/${eq.id}`);
          } catch { /* ignore if already deleted */ }
        }

        // Add all current questions
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          if (!q.questionText.trim()) continue; // Skip empty questions
          const qPayload = {
            questionText: q.questionText.trim(),
            fieldType: q.fieldType,
            isRequired: q.required ? 1 : 0,
            helpText: q.helpText || null,
            optionsJson: HAS_OPTIONS.includes(q.fieldType) && q.options?.length ? JSON.stringify(q.options) : null,
            displayOrder: i + 1,
          };
          await apiClient.post(`/forms/${savedFormId}/questions`, qPayload);
        }
      }

      setSnackbar({ open: true, message: 'Form saved successfully!', severity: 'success' });
      setTimeout(() => navigate('/rvsk/form-builder'), 1000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to save form';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (formId) {
      navigate(`/rvsk/form-builder/${formId}/preview`);
    } else {
      setSnackbar({ open: true, message: 'Save the form first before previewing', severity: 'error' });
    }
  };

  const handlePublishConfirm = async (states: string[], publishDueDate: string) => {
    let targetFormId = formId || id;
    
    if (!targetFormId) {
      // Save form first if not yet saved
      if (!title.trim()) {
        setSnackbar({ open: true, message: 'Form title is required', severity: 'error' });
        return;
      }
      setSaving(true);
      try {
        const payload = {
          title: title.trim(),
          description: description.trim() || null,
          instructions: instructions.trim() || null,
          dueDate: dueDate ? `${dueDate}T23:59:59` : null,
        };
        const res = await apiClient.post('/forms', payload);
        targetFormId = res.data.id;
        setFormId(targetFormId ?? null);
        
        // Save questions
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          if (!q.questionText.trim()) continue;
          await apiClient.post(`/forms/${targetFormId}/questions`, {
            questionText: q.questionText.trim(),
            fieldType: q.fieldType,
            isRequired: q.required ? 1 : 0,
            helpText: q.helpText || null,
            optionsJson: HAS_OPTIONS.includes(q.fieldType) && q.options?.length ? JSON.stringify(q.options) : null,
            displayOrder: i + 1,
          });
        }
      } catch (err: any) {
        setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to save form before publishing', severity: 'error' });
        setSaving(false);
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        stateKeys: states,
        dueDate: publishDueDate ? `${publishDueDate}T23:59:59` : (dueDate ? `${dueDate}T23:59:59` : null),
      };
      await apiClient.post(`/forms/${targetFormId}/publish`, payload);
      setSnackbar({ open: true, message: 'Form published successfully!', severity: 'success' });
      setPublishDialogOpen(false);
      setTimeout(() => navigate('/rvsk/form-builder'), 1000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to publish form';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        {isEdit ? 'Edit Form' : 'Create New Form'}
      </Typography>

      {/* Form Metadata */}
      <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
        <TextField
          label="Form Title *"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
          placeholder="e.g., School Infrastructure Survey 2025"
        />
        <TextField
          label="Description"
          fullWidth
          multiline
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 2 }}
          placeholder="Brief description of the form's purpose"
        />
        <TextField
          label="Instructions"
          fullWidth
          multiline
          rows={3}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          sx={{ mb: 2 }}
          placeholder="Instructions for form respondents"
        />
        <TextField
          label="Due Date *"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
      </Paper>

      {/* Questions */}
      <Typography variant="h6" sx={{ mb: 2 }}>Questions</Typography>

      {questions.map((question, index) => (
        <Card key={question.id} variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, minWidth: 24 }}>
                {index + 1}.
              </Typography>
              <Box sx={{ flex: 1 }}>
                <TextField
                  label="Question Text"
                  fullWidth
                  size="small"
                  value={question.questionText}
                  onChange={(e) => updateQuestion(index, { questionText: e.target.value })}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Field Type</InputLabel>
                    <Select
                      value={question.fieldType}
                      label="Field Type"
                      onChange={(e: SelectChangeEvent) =>
                        updateQuestion(index, { fieldType: e.target.value as FieldType })
                      }
                    >
                      {FIELD_TYPE_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={question.required}
                        onChange={(e) => updateQuestion(index, { required: e.target.checked })}
                        size="small"
                      />
                    }
                    label="Required"
                  />
                </Box>

                {/* Options Editor */}
                {HAS_OPTIONS.includes(question.fieldType) && (
                  <Box sx={{ ml: 2, mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Options:
                    </Typography>
                    {(question.options || []).map((opt, optIdx) => (
                      <Box key={optIdx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField
                          size="small"
                          value={opt}
                          onChange={(e) => updateOption(index, optIdx, e.target.value)}
                          placeholder={`Option ${optIdx + 1}`}
                          sx={{ flex: 1 }}
                        />
                        <IconButton size="small" onClick={() => removeOption(index, optIdx)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                    <Button size="small" startIcon={<AddIcon />} onClick={() => addOption(index)}>
                      Add Option
                    </Button>
                  </Box>
                )}

                {/* Help Text (collapsible) */}
                <Box>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => toggleHelpText(question.id)}
                    endIcon={expandedHelp[question.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{ textTransform: 'none', color: 'text.secondary' }}
                  >
                    Help Text
                  </Button>
                  <Collapse in={expandedHelp[question.id]}>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Optional help text for respondents"
                      value={question.helpText || ''}
                      onChange={(e) => updateQuestion(index, { helpText: e.target.value })}
                      sx={{ mt: 1 }}
                    />
                  </Collapse>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <IconButton size="small" onClick={() => moveQuestion(index, 'up')} disabled={index === 0}>
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => moveQuestion(index, 'down')} disabled={index === questions.length - 1}>
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => removeQuestion(index)} disabled={questions.length === 1}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}

      {/* Add Question FAB */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Fab variant="extended" color="primary" onClick={addQuestion} size="medium">
          <AddIcon sx={{ mr: 1 }} />
          Add Question
        </Fab>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Bottom Actions */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />} onClick={handleSaveDraft} disabled={saving}>
          Save Draft
        </Button>
        <Button variant="outlined" startIcon={<PreviewIcon />} onClick={handlePreview} disabled={saving}>
          Preview
        </Button>
        <Button variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <PublishIcon />} onClick={() => {
          if (formStatus !== 'DRAFT') {
            setSnackbar({ open: true, message: 'Only DRAFT forms can be published. This form is already ' + formStatus, severity: 'error' });
            return;
          }
          // Save form first if not saved yet, then open publish dialog
          if (!formId && !isEdit) {
            handleSaveDraft().then(() => setPublishDialogOpen(true));
          } else {
            setPublishDialogOpen(true);
          }
        }} disabled={saving || formStatus !== 'DRAFT'}>
          Publish
        </Button>
      </Box>

      <PublishDialog
        open={publishDialogOpen}
        onClose={() => setPublishDialogOpen(false)}
        onConfirm={handlePublishConfirm}
        formId={formId}
      />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
