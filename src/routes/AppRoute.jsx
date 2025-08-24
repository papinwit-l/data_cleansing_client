import { DataProvider } from "@/contexts/dataContext";
import MainLayout from "@/layouts/MainLayout";
import DataSheet from "@/pages/DataSheet";
import Home from "@/pages/Home";
import SlideRport from "@/pages/SlideRport";
import React from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/data-sheet",
        element: <DataSheet />,
      },
      {
        path: "/slide-report",
        element: (
          <DataProvider>
            <SlideRport />
          </DataProvider>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
]);

function AppRoute() {
  return <RouterProvider router={router} />;
}

export default AppRoute;
