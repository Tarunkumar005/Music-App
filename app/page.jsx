"use client"
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from 'react-toastify';


export default function Home() {
  const [status, setStatus] = useState("play");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [songNo, setSongNo] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const sliderRef = useRef(null);

  var song_no = 0;

  useEffect(() => {
    if (uploadedFiles.length > 0 && audioRef.current) {
      audioRef.current.load(); // Reload the audio element when the song changes
      if (status === "pause") {
        audioRef.current.play(); // Auto-play if the player is already playing
      }
    }
  }, [songNo, uploadedFiles]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch("http://localhost:3001/");
        const result = await response.json();
        if (result.success && result.files.length > 0) {
          console.log(result.files[0].filename);
          setUploadedFiles(result.files);
        } else {
          toast.error("No songs added.");
        }
      } catch (error) {
        console.error("Error fetching files:", error);
        toast.error("Failed to fetch uploaded files.");
      }
    };
    fetchFiles();
  }, []);

  const next = useCallback(() => {
    setSongNo((prev) => (prev < uploadedFiles.length - 1 ? prev + 1 : 0));
    playPause(); // Ensure continuity when switching
  }, [uploadedFiles.length]);

  const previous = useCallback(() => {
    setSongNo((prev) => (prev > 0 ? prev - 1 : 0));
    playPause(); // Ensure continuity when switching
  }, []);
  

  const playPause = useCallback(() => {
    if (status === "play") {
      videoRef.current.play();
      audioRef.current.play();
      setStatus("pause");
    } else {
      videoRef.current.pause();
      audioRef.current.pause();
      setStatus("play");
    }
  }, [status]);

  
  useEffect(() => {
    const handleKeyUp = (event) => {
      if (event.key === "ArrowLeft") {
        previous();
      } else if (event.key === "ArrowRight") {
        next();
      } else if (event.key === " ") {
        playPause();
      }
    };
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [previous, next, playPause]); // Include dependencies

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime || 0;
      const duration = audioRef.current.duration || 1;
      setProgress((currentTime / duration) * 100); // Update progress state
      setCurrentTime(currentTime);
      setDuration(duration);
    }
  };

  const handleProgressChange = () => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      const newProgress = parseFloat(sliderRef.current.value); // Get the value from the slider
      const newTime = (newProgress / 100) * audioRef.current.duration;
      if (isFinite(newTime)) {
        audioRef.current.currentTime = newTime; // Update the audio time based on slider value
      } else {
        console.error("Calculated newTime is not finite:", newTime);
      }
    } else {
      console.warn("Audio duration is not finite or audio element is not ready.");
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="player w-96 h-[75vh] mt-24 rounded-2xl border-2 border-slate-400 shadow-slate-800 shadow-xl mx-auto flex-col">
        <video className="h-80 w-80 rounded-full mx-auto mt-5 border-[20px] border-slate-200" src="/vid.mp4" ref={videoRef} loop></video>
        {uploadedFiles.length > 0 && (
          <>
            <audio
              src={`http://localhost:3001/uploads/${uploadedFiles[songNo].filename}`}
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
            ></audio>
            <p className="mt-2 h-6 w-[95%] text-center text-white mx-auto text-[12px]">{uploadedFiles[songNo].filename.slice(0,80)}</p>
            <div className="w-full text-center">
            <p className="text-left text-[10px] mt-2 text-white w-[90%] mx-auto">{formatTime(currentTime)} / {formatTime(duration)}</p>
            <input ref={sliderRef} type="range" className="w-[90%] cursor-pointer accent-slate-800" min="0" max="100" value={progress} onChange={handleProgressChange}/>
            </div>
          </>
        )}
      <div className="w-[75%] flex mx-auto mt-5 items-center justify-between">
        <button className="h-16 w-16 rounded-full bg-white" onClick={previous}><i className="fa-solid fa-backward fa-xl mx-auto"></i></button>
        <button className="h-20 w-20 rounded-full bg-white" onClick={playPause}><i className={`fa-solid fa-${status} fa-2x mx-auto`}></i></button>
        <button className="h-16 w-16 rounded-full bg-white" onClick={next}><i className="fa-solid fa-forward fa-xl mx-auto"></i></button>
      </div>
      </div>
    </>
  );
}
