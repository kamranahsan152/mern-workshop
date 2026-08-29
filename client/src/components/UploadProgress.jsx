// -----------------------------------------------------------------------------
// UploadProgress.jsx
// Renders the queue: one row per selected file with thumbnail, name, % and bar.
// This component is "dumb" — it reads from Redux and dispatches, nothing else.
// -----------------------------------------------------------------------------
import { useDispatch, useSelector } from "react-redux";
import {
  selectQueue,
  removeFromQueue,
  clearFinished,
} from "../features/upload/uploadSlice";

// Turn 1536000 into "1.5 MB"
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const STATUS_LABEL = {
  pending: "Waiting",
  uploading: "Uploading",
  success: "Done",
  error: "Failed",
};

export default function UploadProgress() {
  const queue = useSelector(selectQueue);
  const dispatch = useDispatch();

  if (queue.length === 0) return null;

  const doneCount = queue.filter((f) => f.status === "success").length;

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Upload queue ({queue.length})</h2>
        {doneCount > 0 && (
          <button className="btn-ghost" onClick={() => dispatch(clearFinished())}>
            Clear completed
          </button>
        )}
      </div>

      <ul className="queue">
        {queue.map((file) => (
          <li key={file.id} className={`queue-row status-${file.status}`}>
            <img className="queue-thumb" src={file.previewUrl} alt={file.name} />

            <div className="queue-body">
              <div className="queue-line">
                <span className="queue-name" title={file.name}>
                  {file.name}
                </span>
                <span className="queue-pct">{file.progress}%</span>
              </div>

              {/* The bar is just a div whose width is the percentage. */}
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${file.progress}%` }}
                />
              </div>

              <div className="queue-meta">
                <span className={`chip chip-${file.status}`}>
                  {STATUS_LABEL[file.status]}
                </span>
                <span>{formatSize(file.size)}</span>
                {file.error && <span className="err-text">{file.error}</span>}
              </div>
            </div>

            {file.status !== "uploading" && (
              <button
                className="btn-x"
                onClick={() => dispatch(removeFromQueue(file.id))}
                aria-label={`Remove ${file.name}`}
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
