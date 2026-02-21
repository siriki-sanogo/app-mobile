import { Feather } from "@expo/vector-icons";
import { useNetInfo } from "@react-native-community/netinfo";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Modal,
} from "react-native";
import { useAppContext } from "../contexte/AppContext";
import { useTranslation } from "../contexte/i18n";
import { searchAllContent } from "../services/database";
import { ALL_CARDS } from "../constants/data";

const CATEGORIES = [
    { id: "all", label_fr: "Tous", label_en: "All" },
    { id: "coran", label_fr: "Coran", label_en: "Quran" },
    { id: "bible", label_fr: "Bible", label_en: "Bible" },
    { id: "african", label_fr: "Textes africains", label_en: "African Texts" },
];

export default function UniversalSearch() {
    const { profile, darkMode } = useAppContext();
    const currentLanguage = profile?.language || "fr";
    const t = useTranslation(currentLanguage);

    const [query, setQuery] = useState("");
    const netInfo = useNetInfo();
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [selectedResult, setSelectedResult] = useState<any>(null);

    const handleSearch = async (text: string) => {
        setQuery(text);
        if (text.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const searchLower = text.toLowerCase();
            let finalResults: any[] = [];

            // 1. Search ALL_CARDS (fullText, title, reference)
            const cardResults = ALL_CARDS.filter((card) => {
                // Filter by category
                if (selectedCategory !== "all" && card.source !== selectedCategory) return false;

                // Search in title, fullText, reference
                const title = (currentLanguage === "en" ? card.title_en : card.title).toLowerCase();
                const fullText = (currentLanguage === "en" ? (card as any).fullText_en : (card as any).fullText || "").toLowerCase();
                const reference = ((card as any).reference || "").toLowerCase();

                return title.includes(searchLower) || fullText.includes(searchLower) || reference.includes(searchLower);
            }).map((card) => ({
                id: `card-${card.id}`,
                title: currentLanguage === "en" ? card.title_en : card.title,
                description: currentLanguage === "en" ? (card as any).fullText_en : (card as any).fullText,
                reference: (card as any).reference || "",
                source: card.source,
                emoji: card.emoji,
                cardData: card,
            }));

            finalResults = [...cardResults];

            // 2. Search Local DB
            try {
                console.log("[UniversalSearch] Calling searchAllContent with:", text, selectedCategory);
                const dbResults = await searchAllContent(text, selectedCategory);
                console.log("[UniversalSearch] DB returned", (dbResults as any[]).length, "results");
                const formattedDb = (dbResults as any[]).map((item: any) => ({
                    id: `db-${item.id}`,
                    title: `${item.book} ${item.chapter ? `${item.chapter}:${item.verse}` : ""}`.trim(),
                    description: item.content,
                    reference: item.book,
                    source: item.source,
                    emoji: item.source === "bible" ? "📖" : item.source === "coran" ? "📚" : "🌍",
                }));
                // Avoid duplicates
                const existingTitles = new Set(finalResults.map(r => r.title.toLowerCase()));
                formattedDb.forEach(r => {
                    if (!existingTitles.has(r.title.toLowerCase())) {
                        finalResults.push(r);
                    }
                });
            } catch (dbErr) {
                console.log("DB search error:", dbErr);
            }

            setResults(finalResults);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (catId: string) => {
        setSelectedCategory(catId);
        if (query.length >= 2) {
            setTimeout(() => handleSearch(query), 100);
        }
    };

    const getSourceLabel = (source: string) => {
        return source === "bible" ? "📖 Bible" : source === "coran" ? "📚 Coran" : "🌍 Textes africains";
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, darkMode ? { color: "#E5E7EB" } : { color: "#1F2937" }]}>{t("search_title")}</Text>

            {/* Category Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        onPress={() => handleCategoryChange(cat.id)}
                        style={[
                            styles.tab,
                            selectedCategory === cat.id
                                ? { backgroundColor: "#F97316", borderColor: "#F97316" }
                                : darkMode
                                    ? { backgroundColor: "#1F2937", borderColor: "#374151" }
                                    : { backgroundColor: "white", borderColor: "#E5E7EB" },
                        ]}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                selectedCategory === cat.id
                                    ? { color: "white", fontWeight: "700" }
                                    : darkMode
                                        ? { color: "#D1D5DB" }
                                        : { color: "#4B5563" },
                            ]}
                        >
                            {currentLanguage === "en" ? cat.label_en : cat.label_fr}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Search Input */}
            <View style={[styles.inputContainer, darkMode ? { backgroundColor: "#1F2937" } : { backgroundColor: "#F9FAFB" }]}>
                <TextInput
                    style={[styles.input, darkMode ? { color: "white" } : { color: "#1F2937" }]}
                    placeholder={t("search_placeholder")}
                    placeholderTextColor="#9CA3AF"
                    value={query}
                    onChangeText={(text) => handleSearch(text)}
                    returnKeyType="search"
                />
                <TouchableOpacity style={styles.searchButton} onPress={() => handleSearch(query)}>
                    {loading ? <Feather name="loader" size={20} color="white" /> : <Feather name="search" size={20} color="white" />}
                </TouchableOpacity>
            </View>

            {/* Results List */}
            {results.length > 0 && (
                <View style={[styles.resultsContainer, darkMode ? { backgroundColor: "#1F2937" } : { backgroundColor: "white" }]}>
                    {results.slice(0, 10).map((item: any) => (
                        <TouchableOpacity key={item.id} style={[styles.resultItem, darkMode ? { borderBottomColor: "#374151" } : {}]} onPress={() => setSelectedResult(item)}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
                                <View style={{ flex: 1 }}>
                                    <Text numberOfLines={1} style={[styles.resultTitle, darkMode ? { color: "#E5E7EB" } : { color: "#1F2937" }]}>{item.title}</Text>
                                    <Text numberOfLines={2} style={[styles.resultDesc, darkMode ? { color: "#9CA3AF" } : { color: "#6B7280" }]}>{item.description}</Text>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 }}>
                                        <Text style={styles.resultSource}>{getSourceLabel(item.source)}</Text>
                                        {item.reference ? <Text style={[styles.resultSource, { color: "#3B82F6" }]}>• {item.reference}</Text> : null}
                                    </View>
                                </View>
                                <Feather name="chevron-right" size={16} color={darkMode ? "#6B7280" : "#9CA3AF"} />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* No results */}
            {query.length >= 2 && results.length === 0 && !loading && (
                <View style={{ alignItems: "center", paddingVertical: 20 }}>
                    <Text style={{ color: "#9CA3AF", fontSize: 14 }}>
                        {currentLanguage === "en" ? "No results found" : "Aucun résultat trouvé"}
                    </Text>
                </View>
            )}

            {/* Detail Modal */}
            <Modal
                visible={!!selectedResult}
                transparent
                animationType="slide"
                onRequestClose={() => setSelectedResult(null)}
            >
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
                    <View style={{
                        backgroundColor: darkMode ? "#1F2937" : "white",
                        borderTopLeftRadius: 28,
                        borderTopRightRadius: 28,
                        padding: 24,
                        paddingBottom: 40,
                        maxHeight: "80%",
                    }}>
                        <View style={{ alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: darkMode ? "#4B5563" : "#D1D5DB", marginBottom: 20 }} />

                        <TouchableOpacity
                            onPress={() => setSelectedResult(null)}
                            style={{ position: "absolute", top: 16, right: 16, zIndex: 1, padding: 8 }}
                        >
                            <Feather name="x" size={22} color={darkMode ? "#9CA3AF" : "#6B7280"} />
                        </TouchableOpacity>

                        <View style={{ alignSelf: "center", width: 64, height: 64, borderRadius: 18, backgroundColor: darkMode ? "#374151" : "#F3F4F6", justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
                            <Text style={{ fontSize: 32 }}>{selectedResult?.emoji}</Text>
                        </View>

                        <Text style={{ fontSize: 20, fontWeight: "800", color: darkMode ? "#F9FAFB" : "#111827", textAlign: "center", marginBottom: 8 }}>
                            {selectedResult?.title}
                        </Text>

                        <View style={{ alignSelf: "center", backgroundColor: darkMode ? "#374151" : "#F0F5FF", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 20 }}>
                            <Text style={{ fontSize: 13, fontWeight: "700", color: "#3B82F6" }}>
                                {selectedResult ? getSourceLabel(selectedResult.source) : ""}
                                {selectedResult?.reference ? ` • ${selectedResult.reference}` : ""}
                            </Text>
                        </View>

                        <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                            <Text style={{ fontSize: 16, lineHeight: 26, color: darkMode ? "#D1D5DB" : "#374151", textAlign: "center", fontStyle: "italic" }}>
                                {`"${selectedResult?.description || ""}"`}
                            </Text>
                        </ScrollView>

                        <TouchableOpacity
                            style={{ backgroundColor: darkMode ? "#374151" : "#F3F4F6", borderRadius: 16, height: 48, justifyContent: "center", alignItems: "center", marginTop: 20 }}
                            onPress={() => setSelectedResult(null)}
                        >
                            <Text style={{ fontSize: 15, fontWeight: "700", color: darkMode ? "#D1D5DB" : "#374151" }}>
                                {currentLanguage === "en" ? "Close" : "Fermer"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    input: {
        flex: 1,
        fontSize: 15,
        marginRight: 8,
        paddingVertical: 8,
        borderWidth: 0,
    },
    searchButton: {
        backgroundColor: "#F97316",
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    resultsContainer: {
        marginTop: 12,
        borderRadius: 16,
        padding: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    resultItem: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    resultTitle: {
        fontWeight: "700",
        fontSize: 14,
        marginBottom: 2,
    },
    resultDesc: {
        fontSize: 13,
        lineHeight: 18,
    },
    resultSource: {
        fontSize: 11,
        color: "#F97316",
        fontWeight: "700",
    },
});
