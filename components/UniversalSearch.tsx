import { Feather } from "@expo/vector-icons";
import { useNetInfo } from "@react-native-community/netinfo";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
    Linking
} from "react-native";
import { useAppContext } from "../contexte/AppContext";
import { useTranslation } from "../contexte/i18n";
import { searchOnline } from "../services/api";
import { searchTexts } from "../services/database";

const SEARCH_SOURCES = [
    { id: "larousse_fr", labelKey: "source_fr", url: "https://www.larousse.fr/dictionnaires/francais/" },
    { id: "wordreference_enfr", labelKey: "source_enfr", url: "https://www.wordreference.com/enfr/" },
    { id: "cambridge_en", labelKey: "source_en", url: "https://dictionary.cambridge.org/dictionary/english/" },
    { id: "quran", labelKey: "source_quran", url: "https://quran.com/search?q=" },
    { id: "bible", labelKey: "source_bible", url: "https://www.biblegateway.com/quicksearch/?quicksearch=" },
    { id: "gutenberg", labelKey: "source_african", url: "https://www.gutenberg.org/ebooks/search/?query=Du+Bois%2C+W.+E.+B." },
];

export default function UniversalSearch() {
    const { profile } = useAppContext();
    const currentLanguage = profile?.language || "fr";
    const t = useTranslation(currentLanguage);

    const colorScheme = useColorScheme();
    const darkMode = colorScheme === "dark";
    const [query, setQuery] = useState("");
    const [targetUrl, setTargetUrl] = useState("");
    const netInfo = useNetInfo();
    const router = useRouter();
    const [selectedSourceId, setSelectedSourceId] = useState(SEARCH_SOURCES[0].id);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all"); // Assuming a default category

    const handleSearch = async (text: string) => {
        setQuery(text); // Update query state
        if (text.length > 2) {
            setLoading(true);
            try {
                console.log(`UniversalSearch: Searching for '${text}' in '${selectedCategory}'`);

                // 1. Search Local DB
                const dbResults = await searchTexts(text, selectedCategory);
                console.log("UniversalSearch: Local Results:", dbResults.length);

                let finalResults: any[] = dbResults.map((item: any) => ({
                    id: `local-${item.id}`,
                    title: `${item.book} ${item.chapter ? `${item.chapter}:${item.verse}` : ""}`,
                    description: item.content,
                    type: item.source,
                }));

                // Navigation Shortcuts (Exercises)
                if (text.toLowerCase().includes("exercic") || text.toLowerCase().includes("exercise")) {
                    finalResults.unshift({
                        id: "nav-exercises",
                        title: "Accéder aux Exercices",
                        description: "Section Bien-être & Méditation",
                        type: "navigation",
                        route: "/dashboard/exercises" // Adjust path based on file structure
                    });
                }

                // 2. Search Online if connected
                if (netInfo.isConnected !== false) {
                    console.log("Searching Online...");
                    const apiResults = await searchOnline(text, selectedCategory);
                    console.log("Online Results:", apiResults.length);

                    const formattedApi = apiResults.map((item: any, index: number) => ({
                        id: `api-${index}`, // Temporary ID
                        title: item.title,
                        description: item.description,
                        type: item.source + " (Online)"
                    }));
                    finalResults = [...finalResults, ...formattedApi];
                }

                setResults(finalResults as any);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        } else {
            setResults([]);
        }
    };

    const handleResultPress = (item: any) => {
        if (item.type === "navigation" && item.route) {
            router.push(item.route);
        } else {
            // Navigate to assistant and pass the text as a param or via context
            // For simplicity, we'll try to use the router and maybe the assistant will pick it up
            console.log("Navigating to assistant with:", item.description);
            router.push({
                pathname: "/assistant",
                params: { initialMessage: item.description }
            } as any);
        }
    };

    const handleSourcePress = async (source: typeof SEARCH_SOURCES[0]) => {
        setSelectedSourceId(source.id);
        if (!query) {
            // If no search query, open the external link directly
            const url = source.url;
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, darkMode ? { color: "#E5E7EB" } : { color: "#1F2937" }]}>{t("search_title")}</Text>

            {/* Tabs (Sources/Categories) */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
                {SEARCH_SOURCES.map((source: any) => (
                    <TouchableOpacity
                        key={source.id}
                        onPress={() => handleSourcePress(source)}
                        style={[
                            styles.tab,
                            selectedSourceId === source.id
                                ? { backgroundColor: "#F97316", borderColor: "#F97316" }
                                : darkMode
                                    ? { backgroundColor: "#1F2937", borderColor: "#374151" }
                                    : { backgroundColor: "white", borderColor: "#E5E7EB" },
                        ]}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                selectedSourceId === source.id
                                    ? { color: "white", fontWeight: "700" }
                                    : darkMode
                                        ? { color: "#D1D5DB" }
                                        : { color: "#4B5563" },
                            ]}
                        >
                            {t(source.labelKey)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Input */}
            <View style={[styles.inputContainer, darkMode ? { backgroundColor: "#1F2937" } : { backgroundColor: "white" }]}>
                <TextInput
                    style={[styles.input, darkMode ? { color: "white" } : { color: "#1F2937" }]}
                    placeholder={t("search_placeholder")}
                    placeholderTextColor="#9CA3AF"
                    value={query}
                    onChangeText={(text) => handleSearch(text)} // Live search
                    returnKeyType="search"
                />
                <TouchableOpacity style={styles.searchButton} onPress={() => handleSearch(query)}>
                    {loading ? <Feather name="loader" size={20} color="white" /> : <Feather name="search" size={20} color="white" />}
                </TouchableOpacity>
            </View>

            {/* Results List */}
            {results.length > 0 && (
                <View style={[styles.resultsContainer, darkMode ? { backgroundColor: "#1F2937", borderColor: "#374151" } : { backgroundColor: "white", borderColor: "#E5E7EB" }]}>
                    {results.map((item: any) => (
                        <TouchableOpacity key={item.id} style={styles.resultItem} onPress={() => handleResultPress(item)}>
                            <Text style={[styles.resultTitle, darkMode ? { color: "#E5E7EB" } : { color: "#1F2937" }]}>{item.title}</Text>
                            <Text style={[styles.resultDesc, darkMode ? { color: "#9CA3AF" } : { color: "#6B7280" }]}>{item.description}</Text>
                            <Text style={styles.resultSource}>{item.type}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
    },
    tabsScroll: {
        flexGrow: 0,
        marginBottom: 12,
    },
    tab: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
    tabText: {
        fontSize: 13,
        fontWeight: "500",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    input: {
        flex: 1,
        fontSize: 16,
        marginRight: 8,
    },
    searchButton: {
        backgroundColor: "#F97316",
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    resultsContainer: {
        marginTop: 12,
        borderRadius: 12,
        borderWidth: 1,
        padding: 12,
    },
    resultItem: {
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB", // Simplified for now
        paddingBottom: 8,
    },
    resultTitle: {
        fontWeight: "700",
        fontSize: 14,
        marginBottom: 2,
    },
    resultDesc: {
        fontSize: 13,
    },
    resultSource: {
        fontSize: 10,
        color: "#F97316",
        marginTop: 2,
        textTransform: 'uppercase',
        fontWeight: '700',
    }
});
