# Dependencias para Scene360 - Comandos de Instalación

## Instalación de Dependencias

Ejecuta estos comandos en el directorio raíz del proyecto:

```bash
# Dependencias principales de Expo
npx expo install expo-sensors expo-gl expo-three expo-asset expo-file-system react-native-webview

# Three.js y tipos
npm install three @types/three

# Dependencias adicionales si no están instaladas
npm install --save-dev @types/react-native
```

## Verificar package.json

Después de la instalación, verifica que estas dependencias estén en tu `package.json`:

```json
{
  "dependencies": {
    "expo-sensors": "~13.0.5",
    "expo-gl": "~13.6.0", 
    "expo-three": "~7.0.0",
    "expo-asset": "~9.0.2",
    "expo-file-system": "~16.0.9",
    "react-native-webview": "13.8.6",
    "three": "^0.160.0"
  },
  "devDependencies": {
    "@types/three": "^0.160.0",
    "@types/react-native": "^0.72.8"
  }
}
```

## Configuración de app.json

Agrega estos permisos a tu `app.json`:

```json
{
  "expo": {
    "name": "Booky",
    "slug": "booky-fe",
    "platforms": ["ios", "android", "web"],
    "ios": {
      "infoPlist": {
        "NSMotionUsageDescription": "Esta aplicación usa el giroscopio para controlar la visualización 360° de escenas de libros."
      }
    },
    "android": {
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE"
      ]
    }
  }
}
```

## Verificar Instalación

Para verificar que todo está correctamente instalado:

```bash
# Verificar que las dependencias están instaladas
npm list expo-sensors expo-gl expo-three expo-asset expo-file-system react-native-webview three

# Limpiar cache si hay problemas
npx expo start --clear

# Reinstalar node_modules si es necesario
rm -rf node_modules package-lock.json
npm install
```

## Troubleshooting Común

### Error: "expo-sensors not found"
```bash
npx expo install expo-sensors
```

### Error: "three module not found"
```bash
npm install three @types/three
```

### Error: "WebView not working"
```bash
npx expo install react-native-webview
```

### Error: "GLView not rendering"
```bash
npx expo install expo-gl expo-three
```

### Error de TypeScript
```bash
npm install --save-dev @types/react-native @types/three
```

## Comandos de Desarrollo

```bash
# Iniciar en modo desarrollo
npx expo start

# Iniciar con cache limpio
npx expo start --clear

# Compilar para iOS
npx expo run:ios

# Compilar para Android  
npx expo run:android

# Ejecutar en web
npx expo start --web
```
