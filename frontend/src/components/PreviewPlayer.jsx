import { useEffect, useRef, useState } from 'react'

function PreviewPlayer({ images }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [currentFrame, setCurrentFrame] = useState(0)

  useEffect(() => {
    if (!images || images.length === 0) return

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    // Cargar todas las imágenes
    const imageElements = []
    let loadedCount = 0

    images.forEach((imgData, index) => {
      const img = new Image()
      img.onload = () => {
        loadedCount++
        if (loadedCount === 1) {
          // Configurar canvas con las dimensiones de la primera imagen
          canvas.width = img.width
          canvas.height = img.height
          context.drawImage(img, 0, 0)
        }
      }
      img.src = imgData.p
      imageElements.push(img)
    })

    // Manejar scroll
    const handleScroll = () => {
      const container = containerRef.current
      const scrollTop = container.scrollTop
      const maxScroll = container.scrollHeight - container.clientHeight
      const scrollFraction = scrollTop / maxScroll
      const frameIndex = Math.min(
        Math.floor(scrollFraction * images.length),
        images.length - 1
      )

      if (frameIndex !== currentFrame && imageElements[frameIndex]?.complete) {
        setCurrentFrame(frameIndex)
        context.drawImage(imageElements[frameIndex], 0, 0)
      }
    }

    const container = containerRef.current
    container.addEventListener('scroll', handleScroll)

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [images, currentFrame])

  return (
    <div className="preview-player">
      <h2>3. Vista previa (desplázate para animar)</h2>
      <p className="frame-counter">Frame: {currentFrame + 1} / {images.length}</p>
      
      <div ref={containerRef} className="scroll-container">
        <canvas ref={canvasRef} className="preview-canvas" />
        <div style={{ height: `${images.length * 100}px` }} />
      </div>
    </div>
  )
}

export default PreviewPlayer
