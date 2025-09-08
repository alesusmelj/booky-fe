export const strings = {
  // App-wide strings
  app: {
    name: 'Booky',
  },

  // Navigation
  navigation: {
    home: 'Inicio',
    search: 'Buscar',
    market: 'Mercado',
    community: 'Comunidad',
    messages: 'Mensajes',
    library: 'Biblioteca',
    profile: 'Perfil',
  },

  // Accessibility labels
  accessibility: {
    notifications: 'Notificaciones',
    profile: 'Perfil',
    addImage: 'Añadir imagen',
    publishPost: 'Publicar post',
    textInput: 'Escribe tu post',
  },

  // CreatePost component
  createPost: {
    placeholder: '¿Qué estás leyendo?',
    publishButton: 'Publicar',
    addImageAccessibility: 'Añadir imagen',
    publishAccessibility: 'Publicar post',
    textInputAccessibility: 'Escribe tu post',
    imageUpcomingTitle: 'Funcionalidad próximamente',
    imageUpcomingMessage: 'La subida de imágenes estará disponible pronto.',
  },

  // Post component
  post: {
    likeAccessibility: 'Me gusta',
    commentAccessibility: 'Comentar',
    shareAccessibility: 'Compartir',
    userProfileAccessibility: 'Ver perfil de usuario',
    postImageAccessibility: 'Imagen del post',
  },

  // Home screen
  home: {
    feedTitle: 'Tu feed',
    emptyFeedMessage: '¡Sigue a otros usuarios para ver sus posts aquí!',
  },

  // Placeholder screens
  placeholders: {
    comingSoon: 'Próximamente',
    search: {
      title: 'Buscar',
    },
    communities: {
      title: 'Comunidades',
    },
    library: {
      title: 'Mi Biblioteca',
    },
    profile: {
      title: 'Mi Perfil',
    },
  },

  // Error messages
  errors: {
    postCreationFailed: 'No se pudo crear el post. Intenta de nuevo.',
    genericError: 'Ha ocurrido un error. Intenta de nuevo.',
  },
} as const;