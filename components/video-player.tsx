"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Subtitles,
  X,
  ChevronLeft,
  Loader2,
} from "lucide-react";

interface Caption {
  id: string;
  lan: string;
  lanName: string;
  url: string;
}

interface VideoSource {
  resolution: number;
  streamUrl: string;
}

interface VideoPlayerProps {
  sources: VideoSource[];
  captions: Caption[];
  title: string;
  poster?: string;
  onBack?: () => void;
}

export function VideoPlayer({
  sources,
  captions,
  title,
  poster,
  onBack,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState(
    sources.length > 0 ? sources[sources.length - 1].resolution : 720
  );
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null);
  const [buffered, setBuffered] = useState(0);

  const currentSource =
    sources.find((s) => s.resolution === selectedResolution) || sources[0];

  const formatTime = (time: number): string => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !videoRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = percent * duration;
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += seconds;
  };

  const handleResolutionChange = (resolution: number) => {
    const currentTimeBeforeChange = videoRef.current?.currentTime || 0;
    setSelectedResolution(resolution);
    setShowSettings(false);
    
    // Resume from current time after source change
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentTimeBeforeChange;
        if (isPlaying) videoRef.current.play();
      }
    }, 100);
  };

  const handleCaptionChange = (captionLan: string | null) => {
    setSelectedCaption(captionLan);
    setShowCaptions(false);
  };

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleLoadedData = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("progress", handleProgress);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("progress", handleProgress);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.min(1, volume + 0.1);
            videoRef.current.volume = newVol;
            setVolume(newVol);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.max(0, volume - 0.1);
            videoRef.current.volume = newVol;
            setVolume(newVol);
          }
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
      }
      showControlsTemporarily();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, volume, showControlsTemporarily]);

  const selectedCaptionUrl = selectedCaption
    ? captions.find((c) => c.lan === selectedCaption)?.url
    : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black group"
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full"
        src={currentSource?.streamUrl}
        poster={poster}
        onClick={togglePlay}
        crossOrigin="anonymous"
      >
        {selectedCaptionUrl && (
          <track
            kind="subtitles"
            src={selectedCaptionUrl}
            srcLang={selectedCaption || "en"}
            default
          />
        )}
      </video>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Top Bar */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-b from-black/80 to-transparent">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}
          <h2 className="text-white font-semibold text-lg truncate">{title}</h2>
        </div>

        {/* Center Play Button */}
        <div className="flex-1 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="p-4 rounded-full bg-primary/80 hover:bg-primary transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="p-4 bg-gradient-to-t from-black/80 to-transparent space-y-2">
          {/* Progress Bar */}
          <div
            ref={progressRef}
            className="h-1.5 bg-white/30 rounded-full cursor-pointer group/progress"
            onClick={handleProgressClick}
          >
            {/* Buffered Progress */}
            <div
              className="absolute h-1.5 bg-white/50 rounded-full"
              style={{ width: `${(buffered / duration) * 100}%` }}
            />
            {/* Current Progress */}
            <div
              className="relative h-1.5 bg-primary rounded-full group-hover/progress:h-2 transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white" />
                )}
              </button>

              {/* Skip Backward */}
              <button
                onClick={() => skip(-10)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <SkipBack className="w-5 h-5 text-white" />
              </button>

              {/* Skip Forward */}
              <button
                onClick={() => skip(10)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <SkipForward className="w-5 h-5 text-white" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1 group/volume">
                <button
                  onClick={toggleMute}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-0 group-hover/volume:w-20 transition-all duration-200 accent-primary"
                />
              </div>

              {/* Time Display */}
              <span className="text-white text-sm ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Captions */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowCaptions(!showCaptions);
                    setShowSettings(false);
                  }}
                  className={`p-2 hover:bg-white/20 rounded-full transition-colors ${
                    selectedCaption ? "text-primary" : "text-white"
                  }`}
                >
                  <Subtitles className="w-5 h-5" />
                </button>

                {showCaptions && (
                  <div className="absolute bottom-full right-0 mb-2 bg-background/95 backdrop-blur rounded-lg p-2 min-w-[160px] max-h-[200px] overflow-y-auto">
                    <button
                      onClick={() => handleCaptionChange(null)}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-secondary text-sm ${
                        !selectedCaption ? "text-primary" : "text-foreground"
                      }`}
                    >
                      Off
                    </button>
                    {captions.map((caption) => (
                      <button
                        key={caption.id}
                        onClick={() => handleCaptionChange(caption.lan)}
                        className={`w-full text-left px-3 py-2 rounded hover:bg-secondary text-sm ${
                          selectedCaption === caption.lan
                            ? "text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {caption.lanName}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Settings (Resolution) */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSettings(!showSettings);
                    setShowCaptions(false);
                  }}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <Settings className="w-5 h-5 text-white" />
                </button>

                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-background/95 backdrop-blur rounded-lg p-2 min-w-[120px]">
                    <p className="text-muted-foreground text-xs px-3 py-1 uppercase">
                      Quality
                    </p>
                    {sources.map((source) => (
                      <button
                        key={source.resolution}
                        onClick={() => handleResolutionChange(source.resolution)}
                        className={`w-full text-left px-3 py-2 rounded hover:bg-secondary text-sm ${
                          selectedResolution === source.resolution
                            ? "text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {source.resolution}p
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5 text-white" />
                ) : (
                  <Maximize className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
