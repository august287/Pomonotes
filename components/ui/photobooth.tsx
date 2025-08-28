"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import {
  Camera,
  Download,
  Clock,
  Layout,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

// Add custom xs breakpoint styles
import { cn } from "../../lib/utils";

// Define available frame colors
const FRAME_COLORS = [
  { name: "Pink", value: "#ff9ed8" },
  { name: "Yellow", value: "#f9f4a1" },
  { name: "Blue", value: "#a1e4f9" },
  { name: "Green", value: "#b8f9a1" },
  { name: "Purple", value: "#d8a1f9" },
];

// Layout configurations
const LAYOUTS = [
  { id: "single", name: "Single", cols: 1, rows: 1, count: 1 },
  { id: "column", name: "Column x3", cols: 1, rows: 3, count: 3 },
  { id: "row", name: "Row x3", cols: 3, rows: 1, count: 3 },
  { id: "grid", name: "Grid 2x2", cols: 2, rows: 2, count: 4 },
];

export function Photobooth() {
  // Use createRef instead of useRef for more immediate availability
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Log when refs change to debug issues
  useEffect(() => {
    console.log("Video ref updated:", !!videoRef.current);
  }, [videoRef.current]);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [selectedColor, setSelectedColor] = useState(FRAME_COLORS[0].value);
  const [selectedLayout, setSelectedLayout] = useState(LAYOUTS[0]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isTakingMultiple, setIsTakingMultiple] = useState(false);
  const [photosTaken, setPhotosTaken] = useState(0);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);

  // Initialize camera when component mounts
  useEffect(() => {
    return () => {
      // Clean up stream when component unmounts
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Handle countdown timer
  useEffect(() => {
    if (!isCountingDown) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      if (isTakingMultiple) {
        capturePhoto();
        if (photosTaken + 1 < selectedLayout.count) {
          // Reset countdown for next photo
          setPhotosTaken((prev) => prev + 1);
          setCountdown(3);
        } else {
          // All photos taken
          setIsCountingDown(false);
          setIsTakingMultiple(false);
          setPhotosTaken(0);
        }
      } else {
        capturePhoto();
        setIsCountingDown(false);
      }
    }
  }, [isCountingDown, countdown, isTakingMultiple, photosTaken]);

  // Check if browser is Safari
  const isSafari = () => {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  };

  // Check if device is running iOS
  const isIOS = () => {
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  };

  // Start camera
  const startCamera = async () => {
    console.log("Start camera function called");
    setIsLoadingCamera(true);

    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Media devices or getUserMedia not supported");
        alert(
          "Your browser doesn't support camera access. Please try a different browser like Chrome or Firefox."
        );
        setIsLoadingCamera(false);
        return;
      }

      // Special check for Safari/iOS security requirements
      if (
        (isSafari() || isIOS()) &&
        window.location.protocol !== "https:" &&
        window.location.hostname !== "localhost"
      ) {
        console.error("Safari/iOS requires HTTPS for camera access");
        alert(
          "Safari and iOS require HTTPS for camera access. Please use this application on a secure connection or try Chrome/Firefox on desktop."
        );
        setIsLoadingCamera(false);
        return;
      }

      console.log("Requesting camera access...");

      let stream;

      // iOS Safari specific handling
      if (isIOS()) {
        console.log("iOS device detected, using specific constraints");

        try {
          // First attempt with exact values that work well on iOS
          const iosConstraints = {
            audio: false,
            video: {
              facingMode: "user",
              width: { ideal: 640, max: 1280 },
              height: { ideal: 480, max: 720 },
            },
          };

          console.log("Attempting iOS camera access with specific constraints");
          stream = await navigator.mediaDevices.getUserMedia(iosConstraints);
          console.log("iOS camera access successful with specific constraints");
        } catch (err) {
          console.error(
            "iOS camera access failed with specific constraints:",
            err
          );

          try {
            // Second attempt - minimal constraints that often work on iOS
            console.log("Trying fallback with minimal constraints for iOS");
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
            console.log(
              "iOS camera access successful with minimal constraints"
            );
          } catch (err2) {
            console.error(
              "iOS camera access failed with minimal constraints:",
              err2
            );

            // Third attempt - try environment camera (back camera)
            try {
              console.log("Trying with environment camera on iOS");
              stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
                audio: false,
              });
              console.log(
                "iOS camera access successful with environment camera"
              );
            } catch (err3) {
              console.error("All iOS camera access attempts failed:", err3);
              throw new Error(
                "Unable to access camera on iOS. Please check your privacy settings and ensure Safari has camera access."
              );
            }
          }
        }
      } else {
        // Non-iOS browser handling
        const constraints = {
          video: isSafari()
            ? true // Safari works better with simple constraints
            : {
                facingMode: "user",
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);
      }

      // Store stream in state
      setStream(stream);
      setIsActive(true);

      // Wait a bit to ensure DOM is updated
      setTimeout(() => {
        if (videoRef.current) {
          console.log("Setting video source object to stream");

          // Safari-specific handling
          try {
            videoRef.current.srcObject = stream;
          } catch (error) {
            console.error("Error setting srcObject:", error);

            // No fallback needed for newer browsers - let's just log the error
            // createObjectURL is deprecated and has typing issues with MediaStream
            console.warn(
              "Failed to set srcObject directly, video may not work on this browser"
            );
          }

          // Add event listener to ensure the video is actually playing
          videoRef.current.onloadedmetadata = () => {
            console.log("Video metadata loaded, attempting to play");
            if (videoRef.current) {
              // Safari sometimes needs a small delay after metadata loads
              setTimeout(
                () => {
                  if (videoRef.current) {
                    videoRef.current
                      .play()
                      .then(() => {
                        console.log("Video playback started successfully");
                        setIsCameraReady(true);
                      })
                      .catch((e) => {
                        console.error("Error playing video:", e);

                        // Safari-specific error message
                        if (isSafari()) {
                          alert(
                            "Safari has restricted camera access. Please check your camera permissions in Safari settings and ensure you're using HTTPS."
                          );
                        } else {
                          alert(
                            "Could not start video playback. Please check your camera permissions."
                          );
                        }
                      });
                  }
                },
                isSafari() ? 300 : 0
              ); // Add delay for Safari
            }
          };

          // Add additional event listeners for debugging
          videoRef.current.onplay = () =>
            console.log("Video play event triggered");
          videoRef.current.onplaying = () =>
            console.log("Video is now playing");
          videoRef.current.onwaiting = () =>
            console.log("Video is waiting for data");
          videoRef.current.onerror = (e) =>
            console.error("Video element error:", e);
        } else {
          console.error("Video ref is still not available after timeout");
          alert("Could not initialize camera. Please try refreshing the page.");

          // Clean up stream since we couldn't attach it
          stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
          setIsActive(false);
          setStream(null);
        }
      }, 100); // Small delay to ensure component has rendered
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert(
        "Could not access your camera. Please make sure you've granted camera permissions in your browser settings."
      );
    } finally {
      setIsLoadingCamera(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsActive(false);
    setIsCameraReady(false);
  };

  // Take photo with current settings
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    let photoDataUrl;

    // iOS Safari may need a small delay before capturing to ensure
    // the camera is fully initialized
    if (isIOS()) {
      console.log("iOS device detected, optimizing capture process");
      // No delay needed as we'll handle it with better error management
    }

    try {
      // Check if video dimensions are available
      if (!video.videoWidth || !video.videoHeight) {
        console.warn("Video dimensions not available yet");
        // Set default dimensions if video is not ready
        canvas.width = 640;
        canvas.height = 480;
      } else {
        // Match canvas size to video dimensions while preserving aspect ratio
        // Use 4:3 aspect ratio for consistent photos
        const aspectRatio = 4 / 3;

        // Calculate dimensions based on video's aspect ratio
        let canvasWidth, canvasHeight;
        const videoRatio = video.videoWidth / video.videoHeight;

        if (videoRatio > aspectRatio) {
          // Video is wider than target ratio
          canvasWidth = video.videoHeight * aspectRatio;
          canvasHeight = video.videoHeight;
        } else {
          // Video is taller than target ratio
          canvasWidth = video.videoWidth;
          canvasHeight = video.videoWidth / aspectRatio;
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Calculate source coordinates to center the crop
        const sx = (video.videoWidth - canvasWidth) / 2;
        const sy = (video.videoHeight - canvasHeight) / 2;

        // Draw the cropped video frame onto the canvas
        context.drawImage(
          video,
          sx,
          sy,
          canvasWidth,
          canvasHeight, // Source coordinates
          0,
          0,
          canvasWidth,
          canvasHeight // Destination coordinates
        );
      }

      // Convert canvas to data URL
      photoDataUrl = canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Error capturing photo:", error);
      alert(
        "Failed to capture photo. The camera may not be fully initialized yet."
      );
      return;
    }

    // Add photo to collection
    setPhotos((prev) => {
      // If not in multi-mode, just add the new photo
      if (!isTakingMultiple) return [...prev, photoDataUrl!];

      // For multi-mode, replace photo at current index or add new one
      const newPhotos = [...prev];
      if (photosTaken < newPhotos.length) {
        newPhotos[photosTaken] = photoDataUrl!;
      } else {
        newPhotos.push(photoDataUrl!);
      }
      return newPhotos;
    });
  };

  // Reset photos
  const resetPhotos = () => {
    setPhotos([]);
    setPhotosTaken(0);
  };

  // Start countdown and take photo(s)
  const startCountdown = (multiplePhotos = false) => {
    setCountdown(3);
    setIsCountingDown(true);
    setIsTakingMultiple(multiplePhotos);

    if (multiplePhotos) {
      // Clear previous photos when starting a new multi-photo session
      setPhotos(Array(selectedLayout.count).fill(""));
      setPhotosTaken(0);
    }
  };

  // Handle layout change
  const changeLayout = (layout: (typeof LAYOUTS)[0]) => {
    setSelectedLayout(layout);
    // Reset photos when layout changes
    setPhotos([]);
  };

  // Download composite photo
  const downloadPhoto = () => {
    if (photos.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    // Set canvas size based on layout for final image
    // Using 4:3 aspect ratio for each photo
    const photoWidth = 400;
    const photoHeight = 300;
    canvas.width = photoWidth * selectedLayout.cols;
    canvas.height = photoHeight * selectedLayout.rows;

    // Fill background with selected frame color
    context.fillStyle = selectedColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw a border around the entire frame in a darker shade of the selected color
    const borderColor = selectedColor;
    context.strokeStyle = borderColor;
    context.lineWidth = 10;
    context.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

    // Add photos to layout
    let currentPhotos = [...photos];
    // Pad with empty photos if needed
    while (currentPhotos.length < selectedLayout.count) {
      currentPhotos.push("");
    }

    // Limit to the number of photos needed for the current layout
    currentPhotos = currentPhotos.slice(0, selectedLayout.count);

    // Create temporary image to draw each photo
    const tempImage = new Image();

    // Use a promise to ensure all images are loaded before download
    const drawImages = async () => {
      // Draw each image in its position
      for (let i = 0; i < currentPhotos.length; i++) {
        if (!currentPhotos[i]) continue;

        // Calculate position in grid
        const row = Math.floor(i / selectedLayout.cols);
        const col = i % selectedLayout.cols;
        const x = col * photoWidth;
        const y = row * photoHeight;

        // Draw the photo
        await new Promise<void>((resolve) => {
          tempImage.onload = () => {
            // Calculate dimensions to preserve aspect ratio
            const imgWidth = tempImage.width;
            const imgHeight = tempImage.height;
            const targetWidth = photoWidth - 20; // Allow padding
            const targetHeight = photoHeight - 20;

            // Calculate dimensions to fit while preserving aspect ratio
            let drawWidth, drawHeight;
            const imgRatio = imgWidth / imgHeight;
            const targetRatio = targetWidth / targetHeight;

            if (imgRatio > targetRatio) {
              // Image is wider than target area
              drawWidth = targetWidth;
              drawHeight = targetWidth / imgRatio;
            } else {
              // Image is taller than target area
              drawHeight = targetHeight;
              drawWidth = targetHeight * imgRatio;
            }

            // Center the image in the available space
            const offsetX = x + 10 + (targetWidth - drawWidth) / 2;
            const offsetY = y + 10 + (targetHeight - drawHeight) / 2;

            // Draw image preserving aspect ratio
            context.drawImage(
              tempImage,
              offsetX,
              offsetY,
              drawWidth,
              drawHeight
            );
            resolve();
          };
          tempImage.src = currentPhotos[i];
        });
      }

      // Add decorative elements - date watermark right-justified
      // Use a consistent font stack for cross-browser compatibility
      context.font =
        "normal 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif";
      context.fillStyle = "white";
      context.textAlign = "right";
      const date = new Date().toLocaleDateString();
      context.fillText(date, canvas.width - 15, canvas.height - 15);

      try {
        // Create download link in a safer way
        const dataUrl = canvas.toDataURL("image/png");

        // iOS Safari requires different approach
        if (isIOS()) {
          console.log(
            "iOS detected, using Safari-compatible download approach"
          );

          // For iOS, we'll show the image in a new window/tab which user can then save
          // This is more reliable than trying to force a download on iOS
          const newWindow = window.open();
          if (newWindow) {
            newWindow.document.write(`
              <html>
                <head>
                  <title>Save Your Photo</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    body { font-family: -apple-system, sans-serif; margin: 0; padding: 20px; text-align: center; background-color: #f8f8f8; }
                    img { max-width: 100%; border: 10px solid ${selectedColor}; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 20px; }
                    h2 { color: #333; }
                    p { color: #666; line-height: 1.5; }
                  </style>
                </head>
                <body>
                  <h2>Your Photo is Ready!</h2>
                  <img src="${dataUrl}" alt="Your Photobooth Picture" />
                  <p>Press and hold on the image to save it to your photos.</p>
                </body>
              </html>
            `);
          } else {
            alert(
              "Unable to open new window. Please check your popup blocker settings."
            );
          }
        } else {
          // Non-iOS approach using standard download
          // Create a blob from data URL for more reliable downloads
          const byteString = atob(dataUrl.split(",")[1]);
          const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);

          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }

          const blob = new Blob([ab], { type: mimeString });
          const url = URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.download = `photobooth-${Date.now()}.png`;

          // Using safer DOM operations
          document.body.appendChild(a);
          a.click();

          // Small delay before cleanup
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);
        }
      } catch (error) {
        console.error("Download failed:", error);
        alert("Failed to download the photo. Please try again.");
      }
    };

    drawImages().catch((err) => {
      console.error("Error creating photo:", err);
      alert("An error occurred while creating your photo. Please try again.");
    });
  };

  // Store browser compatibility status
  const [browserCompatible, setBrowserCompatible] = useState<boolean | null>(
    null
  );

  // Store browser information for user feedback
  const [browserInfo, setBrowserInfo] = useState<string>("");

  // Define fixed UI colors separate from the photo frame color
  const buttonColor = "#a65c18"; // Keeping consistent with the app's theme
  const buttonTextColor = "#fefcac";
  const buttonOutlineColor = "#a65c18";

  // Define consistent font styles to address Safari font inconsistencies
  const fontStyles = {
    fontFamily:
      'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    fontWeight: "400", // Consistent font weight across browsers
    fontStyle: "normal", // Explicitly prevent cursive/italic styling
  };

  // Check browser compatibility
  useEffect(() => {
    // Check if we're running in a browser environment
    if (typeof window !== "undefined") {
      // Get browser info for more detailed messaging
      const ua = navigator.userAgent;
      let browserName = "Unknown browser";

      if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
        browserName = "Safari";
        if (/iPhone|iPad|iPod/i.test(ua)) {
          browserName = "Mobile Safari";
        }
      } else if (/Firefox/i.test(ua)) {
        browserName = "Firefox";
      } else if (/Chrome/i.test(ua)) {
        browserName = "Chrome";
      } else if (/Edge/i.test(ua)) {
        browserName = "Edge";
      }

      setBrowserInfo(browserName);

      // Check if browser supports camera API
      const hasMediaDevices = !!(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      );
      let hasCanvas = false;

      // Check if we can create canvas elements
      try {
        const testCanvas = document.createElement("canvas");
        const testContext = testCanvas.getContext("2d");
        hasCanvas = !!testContext;
      } catch (err) {
        console.error("Canvas creation error:", err);
      }

      // Set compatibility status
      setBrowserCompatible(hasMediaDevices && hasCanvas);

      if (!hasMediaDevices) {
        console.warn(`${browserName} doesn't support camera access`);
      }

      if (!hasCanvas) {
        console.warn(`${browserName} doesn't properly support canvas`);
      }

      // Special Safari warning
      if (browserName.includes("Safari") && !browserName.includes("Chrome")) {
        console.warn("Safari has additional camera access restrictions");
        if (
          window.location.protocol !== "https:" &&
          window.location.hostname !== "localhost"
        ) {
          console.warn("Safari requires HTTPS for camera access");
        }
      }
    }
  }, []);

  // Calculate grid layout classes based on selected layout
  const getGridClasses = () => {
    switch (selectedLayout.id) {
      case "single":
        return "grid-cols-1 grid-rows-1";
      case "column":
        return "grid-cols-1 grid-rows-3";
      case "row":
        return "grid-cols-3 grid-rows-1";
      case "grid":
        return "grid-cols-2 grid-rows-2";
      default:
        return "grid-cols-1 grid-rows-1";
    }
  };

  return (
    <div
      className="space-y-4 px-2 sm:px-4 font-sans"
      style={{
        fontFamily:
          'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
        fontStyle: "normal",
      }}
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-4">
        <div className="flex justify-center sm:justify-start gap-4 mb-2 sm:mb-0">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium mr-1" style={fontStyles}>
              Frame:
            </span>
            {FRAME_COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color.value)}
                className={`w-8 h-8 rounded-full border-2 ${
                  selectedColor === color.value
                    ? "border-black"
                    : "border-white"
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
                aria-label={`Select ${color.name} frame color`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          {LAYOUTS.map((layout) => (
            <Button
              key={layout.id}
              onClick={() => changeLayout(layout)}
              variant={selectedLayout.id === layout.id ? "default" : "outline"}
              size="sm"
              className="flex items-center justify-center gap-1"
              style={{
                backgroundColor:
                  selectedLayout.id === layout.id ? buttonColor : "transparent",
                borderColor: buttonOutlineColor,
                color:
                  selectedLayout.id === layout.id
                    ? buttonTextColor
                    : buttonOutlineColor,
                ...fontStyles,
              }}
            >
              <Layout className="w-4 h-4" />
              <span className="hidden sm:inline">{layout.name}</span>
              <span className="inline sm:hidden">
                {layout.id === "single"
                  ? "1"
                  : layout.id === "column"
                  ? "↓"
                  : layout.id === "row"
                  ? "→"
                  : "□"}
              </span>
            </Button>
          ))}
        </div>
      </div>

      <div className="relative">
        {isActive ? (
          <div className="relative">
            <div
              className="border-8 rounded-lg overflow-hidden"
              style={{ borderColor: selectedColor }}
            >
              {/* Add aspect ratio container for video */}
              <div className="mx-auto w-full max-w-md">
                <div className="aspect-[4/3] relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={true} /* Always muted for autoplay compatibility */
                    controls={isIOS()} /* Show controls on iOS for better interaction */
                    className="w-full h-full object-cover rounded"
                    style={{
                      display: "block",
                      transform: isIOS()
                        ? "scaleX(-1)"
                        : "none" /* Mirror for selfie view on iOS */,
                      WebkitTransform: isIOS()
                        ? "scaleX(-1)"
                        : "none" /* Safari specific */,
                    }}
                    onError={(e) => {
                      console.error("Video error:", e);
                      if (isSafari() || isIOS()) {
                        alert(
                          "Camera access was restricted. Please ensure you're using Safari, have granted camera permissions, and are on HTTPS."
                        );
                      } else {
                        alert(
                          "Failed to display camera stream. Please check your browser permissions."
                        );
                      }
                      stopCamera();
                    }}
                  />
                </div>
              </div>
              {/* Loading overlay during camera initialization */}
              {isLoadingCamera && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 border-4 border-t-4 border-white rounded-full animate-spin"></div>
                  <p className="text-white mt-4">Initializing camera...</p>
                </div>
              )}

              {/* Countdown overlay */}
              {isCountingDown && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span
                    className="text-white text-8xl font-bold"
                    style={fontStyles}
                  >
                    {countdown}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2 mt-4">
              <Button
                onClick={() => capturePhoto()}
                disabled={!isCameraReady || isCountingDown}
                className="flex items-center justify-center gap-2 pompompurin-button"
                style={{
                  backgroundColor: buttonColor,
                  color: buttonTextColor,
                  ...fontStyles,
                }}
              >
                <Camera className="w-5 h-5" />
                <span>Take Photo</span>
              </Button>

              <Button
                onClick={() => startCountdown(false)}
                disabled={!isCameraReady || isCountingDown}
                variant="outline"
                className="flex items-center justify-center gap-2"
                style={{
                  borderColor: buttonOutlineColor,
                  color: buttonOutlineColor,
                  ...fontStyles,
                }}
              >
                <Clock className="w-5 h-5" />
                <span>3s Timer</span>
              </Button>

              {selectedLayout.count > 1 && (
                <Button
                  onClick={() => startCountdown(true)}
                  disabled={!isCameraReady || isCountingDown}
                  variant="outline"
                  className="flex items-center justify-center gap-2 col-span-1 sm:col-span-1"
                  style={{
                    borderColor: buttonOutlineColor,
                    color: buttonOutlineColor,
                    ...fontStyles,
                  }}
                >
                  <Camera className="w-5 h-5" />
                  <span className="hidden sm:inline">
                    {selectedLayout.count} Photos Timer
                  </span>
                  <span className="inline sm:hidden">Multi</span>
                </Button>
              )}

              <Button
                onClick={stopCamera}
                variant="outline"
                className="col-span-1 sm:col-span-1 lg:ml-auto"
                style={{
                  borderColor: buttonOutlineColor,
                  color: buttonOutlineColor,
                  ...fontStyles,
                }}
              >
                Close Camera
              </Button>
            </div>
          </div>
        ) : (
          <Card className="border-2" style={{ borderColor: selectedColor }}>
            <CardContent className="p-4 sm:p-6 flex justify-center items-center flex-col gap-4 min-h-[250px] sm:min-h-[300px]">
              {photos.length > 0 ? (
                <div className="text-center w-full" style={fontStyles}>
                  <h3 className="font-medium mb-4">Your photos are ready!</h3>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button
                      onClick={startCamera}
                      className="pompompurin-button w-full sm:w-auto"
                      style={{
                        backgroundColor: buttonColor,
                        color: buttonTextColor,
                        ...fontStyles,
                      }}
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Take More Photos
                    </Button>
                    <Button
                      onClick={resetPhotos}
                      variant="outline"
                      className="w-full sm:w-auto"
                      style={{
                        borderColor: buttonOutlineColor,
                        color: buttonOutlineColor,
                        ...fontStyles,
                      }}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Clear Photos
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-full text-center">
                    <Button
                      onClick={() => {
                        console.log("Camera button clicked");
                        startCamera();
                      }}
                      size="lg"
                      className="flex items-center justify-center gap-2 mb-4 pompompurin-button w-full sm:w-auto"
                      style={{
                        backgroundColor: buttonColor,
                        color: buttonTextColor,
                        ...fontStyles,
                      }}
                      disabled={isLoadingCamera}
                    >
                      <Camera className="w-6 h-6" />
                      {isLoadingCamera
                        ? "Initializing Camera..."
                        : "Open Camera"}
                    </Button>

                    <p className="text-center text-sm mt-2" style={fontStyles}>
                      Your browser may ask for permission to access your camera.
                      <br className="hidden sm:block" />
                      Please click "Allow" when prompted.
                    </p>

                    {/* Browser-specific information */}
                    {(isSafari() || isIOS()) && (
                      <div
                        className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded text-left text-xs"
                        style={fontStyles}
                      >
                        <p className="font-medium">
                          {isIOS()
                            ? "Note for iOS users:"
                            : "Note for Safari users:"}
                        </p>
                        {isIOS() ? (
                          <ul className="list-disc pl-4 mt-1 space-y-1">
                            <li>iOS has strict camera permissions</li>
                            <li>
                              Make sure to use Safari browser (not Chrome or
                              Firefox on iOS)
                            </li>
                            <li>
                              Enable camera access in Settings → Privacy →
                              Camera
                            </li>
                            <li>
                              If camera fails, try reloading or rotating your
                              device
                            </li>
                            <li>
                              Tap the video area if it doesn't start
                              automatically
                            </li>
                            <li>
                              Photos will open in a new tab for saving (long
                              press to save)
                            </li>
                          </ul>
                        ) : (
                          <ul className="list-disc pl-4 mt-1 space-y-1">
                            <li>Camera access may be restricted in Safari</li>
                            <li>
                              You may need to enable camera access in Safari
                              settings
                            </li>
                            <li>
                              Using Chrome or Firefox may provide a better
                              experience
                            </li>
                          </ul>
                        )}
                      </div>
                    )}

                    {/* Show when browser is definitely incompatible */}
                    {browserCompatible === false && (
                      <div
                        className="mt-4 p-3 bg-red-50 border border-red-300 rounded text-left"
                        style={fontStyles}
                      >
                        <p className="font-medium text-red-700">
                          Your browser ({browserInfo}) doesn't support camera
                          access
                        </p>
                        <p className="mt-1 text-sm">
                          Please try using a different browser like Chrome or
                          Firefox.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Canvas used for capturing and processing photos */}
      <canvas ref={canvasRef} className="hidden">
        Your browser does not support the canvas element. Please try a different
        browser.
      </canvas>

      {/* Photo gallery */}
      {photos.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
            <h3 className="font-medium text-lg" style={fontStyles}>
              Your Photos
            </h3>

            <Button
              onClick={resetPhotos}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 w-full sm:w-auto"
              style={{
                borderColor: buttonOutlineColor,
                color: buttonOutlineColor,
                ...fontStyles,
              }}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Clear All Photos
            </Button>
          </div>

          <div className={`grid ${getGridClasses()} gap-2 sm:gap-4`}>
            {photos.map(
              (photo, i) =>
                photo && (
                  <div
                    key={i}
                    className="border-4 rounded-lg overflow-hidden relative group aspect-[4/3]"
                    style={{ borderColor: selectedColor }}
                  >
                    <img
                      src={photo}
                      alt={`Captured photo ${i + 1}`}
                      className="w-full h-full object-contain"
                    />
                    {/* Individual photo delete button - visible on mobile, hover on desktop */}
                    <button
                      onClick={() => {
                        const newPhotos = [...photos];
                        newPhotos[i] = "";
                        setPhotos(newPhotos.filter((p) => p !== ""));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 
                        opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      title="Delete this photo"
                      aria-label="Delete photo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )
            )}
          </div>

          <div className="flex justify-center mt-4">
            <Button
              onClick={downloadPhoto}
              className="flex items-center justify-center gap-2 pompompurin-button w-full sm:w-auto"
              style={{
                backgroundColor: buttonColor,
                color: buttonTextColor,
                ...fontStyles,
              }}
            >
              <Download className="w-5 h-5" />
              Download Photo{selectedLayout.count > 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
