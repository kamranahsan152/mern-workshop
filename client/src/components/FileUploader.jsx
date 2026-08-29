// -----------------------------------------------------------------------------
// FileUploader.jsx
// The drop zone + file picker + "Upload all" button.
// -----------------------------------------------------------------------------
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  filesSelected,
  registerFiles,
  fileRegistry,
  uploadFileThunk,
  selectQueue,
  selectIsUploading,
} from "../features/upload/uploadSlice";

export default function FileUploader() {
  const dispatch = useDispatch();
  const queue = useSelector(selectQueue);
  const isUploading = useSelector(selectIsUploading);

  // A ref lets the styled div trigger the hidden <input type="file">.
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  // Shared by both the picker and drag-and-drop.
  function handleFiles(fileList) {
    if (!fileList || fileList.length === 0) return;

    // Client-side filter. This is CONVENIENCE, not security — the server
    // validates again, because anyone can bypass the browser.
    const images = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/")
    );
    if (images.length === 0) {
      alert("Please choose image files only.");
      return;
    }

    // registerFiles stashes the real File objects and returns plain metadata.
    const meta = registerFiles(images);
    dispatch(filesSelected(meta));
  }

  function onInputChange(e) {
    handleFiles(e.target.files);
    // Reset so picking the SAME file twice still fires onChange.
    e.target.value = "";
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  // Upload every file that has not succeeded yet.
  function uploadAll() {
    console.log("[dbg] uploadAll fired. queue:", queue.length,
      "registry keys:", [...fileRegistry.keys()]);
    queue
      .filter((f) => f.status === "pending" || f.status === "error")
      .forEach((f) => {
        const file = fileRegistry.get(f.id);
        console.log("[dbg] id:", f.id, "-> file?", !!file, file);
        if (file) dispatch(uploadFileThunk({ id: f.id, file }));
        else console.error("[dbg] NO FILE for id", f.id);
      });
  }

  const pendingCount = queue.filter(
    (f) => f.status === "pending" || f.status === "error"
  ).length;

  return (
    <section className="panel">
      <div
        className={`dropzone ${dragging ? "dropzone-active" : ""}`}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <div className="dropzone-icon">＋</div>
        <p className="dropzone-title">Drop photos here or click to browse</p>
        <p className="dropzone-sub">JPG, PNG, GIF or WebP · up to 5 MB each</p>

        {/* The real input is hidden — we style the div instead. */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onInputChange}
          style={{ display: "none" }}
        />
      </div>

      <button
        className="btn-primary"
        onClick={uploadAll}
        disabled={pendingCount === 0 || isUploading}
      >
        {isUploading
          ? "Uploading…"
          : pendingCount > 0
          ? `Upload ${pendingCount} photo${pendingCount > 1 ? "s" : ""}`
          : "Nothing to upload"}
      </button>
    </section>
  );
}
