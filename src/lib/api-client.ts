const getAuthHeader = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
};

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Wystąpił błąd API');
    }
    return response.json();
};

export const api = {
    get: async <T>(endpoint: string): Promise<T> => {
        const response = await fetch(
            `<span class="math-inline">\{process\.env\.NEXT\_PUBLIC\_API\_URL\}</span>{endpoint}`,
            {
                method: 'GET',
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json',
                },
            },
        );
        return handleResponse(response);
    },

    post: async <T>(endpoint: string, body: unknown): Promise<T> => {
        const response = await fetch(
            `<span class="math-inline">\{process\.env\.NEXT\_PUBLIC\_API\_URL\}</span>{endpoint}`,
            {
                method: 'POST',
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            },
        );
        return handleResponse(response);
    },
};