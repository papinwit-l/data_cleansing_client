import { useData } from "@/contexts/DataContext";
import React from "react";
import TYN_LOGO from "@/assets/images/TYN_LOGO-white.png";

function TitleSlide({ projectName, reportType }) {
  const { dateRange } = useData();

  const formattedDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      timeZone: "Asia/Bangkok",
    });
  };
  //   console.log(dateRange);
  return (
    <div
      id="title-component"
      className="flex flex-col border w-7xl h-[720px] gap-2 relative group overflow-hidden"
      // style={{ backgroundColor: "#405a5a" }}
    >
      <div className="absolute bg-main-secondary h-full w-full"></div>
      <img
        className="absolute h-26 top-6 left-8"
        src={TYN_LOGO}
        alt="tyn-logo"
      />
      {/* CIRCLE BACKGROUND */}
      <div className="absolute left-28 top-[250px] border-[#4c6363] border-[1px] rounded-full w-[1400px] h-[1400px]" />
      <div className="absolute top-5 right-14 text-xs text-main-tertiary leading-[125%] text-left font-main-detail">
        <p>PRESENTED BY</p>
        <p>TYN MOON MAKERS CO.,LTD.</p>
      </div>
      <div className="absolute top-[50%] -translate-y-14 w-full flex flex-col items-center gap-12 text-6xl font-header">
        <div className="flex flex-col items-center gap-2 text-main-tertiary">
          <h1>{projectName.length > 0 ? projectName : "{Project Name}"}</h1>
          <h1>
            {reportType.length > 0
              ? reportType
              : "{Monthly Report / Weekly Report}"}
          </h1>
        </div>
        <h1 className="text-main-primary">
          {dateRange.from &&
            dateRange.to &&
            `${formattedDate(dateRange.from)} - ${formattedDate(dateRange.to)}`}
        </h1>
      </div>
    </div>
  );
}

export default TitleSlide;
