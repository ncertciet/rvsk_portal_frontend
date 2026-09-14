import apiClient from '../../../services/apiClient';
import {
  SuperAdminHomeData,
  RvskAdminHomeData,
  StateAdminHomeData,
  SpocHomeData,
  GalleryImage,
} from './types';

// ─── API Functions ──────────────────────────────────────────────────────────
// NOTE: These intentionally do NOT swallow errors or return dummy data.
// On the test environment we want real API failures to surface so the UI can
// show an error state (see the callers). Errors propagate to the caller, which
// normalizes them via getApiError() and renders a message.

export async function fetchSuperAdminHome(): Promise<SuperAdminHomeData> {
  const response = await apiClient.get<SuperAdminHomeData>('/home/super-admin');
  return response.data;
}

export async function fetchRvskAdminHome(): Promise<RvskAdminHomeData> {
  const response = await apiClient.get<RvskAdminHomeData>('/home/rvsk-admin');
  return response.data;
}

export async function fetchStateAdminHome(): Promise<StateAdminHomeData> {
  const response = await apiClient.get<StateAdminHomeData>('/home/state-admin');
  return response.data;
}

export async function fetchSpocHome(): Promise<SpocHomeData> {
  const response = await apiClient.get<SpocHomeData>('/home/spoc');
  return response.data;
}

export async function fetchGalleryImages(page = 0, size = 20): Promise<GalleryImage[]> {
  const response = await apiClient.get<GalleryImage[]>('/gallery/images', {
    params: { page, size },
  });
  return response.data;
}

export async function uploadGalleryImage(file: File, caption: string): Promise<GalleryImage> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('caption', caption);

  const response = await apiClient.post<GalleryImage>('/gallery/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function deleteGalleryImage(id: string): Promise<void> {
  await apiClient.delete(`/gallery/images/${id}`);
}
