// -----------------------------------------------------------------------------
// uploadApi.js
// All network code lives here. Components and slices never call axios directly —
// that keeps Redux logic clean and makes the API easy to swap later.
// -----------------------------------------------------------------------------
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

console.log("BASE_URL", BASE_URL);

const api = axios.create({ baseURL: BASE_URL });

/**
 * Upload ONE file and report progress.
 *
 * Why one file per request instead of all of them at once?
 * Because the browser only gives you ONE progress number per request. If you
 * send 5 files in one request you get 5 files sharing a single progress bar.
 * One request per file = one accurate bar per file, which is what our UI needs.
 *
 * @param {File} file        - a real browser File object from <input type="file">
 * @param {Function} onProgress - called with 0..100 as the upload advances
 */
export async function uploadSingleFile(file, onProgress) {
  // FormData is the browser's built-in way to build a multipart/form-data body.
  const formData = new FormData();

  // "photos" MUST match upload.array("photos") on the Express side.
  formData.append("photos", file);

  const response = await api.post("/api/files/upload", formData, {
    // NOTE: do NOT set Content-Type yourself. The browser must set it, because
    // it has to append the random "boundary" string that separates the parts.
    onUploadProgress: (event) => {
      // event.total can be undefined on some servers, so guard it.
      if (!event.total) return;
      const percent = Math.round((event.loaded * 100) / event.total);
      onProgress(percent);
    },
  });

  // Server returns { success, count, files: [...] } — we sent one, take the first.
  return response.data.files[0];
}

/** GET /api/files — everything already on the server. */
export async function fetchAllFiles() {
  const response = await api.get("/api/files");
  return response.data.files;
}

/** DELETE /api/files/:filename */
export async function deleteFileRequest(filename) {
  await api.delete(`/api/files/${filename}`);
  return filename;
}
