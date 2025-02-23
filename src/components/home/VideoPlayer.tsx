import React, { useEffect, useRef, useState } from "react";

const VideoPlayer: React.FC = () => {
  const [showCover, setShowCover] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Ocultar la portada después de 2 segundos y empezar el video
    const timer = setTimeout(() => {
      setShowCover(false);
      videoRef.current?.play();
    }, 2000);

    return () => clearTimeout(timer); // Limpia el timer si el componente se desmonta
  }, []);

  const handleVideoEnd = () => {
    setShowCover(true); // Mostrar la portada nuevamente cuando termine el video
  };

  const handleCover = () => {
    setShowCover(false);
    videoRef.current?.play(); // Mostrar la portada nuevamente cuando termine el video
  };
  return (
    <div className="w-full h-[450px] overflow-hidden rounded-lg shadow-lg mb-6">
      {showCover && (
        <div className="w-full h-[450px] overflow-hidden rounded-lg shadow-lg ">
          <img
            src="/img/portada_mobile.png"
            alt="Portada del video promocional"
            className="w-full h-full object-cover md:hidden"
            onClick={handleCover}
          />
          <img
            src="/img/portada_pc.png"
            alt="Portada del video promocional md:block hidden"
            className="w-full h-full object-cover "
            onClick={handleCover}
          />
        </div>
      )}

      <video
        className="w-full h-full object-cover  md:block hidden"
        controls
        muted
        playsInline
        ref={videoRef}
        onEnded={handleVideoEnd}
        autoPlay
      >
        <source src="/videos/video_pc.mov" type="video/mp4" />
        Tu navegador no soporta el video.
      </video>

      <video
        className="w-full h-full object-cover md:hidden"
        controls
        muted
        playsInline
        ref={videoRef}
        onEnded={handleVideoEnd}
        autoPlay
      >
        <source src="/videos/video_mobile.mov" type="video/mp4" />
        Tu navegador no soporta el video.
      </video>
    </div>
  );
};

export default VideoPlayer;
