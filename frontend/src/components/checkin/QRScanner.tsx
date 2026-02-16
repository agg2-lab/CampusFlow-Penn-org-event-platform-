"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Loader2 } from "lucide-react";

interface QRScannerProps {
  onScan: (data: string) => void;
  scanning: boolean;
}

export function QRScanner({ onScan, scanning }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState("");
  const scannerRef = useRef<any>(null);

  const startCamera = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 640, height: 480 },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        startScanning();
      }
    } catch (err) {
      setError("Camera access denied. Please allow camera permissions.");
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    if (scannerRef.current) {
      clearInterval(scannerRef.current);
      scannerRef.current = null;
    }
  };

  const startScanning = () => {
    if (scannerRef.current) return;

    scannerRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Use the BarcodeDetector API if available
      if ("BarcodeDetector" in window) {
        const detector = new (window as any).BarcodeDetector({
          formats: ["qr_code"],
        });
        detector
          .detect(canvas)
          .then((barcodes: any[]) => {
            if (barcodes.length > 0 && barcodes[0].rawValue) {
              onScan(barcodes[0].rawValue);
            }
          })
          .catch(() => {});
      }
    }, 500);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50">
        {cameraActive ? (
          <>
            <video
              ref={videoRef}
              className="h-80 w-full object-cover"
              playsInline
              muted
            />
            {/* Scanning overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 rounded-2xl border-4 border-white/60 shadow-lg">
                {scanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-80 flex-col items-center justify-center gap-3">
            <Camera className="h-12 w-12 text-gray-300" />
            <p className="text-sm text-gray-500">Camera preview will appear here</p>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        {!cameraActive ? (
          <button onClick={startCamera} className="btn-primary flex-1">
            <Camera className="h-4 w-4" />
            Start Camera
          </button>
        ) : (
          <button onClick={stopCamera} className="btn-danger flex-1">
            <CameraOff className="h-4 w-4" />
            Stop Camera
          </button>
        )}
      </div>

      <p className="text-center text-xs text-gray-400">
        Position the QR code within the frame to scan automatically.
        Uses the BarcodeDetector API for scanning.
      </p>
    </div>
  );
}
