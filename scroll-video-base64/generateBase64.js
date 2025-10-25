import fs from 'fs'
import path from 'path';

const dir = './frames';
const files = fs.readdirSync(dir)
  .filter(f => f.endsWith('.jpg') || f.endsWith('.webp') || f.endsWith('.png'))
  .sort(); // Asegura orden por nombre

const images = files.map((filename, index) => {
  const filePath = path.join(dir, filename);
  const base64 = fs.readFileSync(filePath, 'base64');
  return {
    id: `image_${index + 1}`,
    w: 2400,
    h: 1800,
    u: "",
    p: `data:image/jpeg;base64,${base64}`,
    e: 1
  };
});

const output = `export const images = ${JSON.stringify(images, null, 2)};\n`;

fs.writeFileSync('images.js', output);
console.log("✅ Archivo images.js generado correctamente con", images.length, "frames.");
