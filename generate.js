const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');
const { parse } = require('yaml');

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

function calculateTextWidth(text) {
  return text.split('').reduce((totalWidth, char) => {
    return totalWidth + (letterWidths[char.toUpperCase()] || 6);
  }, 0);
}

function generatePixelArt(text, mainColor, shadowColor, colorName) {
  const canvasWidth = 4 + calculateTextWidth(text);
  const canvasHeight = 9;

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = mainColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = shadowColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  ctx.font = "5px Minecraft Styled Small Latin";
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
  savePixelArt(text, colorName, buffer);
}

function savePixelArt(text, colorName, buffer) {
  const firstLetter = text[0].toUpperCase();
  const directoryPath = path.join("generated", firstLetter, text);

  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  const fileName = `${text}-${colorName}.png`;
  const filePath = path.join(directoryPath, fileName);
  fs.writeFileSync(filePath, buffer);
}

function generateRainbowColors(numColors) {
  const colors = [];
  for (let i = 0; i < numColors; i++) {
    const hue = (i / numColors) * 360;

    const mainColor = `hsl(${hue}, 100%, 50%)`;
    const shadowColor = `hsl(${hue}, 100%, 30%)`;

    const colorName = i + 1;

    colors.push({ mainColor, shadowColor, colorName });
  }
  return colors;
}

const rainbowColors = generateRainbowColors(64);
const wordData = parse(fs.readFileSync('./words.yml', 'utf8'));

if (wordData && wordData.words) {
  wordData.words.forEach(word => {
    rainbowColors.forEach(colorObj => {
      generatePixelArt(word.normalize('NFD').replace(/[\u0300-\u036f]/g, ''), colorObj.mainColor, colorObj.shadowColor, colorObj.colorName);
    });

    console.log(`Generated pixel art for ${word}`);
  });
}




