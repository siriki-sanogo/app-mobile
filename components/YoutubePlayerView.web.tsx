import React from "react";
import { View } from "react-native";

interface YoutubePlayerViewProps {
    videoId: string;
    height?: number;
    play?: boolean;
    onReady?: () => void;
    onChangeState?: (state: string) => void;
}

export default function YoutubePlayerView({ videoId, height = 300, play = false, onReady, onChangeState }: YoutubePlayerViewProps) {
    // On mount, trigger onReady to stop loading spinner
    React.useEffect(() => {
        if (onReady) onReady();
    }, [onReady]);

    return (
        <View style={{ height, width: "100%", overflow: "hidden" }}>
            <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=${play ? 1 : 0}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ border: "none" }}
            />
        </View>
    );
}
