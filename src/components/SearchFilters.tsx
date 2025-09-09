import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, strings } from '../constants';

export type FilterType = 'books' | 'people' | 'communities';

interface SearchFiltersProps {
  activeFilters: FilterType[];
  onFilterChange: (filters: FilterType[]) => void;
}

export function SearchFilters({ activeFilters, onFilterChange }: SearchFiltersProps) {
  const filters: { key: FilterType; label: string }[] = [
    { key: 'books', label: strings.search.filters.books },
    { key: 'people', label: strings.search.filters.people },
    { key: 'communities', label: strings.search.filters.communities },
  ];

  const handleFilterPress = (filterKey: FilterType) => {
    if (activeFilters.includes(filterKey)) {
      // Remove filter if already active
      onFilterChange(activeFilters.filter(f => f !== filterKey));
    } else {
      // Add filter if not active
      onFilterChange([...activeFilters, filterKey]);
    }
  };

  return (
    <View style={styles.container}>
      {filters.map((filter, index) => {
        const isActive = activeFilters.includes(filter.key);
        return (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              isActive && styles.activeFilterButton,
              index === filters.length - 1 && { marginRight: 0 },
            ]}
            onPress={() => handleFilterPress(filter.key)}
            testID={`filter-${filter.key}`}
            accessible={true}
            accessibilityLabel={isActive ? `Desactivar filtro ${filter.label}` : `Activar filtro ${filter.label}`}
          >
            <Text
              style={[
                styles.filterText,
                isActive && styles.activeFilterText,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  filterButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.neutral.gray100,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: colors.primary.main,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.neutral.gray600,
    textAlign: 'center',
  },
  activeFilterText: {
    color: colors.neutral.white,
  },
});