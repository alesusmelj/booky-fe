import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants';

interface CustomModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    showCloseButton?: boolean;
    closeButtonText?: string;
    headerRight?: React.ReactNode;
    animationType?: 'slide' | 'fade' | 'none';
    presentationStyle?: 'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen';
}

export const CustomModal: React.FC<CustomModalProps> = ({
    visible,
    onClose,
    title,
    children,
    showCloseButton = true,
    closeButtonText = 'Cerrar',
    headerRight,
    animationType = 'slide',
    presentationStyle = 'pageSheet',
}) => {
    const insets = useSafeAreaInsets();

    return (
        <Modal
            visible={visible}
            animationType={animationType}
            transparent={true}
            onRequestClose={onClose}
            statusBarTranslucent={false}
        >
            <View style={styles.overlay}>
                <View style={styles.modalCard}>
                    {/* Header */}
                    {(title || showCloseButton || headerRight) && (
                        <View style={styles.header}>
                            {showCloseButton ? (
                                <TouchableOpacity
                                    onPress={onClose}
                                    style={styles.closeButton}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Text style={styles.closeButtonText}>{closeButtonText}</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.headerSpacer} />
                            )}

                            {title && <Text style={styles.title}>{title}</Text>}

                            {headerRight ? (
                                <View style={styles.headerRight}>{headerRight}</View>
                            ) : (
                                <View style={styles.headerSpacer} />
                            )}
                        </View>
                    )}

                    {/* Content */}
                    <View style={styles.content}>{children}</View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalCard: {
        width: '100%',
        maxWidth: 500,
        backgroundColor: colors.neutral.white,
        borderRadius: 16,
        maxHeight: '80%',
        shadowColor: colors.shadow.default,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral.gray200,
        backgroundColor: colors.neutral.white,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    closeButton: {
        padding: 4,
        minWidth: 70,
    },
    closeButtonText: {
        fontSize: 16,
        color: colors.neutral.gray600,
        fontWeight: '400',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.neutral.gray900,
        textAlign: 'center',
        flex: 1,
    },
    headerRight: {
        minWidth: 70,
        alignItems: 'flex-end',
    },
    headerSpacer: {
        minWidth: 70,
    },
    content: {
        padding: 20,
    },
});
