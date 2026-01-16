import { Audio } from "expo-av";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

export type SoundTrack = {
    id: string;
    name: string;
    source: any; // URL or require()
    category: "Nature" | "Noise" | "Music";
};

// Public Domain / Free Assets placeholders
// In a real app, these would be local assets or reliable CDN links.
const TRACKS: SoundTrack[] = [
    {
        id: "rain",
        name: "Pluie Douce",
        source: { uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" }, // Placeholder
        category: "Nature",
    },
    {
        id: "forest",
        name: "Forêt Calme",
        source: { uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" }, // Placeholder
        category: "Nature",
    },
    {
        id: "white_noise",
        name: "Bruit Blanc",
        source: { uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }, // Placeholder
        category: "Noise",
    },
];

interface SoundContextType {
    isPlaying: boolean;
    currentTrack: SoundTrack | null;
    playTrack: (trackId: string) => Promise<void>;
    togglePlayPause: () => Promise<void>;
    stop: () => Promise<void>;
    tracks: SoundTrack[];
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: ReactNode }) {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<SoundTrack | null>(null);

    useEffect(() => {
        return () => {
            // Cleanup on unmount
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const playTrack = async (trackId: string) => {
        try {
            // 1. Unload previous if exists
            if (sound) {
                await sound.unloadAsync();
                setSound(null);
            }

            const track = TRACKS.find((t) => t.id === trackId);
            if (!track) return;

            // 2. Load new sound
            const { sound: newSound } = await Audio.Sound.createAsync(
                track.source,
                { shouldPlay: true, isLooping: true }
            );

            setSound(newSound);
            setCurrentTrack(track);
            setIsPlaying(true);
        } catch (error) {
            console.log("Error loading sound:", error);
        }
    };

    const togglePlayPause = async () => {
        if (!sound) return;

        if (isPlaying) {
            await sound.pauseAsync();
            setIsPlaying(false);
        } else {
            await sound.playAsync();
            setIsPlaying(true);
        }
    };

    const stop = async () => {
        if (sound) {
            await sound.stopAsync();
            setIsPlaying(false);
        }
    };

    return (
        <SoundContext.Provider
            value={{
                isPlaying,
                currentTrack,
                playTrack,
                togglePlayPause,
                stop,
                tracks: TRACKS,
            }}
        >
            {children}
        </SoundContext.Provider>
    );
}

export function useSound() {
    const ctx = useContext(SoundContext);
    if (!ctx) throw new Error("useSound must be used within SoundProvider");
    return ctx;
}
