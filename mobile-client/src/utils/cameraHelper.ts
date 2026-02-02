// Mobile Camera Handler
// This module provides camera capture functionality that bypasses the native file picker
// when photos are mandatory, ensuring camera-only access.

import { Ref } from 'react';

export interface CameraPhoto {
    dataUrl: string;
    blob: Blob;
}

export async function openMobileCamera(
    videoRef: Ref<HTMLVideoElement>,
    canvasRef: Ref<HTMLCanvasElement>
): Promise<CameraPhoto | null> {
    try {
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }, // Prefer back camera
            audio: false
        });

        return new Promise((resolve, reject) => {
            const video = (videoRef as any).current;
            const canvas = (canvasRef as any).current;

            if (!video || !canvas) {
                reject(new Error('Video or canvas ref not available'));
                return;
            }

            // Attach stream to video element
            video.srcObject = stream;
            video.play();

            // Wait for user to capture
            // This would need to be triggered by a button click in the UI
            const capturePhoto = () => {
                const context = canvas.getContext('2d');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context?.drawImage(video, 0, 0);

                canvas.toBlob((blob) => {
                    // Stop camera stream
                    stream.getTracks().forEach(track => track.stop());

                    if (blob) {
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                        resolve({ dataUrl, blob });
                    } else {
                        reject(new Error('Failed to capture photo'));
                    }
                }, 'image/jpeg', 0.85);
            };

            // Store capture function for later use
            (window as any).__capturePhoto = capturePhoto;
        });
    } catch (error) {
        console.error('Camera access error:', error);
        return null;
    }
}
