import { useRef, useCallback } from 'react';
import { logger } from '../utils/logger';

interface UseBarcodeHandlerOptions {
    debounceMs?: number;
    onBarcodeProcessed: (isbn: string) => void;
}

export const useBarcodeHandler = ({
    debounceMs = 1000,
    onBarcodeProcessed
}: UseBarcodeHandlerOptions) => {
    const lastProcessedRef = useRef<string | null>(null);
    const lastProcessTimeRef = useRef<number>(0);
    const processingRef = useRef<boolean>(false);

    const handleBarcodeScanned = useCallback((scannedISBN: string) => {
        const now = Date.now();
        const timeSinceLastProcess = now - lastProcessTimeRef.current;

        // Multiple protection layers
        if (processingRef.current) {
            logger.info('🛡️ [BARCODE-HANDLER] Already processing, ignoring duplicate');
            return;
        }

        if (lastProcessedRef.current === scannedISBN && timeSinceLastProcess < debounceMs) {
            logger.info('🛡️ [BARCODE-HANDLER] Same ISBN within debounce period, ignoring:', {
                isbn: scannedISBN,
                timeSince: timeSinceLastProcess,
                debounceMs
            });
            return;
        }

        // Set protection flags immediately
        processingRef.current = true;
        lastProcessedRef.current = scannedISBN;
        lastProcessTimeRef.current = now;

        logger.info('✅ [BARCODE-HANDLER] Processing new barcode:', scannedISBN);

        try {
            onBarcodeProcessed(scannedISBN);
        } catch (error) {
            logger.error('❌ [BARCODE-HANDLER] Error processing barcode:', error);
        } finally {
            // Reset processing flag after a short delay
            setTimeout(() => {
                processingRef.current = false;
            }, 500);
        }
    }, [debounceMs, onBarcodeProcessed]);

    const reset = useCallback(() => {
        lastProcessedRef.current = null;
        lastProcessTimeRef.current = 0;
        processingRef.current = false;
        logger.info('🔄 [BARCODE-HANDLER] Handler reset');
    }, []);

    return {
        handleBarcodeScanned,
        reset
    };
};
