// frontend API utility
const API_BASE = '/api';

export const fetchFromAPI = async <T = any>(key: string): Promise<T | null> => {
    try {
        const response = await fetch(`${API_BASE}/${key}`);
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
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error(`Failed to save ${key}:`, error);
        throw error;
    }
};

export const uploadImageToAPI = async (base64OrFile: string | File): Promise<string> => {
    try {
        // If it's already a URL from our backend, just return it
        if (typeof base64OrFile === 'string' && base64OrFile.startsWith('/uploads/')) {
            return base64OrFile;
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
                return base64OrFile;
            }
        } else {
            fileToUpload = base64OrFile;
        }

        const formData = new FormData();
        formData.append('image', fileToUpload);

        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData, // Do not set Content-Type header, fetch does it automatically with boundary for FormData
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        return data.url; // Relative URL like /uploads/filename.png
    } catch (error) {
        console.error('Failed to upload image:', error);
        throw error;
    }
};

export const submitLeadToAPI = async (leadData: { name: string; phone: string; courseId?: string; sourceRef?: string }) => {
    try {
        const response = await fetch(`${API_BASE}/leads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(leadData),
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error(`Failed to submit lead:`, error);
        throw error;
    }
};
