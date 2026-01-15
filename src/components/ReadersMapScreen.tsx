import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../constants';
import { UserDto } from '../services/usersService';
import { useLocationSearch } from '../hooks/useLocationSearch';
import { useNavigation } from '../contexts/NavigationContext';
import { logger } from '../utils/logger';

const { width, height } = Dimensions.get('window');

interface ReadersMapScreenProps {
  visible: boolean;
  onClose: () => void;
}

interface UserMarkerData extends UserDto {
  coordinate: {
    latitude: number;
    longitude: number;
  };
}

export const ReadersMapScreen: React.FC<ReadersMapScreenProps> = ({
  visible,
  onClose,
}) => {
  const { navigate } = useNavigation();
  const { users, loading, error, searchUsersByLocation, clearResults } = useLocationSearch();

  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: -34.6037,
    longitude: -58.3816,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [userMarkers, setUserMarkers] = useState<UserMarkerData[]>([]);

  // Convert users to markers
  useEffect(() => {
    const markers: UserMarkerData[] = users
      .filter(user => user.address?.latitude && user.address?.longitude)
      .map(user => ({
        ...user,
        coordinate: {
          latitude: user.address!.latitude!,
          longitude: user.address!.longitude!,
        },
      }));

    setUserMarkers(markers);
    logger.info('🗺️ [ReadersMapScreen] Updated user markers:', markers.length);
  }, [users]);

  // Search users when map region changes
  const handleRegionChangeComplete = useCallback((region: Region) => {
    const searchData = {
      bottom_left_latitude: region.latitude - region.latitudeDelta / 2,
      bottom_left_longitude: region.longitude - region.longitudeDelta / 2,
      top_right_latitude: region.latitude + region.latitudeDelta / 2,
      top_right_longitude: region.longitude + region.longitudeDelta / 2,
    };

    logger.info('🗺️ [ReadersMapScreen] Region changed, searching users:', searchData);
    searchUsersByLocation(searchData);
  }, [searchUsersByLocation]);

  // Get current location
  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      logger.info('📍 [ReadersMapScreen] Getting current location...');

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso Denegado', 'Se requiere permiso de ubicación.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

      setMapRegion(newRegion);
      logger.info('✅ [ReadersMapScreen] Current location set');
    } catch (error) {
      logger.error('📍 [ReadersMapScreen] Error getting current location:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación actual. Por favor intenta de nuevo.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Search location by query
  const searchLocation = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Por favor ingresa una ubicación para buscar.');
      return;
    }

    try {
      setIsLoadingLocation(true);
      logger.info('🔍 [ReadersMapScreen] Searching for:', searchQuery);

      const geocode = await Location.geocodeAsync(searchQuery);

      if (geocode.length > 0) {
        const result = geocode[0];
        const newRegion = {
          latitude: result.latitude,
          longitude: result.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };

        setMapRegion(newRegion);
        logger.info('✅ [ReadersMapScreen] Location found and set');
      } else {
        Alert.alert('Sin Resultados', 'No se encontraron ubicaciones para tu búsqueda.');
      }
    } catch (error) {
      logger.error('🔍 [ReadersMapScreen] Error searching location:', error);
      Alert.alert('Error', 'No se pudo buscar la ubicación. Por favor intenta de nuevo.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Handle marker press
  const handleMarkerPress = (user: UserDto) => {
    setSelectedUser(user);
    logger.info('👤 [ReadersMapScreen] User marker pressed:', user.id);
  };

  // Handle user profile navigation
  const handleViewProfile = () => {
    if (selectedUser) {
      logger.info('👤 [ReadersMapScreen] Navigating to profile:', selectedUser.id);
      // Navegar primero
      navigate('profile', { userId: selectedUser.id });
      // Cerrar el modal después con un pequeño delay para evitar crash del mapa
      setTimeout(() => {
        onClose();
      }, 100);
    }
  };

  // Close user info
  const handleCloseUserInfo = () => {
    setSelectedUser(null);
  };

  // Initial search when modal opens
  useEffect(() => {
    if (visible) {
      handleRegionChangeComplete(mapRegion);
    } else {
      clearResults();
      setSelectedUser(null);
    }
  }, [visible, handleRegionChangeComplete, clearResults]);

  if (!visible) {
    console.log('🗺️ [ReadersMapScreen] Not visible, returning null');
    return null;
  }

  console.log('🗺️ [ReadersMapScreen] Rendering map screen, visible:', visible);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color={colors.neutral.gray800} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mapa de Lectores</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <MaterialIcons name="search" size={20} color={colors.neutral.gray400} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar una ubicación..."
              placeholderTextColor={colors.neutral.gray400}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={searchLocation}
              editable={!isLoadingLocation}
            />
            {isLoadingLocation && (
              <ActivityIndicator size="small" color={colors.primary.main} />
            )}
          </View>
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={getCurrentLocation}
            disabled={isLoadingLocation}
          >
            <MaterialIcons name="my-location" size={20} color={colors.primary.main} />
          </TouchableOpacity>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={mapRegion}
            onRegionChangeComplete={handleRegionChangeComplete}
            showsUserLocation={true}
            showsMyLocationButton={false}
            provider={PROVIDER_GOOGLE}
          >
            {userMarkers.map((user) => (
              <Marker
                key={user.id}
                coordinate={user.coordinate}
                onPress={() => handleMarkerPress(user)}
              >
                <View style={styles.markerContainer}>
                  <Image
                    source={{ uri: user.image || 'https://via.placeholder.com/40' }}
                    style={styles.markerImage}
                  />
                </View>
              </Marker>
            ))}
          </MapView>

          {/* Loading overlay */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary.main} />
              <Text style={styles.loadingText}>Buscando lectores...</Text>
            </View>
          )}

          {/* Results count */}
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>
              {userMarkers.length} lectores encontrados
            </Text>
          </View>
        </View>

        {/* User Info Modal */}
        {selectedUser && (
          <View style={styles.userInfoOverlay}>
            <View style={styles.userInfoContainer}>
              <TouchableOpacity
                style={styles.userInfoClose}
                onPress={handleCloseUserInfo}
              >
                <MaterialIcons name="close" size={20} color={colors.neutral.gray600} />
              </TouchableOpacity>

              <View style={styles.userInfoContent}>
                <Image
                  source={{ uri: selectedUser.image || 'https://via.placeholder.com/60' }}
                  style={styles.userInfoImage}
                />
                <View style={styles.userInfoDetails}>
                  <Text style={styles.userInfoName}>
                    {selectedUser.name} {selectedUser.lastname}
                  </Text>
                  <Text style={styles.userInfoUsername}>@{selectedUser.username}</Text>
                  {selectedUser.description && (
                    <Text style={styles.userInfoDescription} numberOfLines={2}>
                      {selectedUser.description}
                    </Text>
                  )}
                  {selectedUser.address && (
                    <Text style={styles.userInfoLocation}>
                      📍 {selectedUser.address.city && `${selectedUser.address.city}, `}
                      {selectedUser.address.state}, {selectedUser.address.country}
                    </Text>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={styles.viewProfileButton}
                onPress={handleViewProfile}
              >
                <Text style={styles.viewProfileText}>Ver Perfil</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
    paddingTop: 50, // Account for status bar
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.gray800,
  },
  headerRight: {
    width: 40, // Balance the close button
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray100,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.neutral.gray800,
  },
  currentLocationButton: {
    backgroundColor: colors.neutral.gray100,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.primary.main,
    overflow: 'hidden',
    backgroundColor: colors.neutral.white,
  },
  markerImage: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: colors.neutral.gray600,
  },
  resultsContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.neutral.gray600,
  },
  userInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  userInfoContainer: {
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: height * 0.4,
  },
  userInfoClose: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  userInfoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfoImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  userInfoDetails: {
    flex: 1,
  },
  userInfoName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.gray800,
    marginBottom: 2,
  },
  userInfoUsername: {
    fontSize: 14,
    color: colors.neutral.gray500,
    marginBottom: 4,
  },
  userInfoDescription: {
    fontSize: 14,
    color: colors.neutral.gray600,
    marginBottom: 4,
    lineHeight: 20,
  },
  userInfoLocation: {
    fontSize: 12,
    color: colors.neutral.gray500,
  },
  viewProfileButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewProfileText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
  },
});
