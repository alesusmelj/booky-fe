import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants';

export interface CommunityData {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
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
      <Image source={{ uri: community.iconUrl }} style={styles.icon} />
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
  icon: {
    width: 48,
    height: 48,
    borderRadius: 8,
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
  description: {
    fontSize: 14,
    color: colors.neutral.gray600,
    lineHeight: 18,
  },
});