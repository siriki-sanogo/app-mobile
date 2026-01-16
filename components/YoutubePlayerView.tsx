import React from "react";
import YoutubePlayer from "react-native-youtube-iframe";

interface YoutubePlayerViewProps {
    videoId: string;
    height?: number;
    play?: boolean;
    onReady?: () => void;
    onChangeState?: (state: string) => void;
}

export default function YoutubePlayerView({ videoId, height = 300, play = false, onReady, onChangeState }: YoutubePlayerViewProps) {
    return (
        <YoutubePlayer
            height={height}
            play={play}
            videoId={videoId}
            onReady={onReady}
            onChangeState={onChangeState}
        />
    );
}
