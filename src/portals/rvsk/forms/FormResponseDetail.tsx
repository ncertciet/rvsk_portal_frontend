import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, Divider, Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import { DUMMY_FORMS, DUMMY_RESPONSES, DUMMY_SUBMISSION_ANSWERS } from './dummyData';

export default function FormResponseDetail() {
  const { id, stateCode } = useParams<{ id: string; stateCode: string }>();
  const navigate = useNavigate();

  // TODO: Fetch form + response detail from API
  // const form = await apiClient.get(`/forms/${id}`);
  // const response = await apiClient.get(`/forms/${id}/responses/${stateCode}`);
  const form = DUMMY_FORMS.find((f) => f.id === id);
  const responseEntry = DUMMY_RESPONSES.find((r) => r.stateCode === stateCode);

  if (!form || !responseEntry) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Response not found.</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Back
        </Button>
      </Box>
    );
  }

  const getAnswer = (questionId: string) => {
    return DUMMY_SUBMISSION_ANSWERS.find((a) => a.questionId === questionId);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back to Responses
      </Button>

      <Paper sx={{ p: 4 }} variant="outlined">
        <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>{form.title}</Typography>
        <Typography variant="body1" color="text.secondary">
          Response from: <strong>{responseEntry.stateName}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Submitted on: {responseEntry.submittedDate} by {responseEntry.submittedBy}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {form.questions.map((question, index) => {
            const answer = getAnswer(question.id);
            const displayValue = answer
              ? Array.isArray(answer.value)
                ? answer.value.join(', ')
                : answer.value || '—'
              : '—';

            return (
              <Box key={question.id}>
                <Typography variant="subtitle2" color="text.secondary">
                  {index + 1}. {question.questionText}{question.required ? ' *' : ''}
                </Typography>
                {question.fieldType === 'FILE' ? (
                  <Box sx={{ mt: 0.5 }}>
                    {answer?.fileName ? (
                      <Link
                        href="#"
                        underline="hover"
                        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                        onClick={(e) => {
                          e.preventDefault();
                          // TODO: Download file from API
                          // window.open(`/api/v1/forms/${id}/responses/${stateCode}/files/${question.id}`);
                        }}
                      >
                        <DownloadIcon fontSize="small" />
                        {answer.fileName}
                      </Link>
                    ) : (
                      <Typography variant="body1" sx={{ mt: 0.5 }}>No file uploaded</Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body1" sx={{ mt: 0.5 }}>{displayValue}</Typography>
                )}
              </Box>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
}
