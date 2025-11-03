import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface VideoPlayerProps {
  title: string;
  videoUrl?: string;
  s3Key?: string;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
}

export const VideoPlayer = ({
  title,
  videoUrl,
  s3Key,
  onComplete,
  onProgress,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (video.duration) {
        const currentProgress = (video.currentTime / video.duration) * 100;
        setProgress(currentProgress);
        if (onProgress) {
          onProgress(currentProgress);
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      updateProgress();
      // Auto-complete at 90%
      if (
        video.duration &&
        video.currentTime / video.duration >= 0.9 &&
        onComplete
      ) {
        onComplete();
      }
    };

    const handleError = (e: Event) => {
      const video = e.target as HTMLVideoElement;
      let errorMsg = "Failed to load video";

      if (video.error) {
        switch (video.error.code) {
          case video.error.MEDIA_ERR_ABORTED:
            errorMsg = "Video loading aborted";
            break;
          case video.error.MEDIA_ERR_NETWORK:
            errorMsg = "Network error - check if URL is accessible and CORS is configured";
            break;
          case video.error.MEDIA_ERR_DECODE:
            errorMsg = "Video decoding error - file may be corrupted";
            break;
          case video.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMsg = "Video format not supported";
            break;
          default:
            errorMsg = `Video error: ${video.error.message || "Unknown error"}`;
        }
      }

      console.error("Video error details:", {
        errorCode: video.error?.code,
        errorMsg: video.error?.message,
        videoUrl: videoUrl,
        networkState: video.networkState,
        readyState: video.readyState
      });
      setError(errorMsg);
      setIsLoading(false);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("error", handleError);
    };
  }, [videoUrl, s3Key, onComplete, onProgress]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    const newTime = (value[0] / 100) * duration;
    video.currentTime = newTime;
    setProgress(value[0]);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentTime = videoRef.current?.currentTime || 0;

  return (
    <div className="w-full space-y-4">
      <div className="aspect-video w-full bg-black rounded-lg overflow-hidden relative group">
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              playsInline
              crossOrigin="anonymous"
              controls={false}
              onLoadStart={() => {
                setIsLoading(true);
                setError(null);
              }}
            />
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                <Loader2 className="h-8 w-8 animate-spin text-white mb-2" />
                <p className="text-white text-sm">Loading video...</p>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-4">
                <p className="text-white text-center mb-2">{error}</p>
                <p className="text-white/70 text-xs text-center">
                  Please check your AWS credentials and S3 bucket configuration
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
              <p className="text-muted-foreground">Loading video...</p>
            </div>
          </div>
        )}

        {/* Controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white text-xs">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
            <Slider
              value={[progress]}
              onValueChange={handleProgressChange}
              max={100}
              step={0.1}
              className="cursor-pointer"
            />
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
                disabled={!videoUrl}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
                disabled={!videoUrl}
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              <div className="flex-1" />
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => videoRef.current?.requestFullscreen()}
                disabled={!videoUrl}
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{title}</h3>
        {onComplete && (
          <Button onClick={onComplete} variant="outline" size="sm">
            Mark as Complete
          </Button>
        )}
      </div>
    </div>
  );
};
