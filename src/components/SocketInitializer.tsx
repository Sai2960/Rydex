"use client";

import { getSocket } from "@/lib/socket";
import { useEffect } from "react";

function SocketInitializer({ userId }: { userId: string }) {
  useEffect(() => {
    if (!userId) return;
    const socket = getSocket();
    socket.emit("identity", userId);

    return () => {
      // Don't disconnect on unmount so isOnline stays true while browsing
    };
  }, [userId]);

  return null;
}

export default SocketInitializer;