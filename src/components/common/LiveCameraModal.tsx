import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, SwitchCamera, X, Check, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { compressDataUrl } from '../../utils/imageCompressor';

interface LiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (compressedDataUrl: string) => void;
  title?: string;
  guideType?: 'body_front' | 'body_back' | 'body_side' | 'face' | 'none';
}

export const LiveCameraModal: React.FC<LiveCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'लाइव कैमरा फोटो (Live Camera Photo)',
  guideType = 'none',
}) => {
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fallbackInputRef = useRef<HTMLInputElement>(null);

  // Stop camera stream safely
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Start camera stream
  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    stopStream();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('आपके ब्राउज़र में डायरेक्ट कैमरा सपोर्ट उपलब्ध नहीं है। कृपया नीचे दिए गए बटन से मोबाइल कैमरा खोलें।');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err: unknown) {
      console.warn('getUserMedia error:', err);
      // If environment camera fails, try user camera
      if (facing === 'environment') {
        try {
          const mediaStreamFallback = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          setStream(mediaStreamFallback);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStreamFallback;
            await videoRef.current.play();
          }
          return;
        } catch {
          // Both failed
        }
      }

      setCameraError(
        'कैमरा शुरू नहीं हो सका (अनुमति नहीं मिली या कैमरा व्यस्त है)। कृपया नीचे दिए गए "मोबाइल कैमरा से फोटो लें" बटन का उपयोग करें।'
      );
    }
  }, [stopStream]);

  // Initialize camera when modal opens
  useEffect(() => {
    if (isOpen) {
      setCapturedPhoto(null);
      startCamera(facingMode);
    } else {
      stopStream();
      setCapturedPhoto(null);
    }

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, startCamera, stopStream]);

  if (!isOpen) return null;

  // Toggle between back and front camera
  const handleToggleFacing = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
  };

  // Capture frame from video
  const handleTakePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(rawDataUrl);
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedPhoto(null);
    if (!stream) {
      startCamera(facingMode);
    }
  };

  // Accept and use captured photo (with compression)
  const handleAcceptPhoto = async () => {
    if (!capturedPhoto) return;
    setIsProcessing(true);
    try {
      const compressed = await compressDataUrl(capturedPhoto, {
        maxWidth: 960,
        maxHeight: 960,
        quality: 0.75,
      });
      onCapture(compressed);
      stopStream();
      onClose();
    } catch (err) {
      console.warn('Compression failed, using uncompressed:', err);
      onCapture(capturedPhoto);
      stopStream();
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  // Fallback native mobile camera capture via input
  const handleFallbackChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const raw = ev.target?.result as string;
        if (raw) {
          const compressed = await compressDataUrl(raw, {
            maxWidth: 960,
            maxHeight: 960,
            quality: 0.75,
          });
          onCapture(compressed);
          stopStream();
          onClose();
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Fallback camera error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-cyan-400" />
            <span className="text-xs sm:text-sm font-bold text-white tracking-wide">{title}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview Area */}
        <div className="relative w-full bg-black aspect-[3/4] max-h-[58vh] flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center space-y-4 max-w-sm">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-xs text-amber-200 leading-relaxed">{cameraError}</p>

              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fallbackInputRef}
                onChange={handleFallbackChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fallbackInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>मोबाइल कैमरा खोलें (Take Photo)</span>
              </button>
            </div>
          ) : capturedPhoto ? (
            /* Frozen preview of captured photo */
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={capturedPhoto}
                alt="Captured Preview"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                फोटो तैयार
              </div>
            </div>
          ) : (
            /* Live Video Feed */
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Guide Overlay for Body Tracking */}
              {guideType !== 'none' && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                  <div className="w-3/4 h-5/6 border-2 border-dashed border-cyan-400/50 rounded-2xl flex flex-col items-center justify-between p-3">
                    <span className="text-[10px] font-bold bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40">
                      {guideType === 'body_front' && 'सामने सीधे खड़े रहें (Front Pose)'}
                      {guideType === 'body_back' && 'पीठ व लैट्स दिखाएं (Back Pose)'}
                      {guideType === 'body_side' && 'साइड प्रोफाइल सीधा रखें (Side Pose)'}
                      {guideType === 'face' && 'चेहरा फ्रेम के बीच में रखें'}
                    </span>
                    <span className="text-[9px] text-cyan-300/80 bg-black/50 px-2 py-0.5 rounded">
                      पूरा शरीर फ्रेम के अंदर रखें
                    </span>
                  </div>
                </div>
              )}

              {/* Switch Camera Button (Front / Back) */}
              <button
                type="button"
                onClick={handleToggleFacing}
                title="कैमरा बदलें (Switch Camera)"
                className="absolute top-3 right-3 p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md text-white border border-slate-700/80 transition-all cursor-pointer shadow-md active:rotate-180"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between gap-3">
          {capturedPhoto ? (
            /* Retake / Accept controls */
            <>
              <button
                type="button"
                onClick={handleRetake}
                disabled={isProcessing}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>दोबारा लें (Retake)</span>
              </button>

              <button
                type="button"
                onClick={handleAcceptPhoto}
                disabled={isProcessing}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
              >
                {isProcessing ? (
                  <span>प्रोसेस हो रहा है...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>उपयोग करें (Use Photo)</span>
                  </>
                )}
              </button>
            </>
          ) : (
            /* Capture shutter controls */
            <div className="w-full flex items-center justify-between">
              {/* Native mobile camera fallback button */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fallbackInputRef}
                  onChange={handleFallbackChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fallbackInputRef.current?.click()}
                  className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  फोन कैमरा ऐप
                </button>
              </div>

              {/* Shutter Button */}
              <button
                type="button"
                onClick={handleTakePhoto}
                disabled={!!cameraError}
                className="w-14 h-14 rounded-full border-4 border-white bg-red-600 hover:bg-red-500 active:scale-90 transition-all shadow-xl flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mx-auto"
                title="फोटो खींचें"
              >
                <div className="w-10 h-10 rounded-full bg-white/20" />
              </button>

              <button
                type="button"
                onClick={() => {
                  stopStream();
                  onClose();
                }}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                रद्द करें
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
