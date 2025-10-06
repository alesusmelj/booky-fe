import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../constants';
import { logger } from '../utils/logger';
import { useNavigation } from '../contexts/NavigationContext';
import { useCommunities } from '../hooks';
import { CommunityDto, CreateCommunityDto } from '../types/api';

interface CommunityCardProps {
  community: CommunityDto;
  onPress: (communityId: string) => void;
  onJoin: (communityId: string) => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ community, onPress, onJoin }) => {
  // Si join_available es true: usuario NO es miembro, mostrar botón "Join", NO permitir entrar
  // Si join_available es false: usuario YA es miembro, NO mostrar botón "Join", SÍ permitir entrar
  const isUserMember = !community.join_available;
  const canEnterCommunity = isUserMember;
  const showJoinButton = community.join_available;

  return (
    <TouchableOpacity 
      style={styles.communityCard} 
      onPress={canEnterCommunity ? () => onPress(community.id) : undefined}
      activeOpacity={canEnterCommunity ? 0.7 : 1}
      disabled={!canEnterCommunity}
    >
      <View style={styles.communityImageContainer}>
        <View style={styles.communityImagePlaceholder}>
          <MaterialIcons name="groups" size={60} color={colors.neutral.white} />
        </View>
      </View>
      <View style={styles.communityContent}>
        <View style={styles.communityHeader}>
          <Text style={styles.communityName} numberOfLines={1}>
            {community.name}
          </Text>
          <View style={styles.membersBadge}>
            <Text style={styles.membersText}>
              {community.member_count} miembros
            </Text>
          </View>
        </View>
        <Text style={styles.communityDescription} numberOfLines={2}>
          {community.description}
        </Text>
        <View style={styles.communityFooter}>
          <View style={styles.adminInfo}>
            <Text style={styles.adminText}>
              Admin: {community.admin?.name} {community.admin?.lastname}
            </Text>
          </View>
          {showJoinButton ? (
            <TouchableOpacity 
              style={styles.joinButton}
              onPress={(e) => {
                e.stopPropagation();
                onJoin(community.id);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.joinButtonText}>Unirse</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.memberBadge}>
              <Text style={styles.memberBadgeText}>Miembro</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const CommunitiesScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityDescription, setNewCommunityDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const { navigate } = useNavigation();
  const {
    communities,
    loading,
    error,
    refreshing,
    searchCommunities,
    createCommunity,
    joinCommunity,
    refresh,
    fetchCommunities,
    clearError,
  } = useCommunities();

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchCommunities(searchQuery);
      } else {
        // If search is empty, fetch all communities
        searchCommunities('');
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchCommunities]);

  // Clear error when component mounts
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, []);

  const handleCommunityPress = (communityId: string) => {
    logger.info('Community selected:', communityId);
    navigate('community-detail', { communityId });
  };

  const handleJoinCommunity = async (communityId: string) => {
    console.log('🚀 Starting join process for community:', communityId);
    
    try {
      // Step 1: Join community
      console.log('📝 Step 1: Calling joinCommunity API...');
      const success = await joinCommunity(communityId);
      console.log('✅ Join result:', success);
      
      if (!success) {
        Alert.alert('Error', 'No se pudo unir a la comunidad. Intenta de nuevo.');
        return;
      }

      // Step 2: Clear search to show all communities
      console.log('🔍 Step 2: Clearing search query...');
      setSearchQuery('');
      
      // Step 3: Force refresh communities
      console.log('🔄 Step 3: Fetching fresh communities...');
      
      try {
        console.log('📡 Making GET request to fetch communities...');
        await fetchCommunities();
        console.log('✅ Communities refreshed successfully');
      } catch (refreshError) {
        console.error('❌ Refresh failed:', refreshError);
      }
      
      Alert.alert('Éxito', '¡Te has unido a la comunidad exitosamente!');
      
    } catch (error) {
      console.error('❌ Join process failed:', error);
      Alert.alert('Error', 'No se pudo unir a la comunidad. Intenta de nuevo.');
    }
  };

  const handleCreateCommunity = async () => {
    if (!newCommunityName.trim() || !newCommunityDescription.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setIsCreating(true);
    try {
      const communityData: CreateCommunityDto = {
        name: newCommunityName.trim(),
        description: newCommunityDescription.trim(),
      };

      const newCommunity = await createCommunity(communityData);
      
      if (newCommunity) {
        Alert.alert('Éxito', '¡Comunidad creada exitosamente!');
        setShowCreateModal(false);
        setNewCommunityName('');
        setNewCommunityDescription('');
      } else {
        Alert.alert('Error', 'No se pudo crear la comunidad. Intenta de nuevo.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la comunidad. Intenta de nuevo.');
    } finally {
      setIsCreating(false);
    }
  };

  const renderCommunity = ({ item }: { item: CommunityDto }) => (
    <CommunityCard
      community={item}
      onPress={handleCommunityPress}
      onJoin={handleJoinCommunity}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? 'No se encontraron comunidades' : 'No hay comunidades disponibles'}
      </Text>
      <Text style={styles.emptyStateText}>
        {searchQuery 
          ? 'Intenta ajustar los términos de búsqueda'
          : '¡Sé el primero en crear una comunidad!'
        }
      </Text>
      {!searchQuery && (
        <TouchableOpacity 
          style={styles.createFirstButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createFirstButtonText}>Crear Comunidad</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderError = () => (
    <View style={styles.errorState}>
      <Text style={styles.errorTitle}>Algo salió mal</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={refresh}>
        <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && communities.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Cargando comunidades...</Text>
      </View>
    );
  }

  if (error && communities.length === 0) {
    return renderError();
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Comunidades</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>+ Crear</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar comunidades..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.neutral.gray500}
        />
      </View>

      {/* Communities List */}
      <FlatList
        data={communities}
        renderItem={renderCommunity}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          communities.length === 0 && styles.emptyListContainer
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.primary.main]}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* Create Community Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowCreateModal(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Crear Comunidad</Text>
            <TouchableOpacity 
              onPress={handleCreateCommunity}
              style={[styles.modalSaveButton, isCreating && styles.modalSaveButtonDisabled]}
              disabled={isCreating}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color={colors.neutral.white} />
              ) : (
                <Text style={styles.modalSaveText}>Crear</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre de la Comunidad</Text>
              <TextInput
                style={styles.modalInput}
                value={newCommunityName}
                onChangeText={setNewCommunityName}
                placeholder="Ingresa el nombre de la comunidad"
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                value={newCommunityDescription}
                onChangeText={setNewCommunityDescription}
                placeholder="Describe tu comunidad"
                multiline
                numberOfLines={4}
                maxLength={200}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.gray50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.neutral.gray900,
  },
  createButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.neutral.white,
  },
  searchInput: {
    backgroundColor: colors.neutral.gray100,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.neutral.gray900,
  },
  listContainer: {
    padding: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  communityCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  communityImageContainer: {
    height: 120,
    backgroundColor: colors.neutral.gray200,
  },
  communityImage: {
    width: '100%',
    height: '100%',
  },
  communityImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityImagePlaceholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.neutral.white,
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
    fontWeight: 'bold',
    color: colors.neutral.gray900,
    flex: 1,
    marginRight: 12,
  },
  membersBadge: {
    backgroundColor: colors.primary.light,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  membersText: {
    fontSize: 12,
    color: colors.primary.main,
    fontWeight: '600',
  },
  communityDescription: {
    fontSize: 14,
    color: colors.neutral.gray600,
    lineHeight: 20,
    marginBottom: 12,
  },
  communityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adminInfo: {
    flex: 1,
  },
  adminText: {
    fontSize: 12,
    color: colors.neutral.gray500,
  },
  joinButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  joinButtonText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
  },
  memberBadge: {
    backgroundColor: colors.green[100],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.green[600],
  },
  memberBadgeText: {
    color: colors.green[600],
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.neutral.gray600,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.neutral.gray900,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.neutral.gray600,
    textAlign: 'center',
    marginBottom: 24,
  },
  createFirstButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createFirstButtonText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: colors.neutral.gray50,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.neutral.gray900,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.neutral.gray600,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 16,
    color: colors.neutral.gray600,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.neutral.gray900,
  },
  modalSaveButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  modalSaveButtonDisabled: {
    backgroundColor: colors.neutral.gray400,
  },
  modalSaveText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.neutral.gray900,
    backgroundColor: colors.neutral.white,
  },
  modalTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});