import html2canvas from "html2canvas";

export default class GoogleSlidesService {
  constructor() {
    this.accessToken = null;
    this.presentationId = null;
  }

  // Initialize Google API
  async initializeGoogleAPI() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        window.gapi.load("auth2", () => {
          window.gapi.auth2
            .init({
              client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
              scope:
                "https://www.googleapis.com/auth/presentations https://www.googleapis.com/auth/drive.file",
            })
            .then(() => {
              resolve();
            })
            .catch(reject);
        });
      } else {
        reject("Google API not loaded");
      }
    });
  }

  // Authenticate user
  async authenticate() {
    try {
      await this.initializeGoogleAPI();
      const authInstance = window.gapi.auth2.getAuthInstance();

      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn();
      }

      const user = authInstance.currentUser.get();
      this.accessToken = user.getAuthResponse().access_token;
      return this.accessToken;
    } catch (error) {
      throw new Error("Authentication failed: " + error.message);
    }
  }

  // Create a new presentation
  async createPresentation(title = "Performance Dashboard") {
    try {
      const response = await fetch(
        "https://slides.googleapis.com/v1/presentations",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to create presentation: ${response.statusText}`
        );
      }

      const presentation = await response.json();
      this.presentationId = presentation.presentationId;
      return presentation;
    } catch (error) {
      throw new Error("Failed to create presentation: " + error.message);
    }
  }

  // Capture component as image using html2canvas
  async captureComponentAsImage(elementId, options = {}) {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id '${elementId}' not found`);
      }

      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        scale: 2, // Higher quality
        backgroundColor: "#ffffff",
        width: 1920, // Standard slide width
        height: 1080, // Standard slide height
        ...options,
      });

      return canvas.toDataURL("image/png");
    } catch (error) {
      throw new Error("Failed to capture component: " + error.message);
    }
  }

  // Upload image to Google Drive
  async uploadImageToDrive(imageDataUrl, fileName = "slide_image.png") {
    try {
      // Convert data URL to blob
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append(
        "metadata",
        new Blob(
          [
            JSON.stringify({
              name: fileName,
              parents: [], // Optional: specify folder ID
            }),
          ],
          { type: "application/json" }
        )
      );
      formData.append("file", blob);

      // Upload to Google Drive
      const uploadResponse = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload image: ${uploadResponse.statusText}`);
      }

      const fileData = await uploadResponse.json();
      return fileData.id;
    } catch (error) {
      throw new Error("Failed to upload image: " + error.message);
    }
  }

  // Add image to slide
  async addImageToSlide(slideId, imageFileId, options = {}) {
    try {
      const { x = 0, y = 0, width = 720, height = 405 } = options;

      const requests = [
        {
          createImage: {
            objectId: `image_${Date.now()}`,
            url: `https://drive.google.com/uc?id=${imageFileId}`,
            elementProperties: {
              pageObjectId: slideId,
              size: {
                width: {
                  magnitude: width,
                  unit: "PT",
                },
                height: {
                  magnitude: height,
                  unit: "PT",
                },
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: x,
                translateY: y,
                unit: "PT",
              },
            },
          },
        },
      ];

      const response = await fetch(
        `https://slides.googleapis.com/v1/presentations/${this.presentationId}:batchUpdate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requests }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add image to slide: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error("Failed to add image to slide: " + error.message);
    }
  }

  // Create slide from component
  async createSlideFromComponent(
    elementId,
    slideTitle = "Performance Overview",
    options = {}
  ) {
    try {
      // Step 1: Capture component as image
      console.log("Capturing component...");
      const imageDataUrl = await this.captureComponentAsImage(
        elementId,
        options.captureOptions
      );

      // Step 2: Upload image to Google Drive
      console.log("Uploading image to Drive...");
      const imageFileId = await this.uploadImageToDrive(
        imageDataUrl,
        `${slideTitle}.png`
      );

      // Step 3: Create new slide
      console.log("Creating slide...");
      const slideId = `slide_${Date.now()}`;
      const createSlideRequests = [
        {
          createSlide: {
            objectId: slideId,
            slideLayoutReference: {
              predefinedLayout: "BLANK",
            },
          },
        },
      ];

      await fetch(
        `https://slides.googleapis.com/v1/presentations/${this.presentationId}:batchUpdate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requests: createSlideRequests }),
        }
      );

      // Step 4: Add image to slide
      console.log("Adding image to slide...");
      await this.addImageToSlide(slideId, imageFileId, {
        x: 0,
        y: 0,
        width: 720,
        height: 405,
        ...options.imageOptions,
      });

      // Step 5: Add title if provided
      if (slideTitle) {
        await this.addTextToSlide(slideId, slideTitle, {
          x: 50,
          y: 420,
          width: 620,
          height: 50,
        });
      }

      console.log("Slide created successfully!");
      return { slideId, imageFileId };
    } catch (error) {
      throw new Error(
        "Failed to create slide from component: " + error.message
      );
    }
  }

  // Add text to slide
  async addTextToSlide(slideId, text, options = {}) {
    try {
      const {
        x = 50,
        y = 50,
        width = 620,
        height = 50,
        fontSize = 24,
        fontFamily = "Arial",
      } = options;

      const textBoxId = `textbox_${Date.now()}`;
      const requests = [
        {
          createShape: {
            objectId: textBoxId,
            shapeType: "TEXT_BOX",
            elementProperties: {
              pageObjectId: slideId,
              size: {
                width: {
                  magnitude: width,
                  unit: "PT",
                },
                height: {
                  magnitude: height,
                  unit: "PT",
                },
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: x,
                translateY: y,
                unit: "PT",
              },
            },
          },
        },
        {
          insertText: {
            objectId: textBoxId,
            text: text,
          },
        },
        {
          updateTextStyle: {
            objectId: textBoxId,
            style: {
              fontSize: {
                magnitude: fontSize,
                unit: "PT",
              },
              fontFamily: fontFamily,
              bold: true,
            },
            fields: "fontSize,fontFamily,bold",
          },
        },
      ];

      const response = await fetch(
        `https://slides.googleapis.com/v1/presentations/${this.presentationId}:batchUpdate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requests }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add text to slide: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error("Failed to add text to slide: " + error.message);
    }
  }

  // Get presentation URL
  getPresentationUrl() {
    if (!this.presentationId) {
      throw new Error("No presentation created yet");
    }
    return `https://docs.google.com/presentation/d/${this.presentationId}/edit`;
  }
}
