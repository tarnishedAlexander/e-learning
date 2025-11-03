import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Video,
  Square,
  Camera,
  Mic,
  Monitor,
  Upload,
  Download,
} from "lucide-react";
import { toast } from "sonner";

interface VideoRecorderProps {
  onVideoRecorded: (videoBlob: Blob, fileName: string) => void;
  maxDuration?: number; // in seconds, default 5 minutes = 300 seconds
}

export function VideoRecorder({
  onVideoRecorded,
  maxDuration = 300,
}: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const [captureScreen, setCaptureScreen] = useState(true);
  const [captureCamera, setCaptureCamera] = useState(true);
  const [captureMicrophone, setCaptureMicrophone] = useState(true);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopRecording();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      setError(null);
      chunksRef.current = [];

      let mediaStream: MediaStream | null = null;
      const constraints: MediaStreamConstraints = {
        video: false,
        audio: false,
      };

      // Capture screen if enabled
      if (captureScreen) {
        try {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: captureMicrophone,
          });
          if (mediaStream) {
            screenStream.getVideoTracks().forEach((track) => {
              mediaStream!.addTrack(track);
            });
            if (captureMicrophone && screenStream.getAudioTracks().length > 0) {
              screenStream.getAudioTracks().forEach((track) => {
                mediaStream!.addTrack(track);
              });
            }
          } else {
            mediaStream = screenStream;
          }
        } catch (err) {
          console.error("Error accessing screen:", err);
          toast.error("Could not access screen. Please grant permission.");
        }
      }

      // Capture camera if enabled
      if (captureCamera) {
        try {
          const cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: captureMicrophone && !captureScreen, // Only if screen audio wasn't captured
          });

          if (mediaStream) {
            // Combine streams
            cameraStream.getVideoTracks().forEach((track) => {
              mediaStream!.addTrack(track);
            });
            if (captureMicrophone && cameraStream.getAudioTracks().length > 0) {
              cameraStream.getAudioTracks().forEach((track) => {
                mediaStream!.addTrack(track);
              });
            }
          } else {
            mediaStream = cameraStream;
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          if (!captureScreen) {
            toast.error("Could not access camera. Please grant permission.");
            return;
          }
        }
      }

      // Capture microphone only if not already captured
      if (captureMicrophone && !captureScreen && !captureCamera) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          if (mediaStream) {
            audioStream.getAudioTracks().forEach((track) => {
              mediaStream!.addTrack(track);
            });
          } else {
            mediaStream = audioStream;
          }
        } catch (err) {
          console.error("Error accessing microphone:", err);
          toast.error("Could not access microphone. Please grant permission.");
          return;
        }
      }

      if (!mediaStream) {
        toast.error(
          "Please enable at least one capture option (Screen, Camera, or Microphone)"
        );
        return;
      }

      streamRef.current = mediaStream;
      setStream(mediaStream);

      // Set video stream to preview
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: "video/webm;codecs=vp9,opus",
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setVideoBlob(blob);
        setRecordedVideo(url);
        setStream(null);
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
            toast.info(
              `Maximum recording duration reached (${formatTime(maxDuration)})`
            );
          }
          return newTime;
        });
      }, 1000);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Failed to start recording. Please check permissions.");
      toast.error("Failed to start recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  };

  const handleSave = () => {
    if (videoBlob) {
      const fileName = `recording-${Date.now()}.webm`;
      onVideoRecorded(videoBlob, fileName);
      toast.success("Video saved locally!");
    }
  };

  const handleDiscard = () => {
    setRecordedVideo(null);
    setVideoBlob(null);
    setRecordingTime(0);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleDownload = () => {
    if (videoBlob) {
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Video downloaded!");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Record Video Lesson
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Capture Options */}
        {!isRecording && !recordedVideo && (
          <div className="space-y-3 p-4 border rounded-lg">
            <p className="text-sm font-medium">Capture Options:</p>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant={captureScreen ? "default" : "outline"}
                size="sm"
                onClick={() => setCaptureScreen(!captureScreen)}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Screen
              </Button>
              <Button
                type="button"
                variant={captureCamera ? "default" : "outline"}
                size="sm"
                onClick={() => setCaptureCamera(!captureCamera)}
              >
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </Button>
              <Button
                type="button"
                variant={captureMicrophone ? "default" : "outline"}
                size="sm"
                onClick={() => setCaptureMicrophone(!captureMicrophone)}
              >
                <Mic className="h-4 w-4 mr-2" />
                Microphone
              </Button>
            </div>
          </div>
        )}

        {/* Video Preview */}
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
          {recordedVideo ? (
            <video
              src={recordedVideo}
              controls
              className="w-full h-full object-contain"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-contain"
            />
          )}
          {isRecording && (
            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="font-mono">{formatTime(recordingTime)}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {isRecording && (
          <div className="space-y-2">
            <Progress value={(recordingTime / maxDuration) * 100} />
            <p className="text-sm text-muted-foreground text-center">
              {formatTime(recordingTime)} / {formatTime(maxDuration)}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2 justify-center">
          {!isRecording && !recordedVideo && (
            <Button onClick={startRecording} size="lg" className="gap-2">
              <Video className="h-4 w-4" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <Button
              onClick={stopRecording}
              size="lg"
              variant="destructive"
              className="gap-2"
            >
              <Square className="h-4 w-4" />
              Stop Recording
            </Button>
          )}

          {recordedVideo && (
            <>
              <Button
                onClick={handleDiscard}
                variant="outline"
                className="gap-2"
              >
                Discard
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Upload className="h-4 w-4" />
                Save & Continue
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
