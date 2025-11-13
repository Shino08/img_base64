function ExportOptions({ images, onCleanup }) {
  const downloadJS = () => {
    const content = `export const images = ${JSON.stringify(images, null, 2)};`
    const blob = new Blob([content], { type: 'application/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'images.js'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadHTML = () => {
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scroll Animation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { overflow-x: hidden; }
    .scroll-container { height: 100vh; overflow-y: scroll; }
    canvas { position: sticky; top: 0; width: 100%; height: 100vh; object-fit: contain; }
  </style>
</head>
<body>
  <div class="scroll-container" id="container">
    <canvas id="canvas"></canvas>
    <div id="spacer"></div>
  </div>
  
  <script type="module">
    const images = ${JSON.stringify(images)};
    
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const container = document.getElementById('container');
    const spacer = document.getElementById('spacer');
    
    const imageElements = [];
    let loadedCount = 0;
    
    images.forEach((imgData, index) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === 1) {
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0);
        }
      };
      img.src = imgData.p;
      imageElements.push(img);
    });
    
    spacer.style.height = images.length * 100 + 'px';
    
    let currentFrame = 0;
    container.addEventListener('scroll', () => {
      const scrollTop = container.scrollTop;
      const maxScroll = container.scrollHeight - container.clientHeight;
      const scrollFraction = scrollTop / maxScroll;
      const frameIndex = Math.min(
        Math.floor(scrollFraction * images.length),
        images.length - 1
      );
      
      if (frameIndex !== currentFrame && imageElements[frameIndex]?.complete) {
        currentFrame = frameIndex;
        context.drawImage(imageElements[frameIndex], 0, 0);
      }
    });
  </script>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'scroll-animation.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = () => {
    const content = `export const images = ${JSON.stringify(images, null, 2)};`
    navigator.clipboard.writeText(content)
    alert('Código copiado al portapapeles')
  }

  return (
    <div className="export-options">
      <h2>4. Exportar resultado</h2>
      <div className="export-buttons">
        <button onClick={downloadJS}>📥 Descargar images.js</button>
        <button onClick={downloadHTML}>📥 Descargar HTML completo</button>
        <button onClick={copyToClipboard}>📋 Copiar código</button>
        <button onClick={onCleanup} className="cleanup-btn">🗑️ Limpiar archivos</button>
      </div>
    </div>
  )
}

export default ExportOptions
