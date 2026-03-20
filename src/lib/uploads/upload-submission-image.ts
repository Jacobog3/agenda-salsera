type SubmissionFolder = "events" | "academies" | "teachers" | "spots";

export async function uploadSubmissionImage(file: File, folder: SubmissionFolder): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch("/api/submission-upload", {
    method: "POST",
    body: formData
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(String(data.error || "No pudimos subir la imagen. Intenta de nuevo más tarde."));
  }

  return String(data.url ?? "");
}
