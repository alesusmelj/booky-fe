# 🌐 Guía de Prueba Rápida - Visor 360°

## ✅ Estado Actual
- ✅ Expo está ejecutándose con túnel
- ✅ Todas las dependencias están instaladas
- ✅ Pantalla de prueba integrada en la navegación
- ✅ Botón de acceso rápido en HomeScreen
- ✅ Sin errores de linting

## 🚀 Cómo Probar

### 1. Acceder al Visor de Prueba
1. Abre la app en tu dispositivo/emulador
2. En la pantalla principal (Home), busca el botón azul:
   **🌐 Probar Visor 360°**
3. Toca el botón para acceder a la pantalla de prueba

### 2. Opciones de Prueba Disponibles

#### 📱 Imagen de Ejemplo (Recomendado para primera prueba)
- **Qué es**: Una imagen pequeña de 1x1 pixel para probar la funcionalidad básica
- **Cuándo usar**: Para verificar que el visor carga correctamente
- **Resultado esperado**: Pantalla negra/gris que responde al giroscopio

#### 🖼️ Imagen Real Base64
- **Qué es**: Espacio para pegar una imagen panorámica real en formato base64
- **Cómo usar**: 
  1. Edita `src/screens/Scene360TestScreen.tsx`
  2. Reemplaza el comentario en `REAL_PANORAMA_BASE64` con tu imagen base64
  3. Reinicia la app
- **Formato**: `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...`

#### 🌐 URL de Imagen (Más Fácil)
- **Qué es**: Carga una imagen panorámica desde una URL pública
- **Ejemplo incluido**: `https://pannellum.org/images/cerro-toco-0.jpg`
- **Resultado esperado**: Paisaje montañoso de 360°

### 3. Controles Disponibles

#### 🎛️ Toggle Giroscopio
- **ON**: Mueve el teléfono para mirar alrededor
- **OFF**: Usa gestos táctiles (drag) para rotar la vista

#### 📱 Controles Táctiles (cuando giroscopio está OFF)
- **Drag**: Arrastra para rotar la cámara
- **Pinch**: Pellizca para hacer zoom (en WebView/PSV)

#### 🔄 Botones en el Visor (WebView)
- **Centrar Vista**: Vuelve a la posición inicial
- **Giroscopio ON/OFF**: Alterna el control por movimiento
- **Zoom +/-**: Acerca y aleja la vista

## 🔧 Solución de Problemas

### ❌ "No se puede cargar la imagen"
- **Causa**: URL no válida o problemas de red
- **Solución**: Usa la opción "Imagen de Ejemplo" primero

### ❌ "WebView no funciona"
- **Causa**: Problemas con react-native-webview
- **Solución**: El sistema cambiará automáticamente al visor Three.js
- **Indicador**: Verás una alerta ofreciendo usar el fallback

### ❌ "Giroscopio no responde"
- **Causa**: Permisos no otorgados o dispositivo sin giroscopio
- **Solución**: 
  1. Desactiva el giroscopio con el toggle
  2. Usa controles táctiles
  3. En iOS, puede requerir permisos adicionales

### ❌ "Pantalla en blanco"
- **Causa**: Error en la carga del HTML o la imagen
- **Solución**: 
  1. Reinicia la app
  2. Prueba con la "Imagen de Ejemplo"
  3. Verifica la consola de Expo para errores

## 📊 Casos de Prueba Recomendados

### ✅ Prueba Básica
1. Selecciona "Imagen de Ejemplo"
2. Giroscopio ON
3. Presiona "Iniciar Prueba"
4. Mueve el teléfono suavemente

### ✅ Prueba con Imagen Real
1. Selecciona "URL de Imagen"
2. Giroscopio ON
3. Presiona "Iniciar Prueba"
4. Explora el paisaje moviendo el teléfono

### ✅ Prueba sin Giroscopio
1. Cualquier imagen
2. Giroscopio OFF
3. Presiona "Iniciar Prueba"
4. Arrastra con el dedo para rotar

### ✅ Prueba de Fallback
1. Si aparece alerta de WebView
2. Acepta usar Three.js
3. Verifica que funciona igual

## 🎯 Resultados Esperados

### ✅ Funcionamiento Correcto
- La imagen se carga sin errores
- El giroscopio mueve la vista suavemente
- Los controles táctiles responden
- El zoom funciona (en WebView)
- No hay crashes ni pantallas en blanco

### ⚠️ Comportamientos Normales
- Ligero delay al cargar la imagen
- Cambio automático a Three.js si WebView falla
- Solicitud de permisos en iOS
- Diferencias visuales entre WebView y Three.js

## 📝 Notas Técnicas

- **WebView (Opción A)**: Usa Photo Sphere Viewer, más funciones
- **Three.js (Opción B)**: Fallback nativo, más básico pero confiable
- **Giroscopio**: Requiere dispositivo físico, no funciona en emuladores
- **Permisos iOS**: Puede requerir activación manual en Configuración

## 🆘 Si Nada Funciona

1. **Reinicia Expo**: `Ctrl+C` y `npx expo start --clear`
2. **Verifica dependencias**: Todas están instaladas según el log anterior
3. **Prueba en dispositivo real**: El giroscopio no funciona en emuladores
4. **Revisa la consola**: Busca errores en la terminal de Expo
5. **Usa imagen de ejemplo**: Siempre debería funcionar

---

**¡Listo para probar!** 🚀 El visor 360° está completamente configurado y funcionando.