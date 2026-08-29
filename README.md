# Session 17 — Complete File Upload System with Redux + Photo Grid Collage

A full-stack photo collage app. Users pick multiple photos, watch each one upload
with its own live progress bar, and see the finished set rendered as a responsive
collage grid.

Built in two halves:

- **Part 1 — local disk.** No accounts, no keys, no paid services. Files are
  stored in a local `uploads/` folder and served by Express itself. This is the
  default and it works out of the box.
- **Part 2 — production storage.** The same app, switched to Cloudinary or
  Amazon S3 by changing one environment variable. Nothing in the frontend
  changes.

---

## Stack

| Layer | Tech |
|---|---|
| Backend | Node.js, Express, Multer, CORS, dotenv |
| Frontend | React 18, Vite, Redux Toolkit, React-Redux, Axios |
| Storage | Local filesystem (default) · Cloudinary · Amazon S3 |

---

## Quick start

You need **two terminals**.

### Terminal 1 — backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Runs on `http://localhost:5000`. Check it with `http://localhost:5000/api/health`.

### Terminal 2 — frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

> If you skip the `.env` files the app still runs — both sides fall back to the
> default ports in code. Copying them is the good habit.

---

## Project structure

```
server/
  src/
    routes/fileRoutes.js          route definitions
    controllers/fileController.js turn multer files into JSON
    middleware/upload.js          MULTER CONFIG — picks the storage driver
    middleware/storage/           the three interchangeable storage engines
      localStorage.js               disk (default, no extra packages)
      cloudinaryStorage.js          Cloudinary (needs 2 npm packages + keys)
      s3Storage.js                  Amazon S3 (needs 2 npm packages + keys)
    middleware/errorHandler.js    turn upload errors into clean 4xx/5xx
    utils/paths.js                where uploads/ lives
    utils/filename.js             safe unique filename generator
  uploads/                        stored images (gitignored)
  server.js                       app entry
  package.json

client/
  src/
    app/store.js                          Redux store
    features/upload/uploadSlice.js        ALL upload state + thunks
    features/upload/uploadApi.js          axios calls + progress callback
    components/FileUploader.jsx           dropzone + picker + upload button
    components/UploadProgress.jsx         per-file progress rows
    components/PhotoGrid.jsx              the collage
    App.jsx  main.jsx  index.css
  package.json
```

---

## API documentation

Base URL: `http://localhost:5000`

### `POST /api/files/upload`

Uploads one or more images.

- **Content-Type:** `multipart/form-data`
- **Field name:** `photos` (must match exactly)
- **Limits:** 5 MB per file, 10 files per request, images only

**201 Created**

```json
{
  "success": true,
  "count": 1,
  "files": [
    {
      "filename": "1724930012345-3f9a1c2b8e7d4506.png",
      "originalName": "holiday.png",
      "mimeType": "image/png",
      "size": 184320,
      "url": "http://localhost:5000/uploads/1724930012345-3f9a1c2b8e7d4506.png"
    }
  ]
}
```

**Errors**

| Status | When |
|---|---|
| 400 | No file sent, or wrong field name, or more than 10 files |
| 413 | File larger than 5 MB |
| 415 | Not an image |
| 500 | Unexpected server error |

### `GET /api/files`

Lists every file currently in `uploads/`, newest first. This is what lets the
collage survive a page refresh.

### `DELETE /api/files/:filename`

Deletes one file. Returns `404` if it does not exist.

### `GET /uploads/:filename`

The static image itself. Served by `express.static()`. Put this straight into
`<img src="...">`.

---

## How the whole thing works (short version)

1. The user picks files. React gets real `File` objects from the `<input>`.
2. `registerFiles()` stores those `File` objects in a plain JS `Map` and puts only
   *metadata* (id, name, size, preview URL) into Redux — because a `File` is not
   serialisable and must never go in the store.
3. `URL.createObjectURL(file)` gives an instant thumbnail with zero server calls.
4. Clicking **Upload** dispatches one `uploadFileThunk` **per file**. One request
   per file is deliberate: the browser reports progress per *request*, so one
   request per file is the only way to get one accurate bar per file.
5. Inside the thunk, axios's `onUploadProgress` fires repeatedly. Each time, we
   `dispatch(setProgress({ id, percent }))`. That is how bytes-on-the-wire become
   Redux state and re-render the bar.
6. Express receives `multipart/form-data`. `express.json()` cannot read it —
   Multer parses it, validates type and size, generates a safe filename, and
   writes the file to `uploads/`.
7. The controller maps Multer's file objects into clean JSON with a public URL.
8. On `fulfilled`, the slice pushes the saved photo into `photos[]`.
9. `PhotoGrid` renders `photos[]` as a CSS Grid collage.

---

## Testing upload progress

On `localhost` uploads finish instantly, so the bar flashes past. Three ways to
actually see it:

**1. Chrome DevTools throttling (easiest)**
DevTools → Network tab → the throttling dropdown (usually says "No throttling")
→ **Slow 3G**. Now a 2 MB photo takes several seconds and the bar animates properly.

**2. Use big photos**
Upload 3–4 real camera photos at 4–5 MB each rather than small test images.

**3. Add an artificial delay on the server**
For teaching only — put this in `server.js` *above* the routes:

```js
// DEMO ONLY: slow every request down by 2 seconds
app.use((req, res, next) => setTimeout(next, 2000));
```

Delete it afterwards.

---

## Common upload errors and fixes

| Symptom | Cause | Fix |
|---|---|---|
| `MulterError: Unexpected field` | Form field name doesn't match | `formData.append("photos", file)` must match `upload.array("photos")` |
| `req.files is undefined` | Multer middleware not on the route, or listed after the controller | `router.post("/upload", uploadPhotos, uploadFiles)` — middleware first |
| CORS error in console | Express not allowing port 5173 | `app.use(cors({ origin: "http://localhost:5173" }))` |
| Images 404 at `/uploads/...` | Missing static line | `app.use("/uploads", express.static(UPLOAD_DIR))` |
| Body is empty / boundary error | You set `Content-Type` manually | Never set it — the browser must add the multipart boundary |
| Progress jumps 0 → 100 instantly | Localhost is too fast | Throttle to Slow 3G in DevTools |
| `413 File too large` | Over the 5 MB limit | Raise `MAX_FILE_SIZE_MB` in `middleware/upload.js` |
| `A non-serializable value was detected` | You put a `File` in Redux | Store metadata only; keep the `File` in `fileRegistry` |
| `could not find react-redux context` | Missing `<Provider>` | Wrap `<App />` in `<Provider store={store}>` in `main.jsx` |
| Uploads vanish after restart | You deleted `uploads/` or it's gitignored | Normal — `uploads/*` is gitignored by design |
| Uploads vanish after a **deploy** | Ephemeral container filesystem | Switch to Cloudinary or S3 — see Production storage |
| `Cannot find module 'cloudinary'` | Driver set but packages not installed | `npm install cloudinary multer-storage-cloudinary` |
| `Missing CLOUDINARY_API_KEY in .env` | Driver set but keys missing | Add the keys, then restart the server |
| S3 images download instead of display | Missing content type | Set `contentType: multerS3.AUTO_CONTENT_TYPE` |
| S3 returns 403 on the image url | Bucket is private | Add a public-read bucket policy, or use presigned URLs |

---

## Production storage

The default driver is `local` and needs nothing extra. To switch, set
`STORAGE_DRIVER` in `server/.env` and install that driver's packages.

### Cloudinary

```bash
cd server
npm install cloudinary multer-storage-cloudinary
```

```bash
# server/.env
STORAGE_DRIVER=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### Amazon S3

```bash
cd server
npm install @aws-sdk/client-s3 multer-s3
```

```bash
# server/.env
STORAGE_DRIVER=s3
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET=s17-photo-collage
```

### Why bother — what breaks with local disk in production

| Problem | Detail |
|---|---|
| Ephemeral filesystems | Render, Railway, Heroku and most containers wipe the disk on every deploy. Uploads vanish. |
| Horizontal scaling | Two server instances: a photo saved on A returns 404 from B. |
| No CDN | Every image is served by your Node process, from one region. |
| Durability | One disk failure loses everything. S3 replicates automatically. |
| No image processing | Want thumbnails? You maintain a resizing pipeline yourself. |

### What changes, and what doesn't

Only the storage engine and one line in the controller change. The route, the
field name `"photos"`, the filter, the limits, the JSON response shape, and the
**entire React frontend** are untouched.

| Driver | URL comes from | Filename is |
|---|---|---|
| `local` | built from `req.get("host")` | `file.filename` |
| `cloudinary` | `file.path` (already a CDN url) | `file.filename` (the public_id) |
| `s3` | `file.location` | `file.key` |

`GET /api/files` lists the uploads folder, so it only works on the `local`
driver. For cloud drivers you would store photo metadata in MongoDB instead —
that's a stretch assignment below.

**Never commit your keys.** They go in `.env`, `.env` goes in `.gitignore`, and
real values go in your host's environment variables panel.

---

## Student assignment

**Core (everyone):**

1. Add a **file-count badge** showing total size of all photos in the collage.
2. Add a **"Retry" button** on failed queue rows that re-dispatches the upload.
3. Change the limits to **8 MB** and **15 files** — in *both* the server and the
   text shown in the dropzone.
4. Add a **`GET /api/files/stats`** endpoint returning `{ count, totalBytes }`
   and display it in the header.
5. **Move the app to Cloudinary** and prove an uploaded photo still appears in
   the collage. Confirm the url now points at `res.cloudinary.com`.

**Stretch:**

5. Add a **lightbox**: clicking a tile opens the full image in an overlay.
6. Add a **`captions` field** — let the user type a caption per photo before
   upload, send it in the same `FormData`, and show it in the collage.
7. Add **image dimension validation** on the server (reject anything under
   200×200) using the `image-size` npm package.
8. Store photo metadata in **MongoDB** instead of reading the folder, so you keep
   original filenames and upload timestamps properly — and so `GET /api/files`
   works on the cloud drivers.
9. Support **all three drivers** in one codebase and switch between them with
   only an `.env` change. (The shipped project already does this — read
   `src/middleware/upload.js` and explain how it works.)
10. Make an S3 bucket **private** and serve photos through **presigned URLs**
    that expire after one hour.

---

## Security notes

Everything below is implemented in this project:

- **Original filenames are never used for storage.** `makeSafeFilename()` throws
  the name away and generates `timestamp-randomhex.ext`.
- **Path traversal is impossible.** `path.basename()` strips any `../` before the
  name touches the filesystem — in both the filename generator and the delete route.
- **Extension allow-list.** Anything not in `ALLOWED_EXTENSIONS` becomes `.jpg`.
- **MIME type validated** in Multer's `fileFilter`.
- **Size and count limits** enforced by Multer's `limits`.
- **Client-side checks are convenience only** — the server validates everything
  again, because anyone can bypass the browser with curl or Postman.
- **Secrets stay in `.env`**, which is gitignored. Never hardcode an API key,
  and never commit one.
