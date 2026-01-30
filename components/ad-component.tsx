import { useState, useEffect, useRef, type CSSProperties } from "react";
import {
  X,
  ExternalLink,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Image as ImageIcon,
  PictureInPicture,
  Settings,
  SkipForward,
  SkipBack,
} from "lucide-react";
import DOMPurify from "dompurify";
import { API_URL } from "@/api/axios";

interface AdData {
  id: number;
  title: string;
  slug: string;
  ad_type: "image" | "video" | "html";
  image?: string;
  image_alt?: string;
  video_url?: string;
  video_thumbnail?: string;
  html_content?: string;
  link_url: string;
  cta_text?: string;
  open_in_new_tab: boolean;
  placement: string;
  placement_display: string;
}

interface AdComponentProps {
  placement: string;
  postSlug?: string;
  className?: string;
  showLabel?: boolean;
  labelText?: string;

  // Display options
  showCloseButton?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;

  // Styling options
  borderStyle?: "solid" | "dashed" | "dotted" | "none";
  borderColor?: string;
  borderRadius?: string;
  backgroundColor?: string;
  padding?: string;

  // Image options
  imageHeight?: string;
  imageFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  lazyLoad?: boolean;

  // Placeholder options
  placeholderMinHeight?: string;
  showPlaceholderIcon?: boolean;
  customPlaceholder?: React.ReactNode;

  // Video options
  autoPlayVideo?: boolean;
  muteVideo?: boolean;
  loopVideo?: boolean;
  showVideoControls?: boolean;
  enablePictureInPicture?: boolean;
  enableFullscreen?: boolean;
  showPlaybackSpeed?: boolean;
  skipSeconds?: number;

  // Intersection observer options
  impressionThreshold?: number;
  rootMargin?: string;

  // Callbacks
  onAdLoad?: (ad: AdData) => void;
  onAdClick?: (ad: AdData) => void;
  onAdClose?: (ad: AdData) => void;
  onAdImpression?: (ad: AdData) => void;
  onAdError?: (error: string) => void;

  // API options
  apiBaseUrl?: string;
  enableTracking?: boolean;
  maxRetries?: number;
}

export const AdComponent = ({
  placement,
  postSlug,
  className = "",
  showLabel = true,
  labelText = "Advertisement",

  // Display options
  showCloseButton = true,
  autoRefresh = false,
  refreshInterval = 30000,

  // Styling options
  borderStyle = "solid",
  borderColor = "border-neutral-200",
  borderRadius = "",
  backgroundColor = "",
  padding = "",

  // Image options
  imageHeight = "auto",
  imageFit = "cover",
  lazyLoad = true,

  // Placeholder options
  placeholderMinHeight = "200px",
  showPlaceholderIcon = true,
  customPlaceholder,

  // Video options
  autoPlayVideo = false,
  muteVideo = false,
  loopVideo = false,
  showVideoControls = true,
  enablePictureInPicture = true,
  enableFullscreen = true,
  showPlaybackSpeed = true,
  skipSeconds = 10,

  // Intersection observer options
  impressionThreshold = 0.5,
  rootMargin = "0px",

  // Callbacks
  onAdLoad,
  onAdClick,
  onAdClose,
  onAdImpression,
  onAdError,

  // API options
  enableTracking = true,
  maxRetries = 3,
}: AdComponentProps) => {
  const [ad, setAd] = useState<AdData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muteVideo);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageBlob, setImageBlob] = useState<string | null>(null);
  const [thumbnailBlob, setThumbnailBlob] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const adRef = useRef<HTMLDivElement>(null);
  const impressionRecorded = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Load ad on mount and when dependencies change
  useEffect(() => {
    loadAd();

    if (autoRefresh && refreshInterval > 0) {
      refreshTimerRef.current = setInterval(() => {
        loadAd();
      }, refreshInterval);
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [placement, postSlug, autoRefresh, refreshInterval]);

  // Load image as blob
  useEffect(() => {
    if (ad?.image && !imageBlob && ad.ad_type === "image") {
      loadImageAsBlob(ad.image, setImageBlob);
    }
  }, [ad]);

  // Load video thumbnail and video as blob
  useEffect(() => {
    if (ad?.ad_type === "video") {
      if (ad.video_thumbnail && !thumbnailBlob) {
        loadImageAsBlob(ad.video_thumbnail, setThumbnailBlob);
      }
      if (ad.image && !imageBlob) {
        loadImageAsBlob(ad.image, setImageBlob);
      }
    }
  }, [ad]);

  const loadImageAsBlob = async (
    url: string,
    setBlobFn: (blob: string) => void
  ) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load image: ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setBlobFn(blobUrl);
    } catch (error) {
      console.error("Failed to load image as blob:", error);
      setImageError(true);
    }
  };

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (imageBlob) URL.revokeObjectURL(imageBlob);
      if (thumbnailBlob) URL.revokeObjectURL(thumbnailBlob);
    };
  }, [imageBlob, thumbnailBlob]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video || ad?.ad_type !== "video") return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handleEnded = () => {
      setIsPlaying(false);
      if (!loopVideo) {
        setIsVideoPlaying(false);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("ended", handleEnded);
    };
  }, [ad, loopVideo]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (!isVideoPlaying || !showVideoControls) return;

    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    resetControlsTimeout();

    const container = videoContainerRef.current;
    if (container) {
      container.addEventListener("mousemove", resetControlsTimeout);
      container.addEventListener("touchstart", resetControlsTimeout);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (container) {
        container.removeEventListener("mousemove", resetControlsTimeout);
        container.removeEventListener("touchstart", resetControlsTimeout);
      }
    };
  }, [isVideoPlaying, isPlaying, showVideoControls]);

  // Intersection observer for impression tracking
  useEffect(() => {
    if (ad && adRef.current && !impressionRecorded.current && enableTracking) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !impressionRecorded.current) {
              recordImpression();
              impressionRecorded.current = true;
              onAdImpression?.(ad);
            }
          });
        },
        { threshold: impressionThreshold, rootMargin }
      );

      observer.observe(adRef.current);
      return () => observer.disconnect();
    }
  }, [ad, enableTracking, impressionThreshold, rootMargin]);

  const loadAd = async () => {
    try {
      setError(null);
      setLoading(true);
      impressionRecorded.current = false;

      const params = new URLSearchParams({
        placement,
        ...(postSlug && { post_slug: postSlug }),
      });

      const apiUrl = `${API_URL}/api/ads/?${params}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("API returned non-JSON response");
      }

      const data = await response.json();
      const results = Array.isArray(data) ? data : data.results;

      if (results && results.length > 0) {
        const loadedAd = results[0];
        setAd(loadedAd);
        onAdLoad?.(loadedAd);
        setRetryCount(0);
      } else {
        setAd(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Failed to load ad:", errorMessage);
      setError(errorMessage);
      onAdError?.(errorMessage);

      if (retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount(retryCount + 1);
          loadAd();
        }, 1000 * (retryCount + 1));
      }
    } finally {
      setLoading(false);
    }
  };

  const recordImpression = async () => {
    if (!ad || !enableTracking) return;

    try {
      await fetch(`${API_URL}/api/ads/${ad.slug}/impression/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_slug: postSlug || "" }),
      });
    } catch (err) {
      console.error("Failed to record impression:", err);
    }
  };

  const handleClick = async () => {
    if (!ad) return;

    if (enableTracking) {
      try {
        await fetch(`${API_URL}/api/ads/${ad.slug}/click/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post_slug: postSlug || "" }),
        });
      } catch (err) {
        console.error("Failed to record click:", err);
      }
    }

    onAdClick?.(ad);
  };

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play();
      }
    }, 100);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
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
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(duration, currentTime + seconds)
      );
    }
  };

  const toggleFullscreen = async () => {
    if (!videoContainerRef.current || !enableFullscreen) return;

    try {
      if (!document.fullscreenElement) {
        await videoContainerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  const togglePictureInPicture = async () => {
    if (!videoRef.current || !enablePictureInPicture) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error("Picture-in-Picture error:", err);
    }
  };

  const changePlaybackSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    if (ad) {
      onAdClose?.(ad);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Don't render anything if loading, error, no ad, or hidden
  if (loading || error || !ad || !isVisible) {
    return null;
  }

  // Build container style
  const containerStyle: CSSProperties = {
    ...(backgroundColor && { backgroundColor }),
    ...(padding && { padding }),
  };

  // Build border classes
  const borderClasses = [
    borderStyle !== "none" && "border",
    borderStyle === "dashed" && "border-dashed",
    borderStyle === "dotted" && "border-dotted",
    borderColor,
    borderRadius,
  ]
    .filter(Boolean)
    .join(" ");

  // Render placeholder
  const renderPlaceholder = () => {
    if (customPlaceholder) {
      return customPlaceholder;
    }

    return (
      <div
        className="bg-linear-to-br from-neutral-100 to-neutral-200 p-8 flex flex-col items-center justify-center text-center"
        style={{ minHeight: placeholderMinHeight }}
      >
        {showPlaceholderIcon && (
          <ImageIcon className="h-12 w-12 text-neutral-400 mb-4" />
        )}
        <h3 className="text-lg font-light text-neutral-700 mb-2">{ad.title}</h3>
        {ad.image_alt && (
          <p className="text-sm text-neutral-500 font-light">{ad.image_alt}</p>
        )}
      </div>
    );
  };

  // Render loading spinner
  const renderLoading = () => (
    <div
      className="bg-linear-to-brrom-neutral-100 to-neutral-200 flex items-center justify-center"
      style={{ minHeight: placeholderMinHeight }}
    >
      <div className="w-8 h-8 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // Image Ad
  if (ad.ad_type === "image") {
    return (
      <div
        ref={adRef}
        className={`relative group ${className}`}
        style={containerStyle}
      >
        {showLabel && (
          <div className="text-xs text-neutral-400 uppercase tracking-wider mb-2 font-light">
            {labelText}
          </div>
        )}

        <a
          href={ad.link_url}
          target={ad.open_in_new_tab ? "_blank" : "_self"}
          rel={
            ad.open_in_new_tab ? "noopener noreferrer sponsored" : "sponsored"
          }
          onClick={handleClick}
          className={`block relative overflow-hidden hover:border-neutral-300 transition-all ${borderClasses}`}
        >
          {ad.image && !imageError && imageBlob ? (
            <img
              src={imageBlob}
              alt={ad.image_alt || ad.title}
              className={`w-full object-${imageFit}`}
              style={{ height: imageHeight }}
              loading={lazyLoad ? "lazy" : "eager"}
              onError={() => setImageError(true)}
            />
          ) : ad.image && !imageError && !imageBlob ? (
            renderLoading()
          ) : (
            renderPlaceholder()
          )}

          {ad.cta_text && (
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-light">{ad.cta_text}</span>
                <ExternalLink className="h-4 w-4 text-white" />
              </div>
            </div>
          )}

          {showCloseButton && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClose();
                }}
                className="w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center"
                aria-label="Close advertisement"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          )}
        </a>
      </div>
    );
  }

  // Video Ad with Custom Controls
  if (ad.ad_type === "video" && ad.video_url) {
    return (
      <div
        ref={adRef}
        className={`relative group ${className}`}
        style={containerStyle}
      >
        {showLabel && (
          <div className="text-xs text-neutral-400 uppercase tracking-wider mb-2 font-light">
            {labelText}
          </div>
        )}

        <div className={`relative overflow-hidden ${borderClasses}`}>
          {!isVideoPlaying ? (
            // Video Thumbnail with Play Button
            <div className="relative cursor-pointer" onClick={handleVideoPlay}>
              {thumbnailBlob || imageBlob ? (
                <img
                  src={thumbnailBlob || imageBlob || ""}
                  alt={ad.image_alt || ad.title}
                  className={`w-full object-${imageFit}`}
                  style={{ height: imageHeight }}
                  loading={lazyLoad ? "lazy" : "eager"}
                />
              ) : ad.video_thumbnail || ad.image ? (
                renderLoading()
              ) : (
                <div
                  className="bg-linear-to-br from-neutral-100 to-neutral-200 flex items-center justify-center"
                  style={{ minHeight: placeholderMinHeight }}
                >
                  <Play className="h-16 w-16 text-neutral-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                <div className="w-20 h-20 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all transform group-hover:scale-110">
                  <Play className="h-10 w-10 text-black ml-1" />
                </div>
              </div>
              {ad.cta_text && (
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4">
                  <span className="text-white font-light text-lg">
                    {ad.cta_text}
                  </span>
                </div>
              )}
            </div>
          ) : (
            // Video Player with Custom Controls
            <div
              ref={videoContainerRef}
              className="relative bg-black"
              onDoubleClick={toggleFullscreen}
            >
              <video
                ref={videoRef}
                src={ad.video_url}
                autoPlay={autoPlayVideo}
                muted={muteVideo}
                loop={loopVideo}
                className="w-full h-auto"
                playsInline
                onClick={togglePlay}
              />

              {/* Buffering Spinner */}
              {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}

              {/* Custom Video Controls */}
              {showVideoControls && (
                <div
                  className={`absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/70 to-transparent transition-opacity duration-300 ${
                    showControls ? "opacity-100" : "opacity-0"
                  }`}
                  onMouseEnter={() => setShowControls(true)}
                >
                  {/* Progress Bar */}
                  <div className="px-4 pt-6 pb-2">
                    <div
                      ref={progressRef}
                      className="relative h-1 bg-white/30 rounded-full cursor-pointer hover:h-1.5 transition-all group/progress"
                      onClick={handleProgressClick}
                    >
                      <div
                        className="absolute h-full bg-white rounded-full transition-all"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"
                        style={{
                          left: `${(currentTime / duration) * 100}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="px-4 pb-3 flex items-center justify-between gap-2">
                    {/* Left Controls */}
                    <div className="flex items-center gap-2">
                      {/* Play/Pause */}
                      <button
                        onClick={togglePlay}
                        className="text-white hover:scale-110 transition-transform"
                        aria-label={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? (
                          <Pause className="h-6 w-6" fill="white" />
                        ) : (
                          <Play className="h-6 w-6" fill="white" />
                        )}
                      </button>

                      {/* Skip Back */}
                      <button
                        onClick={() => skip(-skipSeconds)}
                        className="text-white hover:scale-110 transition-transform hidden sm:block"
                        aria-label={`Skip back ${skipSeconds} seconds`}
                      >
                        <SkipBack className="h-5 w-5" />
                      </button>

                      {/* Skip Forward */}
                      <button
                        onClick={() => skip(skipSeconds)}
                        className="text-white hover:scale-110 transition-transform hidden sm:block"
                        aria-label={`Skip forward ${skipSeconds} seconds`}
                      >
                        <SkipForward className="h-5 w-5" />
                      </button>

                      {/* Volume */}
                      <div className="flex items-center gap-2 group/volume">
                        <button
                          onClick={toggleMute}
                          className="text-white hover:scale-110 transition-transform"
                          aria-label={isMuted ? "Unmute" : "Mute"}
                        >
                          {isMuted || volume === 0 ? (
                            <VolumeX className="h-5 w-5" />
                          ) : (
                            <Volume2 className="h-5 w-5" />
                          )}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="w-0 group-hover/volume:w-20 transition-all opacity-0 group-hover/volume:opacity-100"
                          style={{
                            accentColor: "white",
                          }}
                        />
                      </div>

                      {/* Time */}
                      <span className="text-white text-sm font-light hidden sm:block">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-2">
                      {/* Playback Speed */}
                      {showPlaybackSpeed && (
                        <div className="relative">
                          <button
                            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                            className="text-white hover:scale-110 transition-transform flex items-center gap-1"
                            aria-label="Playback speed"
                          >
                            <Settings className="h-5 w-5" />
                            <span className="text-xs hidden sm:inline">
                              {playbackSpeed}x
                            </span>
                          </button>
                          {showSpeedMenu && (
                            <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-lg py-2 min-w-[100px]">
                              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                                <button
                                  key={speed}
                                  onClick={() => changePlaybackSpeed(speed)}
                                  className={`w-full px-4 py-2 text-white text-sm hover:bg-white/10 transition-colors text-left ${
                                    playbackSpeed === speed ? "bg-white/20" : ""
                                  }`}
                                >
                                  {speed}x
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Picture-in-Picture */}
                      {enablePictureInPicture && (
                        <button
                          onClick={togglePictureInPicture}
                          className="text-white hover:scale-110 transition-transform hidden sm:block"
                          aria-label="Picture-in-Picture"
                        >
                          <PictureInPicture className="h-5 w-5" />
                        </button>
                      )}

                      {/* Fullscreen */}
                      {enableFullscreen && (
                        <button
                          onClick={toggleFullscreen}
                          className="text-white hover:scale-110 transition-transform"
                          aria-label={
                            isFullscreen ? "Exit fullscreen" : "Fullscreen"
                          }
                        >
                          {isFullscreen ? (
                            <Minimize className="h-5 w-5" />
                          ) : (
                            <Maximize className="h-5 w-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* CTA Button */}
                  {ad.cta_text && (
                    <div className="px-4 pb-3">
                      <a
                        href={ad.link_url}
                        target={ad.open_in_new_tab ? "_blank" : "_self"}
                        rel={
                          ad.open_in_new_tab
                            ? "noopener noreferrer sponsored"
                            : "sponsored"
                        }
                        onClick={handleClick}
                        className=" w-full bg-white hover:bg-neutral-100 text-black px-4 py-2 text-sm font-medium text-center transition-colors rounded flex items-center justify-center gap-2"
                      >
                        <span>{ad.cta_text}</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {showCloseButton && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm"
                aria-label="Close advertisement"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // HTML Ad
  if (ad.ad_type === "html" && ad.html_content) {
    return (
      <div
        ref={adRef}
        className={`relative group ${className}`}
        style={containerStyle}
      >
        {showLabel && (
          <div className="text-xs text-neutral-400 uppercase tracking-wider mb-2 font-light">
            {labelText}
          </div>
        )}

        <div
          className={borderClasses}
          dangerouslySetInnerHTML={{ 
            __html: DOMPurify.sanitize(ad.html_content, {
              ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span', 'div', 'img', 'iframe'],
              ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'width', 'height', 'class', 'id'],
              ALLOW_DATA_ATTR: false,
            })
          }}
        />

        {showCloseButton && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleClose}
              className="w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center z-10"
              aria-label="Close advertisement"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
};

// Export default props
export const defaultAdProps: Partial<AdComponentProps> = {
  showLabel: true,
  labelText: "Advertisement",
  showCloseButton: true,
  autoRefresh: false,
  refreshInterval: 30000,
  borderStyle: "solid",
  borderColor: "border-neutral-200",
  imageHeight: "auto",
  imageFit: "cover",
  lazyLoad: true,
  placeholderMinHeight: "200px",
  showPlaceholderIcon: true,
  autoPlayVideo: false,
  muteVideo: false,
  loopVideo: false,
  showVideoControls: true,
  enablePictureInPicture: true,
  enableFullscreen: true,
  showPlaybackSpeed: true,
  skipSeconds: 10,
  impressionThreshold: 0.5,
  rootMargin: "0px",
  apiBaseUrl: API_URL,
  enableTracking: true,
  maxRetries: 3,
};
