import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants';

export interface PersonData {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string;
}

interface PersonCardProps {
  person: PersonData;
  onPress?: () => void;
}

export function PersonCard({ person, onPress }: PersonCardProps) {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      testID={`person-card-${person.id}`}
      accessible={true}
      accessibilityLabel={`Usuario: ${person.name}`}
    >
      <Image source={{ uri: person.avatarUrl }} style={styles.avatar} />
      <View style={styles.contentContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {person.name}
        </Text>
        <Text style={styles.bio} numberOfLines={2}>
          {person.bio}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral.gray200,
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray800,
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: colors.neutral.gray600,
    lineHeight: 18,
  },
});