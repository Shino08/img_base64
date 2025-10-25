# 🎞️ Scroll Animado desde Video (con Frames en Base64)

Esta guía te enseña paso a paso cómo convertir un video vertical en una animación por scroll usando imágenes `.webp` codificadas en Base64, todo renderizado directamente desde JavaScript y sin necesidad de cargar archivos externos.

---

## 🧰 Requisitos

- Node.js (https://nodejs.org)
- FFmpeg (para extraer frames del video)
- Un video vertical (idealmente .mp4 de 2 segundos)

---

## ⚙️ 1. Instalación de FFmpeg

### En Windows

1. Descarga el ejecutable desde: https://ffmpeg.org/download.html
2. Extrae el ZIP.
3. Copia la ruta del directorio `bin` (por ejemplo: `C:\ffmpeg\bin`).
4. Agrega esa ruta al **PATH del sistema**:
   - Panel de Control > Sistema > Configuración avanzada del sistema > Variables de entorno.
   - Busca "Path", haz clic en "Editar", luego "Nuevo", y pega la ruta del `bin`.

Para verificar, abre una terminal y ejecuta:

```bash
ffmpeg -version
```

---

## 📹 2. Extraer Frames del Video

### 1. Coloca tu video como `video.mp4` en el directorio raíz del proyecto.

### 2. Ejecuta este comando para extraer 30 fps en formato `.webp`:

```bash
ffmpeg -i video.mp4 -vf "fps=30,scale=720:-1:flags=lanczos" frames/frame-%04d.webp
ffmpeg -i video.mp4 -vf "fps=30" frames/frame-%04d.webp
ffmpeg -i video.mp4 -vf "fps=30" frames/frame-%04d.jpg
ffmpeg -i input.mp4 -q:v 50 frame_%03d.webp

```

- `fps=30`: 30 imágenes por segundo.
- `scale=720:-1`: escala el ancho a 720px y ajusta el alto proporcionalmente.
- `frame-%04d.webp`: guarda como `frame-0001.webp`, `frame-0002.webp`, etc.

---

## 🧬 3. Generar el archivo `images.js` con Base64

### 1. Asegúrate de tener Node.js instalado.

### 2. Instala dependencias en el proyecto (una vez):

```bash
npm init -y
npm install --save-dev sharp
```

> `sharp` permite leer y convertir imágenes eficientemente.

### 3. Ejecuta el script para generar `images.js`:

```bash
node generateBase64.js
```

Este script:
- Lee todas las imágenes en `frames/`
- Convierte cada una a Base64
- Genera un archivo `images.js` con un arreglo exportado:

```js
export const images = [
  { id: "image_0", w: 720, h: 1280, u: "", p: "data:image/webp;base64,....", e: 1 },
  ...
];
```

---

## 💻 4. Visualizar animación por scroll

### Archivos incluidos:

- `index.html`
- `main.js`
- `styles.css`
- `images.js` (autogenerado)
