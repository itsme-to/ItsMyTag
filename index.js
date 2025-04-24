import pkg, { GlobalFonts } from '@napi-rs/canvas';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';
import { formatRgb, oklch } from 'culori';

const { createCanvas } = pkg;
const letterWidths = {
  ' ': 3,
  'A': 6,
  'B': 6,
  'C': 6,
  'D': 6,
  'E': 6,
  'F': 6,
  'G': 6,
  'H': 6,
  'I': 4,
  'J': 6,
  'K': 6,
  'L': 6,
  'M': 6,
  'N': 6,
  'O': 6,
  'P': 6,
  'Q': 6,
  'R': 6,
  'S': 6,
  'T': 6,
  'U': 6,
  'V': 6,
  'W': 6,
  'X': 6,
  'Y': 6,
  'Z': 6,
  '0': 6,
  '1': 6,
  '2': 6,
  '3': 6,
  '4': 6,
  '6': 6,
  '6': 6,
  '7': 6,
  '8': 6,
  '9': 6,
  '!': 2,
  '?': 6,
  '.': 2,
  ',': 2,
  '"': 4,
  ':': 2,
  ';': 2,
  '(': 3,
  ')': 3,
  '[': 3,
  ']': 3,
  '{': 3,
  '}': 3,
  '<': 4,
  '>': 4,
  '+': 6,
  '-': 6,
  '*': 6,
  '/': 6,
};

const config = parse(readFileSync('./words.yml', 'utf8'));

class PixelArtGenerator {
  constructor(config) {
    this.config = config;
    GlobalFonts.registerFromPath('./font/minecraft-styled-small-latin.ttf', 'SmallCaps');
  }

  calculateTextWidth(text) {
    return text.split('').reduce((totalWidth, char) => {
      return totalWidth + (letterWidths[char.toUpperCase()] || 6);
    }, 0);
  }

  generatePixelArt(text, mainColor, shadowColor, colorName) {
    const canvasWidth = 4 + this.calculateTextWidth(text);
    const canvasHeight = 9;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = mainColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = shadowColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    ctx.font = '5px SmallCaps';
    ctx.fillStyle = shadowColor
    let xOffset = 2;
    for (let char of text) {
      ctx.fillText(char, xOffset, canvasHeight - 2);
      xOffset += letterWidths[char.toUpperCase()] || 6;
    }

    ctx.fillStyle = "white";
    xOffset = 3;
    for (let char of text) {
      ctx.fillText(char, xOffset, canvasHeight - 2);
      xOffset += letterWidths[char.toUpperCase()] || 6;
    }

    const buffer = canvas.toBuffer('image/png');
    this.savePixelArt(text, colorName, buffer);
  }

  savePixelArt(text, colorName, buffer) {
    const firstLetter = text[0].toUpperCase();
    const directoryPath = join("generated", firstLetter, text);

    if (!existsSync(directoryPath)) {
      mkdirSync(directoryPath, { recursive: true });
    }

    const fileName = `${text}-${colorName}.png`;
    const filePath = join(directoryPath, fileName);
    writeFileSync(filePath, buffer);
  }

  generateRainbowColors(numBaseHues) {
    const colors = [];
    const lights = [
      [0.8, 0.7],
      [0.7, 0.5],
      [0.4, 0.3]
    ];
  
    let colorIndex = 1;
    for (let i = 0; i < numBaseHues; i++) {
      const hue = (i / numBaseHues) * 360;
  
      for (const [lMain, lShadow] of lights) {
        const main = oklch({ l: lMain, c: 0.3, h: hue });
        const shadow = oklch({ l: lShadow, c: 0.2, h: hue });
  
        const mainColor = formatRgb(main);
        const shadowColor = formatRgb(shadow);
  
        colors.push({
          mainColor,
          shadowColor,
          colorName: colorIndex++
        });
      }
    }
  
    return colors;
  }

  generatePixelArtForWords() {
    const rainbowColors = this.generateRainbowColors(64);

    this.config.words.forEach(word => {
      rainbowColors.forEach(colorObj => {
        this.generatePixelArt(word.normalize('NFD').replace(/[\u0300-\u036f]/g, ''), colorObj.mainColor, colorObj.shadowColor, colorObj.colorName);
      });

      console.log(`Generated pixel art for ${word}`);
    });
  }
}

const pixelArtGenerator = new PixelArtGenerator(config);
pixelArtGenerator.generatePixelArtForWords();