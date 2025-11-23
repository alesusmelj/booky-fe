import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Dimensions,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { DeviceMotion, DeviceMotionMeasurement, Gyroscope } from 'expo-sensors';
import * as ScreenOrientation from 'expo-screen-orientation';
import { GLView } from 'expo-gl';
import { Asset } from 'expo-asset';
import { Renderer } from 'expo-three';
import * as ExpoTHREE from 'expo-three';
import * as THREE from 'three';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

export interface SimpleImageViewerProps {
  imageSource: {
    uri?: string;
    base64?: string;
  };
  useGyro?: boolean;
  initialYaw?: number;
  initialPitch?: number;
}

// Test panoramic image (small but real panoramic)
const TEST_PANORAMA_URI = 'https://cdn.pixabay.com/photo/2016/01/05/13/58/360-degree-1123718_1280.jpg';

// Función robusta para obtener URI local desde cualquier fuente
const uriFromSource = async (src: { uri?: string; base64?: string }): Promise<string> => {
  console.log('🔄 [URI] Obteniendo URI local desde fuente...');
  console.log('🔍 [URI] Fuente recibida:', { hasUri: !!src?.uri, hasBase64: !!src?.base64 });
  
  try {
    if (src?.base64) {
      console.log('📄 [URI] Convirtiendo base64 a archivo local...');
      console.log('🔍 [URI] Base64 length:', src.base64.length);
      
      const filePath = `${(FileSystem as any).documentDirectory}panorama_${Date.now()}.jpg`;
      console.log('🔍 [URI] Ruta de archivo:', filePath);
      
      await FileSystem.writeAsStringAsync(filePath, src.base64, { 
        encoding: 'base64'
      });
      
      // Verificar que el archivo se creó
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      console.log('🔍 [URI] Archivo creado:', fileInfo);
      
      console.log('✅ [URI] Base64 guardado como archivo:', filePath);
      return filePath; // file://
    }
    
    if (src?.uri) {
      console.log('🌐 [URI] Descargando desde URI:', src.uri);
      console.log('🔍 [URI] Creando Asset...');
      
      const asset = Asset.fromURI(src.uri);
      console.log('🔍 [URI] Asset creado:', !!asset);
      
      console.log('🔍 [URI] Iniciando descarga...');
      await asset.downloadAsync();
      
      const localUri = asset.localUri ?? asset.uri;
      console.log('🔍 [URI] Asset info:', {
        localUri: asset.localUri,
        uri: asset.uri,
        downloaded: asset.downloaded,
        name: asset.name
      });
      
      console.log('✅ [URI] Asset descargado, URI local:', localUri);
      return localUri; // local path si es posible
    }
    
    console.log('🎯 [URI] Usando imagen de prueba por defecto');
    console.log('🔍 [URI] URL de prueba:', TEST_PANORAMA_URI);
    
    const asset = Asset.fromURI(TEST_PANORAMA_URI);
    console.log('🔍 [URI] Asset de prueba creado');
    
    await asset.downloadAsync();
    console.log('🔍 [URI] Asset de prueba descargado');
    
    const localUri = asset.localUri ?? asset.uri;
    console.log('🔍 [URI] Asset de prueba info:', {
      localUri: asset.localUri,
      uri: asset.uri,
      downloaded: asset.downloaded
    });
    
    console.log('✅ [URI] Imagen de prueba descargada:', localUri);
    return localUri;
  } catch (error) {
    console.error('❌ [URI] Error obteniendo URI local:', error);
    throw error;
  }
};

// Tipos para las opciones de carga
type LoadOpts = {
  timeoutMs?: number;
  noMipmaps?: boolean;
  maxWidth?: number; // p.ej. 4096
};

// Loader robusto mejorado para iOS/Expo Go con expo-three y timeout real
const loadTextureRobustAsync = async (
  url: string,
  opts: LoadOpts = {}
): Promise<THREE.Texture> => {
  const timeoutMs = opts.timeoutMs ?? 10000;
  const maxWidth = opts.maxWidth ?? 4096;

  console.log('🖼️ [ROBUST] Iniciando carga robusta mejorada:', url);
  console.log('🔍 [ROBUST] Opciones:', { timeoutMs, maxWidth, noMipmaps: opts.noMipmaps });

  // Validación temprana para iOS ATS
  if (url.startsWith('http://')) {
    const error = new Error('iOS/ATS bloquea http:// — usa https://');
    console.error('❌ [ROBUST] Error ATS:', error.message);
    throw error;
  }

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => {
      reject(new Error(`Timeout tras ${timeoutMs} ms`));
    }, timeoutMs)
  );

  const loadOp = (async () => {
    const isNative = Platform.OS === 'ios' || Platform.OS === 'android';
    console.log('🔍 [ROBUST] Plataforma:', Platform.OS, 'isNative:', isNative);

    if (isNative) {
      console.log('📱 [ROBUST] Usando ruta nativa optimizada para RN/Expo Go...');
      
      let localUri = url;
      
      // Para Android, intentar usar URL directa si es HTTP/HTTPS
      if (Platform.OS === 'android' && (url.startsWith('http://') || url.startsWith('https://'))) {
        console.log('🤖 [ANDROID] Intentando carga directa sin expo-asset...');
        
        try {
          // Intentar cargar directamente con ExpoTHREE
          console.log('🎨 [ANDROID] Cargando directamente con ExpoTHREE.loadAsync...');
          const texture: THREE.Texture = await ExpoTHREE.loadAsync(url);
          console.log('✅ [ANDROID] Textura cargada directamente');
          
          // Aplicar configuraciones
          if (opts.noMipmaps) {
            texture.generateMipmaps = false;
            texture.minFilter = THREE.LinearFilter;
          }
          texture.magFilter = THREE.LinearFilter;
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          texture.flipY = true;
          
          if ((texture as any).colorSpace !== undefined) {
            (texture as any).colorSpace = THREE.SRGBColorSpace;
          } else if ((THREE as any).sRGBEncoding !== undefined) {
            (texture as any).encoding = (THREE as any).sRGBEncoding;
          }
          
          texture.needsUpdate = true;
          console.log('✅ [ANDROID] Carga directa exitosa');
          return texture;
        } catch (directError) {
          console.warn('⚠️ [ANDROID] Fallo carga directa, intentando con Asset...', directError);
          // Continuar con método de Asset
        }
      }
      
      // Método estándar con expo-asset (para iOS o si Android falló carga directa)
      console.log('📁 [ROBUST] Creando Asset...');
      const asset = /^\d+$/.test(url) ? Asset.fromModule(Number(url)) : Asset.fromURI(url);
      
      try {
        console.log('⬇️ [ROBUST] Descargando Asset...');
        await asset.downloadAsync();
        localUri = asset.localUri ?? asset.uri;
        console.log('✅ [ROBUST] Asset descargado:', localUri);
      } catch (downloadError) {
        console.error('❌ [ROBUST] Error descargando asset:', downloadError);
        throw new Error(`Error descargando imagen: ${downloadError}`);
      }

      // 2) Redimensionar preventivo (evita cuelgues por MAX_TEXTURE_SIZE)
      try {
        console.log('🔧 [ROBUST] Redimensionando imagen preventivo...');
        const resized = await ImageManipulator.manipulateAsync(
          localUri,
          [{ resize: { width: maxWidth } }],
          { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
        );
        localUri = resized.uri;
        console.log('✅ [ROBUST] Imagen redimensionada:', localUri);
      } catch (resizeError) {
        console.warn('⚠️ [ROBUST] Fallo redimensionamiento, usando original:', resizeError);
        // si falla el resize, seguimos con el original
      }

      // 3) Cargar textura con expo-three (más estable que TextureLoader en RN)
      console.log('🎨 [ROBUST] Cargando textura con ExpoTHREE.loadAsync...');
      const texture: THREE.Texture = await ExpoTHREE.loadAsync(localUri);
      console.log('✅ [ROBUST] Textura cargada con ExpoTHREE');

      // 4) Ajustes recomendados para panoramas en móvil
      console.log('⚙️ [ROBUST] Aplicando configuraciones optimizadas...');
      if (opts.noMipmaps) {
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
      }
      texture.magFilter = THREE.LinearFilter;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.flipY = true; // Configuración óptima encontrada
      
      // Color space moderno
      if ((texture as any).colorSpace !== undefined) {
        (texture as any).colorSpace = THREE.SRGBColorSpace;
      } else if ((THREE as any).sRGBEncoding !== undefined) {
        (texture as any).encoding = (THREE as any).sRGBEncoding;
      }
      
      texture.needsUpdate = true;
      console.log('✅ [ROBUST] Configuraciones aplicadas');

      return texture;
    }

    // --- Web fallback: TextureLoader "clásico" ---
    console.log('🌐 [ROBUST] Usando fallback web con TextureLoader...');
    const loader = new THREE.TextureLoader();
    
    // Configurar crossOrigin correctamente
    if (typeof (loader as any).setCrossOrigin === 'function') {
      (loader as any).setCrossOrigin('anonymous');
    } else {
      loader.crossOrigin = 'anonymous';
    }

    return await new Promise<THREE.Texture>((resolve, reject) => {
      loader.load(
        url,
        (texture) => {
          console.log('✅ [ROBUST] Textura cargada con TextureLoader web');
          
          if (opts.noMipmaps) {
            texture.generateMipmaps = false;
            texture.minFilter = THREE.LinearFilter;
          }
          texture.magFilter = THREE.LinearFilter;
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          texture.flipY = true; // Configuración óptima encontrada
          
          // Color space
          if ((texture as any).colorSpace !== undefined) {
            (texture as any).colorSpace = THREE.SRGBColorSpace;
          } else if ((THREE as any).sRGBEncoding !== undefined) {
            (texture as any).encoding = (THREE as any).sRGBEncoding;
          }
          
          texture.needsUpdate = true;
          resolve(texture);
        },
        undefined, // onProgress: poco fiable en web también
        (err: any) => {
          console.error('❌ [ROBUST] Error TextureLoader web:', err);
          reject(new Error(`TextureLoader failed: ${err?.message ?? 'Unknown'}`));
        }
      );
    });
  })();

  // Timeout real (nota: no cancela la descarga subyacente, sólo rechaza antes)
  return Promise.race([loadOp, timeout]);
};

// Función auxiliar para configurar wrapping alternativo si se necesita "girar" la panorámica
const configureTextureWrapping = (texture: THREE.Texture, mode: 'clamp' | 'repeat-horizontal' = 'clamp') => {
  if (mode === 'repeat-horizontal') {
    console.log('🔄 [TEXTURE] Configurando RepeatWrapping horizontal para rotación');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.x = -1;     // invierte horizontal
    texture.center.set(0.5, 0.5);
  } else {
    console.log('🔒 [TEXTURE] Configurando ClampToEdgeWrapping (recomendado)');
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
  }
  // Mantener la configuración óptima de flipY
  texture.flipY = true;
  texture.needsUpdate = true;
};

// Crear textura procedural para iOS (sin cargar archivos externos)
const createProceduralTexture = (type: 'panorama' | 'test' = 'panorama'): THREE.Texture => {
  console.log('🎨 [PROCEDURAL] Creando textura procedural:', type);
  
  const width = type === 'panorama' ? 2048 : 512;
  const height = type === 'panorama' ? 1024 : 256;
  const size = width * height;
  const data = new Uint8Array(4 * size);
  
  for (let i = 0; i < size; i++) {
    const x = i % width;
    const y = Math.floor(i / width);
    const stride = i * 4;
    
    if (type === 'panorama') {
      // Crear un panorama más realista y definido
      const u = x / width;  // 0 to 1 horizontal
      const v = y / height; // 0 to 1 vertical
      
      // Definir regiones más claras
      const skyRegion = v < 0.4;        // 40% superior = cielo
      const mountainRegion = v >= 0.4 && v < 0.7; // 30% medio = montañas
      const groundRegion = v >= 0.7;    // 30% inferior = tierra
      
      if (skyRegion) {
        // CIELO: Gradiente azul más realista con nubes definidas
        const skyIntensity = 1 - (v / 0.4); // Más claro arriba
        const cloudNoise = Math.sin(u * Math.PI * 6) * Math.sin(v * Math.PI * 8) * Math.sin(u * Math.PI * 15);
        const hasCloud = cloudNoise > 0.4;
        
        if (hasCloud) {
          // Nubes blancas brillantes
          data[stride] = 255;
          data[stride + 1] = 255;
          data[stride + 2] = 255;
        } else {
          // Cielo azul con gradiente
          data[stride] = Math.floor(100 + skyIntensity * 55);      // R: 100-155
          data[stride + 1] = Math.floor(150 + skyIntensity * 56);  // G: 150-206  
          data[stride + 2] = Math.floor(200 + skyIntensity * 55);  // B: 200-255
        }
      } else if (mountainRegion) {
        // MONTAÑAS: Perfil más definido con variaciones
        const mountainHeight = Math.sin(u * Math.PI * 8) * 0.15 + 0.55; // Picos variables
        const isAboveMountain = v < mountainHeight;
        
        if (isAboveMountain) {
          // Montañas con sombras y luces
          const mountainShade = Math.sin(u * Math.PI * 20) * 0.3 + 0.7;
          const baseGray = 80;
          const grayValue = Math.floor(baseGray + mountainShade * 60);
          
          data[stride] = grayValue;
          data[stride + 1] = grayValue;
          data[stride + 2] = grayValue + 10; // Tinte azulado
        } else {
          // Transición a tierra (colinas verdes)
          data[stride] = 60;   // R
          data[stride + 1] = 120; // G  
          data[stride + 2] = 40;  // B
        }
      } else {
        // TIERRA: Verde más natural con variaciones
        const grassVariation = Math.sin(u * Math.PI * 25) * Math.sin(v * Math.PI * 30) * 0.3 + 0.7;
        
        data[stride] = Math.floor(20 + grassVariation * 40);   // R: 20-60
        data[stride + 1] = Math.floor(80 + grassVariation * 60); // G: 80-140
        data[stride + 2] = Math.floor(20 + grassVariation * 30); // B: 20-50
      }
      
      // Líneas de referencia más sutiles y útiles
      const isVerticalLine = (x % (width / 8)) < 2;  // Cada 45° horizontal
      const isHorizontalLine = Math.abs(y - height/2) < 1; // Línea de horizonte
      
      if (isVerticalLine || isHorizontalLine) {
        // Líneas amarillas más visibles pero no invasivas
        data[stride] = Math.min(255, data[stride] + 100);     // Aumentar R
        data[stride + 1] = Math.min(255, data[stride + 1] + 100); // Aumentar G
        data[stride + 2] = Math.max(0, data[stride + 2] - 50);    // Reducir B para amarillo
      }
    } else {
      // Patrón de cuadrícula simple para test
      const isGridX = x % 64 < 4;
      const isGridY = y % 32 < 2;
      const isGrid = isGridX || isGridY;
      
      if (isGrid) {
        data[stride] = 255;
        data[stride + 1] = 255;
        data[stride + 2] = 255;
      } else {
        data[stride] = 74;
        data[stride + 1] = 144;
        data[stride + 2] = 226;
      }
    }
    
    data[stride + 3] = 255; // Alpha
  }
  
  const texture = new THREE.DataTexture(data, width, height);
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBAFormat;
  texture.type = THREE.UnsignedByteType;
  texture.wrapS = THREE.ClampToEdgeWrapping; // Cambiado para evitar seams
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.flipY = true; // Configuración óptima encontrada
  
  // Color space moderno
  if ((texture as any).colorSpace !== undefined) {
    (texture as any).colorSpace = THREE.SRGBColorSpace;
  } else if ((THREE as any).sRGBEncoding !== undefined) {
    (texture as any).encoding = (THREE as any).sRGBEncoding;
  }
  
  console.log('✅ [PROCEDURAL] Textura procedural creada:', width + 'x' + height);
  return texture;
};

// Función principal de carga de textura panorámica
const loadPanoramaTexture = async (src: { uri?: string; base64?: string }): Promise<THREE.Texture> => {
  console.log('🚀 [TEXTURE] Iniciando carga robusta de textura panorámica...');
  console.log('🔍 [TEXTURE] Fuente recibida:', { hasUri: !!src?.uri, hasBase64: !!src?.base64 });
  console.log('📱 [TEXTURE] Plataforma:', Platform.OS);
  
  // Si hay una imagen específica, intentar cargarla primero
  if (src?.uri || src?.base64) {
    console.log('🖼️ [TEXTURE] Imagen específica detectada, intentando carga...');
    
    try {
      // Método 1: Intentar carga HTTP directa (solo para URLs) - MÁS ROBUSTO
      if (src.uri && src.uri.startsWith('http')) {
        console.log('🌐 [TEXTURE] Intentando carga HTTP directa:', src.uri);
        
        // En Android, intentar método directo primero (sin expo-asset)
        if (Platform.OS === 'android') {
          try {
            console.log('🤖 [ANDROID] Usando método directo para Android...');
            const texture = await loadTextureRobustAsync(src.uri, {
              timeoutMs: 20000, // Más tiempo para Android
              noMipmaps: true,
              maxWidth: 4096
            });
            console.log('🎉 [ANDROID] Carga HTTP directa exitosa en Android');
            return texture;
          } catch (androidError) {
            console.warn('⚠️ [ANDROID] Fallo método directo Android:', androidError);
            // Continuar a método 2
          }
        } else {
          // iOS - método original
          try {
            const texture = await loadTextureRobustAsync(src.uri, {
              timeoutMs: 15000,
              noMipmaps: true,
              maxWidth: 4096
            });
            console.log('🎉 [IOS] Carga HTTP directa exitosa en iOS');
            return texture;
          } catch (iosError) {
            console.warn('⚠️ [IOS] Fallo HTTP directo iOS:', iosError);
          }
        }
      }
      
      // Método 2: Usar expo-asset para descargar y cargar localmente
      console.log('📁 [TEXTURE] Intentando método local con expo-asset...');
      try {
        const localUri = await uriFromSource(src);
        const texture = await loadTextureRobustAsync(localUri, {
          timeoutMs: 10000,
          noMipmaps: true,
          maxWidth: 4096
        });
        console.log('🎉 [TEXTURE] Carga local exitosa');
        return texture;
      } catch (assetError) {
        console.warn('⚠️ [TEXTURE] Fallo método expo-asset:', assetError);
      }
      
    } catch (imageError) {
      console.warn('⚠️ [TEXTURE] Fallo cargando imagen específica:', imageError);
      console.log('🔄 [TEXTURE] Cayendo a panorama procedural como fallback...');
    }
  } else {
    console.log('🎨 [TEXTURE] Sin imagen específica, usando panorama procedural');
  }
  
  // Fallback confiable: Panorama procedural
  console.log('🎨 [FALLBACK] Usando panorama procedural (funciona garantizado)');
  console.log('💡 [FALLBACK] Esto garantiza que siempre veas algo en lugar de negro');
  try {
    const texture = createProceduralTexture('panorama');
    console.log('🎉 [FALLBACK] Panorama procedural creado exitosamente');
    return texture;
  } catch (error) {
    console.error('❌ [FALLBACK] Error crítico creando panorama procedural:', error);
    return createProceduralTexture('test');
  }
};

export const SimpleImageViewer: React.FC<SimpleImageViewerProps> = ({
  imageSource,
  useGyro = true,
  initialYaw = 0,
  initialPitch = 0,
}) => {
  console.log('🎬 [VIEWER] SimpleImageViewer iniciado con:', { 
    hasUri: !!imageSource.uri, 
    hasBase64: !!imageSource.base64, 
    useGyro 
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loggingEnabled, setLoggingEnabled] = useState(true); // HABILITAR logging por defecto para debug
  
  // Professional camera system with proper orientation handling
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const filteredYawRef = useRef(0);
  const filteredPitchRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const yaw0Ref = useRef(0);
  const pitch0Ref = useRef(0);
  const lastLogTime = useRef(0);
  const logInterval = 1000;
  
  const [orientation, setOrientation] = useState<ScreenOrientation.Orientation | null>(null);
  const [sensorSystem, setSensorSystem] = useState({
    isActive: false,
    isCalibrating: false,
    sensorType: 'none' as 'devicemotion' | 'gyroscope' | 'none',
    sensitivity: 0.5, // Lower default for dramatic movements
  });
  
  const sensorSubscription = useRef<any>(null);
  
  // No transform state needed - 3D camera handles rotation directly
  
  // Rotation state
  const rotationRef = useRef({
    yaw: initialYaw,
    pitch: initialPitch,
  });
  
  // Touch state
  const touchRef = useRef({
    lastX: 0,
    lastY: 0,
    isDragging: false,
  });

  const { width, height } = Dimensions.get('window');

  // Professional camera utilities following exact specifications
  const clamp = (v: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, v));
  };

  const normalizePi = (v: number): number => {
    // Normalize to (-π, π] range
    const twoPi = Math.PI * 2;
    v = ((v + Math.PI) % twoPi + twoPi) % twoPi - Math.PI;
    return v;
  };

  const ema = (prev: number, target: number, dt: number, tau: number = 0.1): number => {
    // Exponential moving average: filtered = prev + (target - prev) * (1 - exp(-dt / tau))
    const alpha = 1 - Math.exp(-dt / tau);
    return prev + (target - prev) * alpha;
  };

  const degToRad = (degrees: number): number => degrees * (Math.PI / 180);
  const radToDeg = (radians: number): number => radians * (180 / Math.PI);

  // Professional sensor processing with exact orientation compensation
  const processSensorData = (data: DeviceMotionMeasurement) => {
    if (!data.rotation) return;

    const currentTime = Date.now() / 1000;
    const dt = lastTimeRef.current ? (currentTime - lastTimeRef.current) : 1 / 60;
    lastTimeRef.current = currentTime;

    const r = data.rotation; // { alpha, beta, gamma } in radians (Expo)
    let yaw = r.alpha ?? 0;   // around Z-axis
    let pitch = r.beta ?? 0;  // around X-axis
    const roll = r.gamma ?? 0; // around Y-axis

    // Detectar landscape por dimensiones si orientation es null
    let effectiveOrientation = orientation;
    if (effectiveOrientation === null || effectiveOrientation === undefined) {
      const dims = Dimensions.get('window');
      const isLandscape = dims.width > dims.height;
      if (isLandscape) {
        // Asumir LANDSCAPE_LEFT por defecto si no tenemos info específica
        effectiveOrientation = ScreenOrientation.Orientation.LANDSCAPE_LEFT;
        console.log('🔧 [ORIENTATION] Detectado landscape por dimensiones:', dims.width + 'x' + dims.height);
      } else {
        effectiveOrientation = ScreenOrientation.Orientation.PORTRAIT_UP;
      }
    }

    // Compensate for screen orientation following exact specifications
    // CRÍTICO: En landscape, beta y gamma cambian de significado
    switch (effectiveOrientation) {
      case ScreenOrientation.Orientation.LANDSCAPE_LEFT:
        // Device rotated 90° CCW - el teléfono está girado hacia la izquierda
        yaw = normalizePi(yaw - Math.PI / 2);
        // En landscape left: roll es el pitch (arriba/abajo)
        pitch = roll;
        console.log('📱 [LANDSCAPE_LEFT] Raw: α=' + radToDeg(r.alpha || 0).toFixed(1) + '° β=' + radToDeg(r.beta || 0).toFixed(1) + '° γ=' + radToDeg(roll).toFixed(1) + '°');
        break;
      case ScreenOrientation.Orientation.LANDSCAPE_RIGHT:
        // Device rotated 90° CW - el teléfono está girado hacia la derecha
        yaw = normalizePi(yaw + Math.PI / 2);
        // En landscape right: -roll es el pitch (arriba/abajo)
        pitch = -roll;
        console.log('📱 [LANDSCAPE_RIGHT] Raw: α=' + radToDeg(r.alpha || 0).toFixed(1) + '° β=' + radToDeg(r.beta || 0).toFixed(1) + '° γ=' + radToDeg(roll).toFixed(1) + '°');
        break;
      case ScreenOrientation.Orientation.PORTRAIT_DOWN:
        yaw = normalizePi(yaw + Math.PI);
        pitch = pitch;
        break;
      case ScreenOrientation.Orientation.PORTRAIT_UP:
      default:
        yaw = normalizePi(yaw);
        pitch = -pitch;
        break;
    }

    // Initial calibration
    if (yaw0Ref.current === 0 && pitch0Ref.current === 0) {
      yaw0Ref.current = yaw;
      pitch0Ref.current = pitch;
      console.log('🎯 [CALIBRATION] Calibración inicial: yaw0=' + radToDeg(yaw).toFixed(1) + '° pitch0=' + radToDeg(pitch).toFixed(1) + '°');
    }

    // Apply calibration offsets
    const yawEff = normalizePi(yaw - yaw0Ref.current);
    const pitchEff = pitch - pitch0Ref.current;

    // Apply exponential smoothing with tau ~ 0.1 seconds
    filteredYawRef.current = ema(filteredYawRef.current, yawEff, dt, 0.1);
    filteredPitchRef.current = ema(filteredPitchRef.current, pitchEff, dt, 0.1);

    // Clamp pitch to ±85° and store for rendering
    yawRef.current = filteredYawRef.current;
    pitchRef.current = clamp(filteredPitchRef.current, degToRad(-85), degToRad(85));

    // No need for image transforms - the 3D camera handles rotation directly
    // yawRef.current and pitchRef.current are used directly in the render loop

    // Throttled logging
    if (loggingEnabled && (currentTime * 1000 - lastLogTime.current) >= logInterval) {
      console.log(`🎥 Camera: yaw=${radToDeg(yawRef.current).toFixed(1)}° pitch=${radToDeg(pitchRef.current).toFixed(1)}°`);
      console.log(`📱 Orientation: ${effectiveOrientation} | Raw: α=${radToDeg(r.alpha || 0).toFixed(1)}° β=${radToDeg(r.beta || 0).toFixed(1)}° γ=${radToDeg(roll).toFixed(1)}°`);
      lastLogTime.current = currentTime * 1000;
    }
  };

  // Pan responder for touch controls
  // Constantes para el control táctil de la cámara 3D
  const DRAG_YAW_K = 0.005;   // sensibilidad horizontal
  const DRAG_PITCH_K = 0.003; // sensibilidad vertical

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !useGyro,
    onMoveShouldSetPanResponder: () => !useGyro,
    
    onPanResponderGrant: (evt) => {
      if (!useGyro) {
        touchRef.current.isDragging = true;
        touchRef.current.lastX = evt.nativeEvent.pageX;
        touchRef.current.lastY = evt.nativeEvent.pageY;
      }
    },
    
    onPanResponderMove: (evt) => {
      if (!useGyro && touchRef.current.isDragging) {
        const dx = evt.nativeEvent.pageX - touchRef.current.lastX;
        const dy = evt.nativeEvent.pageY - touchRef.current.lastY;

        // Rotar cámara (no mover imagen)
        yawRef.current = yawRef.current - dx * DRAG_YAW_K;
        const nextPitch = pitchRef.current + dy * DRAG_PITCH_K;
        pitchRef.current = Math.max(THREE.MathUtils.degToRad(-85), Math.min(THREE.MathUtils.degToRad(85), nextPitch));

        touchRef.current.lastX = evt.nativeEvent.pageX;
        touchRef.current.lastY = evt.nativeEvent.pageY;
      }
    },
    
    onPanResponderRelease: () => {
      touchRef.current.isDragging = false;
    },
  });

  // Image source is handled directly in loadPanoramaTexture

  // Professional sensor management with DeviceMotion + Gyroscope fallback
  const startSensorSystem = async () => {
    try {
      setSensorSystem(prev => ({ ...prev, isCalibrating: true }));
      
      // Try DeviceMotion first (preferred)
      const deviceMotionAvailable = await DeviceMotion.isAvailableAsync();
      
      if (deviceMotionAvailable) {
        console.log('🎥 Starting DeviceMotion sensor system');
        
        DeviceMotion.setUpdateInterval(16); // ~60Hz as specified
        const subscription = DeviceMotion.addListener(processSensorData);
        sensorSubscription.current = subscription;
        
        setSensorSystem(prev => ({
          ...prev,
          sensorType: 'devicemotion',
          isCalibrating: false,
          isActive: true,
        }));
        
        console.log('✅ DeviceMotion sensor system started');
        
      } else {
        // Fallback to Gyroscope with integration
        console.log('⚠️ DeviceMotion not available, trying Gyroscope fallback');
        const gyroAvailable = await Gyroscope.isAvailableAsync();
        
        if (gyroAvailable) {
          console.log('🔄 Starting Gyroscope fallback with integration');
          
          Gyroscope.setUpdateInterval(16); // ~60Hz
          const subscription = Gyroscope.addListener((gyroData) => {
            const currentTime = Date.now() / 1000;
            const dt = lastTimeRef.current ? (currentTime - lastTimeRef.current) : 1 / 60;
            lastTimeRef.current = currentTime;
            
            // Integrate gyroscope rates (rad/s) with dt
            yawRef.current += (gyroData.z ?? 0) * dt;   // rateZ for yaw
            pitchRef.current += (-(gyroData.x || 0)) * dt; // -rateX for pitch
            
            // Apply same filtering and clamping
            yawRef.current = normalizePi(yawRef.current);
            pitchRef.current = clamp(pitchRef.current, degToRad(-85), degToRad(85));
            
            // No need for image transforms - the 3D camera handles rotation directly
            // yawRef.current and pitchRef.current are used directly in the render loop
          });
          
          sensorSubscription.current = subscription;
          
          setSensorSystem(prev => ({
            ...prev,
            sensorType: 'gyroscope',
            isCalibrating: false,
            isActive: true,
          }));
          
          console.log('✅ Gyroscope fallback started');
        } else {
          throw new Error('No motion sensors available');
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to start sensor system:', error);
      setSensorSystem(prev => ({
        ...prev,
        isCalibrating: false,
        isActive: false,
        sensorType: 'none',
      }));
    }
  };

  const stopSensorSystem = () => {
    if (sensorSubscription.current) {
      sensorSubscription.current.remove();
      sensorSubscription.current = null;
    }
    
    setSensorSystem(prev => ({
      ...prev,
      isActive: false,
      sensorType: 'none',
    }));
    
    console.log('🛑 Sensor system stopped');
  };

  // Professional camera controls following specifications
  const centerView = () => {
    // Reset to calibrated position (yaw0, pitch0)
    yawRef.current = 0;
    pitchRef.current = 0;
    filteredYawRef.current = 0;
    filteredPitchRef.current = 0;
    
    // No transform needed - 3D camera resets directly
    
    console.log('🎯 View centered to (yaw=0°, pitch=0°)');
  };

  const recalibrateCamera = async () => {
    // Reset calibration to current position
    yaw0Ref.current = 0;
    pitch0Ref.current = 0;
    
    // Reset current position
    yawRef.current = 0;
    pitchRef.current = 0;
    filteredYawRef.current = 0;
    filteredPitchRef.current = 0;
    
    console.log('📐 Camera recalibrated to current position');
  };

  const adjustSensitivity = (delta: number) => {
    setSensorSystem(prev => ({
      ...prev,
      sensitivity: Math.max(0.2, Math.min(3.0, prev.sensitivity + delta)),
    }));
  };

  // Función para probar diferentes orientaciones de la textura
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const [orientationMode, setOrientationMode] = useState(4); // Empezar en modo 4 (FlipY=true)
  
  const cycleOrientation = () => {
    if (!sphereRef.current) return;
    
    const modes = [
      { scale: [1, 1, 1], flipY: false, name: "Normal" },
      { scale: [-1, 1, 1], flipY: false, name: "Flip X" },
      { scale: [1, -1, 1], flipY: false, name: "Flip Y" },
      { scale: [-1, -1, 1], flipY: false, name: "Flip X+Y" },
      { scale: [1, 1, 1], flipY: true, name: "FlipY=true" },
      { scale: [-1, 1, 1], flipY: true, name: "Flip X + FlipY=true" },
    ];
    
    const nextMode = (orientationMode + 1) % modes.length;
    const mode = modes[nextMode];
    
    sphereRef.current.scale.set(mode.scale[0], mode.scale[1], mode.scale[2]);
    
    // Actualizar flipY de la textura si es necesario
    const material = sphereRef.current.material as THREE.MeshBasicMaterial;
    if (material.map) {
      material.map.flipY = mode.flipY;
      material.map.needsUpdate = true;
    }
    
    setOrientationMode(nextMode);
    console.log(`🔄 [ORIENTATION] Modo ${nextMode}: ${mode.name}`, mode);
  };


  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully');
    setImageLoaded(true);
    setIsLoading(false);
  };

  const handleImageError = (error: any) => {
    console.error('❌ Error loading image:', error);
    setError('Error cargando la imagen. Verifica tu conexión a internet.');
    setIsLoading(false);
  };

  // Zoom functionality can be implemented by changing camera FOV
  const zoomIn = () => {
    console.log('🔍 Zoom in - can be implemented with camera.fov');
  };

  const zoomOut = () => {
    console.log('🔍 Zoom out - can be implemented with camera.fov');
  };

  const toggleLogging = () => {
    setLoggingEnabled(prev => {
      const newState = !prev;
      console.log(newState ? '📊 Logging habilitado - Verás logs cada 1 segundo' : '🔇 Logging deshabilitado');
      return newState;
    });
  };

  // Handle screen orientation detection
  useEffect(() => {
    ScreenOrientation.getOrientationAsync()
      .then(setOrientation)
      .catch(() => setOrientation(ScreenOrientation.Orientation.PORTRAIT_UP));
    
    const subscription = ScreenOrientation.addOrientationChangeListener((event) => {
      setOrientation(event.orientationInfo.orientation);
      console.log('📱 Orientation changed to:', event.orientationInfo.orientation);
    });
    
    return () => {
      ScreenOrientation.removeOrientationChangeListeners();
    };
  }, []);

  // Handle sensor system toggle
  useEffect(() => {
    if (useGyro) {
      startSensorSystem();
    } else {
      stopSensorSystem();
    }
    
    return () => {
      stopSensorSystem();
    };
  }, [useGyro]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSensorSystem();
    };
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>❌ Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setIsLoading(true);
              setImageLoaded(false);
            }}
          >
            <Text style={styles.retryButtonText}>🔄 Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Función para crear el contexto 3D con esfera invertida
  const onContextCreate = async (gl: WebGLRenderingContext) => {
    console.log('🚀 [3D] Iniciando contexto WebGL...');
    console.log('📷 [3D] Fuente de imagen:', {
      hasUri: !!imageSource.uri,
      hasBase64: !!imageSource.base64,
      uri: imageSource.uri?.substring(0, 100)
    });
    
    // Usar dimensiones de la pantalla real en lugar del buffer GL
    const screenDimensions = Dimensions.get('window');
    const renderWidth = screenDimensions.width;
    const renderHeight = screenDimensions.height;
    console.log('📐 [3D] Dimensiones de pantalla:', renderWidth + 'x' + renderHeight);
    
    const { drawingBufferWidth: glWidth, drawingBufferHeight: glHeight } = gl;
    console.log('📐 [3D] Dimensiones del canvas GL:', glWidth + 'x' + glHeight);

    try {
      // CRÍTICO: Configurar viewport ANTES de crear el renderer
      gl.viewport(0, 0, glWidth, glHeight);
      console.log('✅ [3D] Viewport configurado:', glWidth + 'x' + glHeight);

      // Renderer de Expo
      console.log('🎨 [3D] Creando renderer...');
      const renderer = new Renderer({ gl });
      // Usar dimensiones del buffer GL que es lo que realmente tiene el canvas
      renderer.setSize(glWidth, glHeight);
      renderer.setPixelRatio(1); // Importante para dispositivos con alta densidad
      renderer.setClearColor(0x000000, 1);
      console.log('✅ [3D] Renderer creado exitosamente con dimensiones GL');

      // Escena + cámara con FOV equilibrado
      console.log('🎬 [3D] Creando escena y cámara...');
      const scene = new THREE.Scene();
      
      // FOV equilibrado (100) para buena vista panorámica
      const aspectRatio = glWidth / glHeight;
      const fov = 100; // Campo de visión equilibrado
      const camera = new THREE.PerspectiveCamera(fov, aspectRatio, 0.1, 1000);
      camera.position.set(0, 0, 0);
      camera.rotation.order = 'YXZ'; // Yaw-Pitch-Roll
      console.log('✅ [3D] Cámara creada - FOV:', fov, 'Aspect:', aspectRatio.toFixed(2));

      // Geometría de esfera con radio óptimo para pantalla completa
      // Radio 30 es un buen equilibrio - no muy cerca ni muy lejos
      console.log('🌐 [3D] Creando geometría de esfera (radio 30 para vista óptima)...');
      const geometry = new THREE.SphereGeometry(30, 64, 64);
      console.log('✅ [3D] Geometría de esfera creada con radio óptimo');

      // Cargar textura panorámica (ahora siempre procedural para iOS)
      console.log('🖼️ [3D] Iniciando carga de textura panorámica...');
      let texture;
      try {
        texture = await loadPanoramaTexture(imageSource);
        console.log('✅ [3D] Textura panorámica cargada exitosamente, creando material...');
      } catch (textureError) {
        console.error('❌ [3D] Error crítico cargando textura:', textureError);
        console.log('🔄 [3D] Cayendo a panorama procedural de emergencia...');
        // Crear textura procedural como último recurso
        texture = createProceduralTexture('panorama');
        console.log('✅ [3D] Usando panorama procedural de emergencia');
      }

      // Material básico con la textura; renderizamos la CARA INTERIOR
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide, // clave para mirar desde adentro
      });
      console.log('✅ [3D] Material creado con BackSide');

      const sphere = new THREE.Mesh(geometry, material);
      console.log('🌐 [3D] Mesh de esfera creado');

      // Guardar referencia para poder cambiar orientación
      sphereRef.current = sphere;

      // Configuración óptima para orientación correcta del equirectangular
      // Modo 4: scale(1,1,1) + flipY=true - configuración que funciona mejor
      sphere.scale.set(1, 1, 1); // escala normal
      scene.add(sphere);
      console.log('✅ [3D] Esfera agregada con configuración óptima (Modo 4)');

      setImageLoaded(true);
      setIsLoading(false);
      console.log('🎉 [3D] Setup completo, iniciando render loop...');

      // Función para actualizar aspect ratio al rotar pantalla
      const updateCameraAspect = () => {
        const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
        const newAspect = screenWidth / screenHeight;
        camera.aspect = newAspect;
        camera.updateProjectionMatrix();
        // CRÍTICO: Actualizar viewport también
        gl.viewport(0, 0, glWidth, glHeight);
        console.log('📐 [3D] Aspect ratio y viewport actualizados:', newAspect.toFixed(2), `${screenWidth}x${screenHeight}`);
      };

      // Listener para cambios de orientación
      const dimensionsSubscription = Dimensions.addEventListener('change', updateCameraAspect);

      // Loop de render (usa tus refs del giroscopio)
      let frameCount = 0;
      const render = () => {
        requestAnimationFrame(render);

        // Aplicar orientación desde tus sensores
        camera.rotation.y = yawRef.current;   // yaw (izq-der)
        camera.rotation.x = pitchRef.current; // pitch (arriba-abajo)
        camera.rotation.z = 0;                // sin roll

        renderer.render(scene, camera);
        (gl as any).endFrameEXP();

        // Log cada 60 frames (1 segundo aprox)
        frameCount++;
        if (frameCount === 60) {
          console.log('🎮 [3D] Render loop activo - Frame 60, Yaw:', (yawRef.current * 180 / Math.PI).toFixed(1) + '°', 'Pitch:', (pitchRef.current * 180 / Math.PI).toFixed(1) + '°');
          frameCount = 0;
        }
      };

      render();
      console.log('🔄 [3D] Render loop iniciado exitosamente');
    } catch (err) {
      console.error('❌ [3D] Error en onContextCreate:', err);
      console.error('❌ [3D] Stack trace:', (err as Error).stack);
      setError('Error inicializando visor 3D. La imagen puede no ser una panorámica equirectangular válida.');
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>🌐 Cargando Visor 3D...</Text>
          <Text style={styles.loadingSubtext}>
            {imageSource.uri ? `Descargando: ${imageSource.uri.substring(0, 60)}...` : 'Inicializando textura 3D...'}
          </Text>
          <Text style={styles.loadingSubtext}>
            ⏱️ Si tarda más de 10 segundos, se usará imagen de prueba
          </Text>
          <Text style={styles.loadingSubtext}>
            💡 Si ves una pantalla negra, puede ser un problema con la URL de la imagen
          </Text>
        </View>
      )}
      
      {/* 3D Panorama viewport container - ABSOLUTAMENTE toda la pantalla */}
      <View style={styles.imageViewport}>
        <GLView 
          style={styles.glView}
          onContextCreate={onContextCreate} 
        />
      </View>
      
      {/* Debug info overlay - only show when loaded and no error */}
      {imageLoaded && !error && (
        <View style={styles.debugOverlay}>
          <Text style={styles.debugText}>
            🎥 {useGyro ? 'Giroscopio activo' : 'Control táctil'}
          </Text>
          <Text style={styles.debugText}>
            📱 {orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT || orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT ? 'Horizontal' : 'Vertical'}
          </Text>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  imageViewport: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  glView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  // No image styles needed - using GLView for 3D rendering
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtext: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorTitle: {
    color: '#ff6b6b',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 120, // Moved up to avoid overlap with PanoramaViewerSafe controls
    right: 20,
    flexDirection: 'column',
    gap: 10,
    zIndex: 100,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  controlButtonActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
    borderColor: 'rgba(0, 122, 255, 1)',
  },
  statusOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 100,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  statusSubtext: {
    color: '#ccc',
    fontSize: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    textAlign: 'center',
  },
  debugOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 50,
  },
  debugText: {
    color: '#4CAF50',
    fontSize: 11,
    fontWeight: '600',
  },
});
