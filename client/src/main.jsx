import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import CustomHome from "../pages/CustomHome.jsx";
import MyHomes from "../pages/MyHomes.jsx";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/custom-homes/:homeId", element: <CustomHome /> },
  { path: "/my-homes", element: <MyHomes /> },
  { path: "/my-homes/:customHomeId/edit", element: <CustomHome /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
