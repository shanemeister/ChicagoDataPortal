import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
import "./index.css";
import App from "./App.jsx";

Amplify.configure(outputs);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)