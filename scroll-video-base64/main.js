    import { images } from './images.js';

    const imageContainer = document.getElementById('image-container');
    const totalFrames = images.length;
    const MAX_FRAMES = totalFrames - 1;
    let currentFrame = 0;

    // Altura deseada del scroll basada en cantidad de frames
    function setScrollHeight() {
      const pixelsPerFrame = 10; // 10px por frame de scroll
      const scrollHeight = totalFrames * pixelsPerFrame;
      const vhHeight = (scrollHeight + window.innerHeight) / window.innerHeight * 100;
      document.querySelector('main').style.height = `${vhHeight}dvh`;
    }

    // Precargar imágenes para mejorar el rendimiento
    function preloadImages() {
      images.forEach(img => {
        const image = new Image();
        image.src = img.p;
      });
    }

    function updateImage(frame = 0) {
      const src = images[frame].p;
      imageContainer.style.backgroundImage = `url('${src}')`;
    }

    function getScrollFrame() {
      const scrollY = window.scrollY;
      const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = scrollY / scrollMax;
      return Math.min(MAX_FRAMES, Math.floor(scrollFraction * totalFrames));
    }

    // Inicialización
    setScrollHeight();
    preloadImages();
    updateImage(currentFrame);

    // Actualizar en scroll
    window.addEventListener('scroll', () => {
      const nextFrame = getScrollFrame();
      if (nextFrame !== currentFrame) {
        updateImage(nextFrame);
        currentFrame = nextFrame;
      }
    });

    // Actualizar si cambia el tamaño de ventana
    window.addEventListener('resize', () => {
      setScrollHeight();
    });