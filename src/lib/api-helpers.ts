const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getAuthenticatedHeaders = (): HeadersInit => {
    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = {
        'Content-Type': 'application/json', // Ten nagłówek musi być zawsze dla naszych zapytań
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({
            message: `Błąd serwera: ${response.statusText}`,
        }));
        throw new Error(errorData.message || 'Wystąpił nieznany błąd API');
    }
    if (response.status === 204) {
        return;
    }
    return response.json();
};

export const apiClient = {
    get: <T>(endpoint: string): Promise<T> =>
        fetch(`${API_URL}${endpoint}`, {
            headers: getAuthenticatedHeaders(),
        }).then(handleResponse),

    post: <T>(endpoint: string, body: unknown): Promise<T> =>
        fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: getAuthenticatedHeaders(),
            body: JSON.stringify(body),
        }).then(handleResponse),

    patch: <T>(endpoint: string, body: unknown): Promise<T> =>
        fetch(`${API_URL}${endpoint}`, {
            method: 'PATCH',
            headers: getAuthenticatedHeaders(),
            body: JSON.stringify(body),
        }).then(handleResponse),

    delete: <T>(endpoint: string): Promise<T> =>
        fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getAuthenticatedHeaders(),
        }).then(handleResponse),
};