import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  RefreshControl,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { colors } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useGamification } from '../hooks/useGamification';
import { useBooks, useBarcodeHandler, useUserFollow, useChats, useRating } from '../hooks';
import { AchievementCard } from '../components/AchievementCard';
import { UserLibraryBookCard } from '../components/BookCard';
import { BarcodeScannerWrapper } from '../components/BarcodeScannerWrapper';
import { AddBookToLibraryDto, UpdateStatusDto, BooksService } from '../services/booksService';
import { UsersService, UserUpdateDto } from '../services/usersService';
import { AddressDto } from '../types/api';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { logger } from '../utils/logger';

const { width } = Dimensions.get('window');

interface ProfileScreenProps {
  route?: {
    params?: {
      userId?: string;
    };
  };
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ route }) => {
  const { user, refreshUser } = useAuth();
  const { navigate } = useNavigation();
  const { createOrGetChat } = useChats();
  const userId = route?.params?.userId || user?.id;
  const isOwnProfile = !route?.params?.userId || route.params.userId === user?.id;

  const [activeTab, setActiveTab] = useState<'library' | 'reviews' | 'achievements'>('library');
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState<'all' | 'READING' | 'READ' | 'TO_READ' | 'WISHLIST' | 'favorites'>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // State for other user's profile data
  const [profileUserData, setProfileUserData] = useState<any>(null);
  const [loadingProfileUser, setLoadingProfileUser] = useState(false);
  
  // State to force image refresh
  const [imageRefreshKey, setImageRefreshKey] = useState(0);
  
  // Add Book Modal states

  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  
  // Debug: Log when showBarcodeScanner changes
  useEffect(() => {
    logger.info('📱 [PROFILE] showBarcodeScanner state changed to:', showBarcodeScanner);
  }, [showBarcodeScanner]);
  const [isbn, setIsbn] = useState('');
  const [readingStatus, setReadingStatus] = useState<'WISHLIST' | 'READING' | 'TO_READ' | 'READ'>('READING');
  const [bookPreview, setBookPreview] = useState<any>(null);
  const [loadingBookData, setLoadingBookData] = useState(false);
  const [isbnScannedMessage, setIsbnScannedMessage] = useState<string | null>(null);
  const [lastFetchedISBN, setLastFetchedISBN] = useState<string | null>(null);
  
  // Barcode handler with debounce protection
  const handleBarcodeScannedInternal = (scannedISBN: string) => {
    logger.info('📱 [PROFILE] Processing scanned ISBN:', scannedISBN);
    
    // Fill the ISBN input field and auto-fetch book data
    setIsbn(scannedISBN);
    setShowBarcodeScanner(false);
    
    // Show success message
    setIsbnScannedMessage(`📷 ISBN scanned: ${scannedISBN}`);
    
    // Auto-fetch book data immediately (mark as from scanner to avoid duplicate alerts)
    fetchBookByISBN(scannedISBN, true);
    
    // Reopen the Add Book modal so user can review and add manually
    setTimeout(() => {
      setShowAddBookModal(true);
      logger.info('📱 [PROFILE] Add Book modal reopened with scanned ISBN and book data');
      
      // Clear the message after a few seconds
      setTimeout(() => {
        setIsbnScannedMessage(null);
      }, 3000);
    }, 300);
  };

  const { handleBarcodeScanned } = useBarcodeHandler({
    debounceMs: 2000, // 2 second debounce
    onBarcodeProcessed: handleBarcodeScannedInternal
  });
  
  // Edit Profile Modal State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    lastname: '',
    description: '',
  });
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressDto | null>(null);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Map states
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: -34.6037,
    longitude: -58.3816,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markerCoordinate, setMarkerCoordinate] = useState({
    latitude: -34.6037,
    longitude: -58.3816,
  });
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const {
    profile,
    userAchievements,
    unnotifiedAchievements,
    loading: gamificationLoading,
    getUserProfile,
    getUserAchievements,
    getUnnotifiedAchievements,
    markAchievementsAsNotified,
  } = useGamification();

  const { getUserRatings } = useRating();

  const {
    userBooks,
    loading: booksLoading,
    getUserLibrary,
    addBookToLibrary,
    getBookByIsbn,
  } = useBooks();

  const { isFollowing, toggleFollow, loading: followLoading, error: followError } = useUserFollow(userId!);

  const profileUser = isOwnProfile ? user : profileUserData;

  // Log when profileUser changes to debug image updates
  useEffect(() => {
    if (profileUser) {
      logger.info('🔄 [PROFILE] profileUser updated:', {
        id: profileUser.id,
        name: profileUser.name,
        hasImage: !!profileUser.image,
        imagePreview: profileUser.image ? profileUser.image.substring(0, 50) + '...' : 'No image',
        isOwnProfile
      });
    }
  }, [profileUser?.image, profileUser?.name, isOwnProfile]);

  // Debug address picker state
  useEffect(() => {
    logger.info('📍 [ProfileScreen] showAddressPicker state changed:', showAddressPicker);
  }, [showAddressPicker]);

  useEffect(() => {
    if (userId) {
      loadProfileData();
    }
  }, [userId]);

  const loadUserReviews = useCallback(async () => {
    if (!userId) return;
    
    setReviewsLoading(true);
    try {
      const reviews = await getUserRatings(userId);
      setUserReviews(reviews);
      logger.info('✅ [ProfileScreen] User reviews loaded:', {
        userId,
        reviewsCount: reviews.length,
        reviews: reviews.map(r => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          date: r.date_created
        }))
      });
    } catch (error) {
      logger.error('❌ [ProfileScreen] Error loading user reviews:', error);
      setUserReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [userId, getUserRatings]);

  useEffect(() => {
    if (activeTab === 'reviews' && userId) {
      loadUserReviews();
    }
  }, [activeTab, loadUserReviews]);

  const loadOtherUserData = useCallback(async (targetUserId: string) => {
    if (targetUserId === user?.id) return; // Skip if it's current user
    
    try {
      setLoadingProfileUser(true);
      logger.info('👤 Loading other user data for:', targetUserId);
      
      const userData = await UsersService.getUserById(targetUserId);
      setProfileUserData(userData);
      
      logger.info('✅ Other user data loaded successfully');
    } catch (error) {
      logger.error('❌ Error loading other user data:', error);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setLoadingProfileUser(false);
    }
  }, [user?.id]);

  const loadProfileData = useCallback(async () => {
    if (!userId) return;

    try {
      // Load gamification and library data
      await Promise.all([
        getUserProfile(userId),
        getUserAchievements(userId),
        getUserLibrary(userId),
        getUnnotifiedAchievements(userId),
      ]);
      
      // If viewing another user's profile, load their basic data
      if (!isOwnProfile && userId) {
        await loadOtherUserData(userId);
      }
    } catch (error) {
      logger.error('❌ Error loading profile data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    }
  }, [userId, getUserProfile, getUserAchievements, getUserLibrary, getUnnotifiedAchievements, isOwnProfile, loadOtherUserData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  }, [loadProfileData]);

  const handleAchievementPress = (achievement: any) => {
    setSelectedAchievement(achievement);
  };

  const handleCloseAchievementModal = () => {
    setSelectedAchievement(null);
  };

  const handleMarkAchievementsAsNotified = async () => {
    if (!userId || unnotifiedAchievements.length === 0) return;

    const achievementIds = unnotifiedAchievements.map(a => a.id);
    await markAchievementsAsNotified(userId, achievementIds);
  };

  const handleStartChat = async () => {
    if (!userId || isOwnProfile) return;

    try {
      logger.info('💬 [ProfileScreen] Starting chat with user:', { userId });
      const chat = await createOrGetChat(userId);
      
      if (chat) {
        logger.info('💬 [ProfileScreen] Chat created/retrieved, navigating to chat detail:', { 
          chatId: chat.id,
          otherUser: chat.other_user.name 
        });
        navigate('ChatDetail', { 
          chatId: chat.id, 
          otherUser: chat.other_user 
        });
      } else {
        Alert.alert('Error', 'No se pudo iniciar el chat');
      }
    } catch (error) {
      logger.error('❌ [ProfileScreen] Error starting chat:', error);
      Alert.alert('Error', 'No se pudo iniciar el chat');
    }
  };

  const getFilteredBooks = () => {
    if (!userBooks) return [];

    switch (libraryFilter) {
      case 'all':
        return userBooks; // Show all books
      case 'favorites':
        return userBooks.filter(book => book.favorite);
      case 'READ':
        return userBooks.filter(book => book.status === 'READ'); // Handle READ -> read mapping
      default:
        return userBooks.filter(book => book.status === libraryFilter);
    }
  };

  // Add Book Modal Functions
  const handleScanISBN = () => {
    logger.info('📱 [PROFILE] User pressed Scan book ISBN button - USING DIRECT APPROACH');
    
    // DIRECT SOLUTION: Close the add book modal and show scanner directly
    setShowAddBookModal(false);
    
    // Small delay to ensure modal closes, then show scanner
    setTimeout(() => {
      logger.info('📱 [PROFILE] Opening scanner directly');
      setShowBarcodeScanner(true);
    }, 100);
  };


  const updateBookStatus = async (bookId: string, newStatus: 'WISHLIST' | 'READING' | 'TO_READ' | 'READ') => {
    try {
      logger.info('📚 [PROFILE] Updating book status:', { bookId, newStatus });
      
      // Map READ to read for backend compatibility
      const statusData: UpdateStatusDto = { status: newStatus };
      
      await BooksService.updateBookStatus(bookId, statusData);
      
      // Refresh user library
      if (userId) {
        await loadProfileData();
      }
      
      logger.info('✅ [PROFILE] Book status updated successfully');
    } catch (error) {
      logger.error('❌ [PROFILE] Error updating book status:', error);
      Alert.alert('Error', 'Failed to update book status. Please try again.');
    }
  };

  const toggleBookFavorite = async (bookId: string) => {
    try {
      logger.info('⭐ [PROFILE] Toggling book favorite:', { bookId });
      
      await BooksService.toggleBookFavorite(bookId);
      
      // Refresh user library
      if (userId) {
        await getUserLibrary(userId);
      }
      
      logger.info('✅ [PROFILE] Book favorite toggled successfully');
    } catch (error) {
      logger.error('❌ [PROFILE] Error toggling book favorite:', error);
      Alert.alert('Error', 'Failed to update favorite status. Please try again.');
    }
  };

  const handleCloseBarcodeScanner = () => {
    setShowBarcodeScanner(false);
  };

  // Edit Profile Functions
  const handleEditProfile = () => {
    if (profileUser) {
      setEditFormData({
        name: profileUser.name || '',
        lastname: profileUser.lastname || '',
        description: profileUser.description || '',
      });
      setSelectedImageUri(null);
      setSelectedAddress(profileUser.address || null);
      setShowEditProfileModal(true);
    }
  };

  const handleImagePicker = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to select a profile picture.');
        return;
      }

      // Show action sheet
      Alert.alert(
        'Select Profile Picture',
        'Choose how you want to select your profile picture',
        [
          {
            text: 'Camera',
            onPress: async () => {
              const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
              if (cameraPermission.status !== 'granted') {
                Alert.alert('Permission needed', 'Sorry, we need camera permissions to take a picture.');
                return;
              }

              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                setSelectedImageUri(result.assets[0].uri);
              }
            },
          },
          {
            text: 'Photo Library',
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                setSelectedImageUri(result.assets[0].uri);
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      logger.error('❌ Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleAddressSelect = (address: AddressDto) => {
    setSelectedAddress(address);
    logger.info('📍 [PROFILE] Address selected:', address);
  };

  const handleRemoveAddress = () => {
    setSelectedAddress(null);
    logger.info('📍 [PROFILE] Address removed');
  };

  // Map functions
  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      logger.info('📍 [ProfileScreen] Getting current location...');

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setMapRegion(newRegion);
      setMarkerCoordinate({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Get address from coordinates
      await getAddressFromCoordinates(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      logger.error('📍 [ProfileScreen] Error getting current location:', error);
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const searchLocation = async () => {
    if (!addressSearchQuery.trim()) {
      Alert.alert('Error', 'Please enter a location to search.');
      return;
    }

    try {
      setIsLoadingLocation(true);
      logger.info('📍 [ProfileScreen] Searching for:', addressSearchQuery);

      const geocode = await Location.geocodeAsync(addressSearchQuery);
      
      if (geocode.length > 0) {
        const result = geocode[0];
        const newRegion = {
          latitude: result.latitude,
          longitude: result.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setMapRegion(newRegion);
        setMarkerCoordinate({
          latitude: result.latitude,
          longitude: result.longitude,
        });

        // Get detailed address
        await getAddressFromCoordinates(result.latitude, result.longitude);
      } else {
        Alert.alert('No Results', 'No locations found for your search.');
      }
    } catch (error) {
      logger.error('📍 [ProfileScreen] Error searching location:', error);
      Alert.alert('Error', 'Failed to search location. Please try again.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const addressDto: AddressDto = {
          id: `selected-${Date.now()}`,
          state: address.region || address.subregion || 'Unknown State',
          city: address.city || address.district || address.subregion || 'Unknown City',
          country: address.country || 'Unknown Country',
          latitude,
          longitude,
        };

        setSelectedAddress(addressDto);
        logger.info('📍 [ProfileScreen] Address found:', addressDto);
      }
    } catch (error) {
      logger.error('📍 [ProfileScreen] Error getting address:', error);
    }
  };

  const onMapPress = (event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    setMarkerCoordinate(coordinate);
    getAddressFromCoordinates(coordinate.latitude, coordinate.longitude);
  };

  const handleSaveProfile = async () => {
    logger.info('🔄 [PROFILE] handleSaveProfile called');
    logger.info('🔄 [PROFILE] profileUser:', profileUser);
    logger.info('🔄 [PROFILE] editFormData:', editFormData);
    logger.info('🔄 [PROFILE] selectedImageUri:', selectedImageUri);
    
    if (!profileUser) {
      logger.warn('⚠️ [PROFILE] No profileUser, returning early');
      return;
    }

    try {
      setIsUpdatingProfile(true);
      logger.info('🔄 [PROFILE] Starting profile update...');

      const updateData: UserUpdateDto = {
        id: profileUser.id,
        name: editFormData.name.trim(),
        lastname: editFormData.lastname.trim(),
        description: editFormData.description.trim() || undefined,
        address: selectedAddress || undefined,
      };

      logger.info('🔄 [PROFILE] Update data prepared:', updateData);
      logger.info('🔄 [PROFILE] Calling UsersService.updateUserProfile...');

      const updatedUser = await UsersService.updateUserProfile(updateData, selectedImageUri || undefined);
      
      logger.info('✅ [PROFILE] UsersService.updateUserProfile completed:', updatedUser);
      
      // Close modal and reset form state
      setShowEditProfileModal(false);
      setSelectedImageUri(null);
      setSelectedAddress(null);
      setEditFormData({
        name: '',
        lastname: '',
        description: '',
      });
      
      // Refresh profile data to get updated information
      logger.info('🔄 [PROFILE] Refreshing profile data...');
      logger.info('🔄 [PROFILE] Current user before refresh:', {
        id: user?.id,
        name: user?.name,
        hasImage: !!user?.image,
        imagePreview: user?.image ? user.image.substring(0, 50) + '...' : 'No image'
      });
      
      await Promise.all([
        loadProfileData(), // Refresh gamification and library data
        refreshUser(),     // Refresh user basic info (name, lastname, description, image)
      ]);
      
      logger.info('🔄 [PROFILE] Current user after refresh:', {
        id: user?.id,
        name: user?.name,
        hasImage: !!user?.image,
        imagePreview: user?.image ? user.image.substring(0, 50) + '...' : 'No image'
      });
      
      // Force a small delay to ensure state updates have propagated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force image refresh by updating the key
      setImageRefreshKey(prev => prev + 1);
      
      Alert.alert('Success', 'Profile updated successfully!');
      logger.info('✅ Profile updated successfully');
    } catch (error) {
      logger.error('❌ Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsUpdatingProfile(false);
      logger.info('🔄 [PROFILE] handleSaveProfile completed, isUpdatingProfile set to false');
    }
  };

  const fetchBookByISBN = async (isbnValue: string, fromScanner: boolean = false) => {
    if (!isbnValue.trim()) {
      setBookPreview(null);
      return;
    }

    const cleanISBN = isbnValue.trim();
    
    // Prevent duplicate calls - if we just fetched this ISBN, skip
    if (lastFetchedISBN === cleanISBN && !fromScanner) {
      logger.info('📚 [PROFILE] Skipping duplicate fetch for ISBN:', cleanISBN);
      return;
    }

    // If already loading, don't make another call
    if (loadingBookData) {
      logger.info('📚 [PROFILE] Already loading book data, skipping duplicate call');
      return;
    }

    setLastFetchedISBN(cleanISBN);
    setLoadingBookData(true);
    
    try {
      logger.info('📚 [PROFILE] Fetching book data for ISBN:', cleanISBN);
      const bookData = await getBookByIsbn(cleanISBN);
      
      if (bookData) {
        setBookPreview(bookData);
        logger.info('📚 [PROFILE] Book data fetched successfully:', bookData.title);
      } else {
        setBookPreview(null);
        // Only show alert if this is from scanner - not from typing
        if (fromScanner) {
          // Use setTimeout to ensure only one alert shows
          setTimeout(() => {
            Alert.alert('Book Not Found', 'No book found with this ISBN. You can still add it manually.');
          }, 100);
        }
      }
    } catch (error) {
      logger.error('📚 [PROFILE] Error fetching book data:', error);
      setBookPreview(null);
      // Only show alert if this is from scanner - not from typing
      if (fromScanner) {
        // Use setTimeout to ensure only one alert shows
        setTimeout(() => {
          Alert.alert('Error', 'Failed to fetch book data. You can still add the book manually.');
        }, 100);
      }
    } finally {
      setLoadingBookData(false);
    }
  };

  const handleISBNChange = (value: string) => {
    setIsbn(value);
    // Auto-fetch book data when ISBN is complete (typically 10 or 13 digits)
    if (value.length >= 10) {
      fetchBookByISBN(value);
    } else {
      setBookPreview(null);
    }
  };

  const handleAddBook = async () => {
    if (!isbn.trim() || !readingStatus) {
      Alert.alert('Error', 'Please enter ISBN and select reading status');
      return;
    }

    try {
      const bookData: AddBookToLibraryDto = {
        isbn: isbn.trim(),
        status: readingStatus,
      };

      const success = await addBookToLibrary(bookData);
      if (success) {
        setShowAddBookModal(false);
        setIsbn('');
        setReadingStatus('READING');
        setBookPreview(null);
        
        // Refresh user library, gamification profile, and achievements
        if (userId) {
          await Promise.all([
            getUserLibrary(userId),
            getUserProfile(userId), // Refresh gamification profile for points/level updates
            getUserAchievements(userId), // Refresh achievements in case new ones were unlocked
            getUnnotifiedAchievements(userId), // Check for new achievement notifications
          ]);
        }
        
        const bookTitle = bookPreview?.title || 'Book';
        Alert.alert('Success', `${bookTitle} added to your library!`);
      }
    } catch (error) {
      logger.error('❌ [PROFILE] Error adding book:', error);
      Alert.alert('Error', 'Failed to add book to library');
    }
  };

  const libraryFilters = [
    { id: 'all' as const, label: 'All Books', count: userBooks?.length || 0, icon: 'library-books', iconFamily: 'MaterialIcons' as const },
    { id: 'READING' as const, label: 'Reading', count: userBooks?.filter(b => b.status === 'READING').length || 0, icon: 'book-open', iconFamily: 'Feather' as const },
    { id: 'favorites' as const, label: 'Favorites', count: userBooks?.filter(b => b.favorite).length || 0, icon: 'favorite', iconFamily: 'MaterialIcons' as const },
    { id: 'READ' as const, label: 'Read', count: userBooks?.filter(b => b.status === 'READ').length || 0 },
    { id: 'TO_READ' as const, label: 'To Read', count: userBooks?.filter(b => b.status === 'TO_READ').length || 0, icon: 'bookmark', iconFamily: 'Feather' as const },
    { id: 'WISHLIST' as const, label: 'Wishlist', count: userBooks?.filter(b => b.status === 'WISHLIST').length || 0, icon: 'star', iconFamily: 'Feather' as const },
  ];

  const filteredBooks = getFilteredBooks();

  if (!profileUser || loadingProfileUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.profileLoadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.profileLoadingText}>
            {loadingProfileUser ? 'Cargando perfil...' : 'Loading profile...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.profileInfo}>
              <Image
                key={`profile-image-${profileUser.id}-${imageRefreshKey}`}
                source={{ uri: profileUser.image || 'https://via.placeholder.com/120' }}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {profileUser.name} {profileUser.lastname}
                </Text>
                <Text style={styles.username}>@{profileUser.username}</Text>
                {profileUser.description && (
                  <Text style={styles.bio}>{profileUser.description}</Text>
                )}
                {profileUser.address && (
                  <View style={styles.locationContainer}>
                    <MaterialIcons name="location-on" size={16} color={colors.neutral.gray500} />
                    <Text style={styles.locationText}>
                      {profileUser.address.city && `${profileUser.address.city}, `}{profileUser.address.state}, {profileUser.address.country}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {isOwnProfile ? (
              <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[
                    styles.followButton,
                    isFollowing && styles.followingButton,
                    followLoading && styles.followButtonDisabled,
                  ]}
                  onPress={async () => {
                    if (userId) {
                      const success = await toggleFollow();
                      if (success) {
                        // Refrescar la pantalla después de seguir/dejar de seguir
                        await loadProfileData();
                      }
                    }
                  }}
                  disabled={followLoading}
                >
                  {followLoading ? (
                    <ActivityIndicator size="small" color={colors.neutral.white} />
                  ) : (
                    <Text style={[
                      styles.followButtonText,
                      isFollowing && styles.followingButtonText,
                    ]}>
                      {isFollowing ? 'Dejar de seguir' : 'Seguir'}
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.messageButton}
                  onPress={handleStartChat}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="chat-bubble-outline" size={16} color={colors.neutral.gray800} />
                  <Text style={styles.messageButtonText}>Mensaje</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Enhanced Level and Progress Section */}
            {profile && (
              <View style={styles.levelSectionEnhanced}>
                {/* Level Header with Large Badge */}
                <View style={styles.levelHeaderEnhanced}>
                  <View style={styles.levelInfoEnhanced}>
                    {profile.user_level?.badge ? (
                      <View style={styles.levelBadgeContainer}>
                        <Image 
                          source={{ uri: profile.user_level.badge }} 
                          style={styles.levelBadgeLarge}
                          resizeMode="contain"
                        />
                        <View style={styles.levelBadgeGlow} />
                      </View>
                    ) : (
                      <View style={styles.levelBadgeContainer}>
                        <View style={styles.levelBadgePlaceholder}>
                          <MaterialIcons name="emoji-events" size={32} color={colors.status.warning} />
                        </View>
                      </View>
                    )}
                    <View style={styles.levelTextContainer}>
                      <Text style={styles.levelTextLarge}>Level {profile.current_level}</Text>
                      {profile.user_level && (
                        <Text style={styles.levelNameEnhanced}>{profile.user_level.name}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.pointsContainer}>
                    <Text style={styles.pointsTextLarge}>{profile.total_points}</Text>
                    <Text style={styles.pointsLabel}>points</Text>
                  </View>
                </View>
                
                {/* Enhanced Progress Bar */}
                {profile.user_level && (
                  <View style={styles.progressSectionEnhanced}>
                    <View style={styles.progressBarEnhanced}>
                      <View 
                        style={[
                          styles.progressFillEnhanced, 
                          { 
                            width: `${Math.min(100, ((profile.total_points - profile.user_level.min_points) / (profile.user_level.max_points - profile.user_level.min_points)) * 100)}%` 
                          }
                        ]} 
                      />
                      <View style={styles.progressGlow} />
                    </View>
                    <View style={styles.progressLabelsEnhanced}>
                      <Text style={styles.progressLabelStart}>{profile.user_level.min_points}</Text>
                      <Text style={styles.progressLabelCenter}>
                        {profile.user_level.max_points - profile.total_points} to next level
                      </Text>
                      <Text style={styles.progressLabelEnd}>{profile.user_level.max_points}</Text>
                    </View>
                  </View>
                )}

                {/* Stats Row */}
                <View style={styles.statsRowEnhanced}>
                  <View style={styles.statItemEnhanced}>
                    <MaterialIcons name="menu-book" size={20} color={colors.primary.main} />
                    <Text style={styles.statNumberEnhanced}>{profile.books_read}</Text>
                    <Text style={styles.statLabelEnhanced}>Books Read</Text>
                  </View>
                  <View style={styles.statDividerEnhanced} />
                  <View style={styles.statItemEnhanced}>
                    <MaterialIcons name="swap-horiz" size={20} color={colors.status.success} />
                    <Text style={styles.statNumberEnhanced}>{profile.exchanges_completed}</Text>
                    <Text style={styles.statLabelEnhanced}>Exchanges</Text>
                  </View>
                  <View style={styles.statDividerEnhanced} />
                  <View style={styles.statItemEnhanced}>
                    <MaterialIcons name="groups" size={20} color={colors.status.info} />
                    <Text style={styles.statNumberEnhanced}>{profile.communities_joined}</Text>
                    <Text style={styles.statLabelEnhanced}>Communities</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsCard}>
          <View style={styles.tabsContainer}>
            {[
              { id: 'library' as const, label: 'Library' },
              { id: 'reviews' as const, label: 'Reviews' },
              { id: 'achievements' as const, label: 'Achievements' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.tabContent}>
            {activeTab === 'library' && (
              <View>
                {/* Library Header with Add Book Button */}
                {isOwnProfile && (
                  <View style={styles.libraryHeader}>
                    <Text style={styles.libraryHeaderTitle}>My Books</Text>
                    <TouchableOpacity
                      style={styles.addBookButton}
                      onPress={() => setShowAddBookModal(true)}
                    >
                      <Text style={styles.addBookButtonText}>+ Add Book</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {/* Library Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
                  {libraryFilters.map((filter) => (
                    <TouchableOpacity
                      key={filter.id}
                      style={[
                        styles.filterButton,
                        libraryFilter === filter.id && styles.activeFilterButton,
                      ]}
                      onPress={() => setLibraryFilter(filter.id)}
                    >
                      <View style={styles.filterButtonContent}>
                        {filter.icon && filter.iconFamily === 'MaterialIcons' ? (
                          <MaterialIcons 
                            name={filter.icon as any} 
                            size={16} 
                            color={libraryFilter === filter.id ? colors.neutral.white : colors.neutral.gray600} 
                          />
                        ) : filter.icon && filter.iconFamily === 'Feather' ? (
                          <Feather 
                            name={filter.icon as any} 
                            size={16} 
                            color={libraryFilter === filter.id ? colors.neutral.white : colors.neutral.gray600} 
                          />
                        ) : filter.id === 'READ' ? (
                          <MaterialIcons 
                            name="check-circle" 
                            size={16} 
                            color={libraryFilter === filter.id ? colors.neutral.white : colors.neutral.gray600} 
                          />
                        ) : null}
                        <Text
                          style={[
                            styles.filterButtonText,
                            libraryFilter === filter.id && styles.activeFilterButtonText,
                          ]}
                        >
                          {filter.label} ({filter.count})
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Books Grid */}
                <View style={styles.booksGrid}>
                {filteredBooks.map((book) => (
                  <UserLibraryBookCard
                    key={book.id}
                    book={book}
                    onStatusChange={isOwnProfile ? (newStatus) => updateBookStatus(book.book.id, newStatus) : undefined}
                    onFavoritePress={isOwnProfile ? () => toggleBookFavorite(book.book.id) : undefined}
                  />
                ))}
                </View>

                {filteredBooks.length === 0 && (
                  <View style={styles.emptyState}>
                    <MaterialIcons name="library-books" size={48} color={colors.neutral.gray400} />
                    <Text style={styles.emptyStateTitle}>No books found</Text>
                    <Text style={styles.emptyStateText}>
                      {libraryFilter === 'WISHLIST'
                        ? 'Add books to your wishlist to see them here.'
                        : 'No books in this category yet.'}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {activeTab === 'reviews' && (
              <View style={styles.reviewsContainer}>
                {reviewsLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                    <Text style={styles.loadingText}>Cargando reseñas...</Text>
                  </View>
                ) : userReviews.length === 0 ? (
                  <View style={styles.emptyState}>
                    <MaterialIcons name="rate-review" size={48} color={colors.neutral.gray400} style={styles.emptyStateIcon} />
                    <Text style={styles.emptyStateTitle}>
                      {isOwnProfile ? 'No has dejado reseñas' : `${profileUser.name} no ha dejado reseñas`}
                    </Text>
                    <Text style={styles.emptyStateText}>
                      {isOwnProfile 
                        ? 'Las reseñas aparecerán aquí después de completar intercambios de libros.'
                        : 'Las reseñas de intercambios aparecerán aquí cuando estén disponibles.'
                      }
                    </Text>
                  </View>
                ) : (
                  <View style={styles.reviewsList}>
                    {userReviews.map((review) => (
                      <View key={review.id} style={styles.reviewItem}>
                        <View style={styles.reviewHeader}>
                          <View style={styles.reviewRating}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <MaterialIcons
                                key={star}
                                name="star"
                                size={16}
                                color={star <= review.rating ? colors.status.warning : colors.neutral.gray300}
                              />
                            ))}
                            <Text style={styles.reviewRatingText}>({review.rating}/5)</Text>
                          </View>
                          <Text style={styles.reviewDate}>
                            {new Date(review.date_created).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Text>
                        </View>
                        {review.comment && (
                          <Text style={styles.reviewComment}>{review.comment}</Text>
                        )}
                        <View style={styles.reviewFooter}>
                          <MaterialIcons name="swap-horiz" size={16} color={colors.neutral.gray600} />
                          <Text style={styles.reviewExchangeText}>Intercambio de libros</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {activeTab === 'achievements' && (
              <View>
                {userAchievements && userAchievements.length > 0 ? (
                  userAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      earned={true}
                      onPress={() => handleAchievementPress(achievement)}
                    />
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <MaterialIcons name="emoji-events" size={48} color={colors.neutral.gray400} />
                    <Text style={styles.emptyStateTitle}>No achievements yet</Text>
                    <Text style={styles.emptyStateText}>
                      Start reading and participating to earn achievements!
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Achievement Modal */}
      <Modal
        visible={!!selectedAchievement}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseAchievementModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedAchievement && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedAchievement.achievement?.name || selectedAchievement.name}</Text>
                  <TouchableOpacity onPress={handleCloseAchievementModal}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalDescription}>
                  {selectedAchievement.achievement?.description || selectedAchievement.description}
                </Text>
                {selectedAchievement.date_earned && (
                  <Text style={styles.modalEarnedDate}>
                    Earned on {new Date(selectedAchievement.date_earned).toLocaleDateString()}
                  </Text>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Add Book Modal */}
      <Modal
        visible={showAddBookModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddBookModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalScrollContent}
            >
              <Text style={styles.modalTitle}>Add New Book</Text>
            
            <TouchableOpacity style={styles.scanButton} onPress={handleScanISBN}>
              <View style={styles.scanButtonContent}>
                <MaterialIcons name="qr-code-scanner" size={20} color={colors.neutral.gray600} />
                <Text style={styles.scanButtonText}>Scan book ISBN</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>ISBN</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter ISBN number"
                value={isbn}
                onChangeText={handleISBNChange}
              />
              <Text style={styles.inputHelp}>
                Book title and author will be automatically fetched based on ISBN
              </Text>
              
              {/* Scanned ISBN Success Message */}
              {isbnScannedMessage && (
                <View style={styles.scannedMessageContainer}>
                  <Text style={styles.scannedMessageText}>{isbnScannedMessage}</Text>
                </View>
              )}
              
              {/* Loading indicator */}
              {loadingBookData && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary.main} />
                  <Text style={styles.loadingText}>Fetching book data...</Text>
                </View>
              )}
              
              {/* Book preview */}
              {bookPreview && (
                <View style={styles.bookPreview}>
                  <View style={styles.previewTitleContainer}>
                    <Feather name="book-open" size={16} color={colors.status.success} />
                    <Text style={styles.previewTitle}>Book Found:</Text>
                  </View>
                  <Text style={styles.previewBookTitle}>{bookPreview.title}</Text>
                  {bookPreview.author && (
                    <Text style={styles.previewAuthor}>by {bookPreview.author}</Text>
                  )}
                  {bookPreview.genre && (
                    <Text style={styles.previewGenre}>Genre: {bookPreview.genre}</Text>
                  )}
                </View>
              )}
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Reading Status</Text>
              <View style={styles.statusButtons}>
                {[
                  { value: 'WISHLIST' as const, label: 'Wishlist' },
                  { value: 'TO_READ' as const, label: 'To Read' },
                  { value: 'READING' as const, label: 'Reading' },
                  { value: 'READ' as const, label: 'Read' },
                ].map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    style={[
                      styles.statusButton,
                      readingStatus === status.value && styles.activeStatusButton,
                    ]}
                    onPress={() => setReadingStatus(status.value)}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        readingStatus === status.value && styles.activeStatusButtonText,
                      ]}
                    >
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddBookModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addBookButtonModal, (!isbn.trim() || !readingStatus) && styles.disabledButton]}
                onPress={handleAddBook}
                disabled={!isbn.trim() || !readingStatus}
              >
                <Text style={styles.addBookButtonModalText}>Add Book</Text>
              </TouchableOpacity>
            </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfileModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditProfileModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalScrollContent}
            >
              <Text style={styles.modalTitle}>Edit Profile</Text>
              
              {/* Profile Image Section */}
              <View style={styles.imageSection}>
                <TouchableOpacity style={styles.imageContainer} onPress={handleImagePicker}>
                  <Image
                    key={`modal-image-${profileUser?.id}-${imageRefreshKey}-${selectedImageUri ? 'selected' : 'original'}`}
                    source={{ 
                      uri: selectedImageUri || profileUser?.image || 'https://via.placeholder.com/120' 
                    }}
                    style={styles.profileImage}
                  />
                  <View style={styles.imageOverlay}>
                    <MaterialIcons name="camera-alt" size={24} color={colors.neutral.white} />
                  </View>
                </TouchableOpacity>
                <Text style={styles.imageHelp}>Tap to change profile picture</Text>
              </View>

              {/* Form Fields */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your first name"
                  value={editFormData.name}
                  onChangeText={(text) => setEditFormData(prev => ({ ...prev, name: text }))}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your last name"
                  value={editFormData.lastname}
                  onChangeText={(text) => setEditFormData(prev => ({ ...prev, lastname: text }))}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Tell us about yourself..."
                  value={editFormData.description}
                  onChangeText={(text) => setEditFormData(prev => ({ ...prev, description: text }))}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                <Text style={styles.inputHelp}>
                  Share a bit about yourself, your reading preferences, or anything you'd like others to know
                </Text>
              </View>

              {/* Address Section with Map */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Address</Text>
                
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                  <View style={styles.searchInputContainer}>
                    <MaterialIcons name="search" size={20} color={colors.neutral.gray400} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search for an address..."
                      placeholderTextColor={colors.neutral.gray400}
                      value={addressSearchQuery}
                      onChangeText={setAddressSearchQuery}
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
                    onPress={onMapPress}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                    toolbarEnabled={false}
                  >
                    <Marker
                      coordinate={markerCoordinate}
                      title="Selected Location"
                      description={selectedAddress ? `${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}` : 'Tap to select'}
                    />
                  </MapView>
                </View>

                {/* Selected Address Info */}
                {selectedAddress ? (
                  <View style={styles.selectedAddressInfo}>
                    <MaterialIcons name="location-on" size={20} color={colors.primary.main} />
                    <View style={styles.addressTextContainer}>
                      <Text style={styles.addressCity}>{selectedAddress.city}</Text>
                      <Text style={styles.addressState}>{selectedAddress.state}, {selectedAddress.country}</Text>
                      <Text style={styles.addressCoords}>
                        {selectedAddress.latitude.toFixed(4)}, {selectedAddress.longitude.toFixed(4)}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.removeAddressButton}
                      onPress={handleRemoveAddress}
                    >
                      <MaterialIcons name="close" size={16} color={colors.status.error} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.noAddressSelected}>
                    <Text style={styles.noAddressText}>
                      📍 Tap on the map to select your location
                    </Text>
                  </View>
                )}

                <Text style={styles.inputHelp}>
                  Search for your address or tap on the map to select your location
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowEditProfileModal(false)}
                  disabled={isUpdatingProfile}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.addBookButtonModal, 
                    (!editFormData.name.trim() || !editFormData.lastname.trim() || isUpdatingProfile) && styles.disabledButton
                  ]}
                  onPress={() => {
                    logger.info('🔘 [PROFILE] Save Changes button pressed');
                    logger.info('🔘 [PROFILE] Button disabled state:', !editFormData.name.trim() || !editFormData.lastname.trim() || isUpdatingProfile);
                    logger.info('🔘 [PROFILE] Form validation - name:', editFormData.name.trim());
                    logger.info('🔘 [PROFILE] Form validation - lastname:', editFormData.lastname.trim());
                    logger.info('🔘 [PROFILE] isUpdatingProfile:', isUpdatingProfile);
                    handleSaveProfile();
                  }}
                  disabled={!editFormData.name.trim() || !editFormData.lastname.trim() || isUpdatingProfile}
                >
                  {isUpdatingProfile ? (
                    <ActivityIndicator size="small" color={colors.neutral.white} />
                  ) : (
                    <Text style={styles.addBookButtonModalText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Barcode Scanner Modal - FULL SCREEN APPROACH */}
      <Modal
        visible={showBarcodeScanner}
        transparent={false}
        animationType="slide"
        onRequestClose={handleCloseBarcodeScanner}
        presentationStyle="fullScreen"
      >
        <BarcodeScannerWrapper
          onBarcodeScanned={handleBarcodeScanned}
          onClose={handleCloseBarcodeScanner}
        />
      </Modal>


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.gray50,
  },
  scrollView: {
    flex: 1,
  },
  profileLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileLoadingText: {
    fontSize: 16,
    color: colors.neutral.gray600,
  },
  headerCard: {
    backgroundColor: colors.neutral.white,
    marginBottom: 16,
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.neutral.gray900,
  },
  username: {
    fontSize: 14,
    color: colors.neutral.gray600,
    marginBottom: 4,
  },
  levelSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.status.warning,
    marginLeft: 6,
  },
  levelBadge: {
    width: 24,
    height: 24,
    marginRight: 2,
  },
  levelName: {
    fontSize: 14,
    color: colors.neutral.gray600,
    marginLeft: 4,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral.gray700,
  },
  progressSection: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral.gray200,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 11,
    color: colors.neutral.gray500,
    flex: 1,
    textAlign: 'center',
  },
  bio: {
    fontSize: 14,
    color: colors.neutral.gray700,
    lineHeight: 20,
  },
  editButton: {
    backgroundColor: colors.neutral.gray100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.gray800,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  followButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followingButton: {
    backgroundColor: colors.neutral.gray100,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
  },
  followButtonDisabled: {
    backgroundColor: colors.neutral.gray200,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.white,
  },
  followingButtonText: {
    color: colors.neutral.gray600,
  },
  messageButton: {
    backgroundColor: colors.neutral.gray100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  messageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.gray800,
  },
  tabsCard: {
    backgroundColor: colors.neutral.white,
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary.main,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral.gray600,
  },
  activeTabText: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  tabContent: {
    padding: 16,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: colors.neutral.gray100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeFilterButton: {
    backgroundColor: colors.primary.main,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.neutral.gray700,
  },
  activeFilterButtonText: {
    color: colors.neutral.white,
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.neutral.gray600,
    textAlign: 'center',
    lineHeight: 20,
  },
  reviewsContainer: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: colors.neutral.gray600,
    marginTop: 12,
  },
  reviewsList: {
    gap: 16,
  },
  reviewItem: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingText: {
    fontSize: 12,
    color: colors.neutral.gray600,
    marginLeft: 4,
    fontWeight: '500',
  },
  reviewDate: {
    fontSize: 12,
    color: colors.neutral.gray500,
  },
  reviewComment: {
    fontSize: 14,
    color: colors.neutral.gray800,
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray100,
  },
  reviewExchangeText: {
    fontSize: 12,
    color: colors.neutral.gray600,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    width: '100%',
    maxHeight: '85%',
  },
  modalScrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.neutral.gray300,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.gray900,
    flex: 1,
  },
  modalClose: {
    fontSize: 20,
    color: colors.neutral.gray500,
    padding: 4,
  },
  modalDescription: {
    fontSize: 14,
    color: colors.neutral.gray700,
    lineHeight: 20,
    marginBottom: 12,
  },
  modalEarnedDate: {
    fontSize: 12,
    color: colors.neutral.gray500,
  },
  // Add Book styles
  libraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  libraryHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.gray900,
  },
  addBookButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.white,
  },
  scanButton: {
    backgroundColor: colors.neutral.gray100,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neutral.gray300,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: 20,
  },
  scanButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scanButtonText: {
    fontSize: 16,
    color: colors.neutral.gray600,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.neutral.white,
  },
  inputHelp: {
    fontSize: 12,
    color: colors.neutral.gray500,
    marginTop: 4,
  },
  scannedMessageContainer: {
    backgroundColor: colors.green[100] || '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.success || '#4CAF50',
  },
  scannedMessageText: {
    fontSize: 14,
    color: colors.green[600] || '#2E7D32',
    fontWeight: '500',
  },
  bookPreview: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.green[100],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.green[600],
  },
  previewTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.green[600],
  },
  previewBookTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 2,
  },
  previewAuthor: {
    fontSize: 12,
    color: colors.neutral.gray600,
    marginBottom: 2,
  },
  previewGenre: {
    fontSize: 11,
    color: colors.neutral.gray500,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    backgroundColor: colors.neutral.gray100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeStatusButton: {
    backgroundColor: colors.primary.main,
  },
  statusButtonText: {
    fontSize: 12,
    color: colors.neutral.gray700,
  },
  activeStatusButtonText: {
    color: colors.neutral.white,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.neutral.gray100,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: colors.neutral.gray700,
  },
  addBookButtonModal: {
    flex: 1,
    backgroundColor: colors.primary.main,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addBookButtonModalText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.white,
  },
  disabledButton: {
    backgroundColor: colors.neutral.gray300,
  },
  // Edit Profile Modal Styles
  imageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.neutral.gray200,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary.main,
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: colors.neutral.white,
  },
  imageHelp: {
    fontSize: 12,
    color: colors.neutral.gray600,
    textAlign: 'center',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  // Enhanced Profile Styles
  levelSectionEnhanced: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: -16,
    marginBottom: 8,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  levelHeaderEnhanced: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelInfoEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  levelBadgeContainer: {
    position: 'relative',
    marginRight: 16,
  },
  levelBadgeLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  levelBadgeGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 32,
    backgroundColor: colors.status.warning,
    opacity: 0.2,
    zIndex: -1,
  },
  levelBadgePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.status.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelTextContainer: {
    flex: 1,
  },
  levelTextLarge: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.status.warning,
    marginBottom: 2,
  },
  levelNameEnhanced: {
    fontSize: 16,
    color: colors.neutral.gray600,
    fontWeight: '500',
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  pointsTextLarge: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary.main,
  },
  pointsLabel: {
    fontSize: 12,
    color: colors.neutral.gray600,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressSectionEnhanced: {
    marginBottom: 16,
  },
  progressBarEnhanced: {
    height: 12,
    backgroundColor: colors.neutral.gray200,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFillEnhanced: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: 6,
    position: 'relative',
  },
  progressGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary.main,
    opacity: 0.3,
    borderRadius: 6,
  },
  progressLabelsEnhanced: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  progressLabelStart: {
    fontSize: 12,
    color: colors.neutral.gray600,
    fontWeight: '500',
  },
  progressLabelCenter: {
    fontSize: 12,
    color: colors.primary.main,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressLabelEnd: {
    fontSize: 12,
    color: colors.neutral.gray600,
    fontWeight: '500',
  },
  statsRowEnhanced: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },
  statItemEnhanced: {
    alignItems: 'center',
    flex: 1,
  },
  statNumberEnhanced: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral.gray900,
    marginTop: 4,
  },
  statLabelEnhanced: {
    fontSize: 12,
    color: colors.neutral.gray600,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  statDividerEnhanced: {
    width: 1,
    height: 40,
    backgroundColor: colors.neutral.gray200,
    marginHorizontal: 8,
  },
  // Address styles
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.gray50,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressText: {
    marginLeft: 8,
    flex: 1,
  },
  addressMainText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral.gray800,
  },
  addressSubText: {
    fontSize: 12,
    color: colors.neutral.gray500,
    marginTop: 2,
  },
  addressActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editAddressButton: {
    padding: 8,
    marginRight: 4,
  },
  removeAddressButton: {
    padding: 8,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary.main,
    borderStyle: 'dashed',
  },
  addAddressText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.primary.main,
    fontWeight: '500',
  },
  // Map styles
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
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
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  map: {
    flex: 1,
  },
  selectedAddressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray50,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressCity: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray800,
  },
  addressState: {
    fontSize: 14,
    color: colors.neutral.gray600,
    marginTop: 2,
  },
  addressCountry: {
    fontSize: 14,
    color: colors.neutral.gray600,
    marginTop: 2,
  },
  addressCoords: {
    fontSize: 12,
    color: colors.neutral.gray500,
    marginTop: 2,
  },
  noAddressSelected: {
    backgroundColor: colors.neutral.gray50,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  noAddressText: {
    fontSize: 14,
    color: colors.neutral.gray500,
    textAlign: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.neutral.gray600,
  },
});

export default ProfileScreen;
