// -----------------------------------------------------------------------------
// main.jsx — React entry point.
// <Provider> makes the Redux store available to EVERY component below it.
// Forget this and useSelector throws "could not find react-redux context".
// -----------------------------------------------------------------------------
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import App from "./App";
import { store } from "./app/store";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
