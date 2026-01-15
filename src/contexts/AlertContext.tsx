import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../constants';

interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
    icon?: string;
    iconFamily?: 'MaterialIcons' | 'Feather' | 'Ionicons';
}

interface AlertOptions {
    title: string;
    message: string;
    buttons?: AlertButton[];
    layout?: 'row' | 'column' | 'grid';
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
    const layout = alertOptions?.layout || (buttons.length > 2 ? 'column' : 'row'); // Auto layout

    // Helper to render icon
    const renderIcon = (button: AlertButton, color: string) => {
        if (!button.icon) return null;
        const size = layout === 'grid' ? 32 : 20;
        const style = layout === 'grid' ? { marginBottom: 8 } : { marginRight: 8 };

        if (button.iconFamily === 'Feather') {
            return <Feather name={button.icon as any} size={size} color={color} style={style} />;
        }
        if (button.iconFamily === 'Ionicons') {
            return <Ionicons name={button.icon as any} size={size} color={color} style={style} />;
        }
        return <MaterialIcons name={button.icon as any} size={size} color={color} style={style} />;
    };

    // Filter validation needed for grid layout to separate cancel button if desired, 
    // but for simplicity we will just render them based on layout prop.
    const isGrid = layout === 'grid';
    const mainButtons = isGrid ? buttons.filter(b => b.style !== 'cancel') : buttons;
    const cancelButtons = isGrid ? buttons.filter(b => b.style === 'cancel') : [];

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

                        {isGrid ? (
                            // Grid Layout
                            <>
                                <View style={styles.gridContainer}>
                                    {mainButtons.map((button, index) => {
                                        const isDestructive = button.style === 'destructive';
                                        const buttonColor = isDestructive ? colors.neutral.white : colors.neutral.white; // Text/Icon color
                                        // Background handled by styles

                                        return (
                                            <TouchableOpacity
                                                key={`grid-${index}`}
                                                style={[
                                                    styles.gridButton,
                                                    button.style === 'destructive' && styles.destructiveButton,
                                                ]}
                                                onPress={() => handleButtonPress(button)}
                                            >
                                                {renderIcon(button, buttonColor)}
                                                <Text style={[styles.gridButtonText, button.style === 'destructive' && styles.destructiveButtonText]}>
                                                    {button.text}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                                {cancelButtons.map((button, index) => (
                                    <TouchableOpacity
                                        key={`cancel-${index}`}
                                        style={[styles.button, styles.cancelButton, { marginTop: 16 }]}
                                        onPress={() => handleButtonPress(button)}
                                    >
                                        <Text style={[styles.buttonText, styles.cancelButtonText]}>{button.text}</Text>
                                    </TouchableOpacity>
                                ))}
                            </>
                        ) : (
                            // Row/Column Layout
                            <View style={[
                                styles.buttonsContainer,
                                layout === 'column' && styles.buttonsColumn
                            ]}>
                                {buttons.map((button, index) => {
                                    const isCancel = button.style === 'cancel';
                                    const isDestructive = button.style === 'destructive';
                                    const textColor = isCancel ? colors.neutral.gray700 : colors.neutral.white;

                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.button,
                                                isCancel && styles.cancelButton,
                                                isDestructive && styles.destructiveButton,
                                                layout === 'row' && index < buttons.length - 1 && styles.buttonMargin,
                                                layout === 'column' && index < buttons.length - 1 && styles.buttonMarginBottom,
                                            ]}
                                            onPress={() => handleButtonPress(button)}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                {renderIcon(button, textColor)}
                                                <Text
                                                    style={[
                                                        styles.buttonText,
                                                        isCancel && styles.cancelButtonText,
                                                        isDestructive && styles.destructiveButtonText,
                                                    ]}
                                                >
                                                    {button.text}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        )}
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
    },
    buttonsColumn: {
        flexDirection: 'column',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 16,
    },
    gridButton: {
        width: 100,
        height: 100,
        backgroundColor: colors.primary.main,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    gridButtonText: {
        color: colors.neutral.white,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
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
    buttonMarginBottom: {
        marginBottom: 12,
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
