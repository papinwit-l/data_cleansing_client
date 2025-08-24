import { useData } from "@/contexts/DataContext";
import React from "react";
import TYN_LOGO from "@/assets/images/TYN_LOGO-white.png";

function EndSlide({ projectName, reportType }) {
  const { dateRange } = useData();

  const formattedDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      timeZone: "Asia/Bangkok",
    });
  };
  //   console.log(dateRange);
  return (
    <div id="end-slide-component">
      <div className="border w-7xl h-[720px] gap-2 relative group bg-main-secondary overflow-hidden text-[#bfc9cc] items-center">
        <div className="absolute bottom-0 left-0 -translate-x-[65%] translate-y-[75%] border-[#4c6363] border-[1px] rounded-full w-[1400px] h-[1400px]"></div>
        <div className="absolute bottom-22 left-12">
          <div className="relative">
            <div className="absolute">
              <SmallCircle />
            </div>
            <div className="absolute translate-x-[50%]">
              <SmallCircle />
            </div>
            <div className="absolute translate-x-[100%]">
              <SmallCircle />
            </div>
            <div className="absolute translate-x-[150%]">
              <SmallCircle />
            </div>
            <div className="absolute translate-x-[200%]">
              <SmallCircle />
            </div>
          </div>
        </div>
        <div className="h-full w-full grid grid-cols-2">
          <div className="flex items-center justify-center">
            <h1 className="text-7xl font-header">THANK YOU</h1>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col font-main-detail">
              <img src={TYN_LOGO} alt="tyn-logo" className="h-40" />
              <div className="ml-4">
                <p>TYN Moon Makers Co., Ltd.</p>
                <div className="mt-4">
                  <p>+66 02 109 9687</p>
                  <p>support@tyn-moonmakers.com</p>
                  <p>www.tyn-moonmakers.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SmallCircle = () => {
  return (
    <div className="w-14 h-14 border-[1px] border-main-primary/60 rounded-full" />
  );
};

export default EndSlide;
