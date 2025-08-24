import React from "react";
import TYNLogo from "@/assets/images/TYN_Logo.png";

function SlideHeader({ title }) {
  return (
    <div className="flex justify-between">
      <div className="flex flex-col justify-between">
        <h1 className="pl-2 text-main-primary text-6xl font-header">{title}</h1>
        <div className="border-b border-2 w-[700px]" />
      </div>
      <img src={TYNLogo} alt="TYN_Logo" className="h-[90px]" />
    </div>
  );
}

export default SlideHeader;
