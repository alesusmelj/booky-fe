# Setup de Visualización 360° - Booky

Este documento describe cómo configurar la funcionalidad de visualización 360° con giroscopio en la aplicación Booky.

## Dependencias Requeridas

Instala las siguientes dependencias en tu proyecto Expo:

```bash
# Dependencias principales
npx expo install expo-sensors expo-gl expo-three expo-asset expo-file-system react-native-webview

# Dependencias de Three.js
npm install three @types/three

# Si usas TypeScript (recomendado)
npm install --save-dev @types/react-native
```

## Estructura de Archivos Creada

```
src/
├── screens/
│   └── Scene360Screen.tsx          # Pantalla principal con inputs y controles
├── components/
│   ├── PanoramaViewer.tsx          # Componente principal (WebView + fallback)
│   └── ThreeJSViewer.tsx           # Fallback Three.js para compatibilidad
└── services/
    └── api.ts                      # Funciones API actualizadas

assets/
└── viewer/
    └── psv.html                    # HTML con Photo Sphere Viewer
```

## Configuración del Backend

Asegúrate de que tu backend tenga configurado el endpoint:

```
POST /api/books/{bookId}/scene-image
```

Con el payload y response según la especificación en el swagger.json.

## Permisos Requeridos

### iOS (app.json/app.config.js)

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSMotionUsageDescription": "Esta aplicación usa el giroscopio para controlar la visualización 360° de escenas de libros."
      }
    }
  }
}
```

### Android (app.json/app.config.js)

```json
{
  "expo": {
    "android": {
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE"
      ]
    }
  }
}
```

## Uso del Componente

### Importar en tu App

```typescript
import { Scene360Screen } from './src/screens/Scene360Screen';

// En tu navegador o App.tsx
<Scene360Screen />
```

### Uso Directo del PanoramaViewer

```typescript
import { PanoramaViewer } from './src/components/PanoramaViewer';

<PanoramaViewer
  imageSource={{ uri: 'https://example.com/panorama.jpg' }}
  useGyro={true}
  initialYaw={0}
  initialPitch={0}
/>
```

## Características Implementadas

### ✅ Funcionalidades Principales

- **Generación de Escenas**: Consume el endpoint del backend para generar imágenes 360°
- **Visualización WebView**: Usa Photo Sphere Viewer con soporte completo de giroscopio
- **Fallback Three.js**: Alternativa compatible cuando WebView falla
- **Controles Táctiles**: Drag para rotar cuando el giroscopio está deshabilitado
- **Zoom**: Controles de zoom in/out
- **Centrar Vista**: Botón para resetear la posición inicial

### 🎛️ Controles de Usuario

- **Toggle Giroscopio**: Activar/desactivar control por movimiento
- **Zoom**: Botones + y - para acercar/alejar
- **Centrar**: Resetear vista a posición inicial
- **Drag Touch**: Control manual cuando giroscopio está off

### 📱 Compatibilidad

- **iOS**: Soporte completo con permisos de DeviceMotion
- **Android**: Soporte completo de giroscopio
- **Emulador**: Funciona con controles táctiles (sin giroscopio)
- **Web**: Compatible con Expo Web (controles táctiles)

## Arquitectura Técnica

### Opción A (Primaria): WebView + Photo Sphere Viewer

- Carga HTML local con PSV desde CDN
- Comunicación bidireccional con React Native via postMessage
- Soporte nativo de giroscopio en PSV
- Mejor rendimiento y características

### Opción B (Fallback): Three.js + expo-gl

- Renderizado 3D nativo con Three.js
- Control manual de giroscopio via expo-sensors
- Funciona cuando WebView no está disponible
- Mayor compatibilidad pero menos características

## Troubleshooting

### WebView no carga

- Verifica que `expo-asset` y `expo-file-system` estén instalados
- Revisa los logs para errores de CORS o carga de assets
- El sistema automáticamente cambia a Three.js como fallback

### Giroscopio no funciona

- **iOS**: Requiere interacción del usuario para activar permisos
- **Android**: Verifica que el dispositivo tenga giroscopio
- **Emulador**: Usa controles táctiles como alternativa

### Imagen no se carga

- Verifica la URL de la imagen generada
- Revisa la conectividad con el backend
- Comprueba que el formato sea equirectangular (4096x2048)

### Rendimiento

- Las imágenes 4K pueden tardar en cargar
- El sistema muestra indicadores de carga automáticamente
- Considera reducir el tamaño para dispositivos más lentos

## Testing

### Casos de Prueba

1. **Generación exitosa**: bookId válido + texto → imagen 360°
2. **Error de backend**: bookId inválido → mensaje de error
3. **Giroscopio ON**: mover dispositivo → panorama se mueve
4. **Giroscopio OFF**: drag táctil → panorama se mueve
5. **Zoom**: botones +/- → acerca/aleja vista
6. **Centrar**: botón centrar → resetea posición
7. **Fallback**: error WebView → cambia a Three.js

### Dispositivos Recomendados

- **iOS**: iPhone 6s+ (soporte completo de DeviceMotion)
- **Android**: API 21+ con giroscopio
- **Emulador**: Funciona con controles táctiles

## Próximas Mejoras

- [ ] Cache de imágenes generadas
- [ ] Soporte para múltiples formatos de imagen
- [ ] Controles de velocidad de rotación
- [ ] Modo VR estereoscópico
- [ ] Integración con realidad aumentada
- [ ] Compartir escenas generadas
