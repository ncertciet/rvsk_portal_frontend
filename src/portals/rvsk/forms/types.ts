/** Shared types for the RVSK Form Builder module */

export type FormStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'EXPIRED';

export type FieldType =
  | 'SHORT_TEXT'
  | 'LONG_TEXT'
  | 'NUMBER'
  | 'DATE'
  | 'DROPDOWN'
  | 'RADIO'
  | 'CHECKBOX'
  | 'FILE';

export interface FormQuestion {
  id: string;
  questionText: string;
  fieldType: FieldType;
  required: boolean;
  helpText?: string;
  options?: string[]; // For DROPDOWN, RADIO, CHECKBOX
}

export interface FormDefinition {
  id: string;
  title: string;
  description: string;
  instructions: string;
  status: FormStatus;
  dueDate: string;
  createdDate: string;
  assignedStates: number;
  responses: number;
  questions: FormQuestion[];
}

export interface FormResponseEntry {
  stateCode: string;
  stateName: string;
  submissionStatus: 'PENDING' | 'DRAFT' | 'SUBMITTED';
  submittedBy: string | null;
  submittedDate: string | null;
}

export interface MyFormEntry {
  id: string;
  title: string;
  dueDate: string;
  status: 'PENDING' | 'DRAFT_SAVED' | 'SUBMITTED';
}

export interface FormAnswer {
  questionId: string;
  value: string | string[] | null;
  fileName?: string;
}

/** All 36 Indian States/UTs */
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman & Nicobar Islands', 'Chandigarh', 'Dadra & Nagar Haveli and Daman & Diu',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];
