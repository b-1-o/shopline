import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// Full UI styles loaded from index.html (historical complete stylesheet)
// import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
