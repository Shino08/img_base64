function ConfigPanel({ config, onChange, onProcess, processing }) {
  const handleChange = (key, value) => {
    onChange({ ...config, [key]: value })
  }

  return (
    <div className="config-panel">
      <h2>2. Configura el procesamiento</h2>
      
      <div className="config-group">
        <label>
          FPS (Frames por segundo):
          <input
            type="number"
            value={config.fps}
            onChange={(e) => handleChange('fps', parseInt(e.target.value))}
            min="1"
            max="60"
            disabled={processing}
          />
        </label>

        <label>
          Ancho (pixels):
          <input
            type="number"
            value={config.scale}
            onChange={(e) => handleChange('scale', parseInt(e.target.value))}
            min="320"
            max="1920"
            step="10"
            disabled={processing}
          />
        </label>

        <label>
          Formato:
          <select
            value={config.format}
            onChange={(e) => handleChange('format', e.target.value)}
            disabled={processing}
          >
            <option value="webp">WebP (recomendado)</option>
            <option value="jpg">JPG</option>
            <option value="png">PNG</option>
          </select>
        </label>
      </div>

      <button 
        onClick={onProcess} 
        disabled={processing}
        className="process-btn"
      >
        {processing ? '⏳ Procesando...' : '▶️ Procesar Video'}
      </button>
    </div>
  )
}

export default ConfigPanel
