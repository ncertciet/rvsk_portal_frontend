import { FormDefinition, FormResponseEntry, MyFormEntry, FormAnswer } from './types';

export const DUMMY_FORMS: FormDefinition[] = [
  {
    id: '1',
    title: 'School Infrastructure Survey 2025',
    description: 'Annual survey to assess school infrastructure across states.',
    instructions: 'Please fill all required fields accurately. Refer to the latest UDISE data for enrollment numbers.',
    status: 'PUBLISHED',
    dueDate: '2025-09-30',
    createdDate: '2025-08-01',
    assignedStates: 12,
    responses: 8,
    questions: [
      { id: 'q1', questionText: 'Total number of classrooms in the school', fieldType: 'NUMBER', required: true },
      { id: 'q2', questionText: 'Does the school have a functional library?', fieldType: 'RADIO', required: true, options: ['Yes', 'No'] },
      { id: 'q3', questionText: 'Type of water supply available', fieldType: 'DROPDOWN', required: true, options: ['Piped Water', 'Hand Pump', 'Well', 'Tanker', 'None'] },
      { id: 'q4', questionText: 'Describe the condition of school buildings', fieldType: 'LONG_TEXT', required: false, helpText: 'Include details about walls, roof, flooring' },
      { id: 'q5', questionText: 'Date of last infrastructure inspection', fieldType: 'DATE', required: true },
      { id: 'q6', questionText: 'Facilities available', fieldType: 'CHECKBOX', required: false, options: ['Computer Lab', 'Science Lab', 'Playground', 'Auditorium', 'Smart Classroom'] },
      { id: 'q7', questionText: 'Upload latest inspection report (PDF)', fieldType: 'FILE', required: false, helpText: 'Max 10MB, PDF format preferred' },
      { id: 'q8', questionText: 'Name of the school principal', fieldType: 'SHORT_TEXT', required: true },
    ],
  },
  {
    id: '2',
    title: 'Teacher Training Feedback',
    description: 'Collect feedback from states on recent teacher training programs.',
    instructions: 'Rate each aspect on the provided scale. Add comments where necessary.',
    status: 'DRAFT',
    dueDate: '2025-10-15',
    createdDate: '2025-08-03',
    assignedStates: 0,
    responses: 0,
    questions: [
      { id: 'q1', questionText: 'Training program name', fieldType: 'SHORT_TEXT', required: true },
      { id: 'q2', questionText: 'Number of teachers trained', fieldType: 'NUMBER', required: true },
      { id: 'q3', questionText: 'Overall rating of the program', fieldType: 'RADIO', required: true, options: ['Excellent', 'Good', 'Average', 'Poor'] },
      { id: 'q4', questionText: 'Areas of improvement', fieldType: 'CHECKBOX', required: false, options: ['Content Quality', 'Duration', 'Trainer Expertise', 'Practical Sessions', 'Materials Provided'] },
      { id: 'q5', questionText: 'Additional comments', fieldType: 'LONG_TEXT', required: false },
    ],
  },
  {
    id: '3',
    title: 'Mid-Day Meal Compliance Report',
    description: 'Monthly compliance reporting for PM POSHAN scheme.',
    instructions: 'Fill data for the current month only. Ensure meal counts match attendance registers.',
    status: 'CLOSED',
    dueDate: '2025-07-31',
    createdDate: '2025-06-01',
    assignedStates: 36,
    responses: 34,
    questions: [
      { id: 'q1', questionText: 'Total meals served this month', fieldType: 'NUMBER', required: true },
      { id: 'q2', questionText: 'Average daily attendance for meals', fieldType: 'NUMBER', required: true },
      { id: 'q3', questionText: 'Were nutritional guidelines followed?', fieldType: 'RADIO', required: true, options: ['Yes', 'Partially', 'No'] },
      { id: 'q4', questionText: 'Issues faced during the month', fieldType: 'LONG_TEXT', required: false },
    ],
  },
];

export const DUMMY_RESPONSES: FormResponseEntry[] = [
  { stateCode: 'AP', stateName: 'Andhra Pradesh', submissionStatus: 'SUBMITTED', submittedBy: 'ap.admin@rvsk.gov.in', submittedDate: '2025-08-15' },
  { stateCode: 'KA', stateName: 'Karnataka', submissionStatus: 'SUBMITTED', submittedBy: 'ka.admin@rvsk.gov.in', submittedDate: '2025-08-12' },
  { stateCode: 'TN', stateName: 'Tamil Nadu', submissionStatus: 'DRAFT', submittedBy: 'tn.admin@rvsk.gov.in', submittedDate: null },
  { stateCode: 'MH', stateName: 'Maharashtra', submissionStatus: 'SUBMITTED', submittedBy: 'mh.admin@rvsk.gov.in', submittedDate: '2025-08-10' },
  { stateCode: 'GJ', stateName: 'Gujarat', submissionStatus: 'PENDING', submittedBy: null, submittedDate: null },
  { stateCode: 'RJ', stateName: 'Rajasthan', submissionStatus: 'SUBMITTED', submittedBy: 'rj.admin@rvsk.gov.in', submittedDate: '2025-08-14' },
  { stateCode: 'UP', stateName: 'Uttar Pradesh', submissionStatus: 'SUBMITTED', submittedBy: 'up.admin@rvsk.gov.in', submittedDate: '2025-08-11' },
  { stateCode: 'MP', stateName: 'Madhya Pradesh', submissionStatus: 'PENDING', submittedBy: null, submittedDate: null },
  { stateCode: 'WB', stateName: 'West Bengal', submissionStatus: 'SUBMITTED', submittedBy: 'wb.admin@rvsk.gov.in', submittedDate: '2025-08-13' },
  { stateCode: 'KL', stateName: 'Kerala', submissionStatus: 'SUBMITTED', submittedBy: 'kl.admin@rvsk.gov.in', submittedDate: '2025-08-09' },
  { stateCode: 'DL', stateName: 'Delhi', submissionStatus: 'SUBMITTED', submittedBy: 'dl.admin@rvsk.gov.in', submittedDate: '2025-08-16' },
  { stateCode: 'HR', stateName: 'Haryana', submissionStatus: 'DRAFT', submittedBy: 'hr.admin@rvsk.gov.in', submittedDate: null },
];

export const DUMMY_MY_FORMS: MyFormEntry[] = [
  { id: '1', title: 'School Infrastructure Survey 2025', dueDate: '2025-09-30', status: 'PENDING' },
  { id: '4', title: 'Digital Literacy Assessment Q3', dueDate: '2025-10-31', status: 'DRAFT_SAVED' },
  { id: '5', title: 'NEP Implementation Progress Report', dueDate: '2025-08-31', status: 'SUBMITTED' },
];

export const DUMMY_SUBMISSION_ANSWERS: FormAnswer[] = [
  { questionId: 'q1', value: '24' },
  { questionId: 'q2', value: 'Yes' },
  { questionId: 'q3', value: 'Piped Water' },
  { questionId: 'q4', value: 'Buildings are in good condition. Roof was repaired last year. Flooring is cemented in all classrooms.' },
  { questionId: 'q5', value: '2025-03-15' },
  { questionId: 'q6', value: ['Computer Lab', 'Playground', 'Smart Classroom'] },
  { questionId: 'q7', value: null, fileName: 'inspection_report_2025.pdf' },
  { questionId: 'q8', value: 'Dr. Rajesh Kumar' },
];
