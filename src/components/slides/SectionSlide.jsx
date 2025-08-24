import React from "react";
import TYN_LOGO from "@/assets/images/TYN_LOGO-08.png";

function SectionSlide({ title, componentID }) {
  return (
    <div id={componentID}>
      <div className="border w-7xl h-[720px] relative group bg-[#c05334] overflow-hidden py-8">
        <div className="h-full relative">
          <div className="absolute -top-2 right-8 ">
            <img className="h-24" src={TYN_LOGO} alt="TYN LOGO" />
          </div>
          <div className="absolute h-full -translate-x-[30%] z-[1]">
            <EllipseSVG />
          </div>
          <div className="absolute h-full -translate-x-[18%] z-[2]">
            <EllipseSVG />
          </div>
          <div className="absolute h-full -translate-x-[6%] z-[3]">
            <EllipseSVG />
          </div>
          <div className="absolute h-full translate-x-[6%] z-[4]">
            <EllipseSVG />
          </div>
          <div className="absolute h-full translate-x-[18%] z-[5]">
            <EllipseSVG />
          </div>
          <div className="absolute h-full translate-x-[30%] z-[6]">
            <EllipseSVG />
          </div>
          <div className="absolute h-full translate-x-[22.5%] z-[7]">
            <HorizontalLine />
          </div>
          <div className="absolute bottom-[50%] right-0 mr-10 mb-4">
            <h1 className="text-6xl font-header">{title}</h1>
          </div>
        </div>
      </div>
    </div>
  );
}

const HorizontalLine = () => {
  return (
    <svg className="w-full h-full" viewBox="0 0 100 10">
      <defs>
        <linearGradient id="lineGradient" x1="0%" x2="100%">
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="gray" />
        </linearGradient>
      </defs>

      <rect x="0" y="5" width="72" height="0.1" fill="url(#lineGradient)" />
    </svg>
  );
};

const EllipseSVG = () => {
  return (
    <svg className="h-full m-0 p-0" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="whiteToGray" x1="0%" x2="100%">
          <stop offset="0%" stopColor="#f4e9e7" />
          <stop offset="100%" stopColor="#a97867" />
        </linearGradient>
      </defs>

      <ellipse
        cx="50"
        cy="50"
        rx="12"
        ry="45"
        fill="transparent"
        stroke="url(#whiteToGray)"
        strokeWidth="0.2"
      />
    </svg>
  );
};

export default SectionSlide;
