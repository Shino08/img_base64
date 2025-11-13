# 🎞️ Video to Scroll Animation - Full Stack App

Aplicación completa para convertir videos en animaciones por scroll con frames en Base64.

## 📁 Estructura del Proyecto

```
Prueba2/
├── backend/          # API Node.js + Express
│   ├── server.js
│   ├── package.json
│   └── .gitignore
├── frontend/         # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚀 Instalación

### 1. Instalar Backend

```powershell
cd backend
npm install
```

### 2. Instalar Frontend

```powershell
cd ../frontend
npm install
```

## ▶️ Ejecutar la Aplicación

### Opción 1: Ejecutar Backend y Frontend por separado

**Terminal 1 - Backend:**
```powershell
cd backend
npm start
```
El backend correrá en: `http://localhost:3001`

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```
El frontend correrá en: `http://localhost:3000`

### Opción 2: Ejecutar todo con un solo comando

Abre dos terminales en PowerShell o usa un comando combinado:

```powershell
# En terminal 1
cd backend; npm start

# En terminal 2
cd frontend; npm run dev
```

## 🎯 Uso de la Aplicación

1. **Subir video**: Arrastra o selecciona tu video (MP4, MOV, AVI, WebM)
2. **Configurar**: Ajusta FPS, escala y formato de salida
3. **Procesar**: Haz clic en "Procesar Video"
4. **Vista previa**: Desplázate para ver la animación
5. **Exportar**: Descarga el código o HTML completo

## 🔌 APIs Disponibles

### `POST /api/upload`
Sube un video al servidor.

**Body:** FormData con campo `video`

**Response:**
```json
{
  "success": true,
  "videoId": "video-1234567890",
  "filename": "video-1234567890.mp4",
  "path": "/uploads/video-1234567890.mp4"
}
```

### `POST /api/process`
Extrae frames del video con FFmpeg.

**Body:**
```json
{
  "videoId": "video-1234567890",
  "fps": 30,
  "scale": 720,
  "format": "webp"
}
```

**Response:**
```json
{
  "success": true,
  "videoId": "video-1234567890",
  "framesCount": 60,
  "framesDir": "/frames/video-1234567890"
}
```

### `POST /api/generate-base64`
Convierte frames a Base64.

**Body:**
```json
{
  "videoId": "video-1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "videoId": "video-1234567890",
  "totalFrames": 60,
  "images": [
    {
      "id": "image_0",
      "w": 720,
      "h": 1280,
      "u": "",
      "p": "data:image/webp;base64,...",
      "e": 1
    }
  ]
}
```

### `DELETE /api/cleanup/:videoId`
Elimina archivos temporales del servidor.

**Response:**
```json
{
  "success": true,
  "message": "Archivos eliminados"
}
```

## 📦 Dependencias

### Backend
- `express`: Servidor web
- `cors`: Permitir peticiones desde el frontend
- `multer`: Subir archivos
- `fluent-ffmpeg`: Procesar video
- `sharp`: Manipular imágenes

### Frontend
- `react`: Librería UI
- `vite`: Build tool
- `axios`: Cliente HTTP (incluido pero no usado, puede usarse)

## ⚙️ Requisitos del Sistema

- Node.js 18+
- FFmpeg instalado en el sistema (ver documentación original)
- Mínimo 4GB RAM (para procesamiento de video)

## 🛠️ Desarrollo

### Backend con auto-reload:
```powershell
cd backend
npm run dev
```

### Frontend con hot reload:
```powershell
cd frontend
npm run dev
```

## 📝 Notas

- Los videos subidos se guardan en `backend/uploads/`
- Los frames se generan en `backend/frames/`
- Usa el botón "Limpiar archivos" para eliminar temporales
- El frontend usa proxy para evitar problemas de CORS

## 🎨 Personalización

### Cambiar puerto del backend:
Edita `backend/server.js`:
```js
const PORT = 3001; // Cambia aquí
```

### Cambiar puerto del frontend:
Edita `frontend/vite.config.js`:
```js
server: {
  port: 3000, // Cambia aquí
}
```

## 📄 Licencia

MIT
