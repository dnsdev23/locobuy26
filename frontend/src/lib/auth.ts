import { apiClient } from './api';

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: 'buyer' | 'seller' | 'local_store';
}

export interface LoginData {
    email: string;
    password: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: 'buyer' | 'seller' | 'local_store';
    avatar_url?: string;
    bio?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export const register = async (data: RegisterData) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
};

export const login = async (data: LoginData) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
};

export const getProfile = async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    window.location.href = '/login';
};
