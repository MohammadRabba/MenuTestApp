"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    voiceflow?: {
      chat: {
        load: (options: {
          verify: { projectID: string };
          url: string;
          versionID: string;
          voice?: { url: string };
        }) => void;
      };
    };
  }
}

export default function VoiceflowScriptLoader() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
    script.type = "text/javascript";
    script.onload = () => {
      if (window.voiceflow?.chat) {
        window.voiceflow.chat.load({
          verify: { projectID: "68cc65db05ca159848bb00bb" },
          url: "https://general-runtime.voiceflow.com",
          versionID: "production",
          voice: {
            url: "https://runtime-api.voiceflow.com",
          },
        });
      } else {
        console.error("Voiceflow chat not found on window.");
      }
    };

    document.body.appendChild(script);

    // Optional: cleanup
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null; // This component only injects the script
}
