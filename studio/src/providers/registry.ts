export type ProviderStatus = {
  id: string;
  kind: "research" | "speech" | "image" | "video" | "render";
  configured: boolean;
  detail: string;
};

export function providerStatuses(env: Record<string, string | undefined> = {}): ProviderStatus[] {
  return [
    {
      id: "edge-tts",
      kind: "speech",
      configured: true,
      detail: "Narration uses edge-tts neural voices on this machine. Recorded cost is 0.",
    },
    {
      id: "elevenlabs",
      kind: "speech",
      configured: Boolean(env.ELEVENLABS_API_KEY),
      detail: "Unavailable until a key is set. This build does not call ElevenLabs.",
    },
    {
      id: "claude",
      kind: "research",
      configured: Boolean(env.ANTHROPIC_API_KEY),
      detail: "Live model calls are off. The pilot's research was written from pages that were opened.",
    },
    {
      id: "runway",
      kind: "video",
      configured: false,
      detail: "Unavailable. Approved shots are Remotion drawings, so no video model is called.",
    },
    {
      id: "fal",
      kind: "image",
      configured: false,
      detail: "Unavailable. No image model is called.",
    },
    {
      id: "remotion",
      kind: "render",
      configured: true,
      detail: "1920×1080 flashcard composition, with FFmpeg for the soundtrack mix.",
    },
  ];
}
