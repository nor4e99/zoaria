import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'https://zoaria-production.up.railway.app/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

/* ─── Request interceptor: attach JWT ─────────────────────────────────── */
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token') || (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

/* ─── Response interceptor: auto-refresh on 401 ──────────────────────── */
let refreshing = false;
let queue: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as any;

    if (error.response?.status === 401 && !original._retry) {
      if (refreshing) {
        return new Promise((resolve) => {
          queue.push(() => resolve(api(original)));
        });
      }

      original._retry = true;
      refreshing = true;

      try {
        const refresh = Cookies.get('refresh_token') || localStorage.getItem('refresh_token');
        if (!refresh) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh });
        const newAccess = data.access;

        Cookies.set('access_token', newAccess, { expires: 1/12 }); // 2hr
        localStorage.setItem('access_token', newAccess);

        api.defaults.headers['Authorization'] = `Bearer ${newAccess}`;
        original.headers['Authorization'] = `Bearer ${newAccess}`;

        queue.forEach((cb) => cb());
        queue = [];

        return api(original);
      } catch {
        // Refresh failed — clear tokens and redirect
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (typeof window !== 'undefined') window.location.href = '/login';
      } finally {
        refreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/* ─── Auth helpers ────────────────────────────────────────────────────── */
export function setTokens(access: string, refresh: string) {
  Cookies.set('access_token', access, { expires: 1/12, sameSite: 'lax' });
  Cookies.set('refresh_token', refresh, { expires: 30, sameSite: 'lax' });
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
}

export function clearTokens() {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export function getAccessToken(): string | null {
  return Cookies.get('access_token') || localStorage.getItem('access_token');
}

/* ─── Typed API methods ───────────────────────────────────────────────── */
export const authApi = {
  registerOwner: (data: any)           => api.post('/auth/register/owner/', data),
  registerVet:   (data: any)           => api.post('/auth/register/vet/', data),
  login:         (email: string, password: string) => api.post('/auth/login/', { email, password }),
  verifyEmail:   (token: string)       => api.post('/auth/verify-email/', { token }),
  forgotPassword:(email: string)       => api.post('/auth/forgot-password/', { email }),
  resetPassword: (data: any)           => api.post('/auth/reset-password/', data),
  changePassword:(data: any)           => api.post('/auth/change-password/', data),
  logout:        (refresh: string)     => api.post('/auth/logout/', { refresh }),
  me:            ()                    => api.get('/auth/me/'),
  updateProfile: (data: any)           => api.patch('/auth/profile/', data),
};

export const petsApi = {
  list:            ()          => api.get('/pets/'),
  create:          (data: any) => api.post('/pets/', data),
  get:             (id: number)=> api.get(`/pets/${id}/`),
  update:          (id: number, data: any) => api.patch(`/pets/${id}/`, data),
  delete:          (id: number)=> api.delete(`/pets/${id}/`),
  bmi:             (id: number)=> api.get(`/pets/${id}/bmi/`),
  species:         ()          => api.get('/pets/species/'),
  breeds:          (speciesId?: number) => api.get(`/pets/breeds/${speciesId ? `?species=${speciesId}` : ''}`),
  breedConditions: (breedId: number)    => api.get(`/pets/breeds/${breedId}/conditions/`),
};

export const vetsApi = {
  list:    (search?: string) => api.get(`/vets/${search ? `?search=${search}` : ''}`),
  get:     (id: number)      => api.get(`/vets/${id}/`),
  myProfile: ()              => api.get('/vets/me/'),
  updateMyProfile: (data: any) => api.patch('/vets/me/', data),
  reviews: (vetId: number)   => api.get(`/vets/${vetId}/reviews/`),
  addReview: (vetId: number, data: any) => api.post(`/vets/${vetId}/reviews/`, data),
};

export const chatApi = {
  conversations: ()               => api.get('/chat/conversations/'),
  startConversation: (vetId: number) => api.post('/chat/conversations/', { vet_id: vetId }),
  messages: (convId: number)      => api.get(`/chat/conversations/${convId}/messages/`),
};

export const calendarApi = {
  appointments:       ()           => api.get('/calendar/appointments/'),
  createAppointment:  (data: any)  => api.post('/calendar/appointments/', data),
  updateAppointment:  (id: number, data: any) => api.patch(`/calendar/appointments/${id}/`, data),
  reminders:          ()           => api.get('/calendar/reminders/'),
  petReminders:       (petId: number)         => api.get(`/calendar/pets/${petId}/reminders/`),
  createReminder:     (petId: number, data: any) => api.post(`/calendar/pets/${petId}/reminders/`, data),
};

export const notificationsApi = {
  list:       ()        => api.get('/notifications/'),
  unreadCount:()        => api.get('/notifications/unread-count/'),
  markRead:   (id: number) => api.post(`/notifications/${id}/read/`),
  markAllRead:()        => api.post('/notifications/mark-read/'),
};

export const feedingApi = {
  guidelines: (speciesId: number) => api.get(`/feeding/guidelines/${speciesId}/`),
  logs:        (petId: number)    => api.get(`/feeding/pets/${petId}/logs/`),
  addLog:      (petId: number, data: any) => api.post(`/feeding/pets/${petId}/logs/`, data),
  calories:    (petId: number)    => api.get(`/feeding/pets/${petId}/calories/`),
};

export const healthApi = {
  records:          (petId: number)          => api.get(`/health/pets/${petId}/records/`),
  addRecord:        (petId: number, data: any) => api.post(`/health/pets/${petId}/records/`, data),
  prescriptions:    (petId: number)          => api.get(`/health/pets/${petId}/prescriptions/`),
  addPrescription:  (petId: number, data: any) => api.post(`/health/pets/${petId}/prescriptions/`, data),
};

export const paymentsApi = {
  subscribe:       (plan: string) => api.post('/payments/subscribe/', { plan }),
  mySubscription:  ()             => api.get('/payments/my-subscription/'),
  history:         ()             => api.get('/payments/history/'),
};

export const hubApi = {
  articles: (lang?: string) => api.get(`/hub/articles/${lang ? `?lang=${lang}` : ''}`),
  videos:   (lang?: string) => api.get(`/hub/videos/${lang ? `?lang=${lang}` : ''}`),
};

export const adminApi = {
  pendingVets:      ()           => api.get('/admin-panel/vets/pending/'),
  approveVet:       (id: number) => api.post(`/admin-panel/vets/${id}/approve/`),
  rejectVet:        (id: number, reason?: string) => api.post(`/admin-panel/vets/${id}/reject/`, { reason }),
  users:            ()           => api.get('/admin-panel/users/'),
  toggleUser:       (id: number) => api.post(`/admin-panel/users/${id}/toggle-active/`),
  analytics:        ()           => api.get('/admin-panel/analytics/'),
};
