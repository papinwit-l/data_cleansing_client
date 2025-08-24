import React, { useState } from "react";

function ImageFallback({ src, alt, className, ...props }) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Check if src is valid (not empty, null, undefined)
  const isValidSrc = src && src.trim() !== "";

  if (!isValidSrc || hasError) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300`}
      >
        <div className="text-center p-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm text-gray-500 font-medium">
            No image available
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div
          className={`${className} flex items-center justify-center bg-gray-50`}
        >
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? "hidden" : ""}`}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </>
  );
}

export default ImageFallback;
