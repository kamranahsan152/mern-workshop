import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Notes from "./pages/Notes";
import { Workshop } from "./pages/Workshop";
import NoteDetail from "./pages/NoteDetail";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
// import NoteDetail from "./pages/NoteDetail";
// import AddNote from "./pages/AddNote";
// import NotFound from "./pages/NotFound";

function App() {
  return (
    <div className="app">
      {/* outside Routes = on every page */}
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* /notes, /dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <Notes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workshop"
          element={
            <ProtectedRoute>
              <Workshop />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes/:id"
          element={
            <ProtectedRoute>
              <NoteDetail />
            </ProtectedRoute>
          }
        />
        {/* <Route path="/add" element={<AddNote />} /> */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </div>
  );
}
export default App;
