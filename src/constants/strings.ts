export const strings = {
  // App-wide strings
  app: {
    name: 'Booky',
  },

  // Navigation
  navigation: {
    home: 'Inicio',
    search: 'Buscar',
    commerce: 'Comercio',
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

  // Search screen
  search: {
    title: 'Buscar',
    placeholder: 'Buscar libros, personas, comunidades...',
    filters: {
      books: 'Libros',
      people: 'Personas',
      communities: 'Comunidades',
    },
    sections: {
      books: 'Libros',
      people: 'Personas',
      communities: 'Comunidades',
    },
    readersMap: 'Mapa de Lectores',
    bookStatus: {
      read: 'Leído',
      reading: 'Leyendo',
      available: 'Disponible',
      wishlist: 'Lista de deseos',
    },
  },

  // Commerce screen
  commerce: {
    title: 'Comercio',
    tabs: {
      tradeBooks: 'Intercambiar Libros',
      myLibrary: 'Mi Biblioteca',
    },
    actions: {
      newExchange: 'Solicitar Nuevo Intercambio',
      chat: 'Chat',
      cancel: 'Cancelar',
      counterOffer: 'Contra Oferta',
      accept: 'Aceptar',
      reject: 'Rechazar',
      makeAvailable: 'Disponible',
    },
    sections: {
      receivedOffers: 'Ofertas Recibidas',
      activeOrders: 'Mis Intercambios',
      myBooks: 'Mis Libros',
    },
    status: {
      pending: 'Pendiente',
      accepted: 'Aceptado',
      rejected: 'Rechazado',
      countered: 'Contraoferta',
      cancelled: 'Cancelado',
      completed: 'Completado',
      active: 'ACTIVO', // Legacy - can be removed later
      available: 'Disponible para intercambio',
      notAvailable: 'Toca para marcar como disponible',
    },
    labels: {
      requests: 'Solicita libros:',
      offers: 'Ofrece:',
      applicant: 'Solicitante',
      owner: 'Propietario',
      you: 'Tú',
      exchange: 'intercambio',
      searchBooks: 'Busca tus libros...',
    },
  },

  // Placeholder screens
  placeholders: {
    comingSoon: 'Próximamente',
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

  // Auth screens
  auth: {
    signIn: 'Iniciar sesión',
    signUp: 'Crear cuenta',
    email: 'Correo electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    username: 'Nombre de usuario',
    firstName: 'Nombre',
    lastName: 'Apellido',
    rememberMe: 'Recordarme',
    forgotPassword: '¿Olvidaste tu contraseña?',
    notRegistered: '¿No estás registrado aún?',
    alreadyRegistered: '¿Ya tienes una cuenta?',
    createAccount: 'Crear una cuenta',
    backToLogin: 'Iniciar sesión',
    appTagline: 'Tu red social literaria',
    signUpTagline: 'Únete a la comunidad de lectores',
    termsAndConditions: 'Al registrarte, aceptas nuestros términos y condiciones',
  },

  // Error messages
  errors: {
    postCreationFailed: 'No se pudo crear el post. Intenta de nuevo.',
    genericError: 'Ha ocurrido un error. Intenta de nuevo.',
    loginFailed: 'Error al iniciar sesión. Verifica tus credenciales.',
    signUpFailed: 'Error al crear la cuenta. Intenta de nuevo.',
    invalidEmail: 'Ingresa un correo electrónico válido.',
    passwordRequired: 'La contraseña es requerida.',
    passwordTooShort: 'La contraseña debe tener al menos 8 caracteres.',
    passwordsDoNotMatch: 'Las contraseñas no coinciden.',
    usernameRequired: 'El nombre de usuario es requerido.',
    usernameInvalid: 'El nombre de usuario debe tener entre 3 y 30 caracteres.',
    firstNameRequired: 'El nombre es requerido.',
    lastNameRequired: 'El apellido es requerido.',
    nameInvalid: 'El nombre debe tener entre 2 y 50 caracteres.',
    emailAlreadyExists: 'Este correo electrónico ya está registrado.',
    usernameAlreadyExists: 'Este nombre de usuario ya está en uso.',
    searchFailed: 'Error en la búsqueda. Intenta de nuevo.',
    followFailed: 'No se pudo seguir al usuario. Intenta de nuevo.',
    unfollowFailed: 'No se pudo dejar de seguir al usuario. Intenta de nuevo.',
  },

  // Post component strings
  post: {
    likeAccessibility: 'Me gusta',
    commentAccessibility: 'Comentar',
    shareAccessibility: 'Compartir',
    userProfileAccessibility: 'Ver perfil del usuario',
    postImageAccessibility: 'Imagen del post',
  },
} as const;