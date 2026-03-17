// frontend API utility
const API_BASE = '/api';

// Helper to get auth headers with JWT token
export const getAuthHeaders = (headers: Record<string, string> = {}) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        return { ...headers, 'Authorization': `Bearer ${token}` };
    }
    return headers;
};

export const fetchFromAPI = async <T = any>(key: string): Promise<T | null> => {
    try {
        const response = await fetch(`${API_BASE}/${key}`, {
            headers: getAuthHeaders()
        });
        if (response.status === 401 || response.status === 403) {
            // Token expired or invalid
            if (localStorage.getItem('adminAuth')) {
                localStorage.removeItem('adminAuth');
                localStorage.removeItem('adminToken');
                window.location.href = '/paneladmindata/login';
            }
        }
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch ${key}:`, error);
        return null;
    }
};

export const saveToAPI = async <T = any>(key: string, data: any): Promise<T> => {
    try {
        const response = await fetch(`${API_BASE}/${key}`, {
            method: 'PUT',
            headers: getAuthHeaders({
                'Content-Type': 'application/json',
            }),
            body: JSON.stringify(data),
        });
        if (response.status === 401 || response.status === 403) {
            window.location.href = '/paneladmindata/login';
            throw new Error('Unauthorized');
        }
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error(`Failed to save ${key}:`, error);
        throw error;
    }
};

export interface UploadResult {
    url: string;
    originalSize?: number;
    webpSize?: number;
    /** Human-readable savings string, e.g. "2.1 MB → 340 KB (84% kichiklashdi)" */
    savingsLabel?: string;
}

const formatBytes = (bytes: number): string => {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    if (bytes >= 1024) return Math.round(bytes / 1024) + ' KB';
    return bytes + ' B';
};

export const uploadImageToAPI = async (base64OrFile: string | File): Promise<string> => {
    const result = await uploadImageToAPIWithStats(base64OrFile);
    return result.url;
};

export const uploadImageToAPIWithStats = async (base64OrFile: string | File): Promise<UploadResult> => {
    try {
        // If it's already a URL from our backend, just return it
        if (typeof base64OrFile === 'string' && base64OrFile.startsWith('/uploads/')) {
            return { url: base64OrFile };
        }

        let fileToUpload: File;

        if (typeof base64OrFile === 'string') {
            // If it's base64, convert to File
            if (base64OrFile.startsWith('data:image')) {
                const res = await fetch(base64OrFile);
                const blob = await res.blob();
                fileToUpload = new File([blob], 'image.png', { type: blob.type });
            } else {
                // Just return the string if it's a URL we can't process
                return { url: base64OrFile };
            }
        } else {
            fileToUpload = base64OrFile;
        }

        const formData = new FormData();
        formData.append('image', fileToUpload);

        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            headers: getAuthHeaders(), // Do not set Content-Type header
            body: formData,
        });

        if (response.status === 401 || response.status === 403) {
            window.location.href = '/paneladmindata/login';
            throw new Error('Unauthorized');
        }

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        const result: UploadResult = { url: data.url, originalSize: data.originalSize, webpSize: data.webpSize };

        if (data.originalSize && data.webpSize && data.webpSize < data.originalSize) {
            const reduction = Math.round((1 - data.webpSize / data.originalSize) * 100);
            result.savingsLabel = `${formatBytes(data.originalSize)} → ${formatBytes(data.webpSize)} (${reduction}% kichiklashdi)`;
        }

        return result;
    } catch (error) {
        console.error('Failed to upload image:', error);
        throw error;
    }
};

export const submitLeadToAPI = async (leadData: { name: string; phone: string; courseId?: string; sourceRef?: string }) => {
    try {
        const response = await fetch(`${API_BASE}/leads`, {
            method: 'POST',
            headers: getAuthHeaders({
                'Content-Type': 'application/json',
            }),
            body: JSON.stringify(leadData),
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error(`Failed to submit lead:`, error);
        throw error;
    }
};
