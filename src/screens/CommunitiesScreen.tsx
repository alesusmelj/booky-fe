import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { colors } from '../constants';
import { logger } from '../utils/logger';
import { useNavigation } from '../contexts/NavigationContext';

// Mock data - should be moved to a service later
const communities = [
  {
    id: '1',
    name: 'Fantasy Book Lovers',
    members: 1243,
    image: 'https://images.unsplash.com/photo-1618944847828-82e943c3bdb7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    description: 'For lovers of fantasy literature from classics to new releases'
  },
  {
    id: '2',
    name: 'Madrid Book Club',
    members: 328,
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    description: 'Local book enthusiasts meeting monthly in Madrid'
  },
  {
    id: '3',
    name: 'Science Fiction Explorers',
    members: 892,
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    description: 'Discussing the stars, space, and everything in between'
  },
];

interface CommunityCardProps {
  community: typeof communities[0];
  onPress: (communityId: string) => void;
  onJoin: (communityId: string) => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ community, onPress, onJoin }) => {
  return (
    <TouchableOpacity 
      style={styles.communityCard} 
      onPress={() => onPress(community.id)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: community.image }} style={styles.communityImage} />
      <View style={styles.communityContent}>
        <View style={styles.communityHeader}>
          <Text style={styles.communityName} numberOfLines={1}>
            {community.name}
          </Text>
          <View style={styles.membersBadge}>
            <Text style={styles.membersText}>
              {community.members} members
            </Text>
          </View>
        </View>
        <Text style={styles.communityDescription} numberOfLines={2}>
          {community.description}
        </Text>
        <TouchableOpacity 
          style={styles.joinButton}
          onPress={() => onJoin(community.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.joinButtonText}>Join Community</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export const CommunitiesScreen: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const { navigate } = useNavigation();

  const handleCommunityPress = (communityId: string) => {
    logger.info('Community pressed:', communityId);
    navigate('community-detail', { communityId });
  };

  const handleJoinCommunity = (communityId: string) => {
    // TODO: Implement join community functionality
    logger.info('Join community:', communityId);
  };

  const handleCreateCommunity = () => {
    // TODO: Navigate to create community screen
    logger.info('Create community pressed');
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchText.toLowerCase()) ||
    community.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderCommunityCard = ({ item }: { item: typeof communities[0] }) => (
    <CommunityCard
      community={item}
      onPress={handleCommunityPress}
      onJoin={handleJoinCommunity}
    />
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateCommunity}
          activeOpacity={0.8}
        >
          <Text style={styles.createButtonText}>+ Create Community</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search communities..."
          placeholderTextColor={colors.neutral.gray400}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Communities List */}
      <FlatList
        data={filteredCommunities}
        renderItem={renderCommunityCard}
        keyExtractor={(item) => item.id}
        numColumns={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const { width } = Dimensions.get('window');
const cardWidth = width - 32; // 16px margin on each side

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.gray50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.neutral.gray900,
  },
  createButton: {
    backgroundColor: colors.primary.indigo600,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  searchInput: {
    backgroundColor: colors.neutral.gray50,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.neutral.gray900,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  listContainer: {
    padding: 16,
  },
  separator: {
    height: 16,
  },
  communityCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    width: cardWidth,
  },
  communityImage: {
    width: '100%',
    height: 128,
    resizeMode: 'cover',
  },
  communityContent: {
    padding: 16,
  },
  communityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  communityName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.gray900,
    flex: 1,
    marginRight: 8,
  },
  membersBadge: {
    backgroundColor: colors.neutral.gray100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  membersText: {
    fontSize: 12,
    color: colors.neutral.gray600,
    fontWeight: '500',
  },
  communityDescription: {
    fontSize: 14,
    color: colors.neutral.gray500,
    lineHeight: 20,
    marginBottom: 16,
  },
  joinButton: {
    backgroundColor: colors.primary.indigo50,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: colors.primary.indigo600,
    fontSize: 14,
    fontWeight: '600',
  },
});
