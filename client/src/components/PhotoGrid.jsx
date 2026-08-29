// -----------------------------------------------------------------------------
// PhotoGrid.jsx  —  the collage
//
// The layout uses CSS Grid with `auto-fill` + `minmax`, which means the number
// of columns is decided by the browser from the available width. No media
// queries needed — that is what makes it responsive for free.
// -----------------------------------------------------------------------------
import { useDispatch, useSelector } from "react-redux";
import {
  selectPhotos,
  selectLoadStatus,
  deletePhotoThunk,
} from "../features/upload/uploadSlice";

export default function PhotoGrid() {
  const photos = useSelector(selectPhotos);
  const loadStatus = useSelector(selectLoadStatus);
  const dispatch = useDispatch();

  if (loadStatus === "loading") {
    return <p className="muted">Loading your collage…</p>;
  }

  if (photos.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon">🖼</div>
        <p>No photos yet. Upload a few to build your collage.</p>
      </div>
    );
  }

  return (
    <section>
      <div className="panel-head">
        <h2>Your collage ({photos.length})</h2>
      </div>

      <div className="grid">
        {photos.map((photo, index) => (
          <figure
            key={photo.filename}
            // Every 5th photo spans two columns and two rows. That single trick
            // is what turns a plain grid into a proper collage.
            className={`tile ${index % 5 === 0 ? "tile-big" : ""}`}
          >
            <img src={photo.url} alt={photo.originalName} loading="lazy" />

            <figcaption className="tile-cap">
              <span className="tile-name">{photo.originalName}</span>
            </figcaption>

            <button
              className="tile-del"
              onClick={() => dispatch(deletePhotoThunk(photo.filename))}
              aria-label={`Delete ${photo.originalName}`}
            >
              ×
            </button>
          </figure>
        ))}
      </div>
    </section>
  );
}
