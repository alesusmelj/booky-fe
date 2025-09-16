# 🔧 Diagnóstico de Crash - Visor 360°

## 🚨 Problema Reportado
La aplicación se cierra (crash) al presionar "Iniciar Prueba 360°"

## 🔍 Plan de Diagnóstico

He creado una **versión simplificada** para identificar exactamente dónde está el problema:

### 📱 **Pasos para Diagnosticar**

1. **Abre la app** en tu iPhone
2. **Ve a la pantalla principal (Home)**
3. **Verás DOS botones ahora**:
   - 🌐 **Probar Visor 360°** (el original que causa crash)
   - 🔧 **Diagnóstico 360°** (nuevo, versión simplificada)

4. **PRIMERO prueba el botón naranja**: 🔧 **Diagnóstico 360°**

### 🎯 **¿Qué Esperamos?**

#### ✅ **Si el Diagnóstico funciona:**
- La app NO se cierra
- Ves una pantalla con "Iniciar Prueba Simple"
- Al tocar el botón, ves "Cargando..." y luego un visor simulado
- **Conclusión**: El problema está en el WebView o Three.js

#### ❌ **Si el Diagnóstico también crashea:**
- La app se cierra igual
- **Conclusión**: El problema está en la navegación o componentes básicos

## 🔧 **Posibles Causas del Crash**

### 1. **Problema de Navegación**
- Error en el sistema de navegación
- Parámetros incorrectos

### 2. **Problema de WebView**
- `react-native-webview` no instalado correctamente
- Conflicto con iOS

### 3. **Problema de Three.js**
- `expo-gl` o `expo-three` causando problemas
- Conflicto con dependencias

### 4. **Problema de Sensores**
- `expo-sensors` causando crash en iOS
- Permisos de giroscopio

### 5. **Problema de Memoria**
- HTML muy grande causando out-of-memory
- Data URI demasiado largo

## 📋 **Información que Necesito**

Después de probar el **Diagnóstico 360°**, dime:

1. **¿Se cierra la app con el botón de Diagnóstico?** (Sí/No)
2. **¿Puedes navegar a la pantalla de diagnóstico?** (Sí/No)
3. **¿Puedes tocar "Iniciar Prueba Simple"?** (Sí/No)
4. **¿Ves la pantalla de "Cargando..."?** (Sí/No)
5. **¿Ves el visor simulado (caja negra)?** (Sí/No)

## 🚀 **Próximos Pasos**

Basado en tus respuestas, podré:
- Identificar exactamente dónde está el problema
- Crear una solución específica
- Hacer el visor 360° funcional en tu iPhone

---

**¡Prueba el botón naranja de Diagnóstico y cuéntame qué pasa!** 🔧
