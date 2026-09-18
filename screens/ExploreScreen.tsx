import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  Apod,
  getApodByDate,
} from "../services/nasaApi";

import {
  isFavorite,
  toggleFavorite,
} from "../storage/favorites";

export default function ExploreScreen() {
  const [date, setDate] = useState("");
  const [apod, setApod] = useState<Apod | null>(null);
  const [loading, setLoading] = useState(false);
  const [favorite, setFavorite] = useState(false);

  async function handleExplore() {
    if (!date.trim()) {
      Alert.alert(
        "Date required",
        "Enter a date in YYYY-MM-DD format."
      );
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(date)) {
      Alert.alert(
        "Invalid date",
        "Use YYYY-MM-DD format. Example: 2025-12-25."
      );
      return;
    }

    try {
      setLoading(true);
      setApod(null);

      const result = await getApodByDate(date);

      setApod(result);

      const saved = await isFavorite(result.date);

      setFavorite(saved);
    } catch (error) {
      console.log("Error fetching APOD:", error);

      Alert.alert(
        "Error",
        "Could not find a NASA APOD for this date."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleFavorite() {
    if (!apod) {
      return;
    }

    try {
      const newStatus = await toggleFavorite(apod);

      setFavorite(newStatus);
    } catch (error) {
      console.log("Error updating favorite:", error);

      Alert.alert(
        "Error",
        "Could not update your favorites."
      );
    }
  }

  async function handleWatchVideo() {
    if (!apod?.url) {
      return;
    }

    try {
      const supported = await Linking.canOpenURL(apod.url);

      if (supported) {
        await Linking.openURL(apod.url);
      } else {
        Alert.alert(
          "Error",
          "This video URL cannot be opened."
        );
      }
    } catch (error) {
      console.log("Error opening video:", error);

      Alert.alert(
        "Error",
        "Could not open this video."
      );
    }
  }

  function formatDate(value: string) {
    const [year, month, day] = value.split("-");

    return `${day}/${month}/${year}`;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="telescope-outline"
              size={30}
              color="#A78BFA"
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Explore the Universe
            </Text>

            <Text style={styles.subtitle}>
              Discover the universe through time
            </Text>
          </View>
        </View>

        <View style={styles.searchCard}>
          <Text style={styles.label}>
            Choose a date
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="calendar-outline"
              size={21}
              color="#8B5CF6"
            />

            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="2025-12-25"
              placeholderTextColor="#697086"
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={styles.exploreButton}
            onPress={handleExplore}
            activeOpacity={0.8}
          >
            <Ionicons
              name="search-outline"
              size={20}
              color="#FFFFFF"
            />

            <Text style={styles.exploreButtonText}>
              Explore
            </Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color="#8B5CF6"
            />

            <Text style={styles.loadingText}>
              Exploring the universe...
            </Text>
          </View>
        )}

        {apod && !loading && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultLabel}>
                ASTRONOMY PICTURE OF THE DAY
              </Text>

              <View style={styles.dateRow}>
                <Ionicons
                  name="calendar-outline"
                  size={15}
                  color="#8C93A8"
                />

                <Text style={styles.resultDate}>
                  {formatDate(apod.date)}
                </Text>
              </View>
            </View>

            {apod.media_type === "image" ? (
              <Image
                source={{ uri: apod.url }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.videoPlaceholder}>
                <View style={styles.videoIconContainer}>
                  <Ionicons
                    name="play"
                    size={34}
                    color="#FFFFFF"
                  />
                </View>

                <Text style={styles.videoTitle}>
                  NASA Video
                </Text>

                <Text style={styles.videoText}>
                  The Astronomy Picture of the Day for
                  this date is a video.
                </Text>

                <TouchableOpacity
                  style={styles.watchButton}
                  onPress={handleWatchVideo}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="play-circle-outline"
                    size={21}
                    color="#FFFFFF"
                  />

                  <Text style={styles.watchButtonText}>
                    Watch Video
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.resultContent}>
              <View style={styles.apodTitleRow}>
                <Ionicons
                  name={
                    apod.media_type === "video"
                      ? "videocam-outline"
                      : "planet-outline"
                  }
                  size={22}
                  color="#A78BFA"
                />

                <Text style={styles.apodTitle}>
                  {apod.title}
                </Text>
              </View>

              <Text style={styles.description}>
                {apod.explanation}
              </Text>

              {apod.copyright && (
                <View style={styles.copyrightRow}>
                  <Ionicons
                    name="person-outline"
                    size={15}
                    color="#697086"
                  />

                  <Text style={styles.copyright}>
                    {apod.copyright}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.favoriteButton,
                  favorite &&
                    styles.favoriteButtonActive,
                ]}
                onPress={handleFavorite}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={
                    favorite
                      ? "heart"
                      : "heart-outline"
                  }
                  size={22}
                  color={
                    favorite
                      ? "#FF6B8A"
                      : "#A78BFA"
                  }
                />

                <Text
                  style={[
                    styles.favoriteText,
                    favorite &&
                      styles.favoriteTextActive,
                  ]}
                >
                  {favorite
                    ? "Remove from Favorites"
                    : "Add to Favorites"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070B17",
  },

  content: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 50,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },

  headerIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: "#17122D",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
  },

  subtitle: {
    color: "#8C93A8",
    fontSize: 13,
    marginTop: 3,
  },

  searchCard: {
    backgroundColor: "#11182A",
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#202A40",
  },

  label: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },

  inputContainer: {
    height: 55,
    backgroundColor: "#090E1B",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#293249",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    marginLeft: 11,
  },

  exploreButton: {
    height: 54,
    backgroundColor: "#6D28D9",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    flexDirection: "row",
    gap: 8,
  },

  exploreButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  loadingContainer: {
    alignItems: "center",
    marginTop: 50,
  },

  loadingText: {
    color: "#A5AABD",
    marginTop: 12,
    fontSize: 14,
  },

  resultCard: {
    backgroundColor: "#11182A",
    borderRadius: 22,
    marginTop: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#202A40",
  },

  resultHeader: {
    padding: 18,
  },

  resultLabel: {
    color: "#8B5CF6",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  resultDate: {
    color: "#A5AABD",
    marginLeft: 6,
    fontSize: 13,
  },

  image: {
    width: "100%",
    height: 260,
    backgroundColor: "#090E1B",
  },

  videoPlaceholder: {
    minHeight: 270,
    backgroundColor: "#090E1B",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  videoIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#6D28D9",
    justifyContent: "center",
    alignItems: "center",
  },

  videoTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    marginTop: 15,
  },

  videoText: {
    color: "#A5AABD",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginTop: 7,
    maxWidth: 280,
  },

  watchButton: {
    height: 48,
    paddingHorizontal: 22,
    backgroundColor: "#6D28D9",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
  },

  watchButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  resultContent: {
    padding: 18,
  },

  apodTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  apodTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
    lineHeight: 28,
    marginLeft: 9,
  },

  description: {
    color: "#A5AABD",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 14,
  },

  copyrightRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },

  copyright: {
    color: "#697086",
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },

  favoriteButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#6D28D9",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  favoriteButtonActive: {
    backgroundColor: "#29143A",
    borderColor: "#EF476F",
  },

  favoriteText: {
    color: "#A78BFA",
    fontSize: 15,
    fontWeight: "700",
  },

  favoriteTextActive: {
    color: "#FF7A9C",
  },
});