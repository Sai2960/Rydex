"use client";
import React, { useEffect, useRef, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import axios from "axios";

function Page() {
  const [userData, setUserData] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasJoined = useRef(false);
  const { roomId } = useParams();
  const router = useRouter();

  const [joined, setJoined] = useState(false);
  const previewRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [loading, setLoading] = useState(false);

  // Fetch user data
  useEffect(() => {
    axios.get("/api/user/me").then(({ data }) => setUserData(data));
  }, []);

  // Camera preview before joining
  useEffect(() => {
    if (joined) return;
    let localStream: MediaStream;
    const init = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(localStream);
        if (previewRef.current) {
          previewRef.current.srcObject = localStream;
        }
      } catch (error) {
        console.log(error);
      }
    };
    init();
    return () => {
      localStream?.getTracks().forEach((t) => t.stop());
    };
  }, [joined]);

  const toggleCamera = () => {
    if (!stream) return;
    stream.getVideoTracks().forEach((track) => (track.enabled = !isCameraOn));
    setIsCameraOn((prev) => !prev);
  };

  const toggleMic = () => {
    if (!stream) return;
    stream.getAudioTracks().forEach((track) => (track.enabled = !isMicOn));
    setIsMicOn((prev) => !prev);
  };

  const startCall = async () => {
    if (!containerRef.current || !userData?._id || hasJoined.current) return;
    hasJoined.current = true;
    setLoading(true);

    // Stop preview stream before handing off to Zego
    stream?.getTracks().forEach((t) => t.stop());

    try {
      const appId = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET!;

      const displayName = `${userData?.name} (${userData?.email})`;

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appId,
        serverSecret,
        roomId?.toString()!,
        userData._id.toString(),
        displayName,
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zp.joinRoom({
        container: containerRef.current,
        scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
        showPreJoinView: false,
        onJoinRoom: () => {
          setLoading(false);
          setJoined(true);
        },
      });
    } catch (error) {
      console.log(error);
      setLoading(false);
      hasJoined.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-10 bg-black/80 backdrop-blur-md">
        <div>
          <Image src="/logo.png" alt="logo" width={44} height={44} priority />
          <p className="text-xs text-gray-400 mt-1">Partner Video KYC</p>
        </div>

        {joined && (
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 bg-red-600/20 hover:bg-red-600 border border-red-500/40 hover:border-red-600 active:scale-95 transition-all duration-150 px-5 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-white shadow-lg shadow-red-900/20"
              onClick={() => router.push("/")}
            >
              <PhoneOff size={15} strokeWidth={2.5} />
              End Call
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 relative overflow-hidden">
        {/* Zego container — always mounted, shown only after join */}
        <div
          ref={containerRef}
          className="absolute inset-0"
          style={{ display: joined ? "block" : "none" }}
        />

        {/* Pre-join lobby */}
        {!joined && (
          <div className="min-h-full flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Camera preview */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                <video
                  ref={previewRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-[300px] sm:h-[400px] object-cover"
                />
                {!isCameraOn && (
                  <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <VideoOff size={40} className="text-white/60" />
                  </div>
                )}

                {/* Connecting overlay */}
                {loading && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <p className="text-sm text-white/70 tracking-wide">
                      Connecting to room…
                    </p>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="space-y-8 text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Secure Video KYC
                </h1>

                {/* Toggle buttons */}
                <div className="flex justify-center lg:justify-start gap-4">
                  <button
                    onClick={toggleCamera}
                    disabled={loading}
                    title={isCameraOn ? "Turn off camera" : "Turn on camera"}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                      isCameraOn
                        ? "bg-white text-black shadow-lg shadow-white/20 hover:bg-gray-100"
                        : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                    }`}
                  >
                    {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
                  </button>

                  <button
                    onClick={toggleMic}
                    disabled={loading}
                    title={isMicOn ? "Mute mic" : "Unmute mic"}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                      isMicOn
                        ? "bg-white text-black shadow-lg shadow-white/20 hover:bg-gray-100"
                        : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                    }`}
                  >
                    {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                  </button>
                </div>

                {/* Status indicators */}
                <div className="flex justify-center lg:justify-start gap-4 text-sm text-white/50">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${isCameraOn ? "bg-green-400" : "bg-red-400"}`}
                    />
                    {isCameraOn ? "Camera on" : "Camera off"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${isMicOn ? "bg-green-400" : "bg-red-400"}`}
                    />
                    {isMicOn ? "Mic on" : "Mic muted"}
                  </span>
                </div>

                {/* Join button */}
                <button
                  onClick={startCall}
                  disabled={loading || !userData}
                  className="w-full bg-white text-black py-4 rounded-xl font-semibold text-base tracking-wide hover:bg-gray-100 active:scale-[0.98] transition-all duration-150 shadow-xl shadow-white/10 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      Connecting…
                    </>
                  ) : !userData ? (
                    <>
                      <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      Loading…
                    </>
                  ) : (
                    "Join Secure Call"
                  )}
                </button>

                <p className="text-xs text-white/30 text-center lg:text-left">
                  Your video and audio are encrypted end-to-end. This session
                  may be recorded for verification purposes.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;