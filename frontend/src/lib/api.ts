import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

apiClient.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
        }
        return Promise.reject(error);
    }
);

export const searchProducts = async (params: {
    latitude: number;
    longitude: number;
    radius?: number;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
}) => {
    const response = await apiClient.get('/products/search', { params });
    return response.data;
};

export const getProduct = async (id: string) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
};

export const getBlogPosts = async () => {
    const response = await apiClient.get('/blog/posts');
    return response.data;
};

export const parseProductUrl = async (url: string) => {
    const response = await apiClient.post('/import/parse', { url });
    return response.data;
};

export const createProduct = async (data: any) => {
    const response = await apiClient.post('/products', data);
    return response.data;
};

export const getPickupLocations = async () => {
    const response = await apiClient.get('/import/locations');
    return response.data;
};

export const getSellers = async () => {
    const response = await apiClient.get('/import/users');
    return response.data;
};

export const batchImport = async (urls: string[]) => {
    const response = await apiClient.post('/import/batch', { urls });
    return response.data;
};

export const fetchShopProducts = async (url: string) => {
    const response = await apiClient.get('/import/shop', { params: { url } });
    return response.data;
};
