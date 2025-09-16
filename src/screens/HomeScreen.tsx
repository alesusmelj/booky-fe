import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { CreatePost, Post, PostData } from '../components';
import { strings, colors } from '../constants';
import { logger } from '../utils/logger';
import { useNavigation } from '../contexts/NavigationContext';

export const HomeScreen: React.FC = () => {
  const { navigate } = useNavigation();

  const handleCreatePost = (_content: string, _images?: File[]) => {
    // TODO: Implement API call to create post
    logger.info('Post created successfully');
  };

  const handleLike = (postId: string) => {
    // TODO: Implement like functionality
    logger.info('Post liked:', postId);
  };

  const handleComment = (postId: string) => {
    // TODO: Implement comment functionality
    logger.info('Comment on post:', postId);
  };

  const handleUserPress = (userId: string) => {
    // TODO: Navigate to user profile
    logger.info('User profile pressed:', userId);
  };

  // Sample posts data - TODO: Replace with API data
  const samplePosts: PostData[] = [
    {
      id: '1',
      user: {
        id: 'user1',
        name: 'David Kim',
      },
      content: 'Visiting this beautiful bookstore in Valencia today! Anyone want to meet up?',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      createdAt: '2025-09-08T10:00:00Z',
      likes: 42,
      comments: 5,
      isLiked: false,
    },
    {
      id: '2',
      user: {
        id: 'user2',
        name: 'María González',
      },
      content: 'Just finished reading "Cien años de soledad" - what an incredible journey! Gabriel García Márquez really knows how to weave magic into words. Highly recommend this masterpiece to anyone who loves Latin American literature.',
      createdAt: '2025-09-08T08:30:00Z',
      likes: 23,
      comments: 8,
      isLiked: true,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <CreatePost 
        onPost={handleCreatePost}
        showCharacterCount={true}
        maxLength={280}
      />
      
      {/* Botón de prueba Scene360 */}
      <TouchableOpacity 
        style={styles.scene360Button}
        onPress={() => navigate('scene360-test')}
      >
        <Text style={styles.scene360ButtonText}>🌐 Probar Visor 360°</Text>
        <Text style={styles.scene360ButtonSubtext}>
          Genera y visualiza escenas panorámicas con giroscopio
        </Text>
      </TouchableOpacity>

      {/* Botón de diagnóstico Scene360 */}
      <TouchableOpacity 
        style={styles.scene360DiagnosticButton}
        onPress={() => navigate('scene360-test-simple')}
      >
        <Text style={styles.scene360DiagnosticButtonText}>🔧 Diagnóstico 360°</Text>
        <Text style={styles.scene360DiagnosticButtonSubtext}>
          Versión simplificada para diagnosticar problemas
        </Text>
      </TouchableOpacity>

      {/* Botón de versión segura Scene360 */}
      <TouchableOpacity 
        style={styles.scene360SafeButton}
        onPress={() => navigate('scene360-test-safe')}
      >
        <Text style={styles.scene360SafeButtonText}>🛡️ Visor 360° Seguro</Text>
        <Text style={styles.scene360SafeButtonSubtext}>
          Solo Three.js - Sin WebView - Más estable en iOS
        </Text>
      </TouchableOpacity>

      {/* Botón de prueba de imágenes */}
      <TouchableOpacity 
        style={styles.scene360ImageTestButton}
        onPress={() => navigate('scene360-image-options')}
      >
        <Text style={styles.scene360ImageTestButtonText}>🖼️ Prueba de Imágenes</Text>
        <Text style={styles.scene360ImageTestButtonSubtext}>
          Múltiples opciones de imágenes para probar carga
        </Text>
      </TouchableOpacity>

      {/* Botón de panorama procedural */}
      <TouchableOpacity 
        style={styles.scene360ProceduralButton}
        onPress={() => navigate('scene360-procedural')}
      >
        <Text style={styles.scene360ProceduralButtonText}>🎨 Panorama Procedural</Text>
        <Text style={styles.scene360ProceduralButtonSubtext}>
          Solución definitiva para iOS - Sin dependencias de red
        </Text>
      </TouchableOpacity>

      {/* Botón de imagen personalizada */}
      <TouchableOpacity 
        style={styles.scene360CustomButton}
        onPress={() => navigate('scene360-custom')}
      >
        <Text style={styles.scene360CustomButtonText}>🖼️ Tu Propia Imagen 360°</Text>
        <Text style={styles.scene360CustomButtonSubtext}>
          Carga tus imágenes con fallback automático garantizado
        </Text>
      </TouchableOpacity>
      
      <View style={styles.feedContainer}>
        <Text style={styles.feedTitle}>{strings.home.feedTitle}</Text>
        
        {samplePosts.map((post) => (
          <Post
            key={post.id}
            post={post}
            onLike={handleLike}
            onComment={handleComment}
            onUserPress={handleUserPress}
          />
        ))}
        
        <View style={styles.emptyFeed}>
          <Text style={styles.emptyFeedText}>
            {strings.home.emptyFeedMessage}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.gray50,
  },
  feedContainer: {
    paddingHorizontal: 0,
    paddingTop: 16,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral.gray800,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  emptyFeed: {
    backgroundColor: colors.neutral.white,
    padding: 32,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  emptyFeedText: {
    fontSize: 16,
    color: colors.neutral.gray500,
    textAlign: 'center',
    lineHeight: 24,
  },
  scene360Button: {
    backgroundColor: '#007AFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scene360ButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  scene360ButtonSubtext: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    textAlign: 'center',
  },
  scene360DiagnosticButton: {
    backgroundColor: '#FF6B35',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  scene360DiagnosticButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  scene360DiagnosticButtonSubtext: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
    textAlign: 'center',
  },
  scene360SafeButton: {
    backgroundColor: '#28a745',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  scene360SafeButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 3,
  },
  scene360SafeButtonSubtext: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.95,
    textAlign: 'center',
    lineHeight: 18,
  },
  scene360ImageTestButton: {
    backgroundColor: '#6f42c1',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#6f42c1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  scene360ImageTestButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 3,
  },
  scene360ImageTestButtonSubtext: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.95,
    textAlign: 'center',
    lineHeight: 18,
  },
  scene360ProceduralButton: {
    backgroundColor: '#ff6b35',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  scene360ProceduralButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 3,
  },
  scene360ProceduralButtonSubtext: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.95,
    textAlign: 'center',
    lineHeight: 18,
  },
  scene360CustomButton: {
    backgroundColor: '#17a2b8',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#17a2b8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  scene360CustomButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 3,
  },
  scene360CustomButtonSubtext: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.95,
    textAlign: 'center',
    lineHeight: 18,
  },
});