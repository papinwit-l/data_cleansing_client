import React from "react";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <main className="w-full">
      <Outlet />
    </main>
  );
}

export default MainLayout;
