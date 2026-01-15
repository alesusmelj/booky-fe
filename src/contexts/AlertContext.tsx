import React, { createContext, useContext, useState, useCallback } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants';

interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface AlertOptions {
    title: string;
    message: string;
    buttons?: AlertButton[];
}

interface AlertContextType {
    showAlert: (options: AlertOptions) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within AlertProvider');
    }
    return context;
};

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [alertOptions, setAlertOptions] = useState<AlertOptions | null>(null);

    const showAlert = useCallback((options: AlertOptions) => {
        setAlertOptions(options);
        setVisible(true);
    }, []);

    const hideAlert = useCallback(() => {
        setVisible(false);
        setTimeout(() => setAlertOptions(null), 300);
    }, []);

    const handleButtonPress = useCallback((button?: AlertButton) => {
        hideAlert();
        if (button?.onPress) {
            setTimeout(() => button.onPress!(), 100);
        }
    }, [hideAlert]);

    const buttons = alertOptions?.buttons || [{ text: 'OK', style: 'default' as const }];

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            <Modal
                visible={visible}
                transparent={true}
                animationType="fade"
                onRequestClose={hideAlert}
                statusBarTranslucent={false}
            >
                <View style={styles.overlay}>
                    <View style={styles.alertCard}>
                        {alertOptions?.title && (
                            <Text style={styles.title}>{alertOptions.title}</Text>
                        )}
                        {alertOptions?.message && (
                            <Text style={styles.message}>{alertOptions.message}</Text>
                        )}
                        <View style={styles.buttonsContainer}>
                            {buttons.map((button, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.button,
                                        button.style === 'cancel' && styles.cancelButton,
                                        button.style === 'destructive' && styles.destructiveButton,
                                        index < buttons.length - 1 && styles.buttonMargin,
                                    ]}
                                    onPress={() => handleButtonPress(button)}
                                >
                                    <Text
                                        style={[
                                            styles.buttonText,
                                            button.style === 'cancel' && styles.cancelButtonText,
                                            button.style === 'destructive' && styles.destructiveButtonText,
                                        ]}
                                    >
                                        {button.text}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>
        </AlertContext.Provider>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    alertCard: {
        width: '100%',
        maxWidth: 320,
        backgroundColor: colors.neutral.white,
        borderRadius: 16,
        padding: 24,
        shadowColor: colors.shadow.default,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.neutral.gray900,
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: colors.neutral.gray700,
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 22,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: colors.primary.main,
        alignItems: 'center',
    },
    buttonMargin: {
        marginRight: 8,
    },
    cancelButton: {
        backgroundColor: colors.neutral.gray200,
    },
    destructiveButton: {
        backgroundColor: colors.status.error,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral.white,
    },
    cancelButtonText: {
        color: colors.neutral.gray700,
    },
    destructiveButtonText: {
        color: colors.neutral.white,
    },
});
