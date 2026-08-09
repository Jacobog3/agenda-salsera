type ExtractVideoFrameOptions = {
  frameCount?: number;
  maxDimension?: number;
  maxDataUrlLength?: number;
  maxFileSize?: number;
};

const DEFAULT_FRAME_COUNT = 4;
const DEFAULT_MAX_DIMENSION = 1000;
const DEFAULT_MAX_DATA_URL_LENGTH = 450_000;
const DEFAULT_MAX_FILE_SIZE = 100 * 1024 * 1024;

function waitForVideoEvent(video: HTMLVideoElement, eventName: string) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("El video tardó demasiado en responder."));
    }, 15_000);

    function cleanup() {
      window.clearTimeout(timeout);
      video.removeEventListener(eventName, handleEvent);
      video.removeEventListener("error", handleError);
    }

    function handleEvent() {
      cleanup();
      resolve();
    }

    function handleError() {
      cleanup();
      const mediaError = video.error;
      const detail = mediaError?.message?.trim();
      reject(
        new Error(
          detail
            ? `No se pudo leer el video en este dispositivo: ${detail}`
            : "No se pudo leer el video en este dispositivo. Prueba compartirlo como MP4 compatible o usa capturas del video."
        )
      );
    }

    video.addEventListener(eventName, handleEvent, { once: true });
    video.addEventListener("error", handleError, { once: true });
  });
}

function getScaledSize(width: number, height: number, maxDimension: number) {
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale))
  };
}

function renderFrame(video: HTMLVideoElement, maxDimension: number, quality: number) {
  const { width, height } = getScaledSize(video.videoWidth, video.videoHeight, maxDimension);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("No se pudo preparar un fotograma del video.");

  context.fillStyle = "#000000";
  context.fillRect(0, 0, width, height);
  context.drawImage(video, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

async function seekVideo(video: HTMLVideoElement, seconds: number) {
  if (Math.abs(video.currentTime - seconds) < 0.05) return;
  const ready = waitForVideoEvent(video, "seeked");
  video.currentTime = seconds;
  await ready;
}

export async function extractVideoFramesForAi(
  file: File,
  options: ExtractVideoFrameOptions = {}
): Promise<string[]> {
  if (!file.type.startsWith("video/")) {
    throw new Error("El archivo debe ser un video.");
  }

  const maxFileSize = options.maxFileSize ?? DEFAULT_MAX_FILE_SIZE;
  if (file.size > maxFileSize) {
    throw new Error("El video supera el límite temporal de 100 MB.");
  }

  const frameCount = Math.max(1, Math.min(options.frameCount ?? DEFAULT_FRAME_COUNT, 6));
  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const maxDataUrlLength = options.maxDataUrlLength ?? DEFAULT_MAX_DATA_URL_LENGTH;
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;

  try {
    const metadataReady = waitForVideoEvent(video, "loadedmetadata");
    video.src = objectUrl;
    video.load();
    await metadataReady;

    if (!Number.isFinite(video.duration) || video.duration <= 0 || !video.videoWidth || !video.videoHeight) {
      throw new Error("No se pudo determinar la duración o resolución del video.");
    }

    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      await waitForVideoEvent(video, "loadeddata");
    }

    const fractions = Array.from({ length: frameCount }, (_, index) =>
      frameCount === 1 ? 0.25 : 0.08 + (0.84 - 0.08) * (index / (frameCount - 1))
    );
    const frames: string[] = [];

    for (const fraction of fractions) {
      const timestamp = Math.min(Math.max(video.duration * fraction, 0), Math.max(video.duration - 0.05, 0));
      await seekVideo(video, timestamp);

      let smallestFrame = "";
      for (const dimensionScale of [1, 0.82, 0.68]) {
        for (const quality of [0.72, 0.6, 0.5]) {
          const frame = renderFrame(video, Math.round(maxDimension * dimensionScale), quality);
          if (!smallestFrame || frame.length < smallestFrame.length) smallestFrame = frame;
          if (frame.length <= maxDataUrlLength) {
            smallestFrame = frame;
            break;
          }
        }
        if (smallestFrame.length <= maxDataUrlLength) break;
      }

      if (!smallestFrame || smallestFrame.length > maxDataUrlLength) {
        throw new Error("Uno de los fotogramas quedó demasiado pesado para analizar.");
      }
      frames.push(smallestFrame);
    }

    return frames;
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
}
