import apiClient from '../../../services/apiClient';

/** RVSK-NOTIFY-EMAIL-003 — API client for the notification config/logs/layout. */

export interface NotificationConfig {
  id: string;
  eventCode: string;
  eventName: string;
  description: string | null;
  emailEnabled: boolean;
  recipientType: string;
  recipientValue: string | null;
  cc: string | null;
  bcc: string | null;
  subjectTemplate: string | null;
  bodyTemplate: string | null;
  textTemplate: string | null;
  defaultSubject: string;
  defaultBody: string;
  allowedTokens: string | null;
  isCustomized: boolean;
  isActive: boolean;
  updatedAt: string;
}

export interface EmailLayout {
  id: string;
  name: string;
  logoUrl: string | null;
  brandName: string | null;
  primaryColor: string | null;
  headerHtml: string | null;
  footerHtml: string | null;
  supportEmail: string | null;
  isActive: boolean;
  updatedAt: string;
}

export interface NotificationLog {
  id: string;
  eventCode: string;
  recipientEmail: string | null;
  cc: string | null;
  subject: string | null;
  status: 'SENT' | 'FAILED' | 'PENDING';
  referenceType: string | null;
  referenceId: string | null;
  attempts: number;
  retryCount: number;
  isTest: boolean;
  errorMessage: string | null;
  lastAttemptAt: string | null;
  createdAt: string;
  sentAt: string | null;
}

export interface Preview {
  subject: string;
  html: string;
  text: string;
}

export interface UpdateConfigPayload {
  emailEnabled?: boolean;
  recipientType?: string;
  recipientValue?: string;
  cc?: string;
  bcc?: string;
  subjectTemplate?: string;
  bodyTemplate?: string;
  textTemplate?: string;
}

export const notificationApi = {
  listConfig: () =>
    apiClient.get<NotificationConfig[]>('/notifications/config').then((r) => r.data),

  updateConfig: (eventCode: string, payload: UpdateConfigPayload) =>
    apiClient
      .put<NotificationConfig>(`/notifications/config/${eventCode}`, payload)
      .then((r) => r.data),

  preview: (eventCode: string) =>
    apiClient
      .get<Preview>(`/notifications/config/${eventCode}/preview`)
      .then((r) => r.data),

  testSend: (eventCode: string, toEmail: string) =>
    apiClient
      .post<{ success: boolean; message: string }>(
        `/notifications/config/${eventCode}/test-send`,
        { toEmail },
      )
      .then((r) => r.data),

  reset: (eventCode: string) =>
    apiClient
      .post<NotificationConfig>(`/notifications/config/${eventCode}/reset`, {})
      .then((r) => r.data),

  getLayout: () =>
    apiClient.get<EmailLayout>('/notifications/layout').then((r) => r.data),

  updateLayout: (payload: Partial<EmailLayout>) =>
    apiClient.put<EmailLayout>('/notifications/layout', payload).then((r) => r.data),

  listLogs: (params: {
    event?: string;
    status?: string;
    isTest?: string;
    page?: number;
    pageSize?: number;
  }) =>
    apiClient
      .get<{
        items: NotificationLog[];
        total: number;
        page: number;
        pageSize: number;
      }>('/notifications/logs', { params })
      .then((r) => r.data),

  resend: (logId: string) =>
    apiClient
      .post<{ success: boolean; message: string }>(
        `/notifications/logs/${logId}/resend`,
        {},
      )
      .then((r) => r.data),
};
