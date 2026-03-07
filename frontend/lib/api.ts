import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'https://zoaria-production.up.railway.app/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

export const setTokens = (access: string, refresh: string) => {
  Cookies.set('access_token', access);
  Cookies.set('refresh_token', refresh);
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

export const clearTokens = () => {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const getAccessToken = () =>
  Cookies.get('access_token') || (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

let refreshing = false;
let queue: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as any;
    if (error.response?.status === 401 && !original._retry) {
      if (refreshing) return new Promise((resolve) => { queue.push(() => resolve(api(original))); });
      original._retry = true;
      refreshing = true;
      try {
        const refresh = Cookies.get('refresh_token') || localStorage.getItem('refresh_token');
        if (refresh) {
          const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh });
          setTokens(data.access, refresh);
          queue.forEach((cb) => cb());
          queue = [];
          return api(original);
        }
      } catch {
        clearTokens();
        window.location.href = '/login';
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  registerOwner: (data: any) => api.post('/auth/register/owner/', data),
  registerVet: (data: any) => api.post('/auth/register/vet/', data),
  login: (emailOrData: any, password?: string) => api.post('/auth/login/', password ? { email: emailOrData, password } : emailOrData),
  logout: (refresh?: string) => api.post('/auth/logout/', { refresh }),
  verifyEmail: (token: string) => api.post('/auth/verify-email/', { token }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password/', { email }),
  resetPassword: (data: any) => api.post('/auth/reset-password/', data),
  changePassword: (data: any) => api.post('/auth/change-password/', data),
  updateProfile: (data: any) => api.patch('/auth/profile/', data),
  getProfile: () => api.get('/auth/profile/'),
  getMe: () => api.get('/auth/me/'),
};

export const petsApi = {
  list: () => api.get('/pets/'),
  get: (id: number) => api.get(`/pets/${id}/`),
  create: (data: any) => api.post('/pets/', data),
  update: (id: number, data: any) => api.patch(`/pets/${id}/`, data),
  delete: (id: number) => api.delete(`/pets/${id}/`),
  species: () => api.get('/pets/species/'),
  breeds: (speciesId?: number) => api.get(`/pets/breeds/${speciesId ? `?species=${speciesId}` : ''}`),
  breedConditions: (breedId: number) => api.get(`/pets/breeds/${breedId}/conditions/`),
  bmi: (petId: number) => api.get(`/pets/${petId}/bmi/`),
};

export const vetsApi = {
  list: (params?: any) => api.get('/vets/', { params }),
  get: (id: number) => api.get(`/vets/${id}/`),
  myProfile: () => api.get('/vets/profile/'),
  updateMyProfile: (data: any) => api.patch('/vets/profile/', data),
  reviews: (vetId: number) => api.get(`/vets/${vetId}/reviews/`),
  addReview: (vetId: number, data: any) => api.post(`/vets/${vetId}/reviews/`, data),
};

export const healthApi = {
  records: (petId: number) => api.get(`/health/records/?pet=${petId}`),
  createRecord: (data: any) => api.post('/health/records/', data),
  prescriptions: (petId: number) => api.get(`/health/prescriptions/?pet=${petId}`),
  createPrescription: (data: any) => api.post('/health/prescriptions/', data),
};

export const feedingApi = {
  logs: (petId: number) => api.get(`/feeding/logs/?pet=${petId}`),
  createLog: (data: any) => api.post('/feeding/logs/', data),
  guidelines: (speciesId?: number) => api.get(`/feeding/guidelines/${speciesId ? `?species=${speciesId}` : ''}`),
};

export const activityApi = {
  logs: (petId: number) => api.get(`/activity/logs/?pet=${petId}`),
  createLog: (data: any) => api.post('/activity/logs/', data),
  deleteLog: (id: number) => api.delete(`/activity/logs/${id}/`),
};

export const calendarApi = {
  appointments: () => api.get('/calendar/appointments/'),
  createAppointment: (data: any) => api.post('/calendar/appointments/', data),
  updateAppointment: (id: number, data: any) => api.patch(`/calendar/appointments/${id}/`, data),
  deleteAppointment: (id: number) => api.delete(`/calendar/appointments/${id}/`),
  reminders: () => api.get('/calendar/reminders/'),
  createReminder: (data: any) => api.post('/calendar/reminders/', data),
  deleteReminder: (id: number) => api.delete(`/calendar/reminders/${id}/`),
};

export const chatApi = {
  conversations: () => api.get('/chat/conversations/'),
  getConversation: (id: number) => api.get(`/chat/conversations/${id}/`),
  startConversation: (vetId: number) => api.post('/chat/conversations/', { vet: vetId }),
  messages: (conversationId: number) => api.get(`/chat/conversations/${conversationId}/messages/`),
  sendMessage: (conversationId: number, data: any) => api.post(`/chat/conversations/${conversationId}/messages/`, data),
};

export const notificationsApi = {
  list: () => api.get('/notifications/'),
  unreadCount: () => api.get('/notifications/unread-count/'),
  markRead: (id: number) => api.patch(`/notifications/${id}/`, { read: true }),
  markAllRead: () => api.post('/notifications/mark-all-read/'),
};

export const paymentsApi = {
  getSubscription: () => api.get('/payments/subscription/'),
  subscribe: (plan: string) => api.post('/payments/subscribe/', { plan }),
  createCheckout: (data: any) => api.post('/payments/checkout/', data),
  getHistory: () => api.get('/payments/history/'),
};

export const hubApi = {
  articles: (params?: any) => api.get('/hub/articles/', { params }),
  getArticle: (id: number) => api.get(`/hub/articles/${id}/`),
  videos: (params?: any) => api.get('/hub/videos/', { params }),
};

export const adminApi = {
  users: () => api.get('/admin-panel/users/'),
  toggleUser: (id: number) => api.post(`/admin-panel/users/${id}/toggle/`),
  pendingVets: () => api.get('/admin-panel/vets/pending/'),
  approveVet: (id: number) => api.post(`/admin-panel/vets/${id}/approve/`),
  rejectVet: (id: number, reason?: string) => api.post(`/admin-panel/vets/${id}/reject/`, { reason }),
  analytics: () => api.get('/admin-panel/analytics/'),
  getStats: () => api.get('/admin-panel/stats/'),
};

export const uploadsApi = {
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/uploads/image/', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export default api;
