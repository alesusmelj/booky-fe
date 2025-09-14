# API Configuration

Este directorio contiene la configuración centralizada para todas las APIs y entornos de la aplicación.

## Estructura

```
src/config/
├── api.ts          # Configuración de endpoints y URLs de API
├── environment.ts  # Configuración de entornos (dev, staging, prod)
├── index.ts        # Exportaciones centralizadas
└── README.md       # Esta documentación
```

## Uso

### Importar configuración de API

```typescript
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

// Usar URL base
const response = await fetch(`${API_BASE_URL}/communities`);

// Usar endpoints predefinidos
const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.communities.base}`);
```

### Importar configuración de entorno

```typescript
import { ENV_CONFIG, isDevelopment } from '../config/environment';

// Usar configuración del entorno actual
const timeout = ENV_CONFIG.apiTimeout;
const enableLogging = ENV_CONFIG.enableLogging;

// Verificar entorno
if (isDevelopment()) {
  console.log('Ejecutando en desarrollo');
}
```

### Importar configuración completa

```typescript
import { config } from '../config';

// Acceso a toda la configuración
const apiUrl = config.api.baseUrl;
const isDevMode = config.isDevelopment;
```

## Entornos

### Development (Desarrollo)
- **URL**: `http://localhost:8080`
- **Logging**: Habilitado
- **Timeout**: 10 segundos

### Staging (Pruebas)
- **URL**: `https://api-staging.booky.com`
- **Logging**: Habilitado
- **Timeout**: 15 segundos

### Production (Producción)
- **URL**: `https://api.booky.com`
- **Logging**: Deshabilitado
- **Timeout**: 20 segundos

## Cambiar de Entorno

El entorno se determina automáticamente por `process.env.NODE_ENV`:

```bash
# Desarrollo (por defecto)
npm start

# Staging
NODE_ENV=staging npm start

# Producción
NODE_ENV=production npm run build
```

## Endpoints Disponibles

### Autenticación
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh`
- `POST /auth/logout`

### Comunidades
- `GET /communities`
- `GET /communities/:id`
- `POST /communities/:id/join`
- `DELETE /communities/:id/leave`

### Posts
- `GET /posts`
- `GET /posts/:id`
- `GET /posts?communityId=:id`
- `POST /posts`

### Reading Clubs
- `GET /reading-clubs`
- `GET /reading-clubs/:id`
- `GET /reading-clubs?communityId=:id`
- `POST /reading-clubs`
- `POST /reading-clubs/:id/join`
- `PUT /reading-clubs/:id/meeting`

### Libros
- `GET /books`
- `GET /books/search`
- `GET /books/isbn/:isbn`
- `GET /books/library`
- `GET /books/exchange`

## Migración desde URLs Hardcodeadas

### Antes
```typescript
const API_BASE_URL = 'http://localhost:8080';
const response = await fetch(`${API_BASE_URL}/communities`);
```

### Después
```typescript
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.communities.base}`);
```

## Beneficios

1. **Centralización**: Todas las URLs en un solo lugar
2. **Flexibilidad**: Fácil cambio entre entornos
3. **Mantenimiento**: Actualizaciones centralizadas
4. **Tipado**: TypeScript para endpoints seguros
5. **Escalabilidad**: Preparado para múltiples entornos
