// Utility function to replace Alert.alert with custom alert
import { useAlert } from '../contexts/AlertContext';

export const createAlert = (showAlert: ReturnType<typeof useAlert>['showAlert']) => ({
    alert: (title: string, message?: string, buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>) => {
        showAlert({
            title,
            message: message || '',
            buttons: buttons || [{ text: 'OK', style: 'default' }],
        });
    },
});
