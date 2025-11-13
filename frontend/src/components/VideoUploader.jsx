import { useState, useRef } from 'react'

function VideoUploader({ onUploadComplete }) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleFile = async (file) => {
    if (!file) return

    setUploading(true)

    const formData = new FormData()
    formData.append('video', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        onUploadComplete(data.videoId)
      } else {
        alert('Error al subir: ' + data.error)
      }
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleChange = (e) => {
    const file = e.target.files[0]
    handleFile(file)
  }

  return (
    <div className="video-uploader">
      <h2>1. Sube tu video</h2>
      <div
        className={`drop-zone ${dragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
        onDrop={handleDrop}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        {uploading ? (
          <p>Subiendo...</p>
        ) : (
          <>
            <p>📹 Arrastra tu video aquí</p>
            <p>o haz clic para seleccionar</p>
            <small>Formatos: MP4, MOV, AVI, WebM</small>
          </>
        )}
      </div>
    </div>
  )
}

export default VideoUploader
