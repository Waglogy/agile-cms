import React from "react";
import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";
import { ToastContainer } from "react-toastify";

import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(

    <BrowserRouter>
      <ToastContainer />
      <App />
    </BrowserRouter>
);
