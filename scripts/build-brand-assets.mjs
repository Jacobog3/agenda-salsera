import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const sourcePath = process.argv[2];

if (!sourcePath) {
  throw new Error("Pass the source logo PNG path as the first argument.");
}

const palette = {
  red: [197, 47, 90],
  blue: [10, 169, 209],
  green: [24, 181, 124],
  yellow: [244, 213, 95]
};

const { data, info } = await sharp(sourcePath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const recolored = Buffer.alloc(data.length);

for (let index = 0; index < data.length; index += 4) {
  const red = data[index];
  const green = data[index + 1];
  const blue = data[index + 2];
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const chroma = maximum - minimum;

  if (chroma < 8 || (minimum > 238 && chroma < 22)) {
    recolored[index] = 0;
    recolored[index + 1] = 0;
    recolored[index + 2] = 0;
    recolored[index + 3] = 0;
    continue;
  }

  let hue;
  if (maximum === red) {
    hue = 60 * (((green - blue) / chroma) % 6);
  } else if (maximum === green) {
    hue = 60 * ((blue - red) / chroma + 2);
  } else {
    hue = 60 * ((red - green) / chroma + 4);
  }
  if (hue < 0) hue += 360;

  let target;
  if (hue < 25 || hue >= 330) {
    target = palette.red;
  } else if (hue < 82) {
    target = palette.yellow;
  } else if (hue < 178) {
    target = palette.green;
  } else {
    target = palette.blue;
  }

  const alpha = Math.round(255 * Math.min(1, chroma / 58));
  recolored[index] = target[0];
  recolored[index + 1] = target[1];
  recolored[index + 2] = target[2];
  recolored[index + 3] = alpha;
}

const trimmedLogo = await sharp(recolored, {
  raw: { width: info.width, height: info.height, channels: 4 }
})
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

const markPath = path.join(projectRoot, "public/images/somossalsa-mark.png");
const iconPath = path.join(projectRoot, "src/app/icon.png");
const appleIconPath = path.join(projectRoot, "src/app/apple-icon.png");
const ogPath = path.join(projectRoot, "public/images/somossalsa-og.png");

const mark = await sharp({
  create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
})
  .composite([
    {
      input: await sharp(trimmedLogo)
        .resize(920, 920, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer(),
      gravity: "center"
    }
  ])
  .png()
  .toBuffer();

await sharp(mark).toFile(markPath);
await sharp(mark).resize(512, 512).png().toFile(iconPath);

const appleMark = await sharp(mark).resize(148, 148).png().toBuffer();
await sharp({
  create: { width: 180, height: 180, channels: 4, background: "#FFFFFF" }
})
  .composite([{ input: appleMark, gravity: "center" }])
  .png()
  .toFile(appleIconPath);

const ogMark = await sharp(mark).resize(360, 360).png().toBuffer();
const ogText = Buffer.from(`
  <svg width="680" height="300" xmlns="http://www.w3.org/2000/svg">
    <style>
      .name { font-family: Avenir Next, Nunito Sans, Arial, sans-serif; font-size: 92px; font-weight: 800; letter-spacing: -4px; }
      .tagline { font-family: Avenir Next, Nunito Sans, Arial, sans-serif; font-size: 25px; font-weight: 700; letter-spacing: 4px; }
      .details { font-family: Avenir Next, Nunito Sans, Arial, sans-serif; font-size: 24px; }
    </style>
    <text x="0" y="105" class="name" fill="#10263B">Somos<tspan fill="#C52F5A">Salsa</tspan></text>
    <text x="4" y="169" class="tagline" fill="#627083">LA COMUNIDAD BAILA AQUÍ</text>
    <text x="4" y="225" class="details" fill="#627083">Eventos · Academias · Maestros · Lugares</text>
  </svg>
`);

await sharp({
  create: { width: 1200, height: 630, channels: 4, background: "#FFFFFF" }
})
  .composite([
    { input: ogMark, left: 92, top: 135 },
    { input: ogText, left: 500, top: 165 }
  ])
  .png()
  .toFile(ogPath);

console.log(`Built ${path.relative(projectRoot, markPath)}`);
console.log(`Built ${path.relative(projectRoot, iconPath)}`);
console.log(`Built ${path.relative(projectRoot, appleIconPath)}`);
console.log(`Built ${path.relative(projectRoot, ogPath)}`);
