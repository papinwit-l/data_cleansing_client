import React from "react";
import { Download, FileText } from "lucide-react";

// Google Slides dimensions (16:9 aspect ratio)
const SLIDE_WIDTH = 1200; // Half of 1920 for better screen display
const SLIDE_HEIGHT = 675; // Half of 1080 for better screen display

// Individual slide components
const Slide1 = () => (
  <div className="w-full h-full bg-white p-8 border border-gray-200 flex flex-col">
    <h1 className="text-3xl font-bold text-gray-800 mb-6">Company Overview</h1>
    <div className="flex-1 grid grid-cols-2 gap-6">
      <div>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-50">
              <th className="border border-gray-300 p-2 text-left">Metric</th>
              <th className="border border-gray-300 p-2 text-left">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">Revenue</td>
              <td className="border border-gray-300 p-2">$10M</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Growth</td>
              <td className="border border-gray-300 p-2">25%</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Employees</td>
              <td className="border border-gray-300 p-2">150</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="bg-gray-50 p-4 rounded flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-blue-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Chart Placeholder</p>
        </div>
      </div>
    </div>
  </div>
);

const Slide2 = () => (
  <div className="w-full h-full bg-white p-8 border border-gray-200 flex flex-col">
    <h1 className="text-3xl font-bold text-gray-800 mb-6">
      Financial Performance
    </h1>
    <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-64 rounded-lg flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-4xl font-bold mb-2">📊</div>
            <p className="text-lg">Interactive Chart</p>
            <p className="text-sm opacity-80">Q1-Q4 Performance</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Slide3 = () => (
  <div className="w-full h-full bg-white p-8 border border-gray-200 flex flex-col">
    <h1 className="text-3xl font-bold text-gray-800 mb-6">Future Roadmap</h1>
    <div className="flex-1 grid grid-cols-3 gap-4">
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h3 className="font-semibold text-green-800 mb-2">Q1 2025</h3>
        <ul className="text-sm text-green-700">
          <li>• Product Launch</li>
          <li>• Team Expansion</li>
          <li>• Market Research</li>
        </ul>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">Q2 2025</h3>
        <ul className="text-sm text-blue-700">
          <li>• Scale Operations</li>
          <li>• Partnership</li>
          <li>• Technology Upgrade</li>
        </ul>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <h3 className="font-semibold text-purple-800 mb-2">Q3 2025</h3>
        <ul className="text-sm text-purple-700">
          <li>• Global Expansion</li>
          <li>• New Features</li>
          <li>• IPO Preparation</li>
        </ul>
      </div>
    </div>
  </div>
);

function SlideRport() {
  const slidesRef = React.useRef(null);

  const exportToPDF = () => {
    // This would integrate with a PDF generation library
    // For demonstration, we'll show an alert
    alert(
      "PDF export functionality would be implemented here using libraries like jsPDF or Puppeteer"
    );
  };

  const exportToGoogleSlides = () => {
    // This would integrate with Google Slides API
    // For demonstration, we'll show an alert
    alert("Google Slides export would require Google Slides API integration");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Company Presentation
            </h1>
            <p className="text-gray-600">Google Slides Template Format</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Download size={20} />
              Export PDF
            </button>
            <button
              onClick={exportToGoogleSlides}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText size={20} />
              Export to Google Slides
            </button>
          </div>
        </div>

        {/* Slides Container */}
        <div ref={slidesRef} className="space-y-8">
          {/* Slide 1 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <span className="text-sm font-medium text-gray-600">Slide 1</span>
            </div>
            <div
              style={{
                width: `${SLIDE_WIDTH}px`,
                height: `${SLIDE_HEIGHT}px`,
              }}
              className="mx-auto"
            >
              <Slide1 />
            </div>
          </div>

          {/* Slide 2 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <span className="text-sm font-medium text-gray-600">Slide 2</span>
            </div>
            <div
              style={{
                width: `${SLIDE_WIDTH}px`,
                height: `${SLIDE_HEIGHT}px`,
              }}
              className="mx-auto"
            >
              <Slide2 />
            </div>
          </div>

          {/* Slide 3 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <span className="text-sm font-medium text-gray-600">Slide 3</span>
            </div>
            <div
              style={{
                width: `${SLIDE_WIDTH}px`,
                height: `${SLIDE_HEIGHT}px`,
              }}
              className="mx-auto"
            >
              <Slide3 />
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">
            Template Information
          </h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>
              <strong>Dimensions:</strong> 960x540px (16:9 aspect ratio, scaled
              for display)
            </p>
            <p>
              <strong>Full Resolution:</strong> 1920x1080px (Google Slides
              standard)
            </p>
            <p>
              <strong>Export Options:</strong> PDF, Google Slides API
              integration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SlideRport;
