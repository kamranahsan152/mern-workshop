// -----------------------------------------------------------------------------
// App.jsx — layout only. All the logic lives in the three child components.
// -----------------------------------------------------------------------------
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import FileUploader from "./components/FileUploader";
import UploadProgress from "./components/UploadProgress";
import PhotoGrid from "./components/PhotoGrid";

import {
  loadPhotosThunk,
  selectGlobalError,
  clearGlobalError,
} from "./features/upload/uploadSlice";

export default function App() {
  const dispatch = useDispatch();
  const globalError = useSelector(selectGlobalError);

  // Empty dependency array = run once when the app mounts.
  useEffect(() => {
    dispatch(loadPhotosThunk());
  }, [dispatch]);

  return (
    <div className="page">
      <header className="header">
        <h1>Photo Collage</h1>
        <p className="muted">
          Session 17 — file uploads with Express, Multer and Redux Toolkit
        </p>
      </header>

      {globalError && (
        <div className="alert">
          <span>{globalError}</span>
          <button
            className="btn-ghost"
            onClick={() => dispatch(clearGlobalError())}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="columns">
        <div className="col-left">
          <FileUploader />
          <UploadProgress />
        </div>
        <div className="col-right">
          <PhotoGrid />
        </div>
      </div>
    </div>
  );
}
