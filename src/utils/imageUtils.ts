/**
 * Image utility functions
 * Provides helpers for handling image URLs and sources
 */

/**
 * Converts HTTP URLs to HTTPS for secure image loading
 * This is necessary for production builds where cleartext (HTTP) traffic is blocked
 * 
 * @param url - The image URL to convert
 * @returns The same URL with HTTPS protocol, or the original URL if already HTTPS or invalid
 * 
 * @example
 * ensureHttps('http://example.com/image.jpg') // returns 'https://example.com/image.jpg'
 * ensureHttps('https://example.com/image.jpg') // returns 'https://example.com/image.jpg'
 * ensureHttps('') // returns ''
 * ensureHttps(null) // returns ''
 */
export const ensureHttps = (url: string | null | undefined): string => {
    if (!url || typeof url !== 'string') {
        return '';
    }

    // If URL starts with http:// (not https://), replace it with https://
    if (url.startsWith('http://')) {
        return url.replace('http://', 'https://');
    }

    // Return as-is if already https:// or relative path
    return url;
};

/**
 * Validates if a URL is a valid image URL
 * 
 * @param url - The URL to validate
 * @returns True if the URL appears to be a valid image URL
 */
export const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== 'string') {
        return false;
    }

    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
        // If URL parsing fails, check if it's a relative path or data URI
        return url.startsWith('/') || url.startsWith('data:');
    }
};
