import { useState, useCallback } from "react";
import GoogleSlidesService from "@/services/googleSlidesService";

export const useGoogleSlides = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [presentationUrl, setPresentationUrl] = useState(null);
  const [slidesService] = useState(() => new GoogleSlidesService());

  const createPresentationFromComponent = useCallback(
    async (elementId, title = "Performance Dashboard") => {
      setIsLoading(true);
      setError(null);

      try {
        // Authenticate user
        console.log("Starting authentication...");
        await slidesService.authenticate();

        // Create presentation
        console.log("Creating presentation...");
        await slidesService.createPresentation(title);

        // Create slide from component
        console.log("Creating slide from component...");
        await slidesService.createSlideFromComponent(
          elementId,
          "Overall Performance",
          {
            captureOptions: {
              scale: 2,
              backgroundColor: "#ffffff",
              width: 1920,
              height: 1080,
              useCORS: true,
              allowTaint: true,
            },
            imageOptions: {
              width: 720,
              height: 405,
            },
          }
        );

        const url = slidesService.getPresentationUrl();
        setPresentationUrl(url);

        console.log("Presentation created successfully:", url);
        return url;
      } catch (err) {
        console.error("Error in createPresentationFromComponent:", err);
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [slidesService]
  );

  const addSlideFromComponent = useCallback(
    async (elementId, slideTitle) => {
      setIsLoading(true);
      setError(null);

      try {
        if (!slidesService.presentationId) {
          throw new Error(
            "No presentation created yet. Create a presentation first."
          );
        }

        console.log("Adding slide from component...");
        await slidesService.createSlideFromComponent(elementId, slideTitle, {
          captureOptions: {
            scale: 2,
            backgroundColor: "#ffffff",
            width: 1920,
            height: 1080,
            useCORS: true,
            allowTaint: true,
          },
          imageOptions: {
            width: 720,
            height: 405,
          },
        });

        const url = slidesService.getPresentationUrl();
        console.log("Slide added successfully");
        return url;
      } catch (err) {
        console.error("Error in addSlideFromComponent:", err);
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [slidesService]
  );

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const createMultipleSlides = useCallback(
    async (slides, presentationTitle = "Multi-Slide Dashboard") => {
      setIsLoading(true);
      setError(null);

      try {
        // Authenticate user
        await slidesService.authenticate();

        // Create presentation
        await slidesService.createPresentation(presentationTitle);

        // Create slides sequentially
        for (const slide of slides) {
          const { elementId, title, options = {} } = slide;
          await slidesService.createSlideFromComponent(elementId, title, {
            captureOptions: {
              scale: 2,
              backgroundColor: "#ffffff",
              width: 1920,
              height: 1080,
              useCORS: true,
              allowTaint: true,
              ...options.captureOptions,
            },
            imageOptions: {
              width: 720,
              height: 405,
              ...options.imageOptions,
            },
          });
        }

        const url = slidesService.getPresentationUrl();
        setPresentationUrl(url);

        return url;
      } catch (err) {
        console.error("Error in createMultipleSlides:", err);
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [slidesService]
  );

  return {
    // Main functions
    createPresentationFromComponent,
    addSlideFromComponent,
    createMultipleSlides,

    // State
    isLoading,
    error,
    presentationUrl,

    // Utility functions
    resetError,

    // Direct access to service (for advanced usage)
    slidesService,
  };
};
