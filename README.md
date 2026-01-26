# 📚 Booky - Red Social para Lectores

<div align="center">

**Plataforma móvil para conectar lectores, intercambiar libros y crear comunidades de lectura**

[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~54.0-000020.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![LiveKit](https://img.shields.io/badge/LiveKit-Enabled-green.svg)](https://livekit.io/)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características Principales](#-características-principales)
- [Arquitectura](#-arquitectura)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Ejecución](#-ejecución)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Scripts Disponibles](#-scripts-disponibles)
- [Calidad de Código](#-calidad-de-código)
- [Contribución](#-contribución)

---

## 🎯 Descripción

**Booky** es una aplicación móvil multiplataforma construida con React Native y Expo que conecta a lectores apasionados en una red social dedicada a los libros. La plataforma permite a los usuarios descubrir nuevos libros, intercambiar ejemplares, participar en clubes de lectura virtuales con llamadas en tiempo real, y formar parte de una comunidad activa de lectores.

---

## ✨ Características Principales

### 📖 Gestión de Biblioteca Personal
- Escaneo de códigos ISBN mediante cámara
- Catalogación automática de libros
- Gestión de biblioteca personal con estado de lectura
- Búsqueda avanzada de libros

### 🔄 Sistema de Intercambio
- Publicación de libros disponibles para intercambio
- Sistema de ofertas y contraofertas
- Seguimiento de intercambios activos
- Calificaciones y reseñas de usuarios

### 👥 Red Social
- Feed de publicaciones de la comunidad
- Sistema de comentarios y reacciones
- Búsqueda de lectores por ubicación
- Perfiles de usuario personalizables
- Mapa interactivo de lectores cercanos

### 🎭 Comunidades y Clubes de Lectura
- Creación y gestión de comunidades temáticas
- Clubes de lectura con calendario de reuniones
- Videollamadas integradas con LiveKit
- Transcripción en tiempo real (español)
- Chat grupal por comunidad

### 🎮 Gamificación
- Sistema de logros y badges
- Estadísticas de lectura

### 🗺️ Geolocalización
- Visualización de lectores en mapa
- Búsqueda por proximidad

### 📸 Experiencias Inmersivas
- Visor panorámico 360°
- Galería de imágenes de libros

---

## 🏗️ Arquitectura

### Patrón de Diseño

La aplicación sigue una arquitectura basada en **componentes funcionales** con **hooks de React** y **Context API** para la gestión de estado global.

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│  (Screens + Components + Navigation)    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          Business Logic Layer           │
│    (Hooks + Contexts + Services)        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│            Data Layer                   │
│  (API Services + Local Storage)         │
└─────────────────────────────────────────┘
```

### Componentes Clave

#### **Contexts (Estado Global)**
- `AuthContext`: Gestión de autenticación y sesión de usuario
- `NavigationContext`: Control de navegación entre pantallas
- `AlertContext`: Sistema de alertas y notificaciones personalizadas

#### **Services (Capa de Datos)**
- `api.ts`: Cliente HTTP base con interceptores
- `booksService.ts`: Operaciones CRUD de libros
- `usersService.ts`: Gestión de usuarios y perfiles
- `chatService.ts`: Mensajería en tiempo real
- `communitiesService.ts`: Comunidades y clubes de lectura
- `exchangeService.ts`: Sistema de intercambio de libros
- `liveKitService.ts`: Integración con LiveKit para videollamadas
- `gamificationService.ts`: Sistema de logros y estadísticas
- `storage.ts`: Persistencia local con AsyncStorage

#### **Screens (Pantallas Principales)**
- `HomeScreen`: Feed principal de publicaciones
- `SearchScreen`: Búsqueda de libros y usuarios
- `LibraryScreen`: Biblioteca personal del usuario
- `CommunitiesScreen`: Exploración de comunidades
- `CommunityDetailScreen`: Detalle de comunidad con posts y miembros
- `ReadingClubsScreen`: Clubes de lectura activos
- `ProfileScreen`: Perfil de usuario (propio y ajeno)
- `ChatsScreen`: Lista de conversaciones
- `ChatDetailScreen`: Chat individual
- `CommerceScreen`: Gestión de intercambios
- `LoginScreen` / `SignUpScreen`: Autenticación

#### **Components (Componentes Reutilizables)**
- `VideoCallRoom`: Sala de videollamadas con LiveKit
- `BarcodeScannerWrapper`: Escáner de códigos ISBN
- `CreateExchangeModal`: Modal para crear ofertas de intercambio
- `CreateReadingClubModal`: Modal para crear clubes de lectura
- `MeetingScheduler`: Calendario para agendar reuniones
- `ReadersMapScreen`: Mapa interactivo de lectores
- `PanoramaViewer`: Visor 360° con Three.js
- `BookCard`, `PersonCard`, `CommunityCard`: Cards reutilizables
- `Navbar`, `TopNavbar`: Navegación principal

---

## 📦 Requisitos Previos

### Opción 1: Desarrollo con Dev Containers (Recomendado)

- [Visual Studio Code](https://code.visualstudio.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Opción 2: Desarrollo Local

- **Node.js**: v18 o superior
- **npm**: v9 o superior
- **Java JDK**: 17 (para Android)
- **Android Studio**: Para emulador Android
- **Xcode**: Para desarrollo iOS (solo macOS)

---

## 🚀 Instalación

### Usando Dev Containers (Recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/alesusmelj/booky-fe.git
cd booky-fe

# 2. Abrir en VS Code
code .

# 3. VS Code detectará la configuración de Dev Container
# Hacer clic en "Reopen in Container" cuando aparezca la notificación
# O usar Command Palette (Ctrl/Cmd + Shift + P): "Dev Containers: Reopen in Container"

# 4. Una vez dentro del contenedor, instalar dependencias
npm install
```

### Instalación Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/alesusmelj/booky-fe.git
cd booky-fe

# 2. Instalar dependencias
npm install

# 3. (Opcional) Para iOS, instalar pods
cd ios && pod install && cd ..
```

---

## ⚙️ Configuración

### Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# Google Maps API Key (para mapas de lectores)
GOOGLE_MAPS_API_KEY=tu_api_key_aqui

# LiveKit WebSocket URL (para videollamadas)
EXPO_PUBLIC_LIVEKIT_WS_URL=wss://tu-proyecto.livekit.cloud
```

### Configuración del Backend

La aplicación requiere un backend REST API. Configurar la URL base en `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://tu-backend-url:puerto';
```

### Configuración de LiveKit

Para habilitar las videollamadas:

1. Crear una cuenta en [LiveKit Cloud](https://livekit.io/)
2. Obtener las credenciales del proyecto
3. Configurar `EXPO_PUBLIC_LIVEKIT_WS_URL` en `.env`
4. El backend debe generar tokens de LiveKit para autenticación

---

## 🎮 Ejecución

### Desarrollo

```bash
# Iniciar servidor de desarrollo de Expo
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS (solo macOS)
npm run ios

# Ejecutar en navegador web
npm run web
```

### Modos de Conexión

```bash
# Modo túnel (para desarrollo remoto/AWS)
npm run start:tunnel

# Modo LAN (para dispositivos en la misma red)
npm run start:lan

# Limpiar caché y reiniciar
npm run start:clear
```

### Escanear QR con Expo Go

1. Ejecutar `npm start`
2. Instalar **Expo Go** en tu dispositivo móvil
   - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS](https://apps.apple.com/app/expo-go/id982107779)
3. Escanear el código QR que aparece en la terminal

---

## 📁 Estructura del Proyecto

```
booky-fe/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── VideoCallRoom.native.tsx
│   │   ├── BarcodeScannerWrapper.tsx
│   │   ├── CreateExchangeModal.tsx
│   │   ├── PanoramaViewer.tsx
│   │   └── ...
│   ├── screens/             # Pantallas principales
│   │   ├── HomeScreen.tsx
│   │   ├── LibraryScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── ...
│   ├── services/            # Servicios de API y lógica de negocio
│   │   ├── api.ts
│   │   ├── booksService.ts
│   │   ├── liveKitService.ts
│   │   └── ...
│   ├── contexts/            # Contextos de React (estado global)
│   │   ├── AuthContext.tsx
│   │   ├── NavigationContext.tsx
│   │   └── AlertContext.tsx
│   ├── hooks/               # Custom hooks
│   │   ├── useBooks.ts
│   │   ├── useChat.ts
│   │   └── ...
│   ├── types/               # Definiciones de TypeScript
│   │   ├── api.ts
│   │   └── ...
│   ├── utils/               # Utilidades y helpers
│   │   ├── logger.ts
│   │   └── ...
│   ├── constants/           # Constantes (strings, colores, temas)
│   │   ├── strings.ts
│   │   ├── colors.ts
│   │   └── theme.ts
│   ├── config/              # Configuraciones
│   └── App.tsx              # Componente raíz
├── assets/                  # Recursos estáticos (imágenes, fuentes)
├── android/                 # Código nativo Android
├── ios/                     # Código nativo iOS
├── plugins/                 # Plugins de Expo Config
├── livekit-agent/          # Agente de LiveKit (Python)
├── .devcontainer/          # Configuración de Dev Container
├── app.json                # Configuración de Expo
├── app.config.js           # Configuración dinámica de Expo
├── package.json            # Dependencias y scripts
├── tsconfig.json           # Configuración de TypeScript
└── README.md               # Este archivo
```

### Descripción de Carpetas Clave

#### `src/components/`
Componentes reutilizables de UI organizados por funcionalidad:
- **Modales**: `CreateExchangeModal`, `CreateReadingClubModal`, `CommentsModal`
- **Cards**: `BookCard`, `PersonCard`, `CommunityCard`, `OfferCard`
- **Navegación**: `Navbar`, `TopNavbar`
- **Multimedia**: `VideoCallRoom`, `PanoramaViewer`, `ImageViewer`
- **Formularios**: `SearchBox`, `SearchFilters`, `TimePicker`, `Calendar`

#### `src/services/`
Capa de acceso a datos y lógica de negocio:
- **API Base**: `api.ts` - Cliente HTTP con Axios, interceptores de autenticación
- **Servicios de dominio**: Cada servicio encapsula operaciones de una entidad (libros, usuarios, chats, etc.)
- **Almacenamiento**: `storage.ts` - Wrapper de AsyncStorage para persistencia local

#### `src/contexts/`
Gestión de estado global con Context API:
- **AuthContext**: Autenticación, tokens, usuario actual
- **NavigationContext**: Stack de navegación personalizado
- **AlertContext**: Sistema de alertas personalizadas

#### `src/hooks/`
Custom hooks para lógica reutilizable:
- Hooks de datos (useBooks, useUsers, useChat)
- Hooks de UI (useDebounce, useKeyboard)
- Hooks de servicios externos (useLiveKit, useLocation)

---

## 🛠️ Tecnologías Utilizadas

### Core
- **React Native** `0.81.5` - Framework de desarrollo móvil
- **Expo** `~54.0` - Plataforma de desarrollo y build
- **TypeScript** `5.9` - Tipado estático

### UI/UX
- **React Native Safe Area Context** - Manejo de áreas seguras
- **React Native Modal** - Modales personalizados
- **Expo Vector Icons** - Iconografía (MaterialIcons)

### Comunicación en Tiempo Real
- **LiveKit** `2.15.7` - Videollamadas WebRTC
- **@livekit/react-native** `2.9.1` - SDK de LiveKit para React Native
- **@livekit/react-native-webrtc** - WebRTC nativo

### Multimedia
- **Expo Camera** - Acceso a cámara (escaneo ISBN)
- **Expo Image Picker** - Selección de imágenes
- **Expo AV** - Reproducción de audio/video
- **Three.js** `0.166.1` - Renderizado 3D (vistas 360°)
- **Expo GL** - OpenGL ES para Three.js

### Geolocalización
- **Expo Location** - Servicios de ubicación
- **Expo Maps** - Mapas nativos
- **React Native Maps** - Componentes de mapa

### Almacenamiento
- **AsyncStorage** - Persistencia local
- **Expo File System** - Manejo de archivos

### Networking
- **Axios** (implícito en api.ts) - Cliente HTTP
- **React Native Blob Util** - Manejo de archivos binarios

### Calidad de Código
- **ESLint** - Linter de código
- **Prettier** - Formateador de código
- **TypeScript ESLint** - Reglas de linting para TypeScript
- **Husky** - Git hooks para pre-commit
- **Jest** - Framework de testing

### Build y Deploy
- **Expo Dev Client** - Cliente de desarrollo personalizado
- **Expo Build Properties** - Configuración de builds nativos
- **EAS (Expo Application Services)** - Build y deploy en la nube

---

## 📜 Scripts Disponibles

### Desarrollo
```bash
npm start              # Iniciar servidor de desarrollo
npm run android        # Ejecutar en Android
npm run ios            # Ejecutar en iOS
npm run web            # Ejecutar en navegador
npm run start:tunnel   # Iniciar con túnel (desarrollo remoto)
npm run start:lan      # Iniciar con acceso LAN
npm run start:clear    # Limpiar caché y reiniciar
```

### Calidad de Código
```bash
npm run lint           # Ejecutar ESLint
npm run lint:fix       # Corregir errores de ESLint automáticamente
npm run lint:errors-only  # Mostrar solo errores (sin warnings)
npm run type-check     # Verificar tipos de TypeScript
npm run format         # Formatear código con Prettier
npm run format:check   # Verificar formato sin modificar
```

### Testing
```bash
npm test               # Ejecutar tests con Jest
npm run test:watch     # Ejecutar tests en modo watch
npm run test:coverage  # Ejecutar tests con reporte de cobertura
```

### Utilidades
```bash
npm run clean          # Limpiar caché de Expo
npm run get-ip         # Obtener IP local (para configuración móvil)
npm run setup-mobile   # Configurar para desarrollo móvil
```

---

## ✅ Calidad de Código

### Herramientas de Calidad

- **TypeScript en modo estricto**: Tipado fuerte para prevenir errores
- **ESLint**: Análisis estático de código con reglas de React Native
- **Prettier**: Formato consistente de código
- **Husky**: Pre-commit hooks para validación automática
- **Jest**: Testing unitario y de integración

### Pre-commit Hooks

Antes de cada commit, se ejecutan automáticamente:
1. Linting de código
2. Verificación de tipos TypeScript
3. Formateo de código
4. Tests unitarios (si están configurados)

### Configuración de ESLint

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'expo',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  // ...
};
```

### Configuración de TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    // ...
  }
}
```

---

## 🤝 Contribución

### Flujo de Trabajo

1. **Fork** del repositorio
2. Crear una **rama** para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. **Commit** de cambios: `git commit -m 'feat: agregar nueva funcionalidad'`
4. **Push** a la rama: `git push origin feature/nueva-funcionalidad`
5. Abrir un **Pull Request**

### Convenciones de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nueva característica
fix: corrección de bug
docs: cambios en documentación
style: cambios de formato (no afectan lógica)
refactor: refactorización de código
test: agregar o modificar tests
chore: tareas de mantenimiento
```

### Checklist antes de PR

- [ ] `npm run lint` pasa sin errores
- [ ] `npm run type-check` pasa sin errores
- [ ] `npm run format` ejecutado
- [ ] `npm test` pasa (si hay tests)
- [ ] Código documentado con comentarios cuando sea necesario
- [ ] README actualizado si es necesario

---

## 📄 Licencia

Este proyecto es privado y está bajo la licencia del propietario.

---

## 👥 Autores

- **Felipe Lena** - [@felipelena8](https://github.com/felipelena8)
- **Alejandro Susmelj** - [@alesusmelj](https://github.com/alesusmelj)

---

## 🙏 Agradecimientos

- [Expo](https://expo.dev/) por la excelente plataforma de desarrollo
- [LiveKit](https://livekit.io/) por la infraestructura de videollamadas
- [React Native Community](https://reactnative.dev/) por las herramientas y librerías

---

<div align="center">

**¿Tienes preguntas? Abre un [issue](https://github.com/alesusmelj/booky-fe/issues)**

Hecho con ❤️ y 📚

</div>
