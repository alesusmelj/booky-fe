# 🎥 Sistema de Cámara Profesional - Refactorización Completa

## 🎯 **Objetivos Cumplidos:**

### ✅ **1. Desacople de Ejes:**
- **Yaw (α)**: Controla mirada izquierda/derecha (horizontal)
- **Pitch (β)**: Controla mirada arriba/abajo (vertical)
- **Roll (γ)**: Ignorado completamente para evitar interferencia

### ✅ **2. Sistema de Referencia Correcto:**
- **Compensación de orientación**: Portrait/Landscape automática
- **Sin cruce de ejes**: Cada eje mantiene su función independientemente
- **Orden Euler YXZ**: Evita gimbal lock

### ✅ **3. Suavizado Profesional:**
- **Filtro exponencial**: Elimina jitter y sobre-sensibilidad
- **Doble suavizado**: En sensor (0.2) + transform (0.3)
- **30 FPS estable**: Frecuencia optimizada para fluidez

### ✅ **4. Clamp & Safety:**
- **Pitch limitado**: ±85° para evitar gimbal lock
- **Yaw normalizado**: -180° a +180° sin saltos
- **Roll ignorado**: Elimina movimientos no deseados

### ✅ **5. Calibración Inicial:**
- **Posición de referencia**: (yaw0, pitch0) fijada al montar
- **Sin saltos**: La vista inicia desde posición actual
- **Recalibración**: Botón 📐 para resetear referencia

### ✅ **6. Compatibilidad:**
- **DeviceMotion primario**: Sensor preferido y más confiable
- **Gyroscope fallback**: Preparado para integración con dt
- **Detección automática**: Usa el mejor sensor disponible

## 🏗️ **Arquitectura del Sistema:**

### **Estado de Cámara Profesional:**
```typescript
const [cameraSystem, setCameraSystem] = useState({
  yaw: 0,           // Rotación horizontal actual
  pitch: 0,         // Rotación vertical actual
  yaw0: 0,          // Calibración inicial horizontal
  pitch0: 0,        // Calibración inicial vertical
  isActive: false,  // Sistema activo
  isCalibrating: false, // En proceso de calibración
  sensorType: 'none' | 'devicemotion' | 'gyroscope',
  sensitivity: 1.0, // Factor de sensibilidad (0.2-3.0)
});
```

### **Funciones Principales:**

#### **🔧 Utilidades de Cámara:**
```typescript
clampPitch(pitch: number): number        // Limita pitch a ±85°
normalizeYaw(yaw: number): number        // Normaliza yaw a ±180°
getScreenOrientation(): string           // Detecta portrait/landscape
applyExponentialFilter(): number         // Filtro de suavizado
```

#### **📡 Gestión de Sensores:**
```typescript
startSensorSystem(): Promise<void>       // Inicia sistema completo
stopSensorSystem(): void                 // Detiene sistema
processSensorData(): void                // Procesa datos del sensor
```

#### **🎮 Controles de Cámara:**
```typescript
centerView(): void                       // Resetea a (yaw=0°, pitch=0°)
recalibrateCamera(): Promise<void>       // Recalibra posición actual
adjustSensitivity(delta: number): void   // Ajusta sensibilidad ±0.2
```

## 🔄 **Flujo de Procesamiento:**

### **1. Inicialización:**
```
useGyro=true → startSensorSystem() → DeviceMotion.isAvailable() → 
Calibración (2s) → Sensor activo (30 FPS)
```

### **2. Procesamiento por Frame:**
```
Datos raw → Compensación orientación → Normalización → 
Calibración → Filtro exponencial → Transform de imagen
```

### **3. Compensación de Orientación:**
```javascript
if (orientation === 'landscape') {
  const temp = rawYaw;
  rawYaw = -rawPitch;    // Swap y ajuste
  rawPitch = temp;
}
```

### **4. Filtrado y Suavizado:**
```javascript
// Filtro exponencial en sensor
const filteredYaw = applyExponentialFilter(current, target, 0.2);

// Filtro adicional en transform
translateX = applyExponentialFilter(prev, new, 0.3);
```

## 📱 **Controles Actualizados:**

### **Lado Derecho:**
```
🎯   ← Centrar vista (resetea a yaw=0°, pitch=0°)
🔍-  ← Zoom out  
🔍+  ← Zoom in
🔄-  ← Sensibilidad -0.2 (rango: 0.2-3.0)
🔄+  ← Sensibilidad +0.2 (rango: 0.2-3.0)
📐   ← Recalibrar cámara (nueva posición de referencia)
📊   ← Habilitar/Deshabilitar logs profesionales
```

### **Estados Visuales:**
- **📐 Calibrando Cámara...** - Durante calibración inicial
- **🎥 DeviceMotion Activo** - Sistema funcionando (azul)
- **🎥 Gyroscope Activo** - Fallback funcionando
- **👆 Control Táctil** - Giroscopio deshabilitado

## 🧪 **Tests de Aceptación:**

### **✅ Test 1: Movimiento Horizontal Puro**
1. **Gira teléfono izquierda/derecha** (como brújula)
2. **Resultado esperado**: Solo yaw cambia, pitch estable
3. **Logs**: `Yaw: ±XX° Pitch: ~0°`

### **✅ Test 2: Movimiento Vertical Puro**
1. **Inclina teléfono arriba/abajo** (mantén orientación)
2. **Resultado esperado**: Solo pitch cambia, yaw estable
3. **Logs**: `Yaw: ~0° Pitch: ±XX°` (limitado a ±85°)

### **✅ Test 3: Orientación Portrait/Landscape**
1. **Rota teléfono** entre portrait y landscape
2. **Resultado esperado**: Mapeo se mantiene correcto
3. **Logs**: `Orientation: portrait/landscape`

### **✅ Test 4: Suavizado**
1. **Movimientos rápidos** del teléfono
2. **Resultado esperado**: Imagen se mueve suavemente, sin nerviosismo
3. **Sensibilidad estable** y predecible

### **✅ Test 5: Centrar Vista**
1. **Presiona 🎯** después de mover la imagen
2. **Resultado esperado**: Vista regresa a `yaw=0°, pitch=0°`
3. **Posición centrada** inmediatamente

## 📊 **Logs Profesionales:**

### **Formato Mejorado:**
```
🎥 Camera: yaw=15.2° pitch=-8.4° | X=760 Y=-420
📱 Orientation: portrait | Raw: α=15.2° β=-8.4° γ=2.1°
```

### **Información Mostrada:**
- **Camera**: Valores filtrados y calibrados
- **Orientation**: Portrait/Landscape actual
- **Raw**: Valores originales del sensor
- **X, Y**: Posición de imagen en píxeles

## 🎯 **Beneficios del Sistema Profesional:**

### ✅ **Robustez:**
- **Sin gimbal lock** (pitch limitado a ±85°)
- **Sin saltos** de 360° a 0°
- **Compensación automática** de orientación

### ✅ **Fluidez:**
- **Doble filtrado** exponencial
- **30 FPS estable** sin jitter
- **Sensibilidad ajustable** en tiempo real

### ✅ **Precisión:**
- **Ejes completamente separados**
- **Calibración automática** al inicio
- **Recalibración manual** cuando sea necesario

### ✅ **Compatibilidad:**
- **DeviceMotion + Gyroscope** fallback
- **Portrait + Landscape** automático
- **iOS + Android** optimizado

¡El sistema ahora es completamente profesional y robusto! 🎉
