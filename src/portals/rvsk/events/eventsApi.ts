import apiClient from '../../../services/apiClient';

export interface EventImage {
  id: string;
  eventId: string;
  imageUrl: string;
  caption?: string | null;
  displayOrder: number;
}

export interface VskEvent {
  id: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  coverImageId?: string | null;
  isPublished: boolean;
  publishedAt?: string | null;
  images: EventImage[];
}

export interface CreateEventPayload {
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
}

// ─── Admin ──────────────────────────────────────────────────────────────────

export async function fetchEvents(): Promise<VskEvent[]> {
  const res = await apiClient.get<VskEvent[]>('/events');
  return res.data ?? [];
}

export async function fetchEvent(id: string): Promise<VskEvent> {
  const res = await apiClient.get<VskEvent>(`/events/${id}`);
  return res.data;
}

export async function createEvent(payload: CreateEventPayload): Promise<VskEvent> {
  const res = await apiClient.post<VskEvent>('/events', payload);
  return res.data;
}

export async function updateEvent(id: string, payload: Partial<CreateEventPayload>): Promise<VskEvent> {
  const res = await apiClient.put<VskEvent>(`/events/${id}`, payload);
  return res.data;
}

export async function deleteEvent(id: string): Promise<void> {
  await apiClient.delete(`/events/${id}`);
}

export async function uploadEventImage(eventId: string, file: File, caption?: string): Promise<EventImage> {
  const form = new FormData();
  form.append('file', file);
  if (caption) form.append('caption', caption);
  const res = await apiClient.post<EventImage>(`/events/${eventId}/images`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function updateImageCaption(imageId: string, caption: string): Promise<EventImage> {
  const res = await apiClient.put<EventImage>(`/events/images/${imageId}/caption`, { caption });
  return res.data;
}

export async function deleteEventImage(imageId: string): Promise<void> {
  await apiClient.delete(`/events/images/${imageId}`);
}

export async function setCoverImage(eventId: string, imageId: string): Promise<VskEvent> {
  const res = await apiClient.put<VskEvent>(`/events/${eventId}/cover/${imageId}`);
  return res.data;
}

export async function publishEvent(id: string): Promise<VskEvent> {
  const res = await apiClient.put<VskEvent>(`/events/${id}/publish`);
  return res.data;
}

export async function unpublishEvent(id: string): Promise<VskEvent> {
  const res = await apiClient.put<VskEvent>(`/events/${id}/unpublish`);
  return res.data;
}

// ─── Public ──────────────────────────────────────────────────────────────────

export async function fetchPublishedEvents(): Promise<VskEvent[]> {
  const res = await apiClient.get<VskEvent[]>('/events/public');
  return res.data ?? [];
}

export async function fetchPublishedEvent(id: string): Promise<VskEvent> {
  const res = await apiClient.get<VskEvent>(`/events/public/${id}`);
  return res.data;
}
