# Configuración para Desarrollo Móvil con Expo

## Problema Identificado ✅

Cuando usas Expo en un **dispositivo móvil físico**, `localhost:8080` apunta al dispositivo móvil, no a tu computadora donde está corriendo el backend.

**Tu IP local detectada**: `192.168.0.102`

## Solución Implementada ✅

### 1. Configuración Automática del Frontend

- ✅ **IP detectada automáticamente**: `192.168.0.102`
- ✅ **Detección de plataforma**: Automática (móvil vs web)
- ✅ **Configuración flexible**: Fácil de cambiar

### 2. URLs Configuradas

- **Web (localhost)**: `http://localhost:8080`
- **Móvil (IP local)**: `http://192.168.0.102:8080`

## Configuración del Backend (PENDIENTE) ⚠️

El backend necesita configurarse para aceptar conexiones desde la red local, no solo localhost.

### Para Spring Boot

Agregar en `application.properties` o `application.yml`:

```properties
# application.properties
server.address=0.0.0.0
server.port=8080
```

O al ejecutar:
```bash
java -jar tu-app.jar --server.address=0.0.0.0
```

### Para Node.js/Express

```javascript
// En lugar de:
app.listen(8080, 'localhost', () => {
  console.log('Server running on localhost:8080');
});

// Usar:
app.listen(8080, '0.0.0.0', () => {
  console.log('Server running on 0.0.0.0:8080');
});
```

### Para .NET Core

```csharp
// Program.cs o Startup.cs
builder.WebHost.UseUrls("http://0.0.0.0:8080");
```

### Para Python/Django

```bash
python manage.py runserver 0.0.0.0:8080
```

### Para Python/Flask

```python
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
```

## Configuración CORS Actualizada

El backend también necesita permitir requests desde la nueva IP:

```java
// Spring Boot
@CrossOrigin(origins = {
    "http://localhost:8081",           // Web development
    "http://192.168.0.102:8081",       // Mobile development
    "http://localhost:19006"           // Expo web alternative
})
```

```javascript
// Node.js/Express
app.use(cors({
  origin: [
    'http://localhost:8081',
    'http://192.168.0.102:8081',
    'http://localhost:19006'
  ]
}));
```

## Verificación

### 1. Verificar que el Backend Escuche en Todas las Interfaces

```bash
# Debería mostrar 0.0.0.0:8080, no 127.0.0.1:8080
netstat -an | grep 8080
```

### 2. Probar Conectividad desde tu IP

```bash
# Desde tu computadora
curl http://192.168.0.102:8080/health

# Desde tu móvil (en browser)
http://192.168.0.102:8080/health
```

### 3. Verificar CORS

```bash
curl -X OPTIONS http://192.168.0.102:8080/auth/login \
  -H "Origin: http://192.168.0.102:8081" \
  -H "Access-Control-Request-Method: POST"
```

## Comandos Útiles

### Obtener tu IP Local
```bash
npm run get-ip
# o
node scripts/get-local-ip.js
```

### Verificar Configuración Actual
```bash
# Ver qué IP está usando la app
# (Revisa los logs de la consola en Expo)
```

## Troubleshooting

### ❌ "Network request failed"
- **Causa**: Backend no accesible desde IP local
- **Solución**: Configurar backend para escuchar en `0.0.0.0:8080`

### ❌ "CORS error"
- **Causa**: Backend no permite requests desde la IP móvil
- **Solución**: Agregar `http://192.168.0.102:8081` a CORS

### ❌ "Connection refused"
- **Causa**: Firewall o backend no corriendo
- **Solución**: Verificar firewall y que backend esté corriendo

### ❌ IP cambió
- **Causa**: Tu router asignó una IP diferente
- **Solución**: Ejecutar `npm run get-ip` y actualizar configuración

## Configuración Actual del Frontend ✅

```typescript
// src/config/development.ts
export const DEV_CONFIG = {
  LOCAL_IP: '192.168.0.102',    // ✅ Tu IP detectada
  BACKEND_PORT: 8080,           // ✅ Puerto del backend
  AUTO_DETECT_MOBILE: true,     // ✅ Detección automática
};
```

## Próximos Pasos

1. **Configurar Backend** para escuchar en `0.0.0.0:8080`
2. **Actualizar CORS** para incluir `http://192.168.0.102:8081`
3. **Probar conexión** desde móvil
4. **Verificar login** funciona correctamente

---

**🎯 Una vez configurado el backend, el login debería funcionar perfectamente en tu dispositivo móvil.**
