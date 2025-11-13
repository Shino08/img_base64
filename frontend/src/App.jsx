import { useState } from 'react'
import VideoUploader from './components/VideoUploader'
import ConfigPanel from './components/ConfigPanel'
import ProgressViewer from './components/ProgressViewer'
import PreviewPlayer from './components/PreviewPlayer'
import ExportOptions from './components/ExportOptions'
import './App.css'

function App() {
  const [videoId, setVideoId] = useState(null)
  const [config, setConfig] = useState({
    fps: 30,
    scale: 720,
    format: 'webp'
  })
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState('')
  const [frames, setFrames] = useState(null)
  const [images, setImages] = useState([])

  const handleUploadComplete = (id) => {
    setVideoId(id)
    setProgress('Video subido exitosamente')
  }

  const handleProcess = async () => {
    if (!videoId) return

    setProcessing(true)
    setProgress('Extrayendo frames del video...')

    try {
      // Paso 1: Procesar video con FFmpeg
      const processRes = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, ...config })
      })

      const processData = await processRes.json()
      
      if (!processData.success) {
        throw new Error(processData.error)
      }

      setFrames(processData.framesCount)
      setProgress(`${processData.framesCount} frames extraídos. Generando Base64...`)

      // Paso 2: Generar Base64
      const base64Res = await fetch('/api/generate-base64', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId })
      })

      const base64Data = await base64Res.json()

      if (!base64Data.success) {
        throw new Error(base64Data.error)
      }

      setImages(base64Data.images)
      setProgress(`✓ Procesamiento completado: ${base64Data.totalFrames} frames`)

    } catch (error) {
      setProgress(`Error: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleCleanup = async () => {
    if (!videoId) return

    try {
      await fetch(`/api/cleanup/${videoId}`, { method: 'DELETE' })
      setVideoId(null)
      setFrames(null)
      setImages([])
      setProgress('Archivos limpiados')
    } catch (error) {
      console.error('Error al limpiar:', error)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1> Convierte tu video🎞️ en frames o base64 </h1>
        <p>Convierte videos en animaciones por scroll con frames en Base64</p>
      </header>

      <main className="app-main">
        <div className="panel-grid">
          <VideoUploader onUploadComplete={handleUploadComplete} />
          
          {videoId && (
            <ConfigPanel 
              config={config} 
              onChange={setConfig}
              onProcess={handleProcess}
              processing={processing}
            />
          )}
        </div>

        {progress && (
          <ProgressViewer message={progress} />
        )}

        {images.length > 0 && (
          <>
            <PreviewPlayer images={images} />
            <ExportOptions images={images} onCleanup={handleCleanup} />
          </>
        )}
      </main>
    </div>
  )
}

export default App
