type CompressImageOptions = {
  maxDimension?: number;
  maxDataUrlLength?: number;
};

const DEFAULT_MAX_DIMENSION = 1600;
const DEFAULT_MAX_DATA_URL_LENGTH = 1_200_000;
const QUALITY_STEPS = [0.82, 0.72, 0.62, 0.52];
const DIMENSION_STEPS = [1, 0.8, 0.65];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo preparar la imagen."));
    image.src = dataUrl;
  });
}

function getScaledSize(width: number, height: number, maxDimension: number) {
  const scale = Math.min(1, maxDimension / Math.max(width, height));

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale))
  };
}

function renderJpegDataUrl(image: HTMLImageElement, maxDimension: number, quality: number) {
  const { width, height } = getScaledSize(image.naturalWidth, image.naturalHeight, maxDimension);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No se pudo preparar la imagen.");
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", quality);
}

export async function compressImageFileForAi(
  file: File,
  options: CompressImageOptions = {}
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo debe ser una imagen.");
  }

  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const maxDataUrlLength = options.maxDataUrlLength ?? DEFAULT_MAX_DATA_URL_LENGTH;
  const originalDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(originalDataUrl);
  let smallestDataUrl = originalDataUrl;

  for (const dimensionStep of DIMENSION_STEPS) {
    const nextMaxDimension = Math.max(640, Math.round(maxDimension * dimensionStep));

    for (const quality of QUALITY_STEPS) {
      const dataUrl = renderJpegDataUrl(image, nextMaxDimension, quality);
      if (dataUrl.length < smallestDataUrl.length) {
        smallestDataUrl = dataUrl;
      }

      if (dataUrl.length <= maxDataUrlLength) {
        return dataUrl;
      }
    }
  }

  if (smallestDataUrl.length <= maxDataUrlLength * 1.25) {
    return smallestDataUrl;
  }

  throw new Error("La imagen es muy pesada para analizarla. Prueba con una captura o una versión más liviana.");
}
