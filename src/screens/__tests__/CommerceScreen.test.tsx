import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CommerceScreen from '../CommerceScreen';

jest.mock('../../components/CommerceToggle', () => ({
    CommerceToggle: ({ activeTab, onTabChange }: any) => {
        const { View, Text, TouchableOpacity } = require('react-native');
        return (
            <View testID="mock-commerce-toggle">
                <Text>Toggle: {activeTab}</Text>
                <TouchableOpacity onPress={() => onTabChange('trade')} testID="btn-trade"><Text>Trade</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => onTabChange('library')} testID="btn-library"><Text>Library</Text></TouchableOpacity>
            </View>
        );
    },
}));

jest.mock('../../components/TradeBooksView', () => ({
    TradeBooksView: () => {
        const { Text } = require('react-native');
        return <Text>MockTradeBooksView</Text>;
    },
}));

jest.mock('../../components/MyLibraryView', () => ({
    MyLibraryView: () => {
        const { Text } = require('react-native');
        return <Text>MockMyLibraryView</Text>;
    },
}));

describe('CommerceScreen', () => {
    it('renders correctly and defaults to trade tab', () => {
        const { getByText, queryByText } = render(<CommerceScreen />);

        // Header Title
        expect(getByText('Comercio')).toBeTruthy();

        // Initial tab is Trade
        expect(getByText('Toggle: trade')).toBeTruthy();
        expect(getByText('MockTradeBooksView')).toBeTruthy();
        expect(queryByText('MockMyLibraryView')).toBeNull();
    });

    it('switches between tabs', () => {
        const { getByText, getByTestId, queryByText } = render(<CommerceScreen />);

        // Switch to library
        fireEvent.press(getByTestId('btn-library'));
        expect(getByText('Toggle: library')).toBeTruthy();
        expect(getByText('MockMyLibraryView')).toBeTruthy();
        expect(queryByText('MockTradeBooksView')).toBeNull();

        // Switch to trade
        fireEvent.press(getByTestId('btn-trade'));
        expect(getByText('Toggle: trade')).toBeTruthy();
        expect(getByText('MockTradeBooksView')).toBeTruthy();
        expect(queryByText('MockMyLibraryView')).toBeNull();
    });
});
