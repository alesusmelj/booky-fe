import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../constants';

export interface CommunityData {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
}

interface CommunityCardProps {
  community: CommunityData;
  onPress?: () => void;
}

export function CommunityCard({ community, onPress }: CommunityCardProps) {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      testID={`community-card-${community.id}`}
      accessible={true}
      accessibilityLabel={`Comunidad: ${community.name}`}
    >
      <View style={styles.iconContainer}>
        <MaterialIcons name="groups" size={28} color={colors.primary.main} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {community.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {community.description}
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: colors.primary.border,
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
  description: {
    fontSize: 14,
    color: colors.neutral.gray600,
    lineHeight: 18,
  },
});