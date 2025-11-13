import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de multer para subir videos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `video-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|mov|avi|webm|mkv|flv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten archivos de video'));
  }
});

// API: Subir video
app.post('/api/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún video' });
    }

    res.json({
      success: true,
      videoId: path.basename(req.file.filename, path.extname(req.file.filename)),
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Obtener información del video
app.post('/api/video-info', async (req, res) => {
  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'videoId es requerido' });
    }

    const uploadsDir = path.join(__dirname, 'uploads');
    const uploadFiles = await fs.readdir(uploadsDir);
    const videoFile = uploadFiles.find(f => f.startsWith(videoId));
    
    if (!videoFile) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }
    
    const videoPath = path.join(uploadsDir, videoFile);

    const metadata = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata);
      });
    });

    const videoStream = metadata.streams.find(s => s.codec_type === 'video');
    
    if (!videoStream) {
      return res.status(400).json({ error: 'No se encontró stream de video' });
    }

    const fps = eval(videoStream.r_frame_rate);
    const duration = parseFloat(videoStream.duration || metadata.format.duration);
    const totalFrames = Math.floor(fps * duration);

    res.json({
      success: true,
      videoId,
      info: {
        width: videoStream.width,
        height: videoStream.height,
        fps: fps,
        duration: duration,
        totalFrames: totalFrames,
        codec: videoStream.codec_name,
        bitrate: metadata.format.bit_rate
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅✅✅ API: Procesar video - SOLUCIÓN DEFINITIVA ✅✅✅
app.post('/api/process', async (req, res) => {
  let framesDir = null;
  
  try {
    const { videoId, scale = null, format = 'jpg' } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'videoId es requerido' });
    }

    const validScale = scale ? Math.max(240, Math.min(4096, Number(scale))) : null;
    const validFormats = ['webp', 'png', 'jpg', 'jpeg'];
    const validFormat = validFormats.includes(format) ? format : 'jpg';

    const uploadsDir = path.join(__dirname, 'uploads');
    const uploadFiles = await fs.readdir(uploadsDir);
    const videoFile = uploadFiles.find(f => f.startsWith(videoId));
    
    if (!videoFile) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }
    
    const videoPath = path.join(uploadsDir, videoFile);
    framesDir = path.join(__dirname, 'frames', videoId);

    await fs.mkdir(framesDir, { recursive: true });

    const metadata = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata);
      });
    });

    const videoStream = metadata.streams.find(s => s.codec_type === 'video');
    const originalFps = eval(videoStream.r_frame_rate);
    const duration = parseFloat(videoStream.duration || metadata.format.duration);
    const estimatedFrames = Math.floor(originalFps * duration);

    console.log(`\n📹 ============ VIDEO INFO ============`);
    console.log(`   Archivo: ${videoFile}`);
    console.log(`   FPS: ${originalFps.toFixed(2)}`);
    console.log(`   Duración: ${duration.toFixed(2)}s`);
    console.log(`   Frames esperados: ${estimatedFrames}`);
    console.log(`   Resolución: ${videoStream.width}x${videoStream.height}`);
    console.log(`======================================\n`);

    const startTime = Date.now();
    
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout: El procesamiento tardó más de 20 minutos'));
      }, 20 * 60 * 1000);

      // 🔥🔥🔥 CONFIGURACIÓN CORRECTA - MÉTODO 1: SIN VSYNC
      let command = ffmpeg(videoPath);
      
      // Construir filtros
      const filters = [];
      if (validScale) {
        filters.push(`scale=${validScale}:-1:flags=lanczos`);
      }
      
      // Aplicar filtros si existen
      if (filters.length > 0) {
        command = command.videoFilter(filters.join(','));
      }

      // 🔥 CLAVE: Usar .fps() para extraer todos los frames
      command = command.fps(originalFps); // Usar FPS original del video

      // Configurar formato de salida según el tipo
      if (validFormat === 'jpg' || validFormat === 'jpeg') {
        command = command.outputOptions(['-q:v', '2']); // Calidad JPEG
      } else if (validFormat === 'webp') {
        command = command.outputOptions(['-q:v', '90']); // Calidad WebP
      } else if (validFormat === 'png') {
        command = command.outputOptions(['-compression_level', '6']);
      }

      console.log('🎬 Iniciando extracción con FPS:', originalFps.toFixed(2));
      console.log(`📂 Destino: ${framesDir}\n`);

      command
        .output(path.join(framesDir, `frame-%06d.${validFormat}`))
        .on('start', (cmd) => {
          console.log('💻 Comando FFmpeg:');
          console.log(cmd);
          console.log('');
        })
        .on('progress', (progress) => {
          if (progress.frames) {
            const percent = progress.percent ? Math.round(progress.percent) : 'N/A';
            console.log(`📊 Frames: ${progress.frames}/${estimatedFrames} | Progreso: ${percent}%`);
          }
        })
        .on('end', () => {
          clearTimeout(timeout);
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
          console.log(`\n✅ Extracción completada en ${elapsed}s`);
          resolve();
        })
        .on('error', (err) => {
          clearTimeout(timeout);
          console.error(`\n❌ Error FFmpeg: ${err.message}`);
          reject(err);
        })
        .run();
    });

    // Contar frames generados
    const generatedFiles = await fs.readdir(framesDir);
    const frameFiles = generatedFiles.filter(f => f.startsWith('frame-'));

    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);

    let totalSize = 0;
    for (const file of frameFiles) {
      const stats = await fs.stat(path.join(framesDir, file));
      totalSize += stats.size;
    }

    console.log(`\n🎉 ============ RESULTADO ============`);
    console.log(`   Frames generados: ${frameFiles.length}`);
    console.log(`   Frames esperados: ${estimatedFrames}`);
    console.log(`   Match: ${frameFiles.length === estimatedFrames ? '✅ PERFECTO' : '⚠️ DIFERENCIA'}`);
    console.log(`   Tiempo: ${processingTime}s`);
    console.log(`   Tamaño total: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`   Formato: ${validFormat.toUpperCase()}`);
    console.log(`======================================\n`);

    res.json({
      success: true,
      videoId,
      framesCount: frameFiles.length,
      estimatedFrames: estimatedFrames,
      match: frameFiles.length === estimatedFrames,
      framesDir,
      processingTime: `${processingTime}s`,
      totalSize: `${(totalSize / (1024 * 1024)).toFixed(2)} MB`,
      config: {
        scale: validScale || 'original',
        format: validFormat,
        originalFps: originalFps.toFixed(2)
      }
    });

  } catch (error) {
    if (framesDir) {
      try {
        await fs.rm(framesDir, { recursive: true, force: true });
        console.log('🗑️  Frames parciales eliminados');
      } catch (cleanupError) {
        console.error('Error al limpiar:', cleanupError.message);
      }
    }
    
    res.status(500).json({ error: error.message });
  }
});

// API: Generar Base64 de los frames
app.post('/api/generate-base64', async (req, res) => {
  try {
    const { videoId, limit = 100, offset = 0 } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'videoId es requerido' });
    }

    const framesDir = path.join(__dirname, 'frames', videoId);
    
    try {
      await fs.access(framesDir);
    } catch {
      return res.status(404).json({ error: 'Frames no encontrados' });
    }

    const allFiles = await fs.readdir(framesDir);
    const frameFiles = allFiles
      .filter(f => f.startsWith('frame-'))
      .sort();

    const startIndex = Math.max(0, Number(offset));
    const maxLimit = Math.min(Number(limit), 500);
    const endIndex = Math.min(startIndex + maxLimit, frameFiles.length);
    const filesToProcess = frameFiles.slice(startIndex, endIndex);

    console.log(`\n🖼️  Generando Base64: ${startIndex} - ${endIndex} de ${frameFiles.length}`);

    const images = [];

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      const filePath = path.join(framesDir, file);
      const imageBuffer = await fs.readFile(filePath);
      
      const metadata = await sharp(imageBuffer).metadata();
      
      const base64 = imageBuffer.toString('base64');
      const mimeType = `image/${metadata.format}`;
      const dataUrl = `data:${mimeType};base64,${base64}`;

      images.push({
        id: `image_${startIndex + i}`,
        w: metadata.width,
        h: metadata.height,
        u: "",
        p: dataUrl,
        e: 1
      });

      if ((i + 1) % 50 === 0) {
        console.log(`   ✓ Procesados ${i + 1}/${filesToProcess.length}`);
      }
    }

    console.log(`✅ Base64 generado: ${images.length} frames\n`);

    res.json({
      success: true,
      videoId,
      totalFrames: frameFiles.length,
      returnedFrames: images.length,
      offset: startIndex,
      hasMore: endIndex < frameFiles.length,
      nextOffset: endIndex < frameFiles.length ? endIndex : null,
      images
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Limpiar archivos temporales
app.delete('/api/cleanup/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId || videoId.includes('..') || videoId.includes('/')) {
      return res.status(400).json({ error: 'videoId inválido' });
    }

    const uploadsDir = path.join(__dirname, 'uploads');
    const framesDir = path.join(__dirname, 'frames', videoId);

    let deletedVideo = false;
    let deletedFrames = false;

    try {
      const uploadFiles = await fs.readdir(uploadsDir);
      const videoFile = uploadFiles.find(f => f.startsWith(videoId));
      if (videoFile) {
        await fs.unlink(path.join(uploadsDir, videoFile));
        deletedVideo = true;
        console.log(`🗑️  Video eliminado: ${videoFile}`);
      }
    } catch (error) {
      console.log('Video ya eliminado');
    }

    try {
      await fs.rm(framesDir, { recursive: true, force: true });
      deletedFrames = true;
      console.log(`🗑️  Frames eliminados: ${videoId}`);
    } catch (error) {
      console.log('Frames ya eliminados');
    }

    res.json({ 
      success: true, 
      message: 'Archivos eliminados',
      deleted: {
        video: deletedVideo,
        frames: deletedFrames
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
  console.log(`📁 Directorio: ${__dirname}`);
});
