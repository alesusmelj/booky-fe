# Integración de Pantalla de Prueba Scene360

## Pantalla de Prueba Creada

He creado `Scene360TestScreen.tsx` que te permite probar la funcionalidad 360° inmediatamente con:

- ✅ **Imagen de ejemplo** (base64 pequeña incluida)
- ✅ **Tu imagen real** (pega tu base64 en el código)
- ✅ **URL externa** (imagen panorámica pública)
- ✅ **Toggle giroscopio** ON/OFF
- ✅ **Instrucciones** paso a paso

## Cómo Usar

### 1. Importar en tu App

```typescript
import { Scene360TestScreen } from './src/screens/Scene360TestScreen';

// En tu navegador o App.tsx
<Scene360TestScreen />
```

### 2. Agregar a tu Navegación (React Navigation)

```typescript
// En tu Stack Navigator
import { Scene360TestScreen } from './src/screens';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Tus otras pantallas */}
        <Stack.Screen 
          name="Scene360Test" 
          component={Scene360TestScreen}
          options={{ title: 'Prueba 360°' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 3. Agregar Botón de Acceso

```typescript
// En cualquier pantalla donde quieras el botón de prueba
import { TouchableOpacity, Text } from 'react-native';

<TouchableOpacity 
  style={styles.testButton}
  onPress={() => navigation.navigate('Scene360Test')}
>
  <Text style={styles.testButtonText}>🌐 Probar Visor 360°</Text>
</TouchableOpacity>
```

## Usar Tu Propia Imagen

### Paso 1: Convertir Imagen a Base64

```bash
# En terminal (macOS/Linux)
base64 -i tu_panorama.jpg

# O usa herramientas online:
# https://www.base64-image.de/
# https://codebeautify.org/image-to-base64-converter
```

### Paso 2: Pegar en el Código

Abre `src/screens/Scene360TestScreen.tsx` y busca:

```typescript
const REAL_PANORAMA_BASE64 = `
// Pega tu imagen base64 aquí
// Debe ser una imagen equirectangular (proporción 2:1, ej: 4096x2048)
`.trim();
```

Reemplaza con:

```typescript
const REAL_PANORAMA_BASE64 = `
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==
// TU BASE64 AQUÍ (sin el prefijo data:image/...)
`.trim();
```

### Paso 3: Probar

1. Abre la pantalla de prueba
2. Selecciona "Tu Imagen Real (Base64)"
3. Presiona "Iniciar Prueba 360°"

## Formato de Imagen Recomendado

Para mejores resultados, usa imágenes:

- **Formato**: Equirectangular (panorama 360°)
- **Proporción**: 2:1 (ej: 4096x2048, 2048x1024)
- **Tipo**: JPG o PNG
- **Tamaño**: Máximo 4K para buen rendimiento

## Ejemplo de App.tsx Completa

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  HomeScreen, 
  Scene360Screen, 
  Scene360TestScreen 
} from './src/screens';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Booky' }}
        />
        <Stack.Screen 
          name="Scene360" 
          component={Scene360Screen}
          options={{ title: 'Generar Escena 360°' }}
        />
        <Stack.Screen 
          name="Scene360Test" 
          component={Scene360TestScreen}
          options={{ title: 'Prueba 360°' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

## Botón de Acceso Rápido en HomeScreen

```typescript
// En tu HomeScreen.tsx
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

// Dentro del render
<TouchableOpacity 
  style={styles.scene360Button}
  onPress={() => navigation.navigate('Scene360Test')}
>
  <Text style={styles.scene360ButtonText}>🌐 Probar Visor 360°</Text>
</TouchableOpacity>

const styles = StyleSheet.create({
  scene360Button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    margin: 16,
    alignItems: 'center',
  },
  scene360ButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

## Funcionalidades de la Pantalla de Prueba

### 🖼️ Fuentes de Imagen
- **Imagen de Ejemplo**: Pequeña imagen incluida para prueba rápida
- **Tu Imagen Real**: Pega tu base64 en el código
- **URL Externa**: Usa imagen panorámica desde internet

### 🧭 Controles
- **Toggle Giroscopio**: ON (movimiento) / OFF (táctil)
- **Zoom**: Botones +/- en el visor
- **Centrar**: Reset a posición inicial
- **Volver**: Regresa a la configuración

### 🔧 Fallbacks Automáticos
- Si WebView falla → cambia a Three.js
- Si no hay giroscopio → modo táctil
- Si imagen no carga → mensaje de error

## Troubleshooting

### "No se ve la imagen"
- Verifica que el base64 esté completo
- Asegúrate de que sea una imagen equirectangular
- Prueba primero con la "URL Externa"

### "Giroscopio no funciona"
- En iOS: necesita interacción del usuario
- En emulador: usa modo táctil
- Verifica permisos en app.json

### "WebView error"
- Automáticamente cambia a Three.js
- Verifica que las dependencias estén instaladas
- Limpia cache: `npx expo start --clear`

¡Ya puedes probar tu visor 360° inmediatamente! 🚀
