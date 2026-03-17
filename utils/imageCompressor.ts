/**
 * Client-side image compression utility.
 * Compresses images to WebP format before saving as base64.
 * Used in admin pages (ManageTeam, ManageMedia, ManageCourses).
 */

export interface CompressResult {
    base64: string;
    originalSize: number;   // bytes
    compressedSize: number; // bytes
}

export const compressImage = (file: File, maxWidth = 1920, quality = 0.85): Promise<string> => {
    return compressImageToWebP(file, maxWidth, quality).then(r => r.base64);
};

export const compressImageToWebP = (file: File, maxWidth = 1920, quality = 0.85): Promise<CompressResult> => {
    return new Promise((resolve, reject) => {
        const originalSize = file.size;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);

                const base64 = canvas.toDataURL('image/webp', quality);

                // Calculate approximate compressed size from base64 length
                const compressedSize = Math.round((base64.length - (base64.indexOf(',') + 1)) * 0.75);

                resolve({ base64, originalSize, compressedSize });
            };
            img.onerror = () => reject(new Error('Image loading failed'));
            img.src = event.target?.result as string;
        };
        reader.onerror = () => reject(new Error('File reading failed'));
        reader.readAsDataURL(file);
    });
};

