# 📷 Configuración de Escaneo con Cámara Real

## 🎯 Objetivo
Habilitar el escaneo real de códigos de barras con la cámara del iPhone usando EAS Build.

## 📋 Requisitos Previos
- ✅ Cuenta de Expo/EAS (expo.dev)
- ✅ Apple Developer Account (para iOS)
- ✅ Xcode instalado (para desarrollo iOS)

## 🚀 Opción 1: EAS Build (Recomendado)

### **Paso 1: Login en EAS**
```bash
npx --registry https://registry.npmjs.org/ eas-cli login
```

### **Paso 2: Configurar EAS Build**
```bash
npx --registry https://registry.npmjs.org/ eas-cli build:configure
```

### **Paso 3: Crear Build de Desarrollo**
```bash
# Para iPhone (desarrollo)
npx --registry https://registry.npmjs.org/ eas-cli build --platform ios --profile development

# Para instalar en tu iPhone físico
npx --registry https://registry.npmjs.org/ eas-cli build --platform ios --profile preview
```

### **Paso 4: Instalar en tu iPhone**
1. **Desarrollo**: Instala Expo Dev Client desde App Store
2. **Preview**: Descarga el archivo .ipa y instala via TestFlight o Xcode

## 🛠️ Opción 2: Expo Dev Build Local

### **Paso 1: Instalar Expo Dev Client**
```bash
npx expo install expo-dev-client
```

### **Paso 2: Crear Build Local**
```bash
# Para iOS (requiere Xcode)
npx expo run:ios

# Para Android
npx expo run:android
```

## 📱 Opción 3: Desarrollo Rápido (Sin Build)

Si quieres probar la funcionalidad sin crear builds, puedes usar la entrada manual que ya está implementada:

### **En tu iPhone actual (Expo Go):**
1. **Abre la app** → Sin crashes ✅
2. **Ve al perfil o biblioteca**
3. **Presiona "Add Book"**
4. **Presiona "📷 Scan book ISBN"**
5. **Usa las opciones disponibles:**
   - **Entrada manual**: Escribe cualquier ISBN
   - **Demo**: Usa el ISBN de ejemplo (1984)

### **ISBNs de Prueba:**
```
9780451524935 - 1984 by George Orwell
9780061120084 - To Kill a Mockingbird
9780547928227 - The Hobbit
9780439708180 - Harry Potter and the Sorcerer's Stone
9780316769174 - The Catcher in the Rye
```

## ⚙️ Configuración Actual del Proyecto

Tu `app.json` ya está configurado correctamente:

```json
{
  "expo": {
    "plugins": [
      "expo-barcode-scanner"  ✅ Plugin habilitado
    ],
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "This app uses the camera to scan book ISBN barcodes for adding books to your library."  ✅ Permisos iOS
      }
    },
    "android": {
      "permissions": [
        "CAMERA"  ✅ Permisos Android
      ]
    }
  }
}
```

## 🔄 Flujo de Desarrollo Recomendado

### **Para Desarrollo Diario:**
1. **Usa Expo Go** con entrada manual de ISBN
2. **Prueba la funcionalidad** completa sin cámara
3. **Desarrolla otras features** sin fricciones

### **Para Testing de Cámara:**
1. **Crea build de desarrollo** con EAS Build
2. **Instala en iPhone físico**
3. **Prueba escaneo real** con códigos de barras físicos

### **Para Producción:**
1. **Build de producción** con EAS Build
2. **Distribución** via App Store o TestFlight

## 📝 Comandos Útiles

### **EAS Build Commands:**
```bash
# Ver builds
npx eas-cli build:list

# Ver estado de build
npx eas-cli build:view [BUILD_ID]

# Cancelar build
npx eas-cli build:cancel [BUILD_ID]

# Configurar credenciales
npx eas-cli credentials
```

### **Expo Commands:**
```bash
# Iniciar desarrollo
npx expo start

# Limpiar cache
npx expo start --clear

# Ver logs
npx expo logs
```

## 🎯 Próximos Pasos

### **Inmediato (Hoy):**
1. ✅ **Usar entrada manual** para continuar desarrollo
2. ✅ **Probar funcionalidad** con ISBNs de ejemplo
3. ✅ **Desarrollar otras features** sin limitaciones

### **Esta Semana:**
1. 🔄 **Crear cuenta EAS** si no tienes
2. 🔄 **Configurar EAS Build** siguiendo esta guía
3. 🔄 **Crear primer build de desarrollo**

### **Próxima Semana:**
1. 📱 **Instalar build en iPhone**
2. 📷 **Probar escaneo real** con libros físicos
3. 🚀 **Optimizar experiencia** de usuario

## 💡 Consejos

### **Desarrollo Eficiente:**
- ✅ **Usa entrada manual** para desarrollo diario
- ✅ **Builds solo para testing** de cámara
- ✅ **Mantén Expo Go** para desarrollo rápido

### **Testing:**
- 📚 **Ten libros físicos** listos para probar
- 📱 **Usa iPhone físico** (no simulador)
- 🔍 **Prueba diferentes tipos** de códigos de barras

### **Producción:**
- 🏗️ **EAS Build para distribución**
- 🍎 **App Store Connect** para publicación
- 📊 **Analytics** para monitorear uso

## 🎉 Resultado Final

Una vez configurado, tendrás:

### **En Expo Go (Desarrollo):**
- ✅ **Entrada manual** de ISBN
- ✅ **Demo funcional** con libros de ejemplo
- ✅ **Desarrollo sin fricciones**

### **En Build Nativo (Testing/Producción):**
- 📷 **Cámara real** para escaneo
- 🔍 **Detección automática** de códigos de barras
- 📱 **Experiencia completa** de usuario

¡Tu app estará lista para ambos entornos! 🚀📱✨
