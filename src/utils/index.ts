export * from './testUtils';
export * from './logger';
export * from './exchangeUtils';

import * as FileSystem from 'expo-file-system';

/**
 * Converts a File object to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Failed to convert file to base64'));
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
};

/**
 * Converts an image URI to base64 string (for React Native)
 */

export const uriToBase64 = async (uri: string): Promise<string> => {
    try {
        if (!uri || typeof uri !== 'string') {
            throw new Error('Invalid URI provided');
        }

        // Check if we're in React Native environment
        if (typeof FileReader === 'undefined' || typeof Blob === 'undefined') {
            // React Native approach using expo-file-system
            try {
                // Validate that the URI exists
                const fileInfo = await FileSystem.getInfoAsync(uri);
                if (!fileInfo.exists) {
                    throw new Error(`File does not exist at URI: ${uri}`);
                }

                const base64 = await FileSystem.readAsStringAsync(uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                if (!base64) {
                    throw new Error('Failed to read file as base64');
                }

                // Determine the MIME type from the URI extension
                const extension = uri.split('.').pop()?.toLowerCase();
                let mimeType = 'image/jpeg'; // default

                if (extension === 'png') {
                    mimeType = 'image/png';
                } else if (extension === 'webp') {
                    mimeType = 'image/webp';
                } else if (extension === 'gif') {
                    mimeType = 'image/gif';
                }

                return `data:${mimeType};base64,${base64}`;
            } catch (fileSystemError) {
                // Fallback: try using fetch with XMLHttpRequest for React Native
                console.warn('FileSystem approach failed, trying fetch fallback:', fileSystemError);

                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = function () {
                        const reader = new FileReader();
                        reader.onloadend = function () {
                            if (typeof reader.result === 'string') {
                                resolve(reader.result);
                            } else {
                                reject(new Error('Failed to convert to base64'));
                            }
                        };
                        reader.readAsDataURL(xhr.response);
                    };
                    xhr.onerror = () => reject(new Error('Network request failed'));
                    xhr.open('GET', uri);
                    xhr.responseType = 'blob';
                    xhr.send();
                });
            }
        } else {
            // Web approach using FileReader and Blob
            const response = await fetch(uri);

            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
            }

            const blob = await response.blob();

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    if (typeof reader.result === 'string') {
                        resolve(reader.result);
                    } else {
                        reject(new Error('Failed to convert URI to base64'));
                    }
                };
                reader.onerror = () => reject(reader.error || new Error('FileReader error'));
                reader.readAsDataURL(blob);
            });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to convert URI to base64: ${errorMessage}`);
    }
};