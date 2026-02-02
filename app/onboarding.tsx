import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useAppContext } from "../contexte/AppContext";
import { Language, useTranslation } from "../contexte/i18n";

const { width } = Dimensions.get("window");
const IS_LARGE_SCREEN = width >= 768;

const AGES = ["12 - 17 ans", "18 - 34 ans", "35 - 54 ans", "55 - ∞"];
const RELIGIONS = [
  "Christianisme",
  "Islam",
  "Bouddhisme",
  "Hindouisme",
  "Animisme",
  "Athée",
];

const OBJECTIVES = [
  "obj_anxiety",
  "obj_stress",
  "obj_resilience",
  "obj_confidence",
  "obj_share_story",
  "obj_help_others"
];

const BOOKS = [
  "Coran",
  "Bible",
  "Dictionnaire Français",
  "Dictionnaire Anglais",
  "Dictionnaire Anglais-Français",
  "Web Du Bois",
];

export default function OnboardingScreen() {
  const { profile, setProfile, setCurrentScreen } = useAppContext();

  const [step, setStep] = useState(1); // 1 or 2

  // Step 1 State
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>("fr");
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [selectedReligion, setSelectedReligion] = useState<string | null>(null);

  // Step 2 State
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);

  const t = useTranslation(language);

  const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      if (profile) {
        setProfile({
          ...profile,
          photoUri: photoUri || undefined, // Save photo
          language,
          ageRange: selectedAge || "",
          religion: selectedReligion || "",
          objectives: selectedObjectives,
          selectedBooks: selectedBooks,
          preferences: {
            showBible: selectedBooks.some(b => b.toLowerCase().includes("bible")),
            showCoran: selectedBooks.some(b => b.toLowerCase().includes("coran")),
            showAfrican: true,
          }
        });
      }
      setCurrentScreen("dashboard");
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  return (
    <View style={styles.mainContainer}>
      {/* Header - Green Background */}
      <View style={[styles.header, { paddingTop: IS_LARGE_SCREEN ? 60 : 50 }]}>
        {step === 2 && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
        )}
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>GOOD APP</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>

          {/* STEP 1: PREFERENCES */}
          {step === 1 && (
            <>
              {/* Profile Picture Section */}
              <View style={styles.profileSection}>
                <Text style={styles.welcomeText}>Bienvenue, {profile?.name || "Ami"} !</Text>
                <Text style={styles.subText}>Personnalisez votre profil</Text>
                <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    {photoUri ? (
                      <Image source={{ uri: photoUri }} style={styles.avatarImage} />
                    ) : (
                      <Feather name="camera" size={32} color="#065F46" />
                    )}
                    <View style={styles.addIcon}>
                      <Feather name="plus" size={12} color="white" />
                    </View>
                  </View>
                  <Text style={styles.addPhotoText}>{photoUri ? "Modifier la photo" : "Ajouter une photo"}</Text>
                </TouchableOpacity>
              </View>

              {/* Section 1: Langue */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t("language")}</Text>
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[styles.optionButton, language === "fr" && styles.optionButtonActive]}
                    onPress={() => setLanguage("fr")}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.optionText, language === "fr" && { color: "white" }]}>Français</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.optionButton, language === "en" && styles.optionButtonActive]}
                    onPress={() => setLanguage("en")}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.optionText, language === "en" && { color: "white" }]}>English</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Section 2: Tranche d'âge */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t("age")}</Text>
                <View style={styles.grid}>
                  {AGES.map((age) => (
                    <TouchableOpacity
                      key={age}
                      style={[styles.gridButton, selectedAge === age && styles.gridButtonActive]}
                      onPress={() => setSelectedAge(age)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.gridText, selectedAge === age && { color: "white" }]}>{age}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Section 3: Religion */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t("religion")}</Text>
                <View style={styles.grid}>
                  {RELIGIONS.map((rel) => (
                    <TouchableOpacity
                      key={rel}
                      style={[styles.gridButton, selectedReligion === rel && styles.gridButtonActive]}
                      onPress={() => setSelectedReligion(rel)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.gridText, selectedReligion === rel && { color: "white" }]}>{rel}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* STEP 2: OBJECTIVES & BOOKS */}
          {step === 2 && (
            <>
              {/* Section 1: Objectifs */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t("objectives")}</Text>
                <View style={styles.verticalList}>
                  {OBJECTIVES.map((obj) => (
                    <TouchableOpacity
                      key={obj}
                      style={[styles.listButton, selectedObjectives.includes(obj) && styles.listButtonActive]}
                      onPress={() => toggleSelection(obj, selectedObjectives, setSelectedObjectives)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.listText, selectedObjectives.includes(obj) && { color: "white" }]}>{t(obj as any)}</Text>
                      {selectedObjectives.includes(obj) && <Feather name="check" size={20} color="white" />}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Section 2: Livres */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t("books")}</Text>
                <View style={styles.grid}>
                  {BOOKS.map((book) => (
                    <TouchableOpacity
                      key={book}
                      style={[styles.gridButton, selectedBooks.includes(book) && styles.gridButtonActive, { width: "48%" }]}
                      onPress={() => toggleSelection(book, selectedBooks, setSelectedBooks)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.gridText, selectedBooks.includes(book) && { color: "white" }]}>{book}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {step === 1 ? t("next") : t("start")}
            </Text>
            <Feather name={step === 1 ? "arrow-right" : "check"} size={20} color="white" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6", // GREY BACKGROUND
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    backgroundColor: "#065F46", // GREEN HEADER
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
    justifyContent: "center",
    flexDirection: "row",
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    position: "absolute",
    left: 16,
    bottom: 20,
    zIndex: 10,
    padding: 8,
  },
  logoCircle: {
    width: 60, // Smaller logo to give space
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 10,
  },
  logoText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#065F46",
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 24,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 20,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  addIcon: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#065F46',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  addPhotoText: {
    marginTop: 8,
    fontSize: 14,
    color: '#065F46',
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937", // DARK TEXT
    marginBottom: 16,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1F2937",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  optionButton: {
    flex: 1,
    backgroundColor: "white", // LIGHT BUTTON
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  optionButtonActive: {
    backgroundColor: "#F97316", // Orange
    borderColor: "#F97316",
  },
  optionText: {
    color: "#4B5563", // Dark Grey
    fontSize: 16,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridButton: {
    width: "48%",
    backgroundColor: "white", // Light
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  gridButtonActive: {
    backgroundColor: "#F97316", // Bright Orange
    borderWidth: 2,
    borderColor: "#F97316",
  },
  gridText: {
    color: "#4B5563",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  verticalList: {
    gap: 12,
  },
  listButton: {
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  listButtonActive: {
    backgroundColor: "#F97316",
    borderWidth: 2,
    borderColor: "#F97316",
  },
  listText: {
    color: "#4B5563",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#065F46", // Green Button instead of Orange? Or Keep Orange as accent? User said Green/Orange/White. Orange is good for CTA.
    borderRadius: 99,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#065F46",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
