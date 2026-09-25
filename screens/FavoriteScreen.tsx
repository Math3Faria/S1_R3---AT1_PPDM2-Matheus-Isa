import React, {
  useCallback,
  useState,
} from "react";

import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";

import { Apod } from "../services/nasaApi";

import {
  getFavorites,
  removeFavorite,
} from "../storage/favorites";

export default function FavoritesScreen() {
  const [favorites, setFavorites] =
    useState<Apod[]>([]);

  const [loading, setLoading] =
    useState(true);

  async function loadFavorites() {
    try {
      setLoading(true);

      const savedFavorites =
        await getFavorites();

      setFavorites(savedFavorites);
    } catch (error) {
      console.log(
        "Error loading favorites:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  function handleRemove(item: Apod) {
    Alert.alert(
      "Remove favorite",
      `Do you want to remove "${item.title}" from your favorites?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",

          onPress: async () => {
            await removeFavorite(item.date);

            setFavorites(
              (currentFavorites) =>
                currentFavorites.filter(
                  (favorite) =>
                    favorite.date !==
                    item.date
                )
            );
          },
        },
      ]
    );
  }

  function formatDate(value: string) {
    const [year, month, day] =
      value.split("-");

    return `${day}/${month}/${year}`;
  }

  function renderFavorite({
    item,
  }: {
    item: Apod;
  }) {
    return (
      <View style={styles.card}>
        {item.media_type === "image" ? (
          <Image
            source={{ uri: item.url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View
            style={styles.videoContainer}
          >
            <Ionicons
              name="videocam-outline"
              size={45}
              color="#8B5CF6"
            />

            <Text style={styles.videoText}>
              Video content
            </Text>
          </View>
        )}

        <View style={styles.cardContent}>
          <View style={styles.titleRow}>
            <Ionicons
              name="planet-outline"
              size={20}
              color="#A78BFA"
            />

            <Text
              style={styles.cardTitle}
              numberOfLines={2}
            >
              {item.title}
            </Text>
          </View>

          <View style={styles.dateRow}>
            <Ionicons
              name="calendar-outline"
              size={15}
              color="#8B5CF6"
            />

            <Text style={styles.date}>
              {formatDate(item.date)}
            </Text>
          </View>

          <Text
            style={styles.description}
            numberOfLines={4}
          >
            {item.explanation}
          </Text>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() =>
              handleRemove(item)
            }
            activeOpacity={0.7}
          >
            <Ionicons
              name="heart"
              size={19}
              color="#FF6B8A"
            />

            <Text style={styles.removeText}>
              Remove Favorite
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View
        style={styles.loadingContainer}
      >
        <ActivityIndicator
          size="large"
          color="#8B5CF6"
        />

        <Text style={styles.loadingText}>
          Loading favorites...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons
            name="heart"
            size={27}
            color="#FF6B8A"
          />
        </View>

        <View
          style={
            styles.headerTextContainer
          }
        >
          <Text style={styles.title}>
            My Favorites
          </Text>

          <Text style={styles.subtitle}>
            Your discoveries across the universe
          </Text>
        </View>
      </View>

      {favorites.length === 0 ? (
        <View
          style={styles.emptyContainer}
        >
          <View style={styles.emptyIcon}>
            <Ionicons
              name="planet-outline"
              size={58}
              color="#8B5CF6"
            />
          </View>

          <Text style={styles.emptyTitle}>
            No favorites yet
          </Text>

          <Text style={styles.emptyText}>
            Explore NASA images and tap
            the heart to save your
            favorites.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) =>
            item.date
          }
          renderItem={renderFavorite}
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.list
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070B17",
    paddingTop: 55,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#070B17",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#A5AABD",
    fontSize: 14,
    marginTop: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 25,
  },

  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#29143A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  headerTextContainer: {
    flex: 1,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
  },

  subtitle: {
    color: "#8C93A8",
    fontSize: 13,
    marginTop: 3,
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "#11182A",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#202A40",
  },

  image: {
    width: "100%",
    height: 190,
    backgroundColor: "#090E1B",
  },

  videoContainer: {
    width: "100%",
    height: 190,
    backgroundColor: "#090E1B",
    justifyContent: "center",
    alignItems: "center",
  },

  videoText: {
    color: "#8C93A8",
    fontSize: 13,
    marginTop: 8,
  },

  cardContent: {
    padding: 17,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  cardTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24,
    marginLeft: 8,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },

  date: {
    color: "#8B5CF6",
    fontSize: 13,
    marginLeft: 6,
  },

  description: {
    color: "#9299AB",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
  },

  removeButton: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 9,
    paddingHorizontal: 13,
    backgroundColor: "#29143A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4A1D45",
    gap: 7,
  },

  removeText: {
    color: "#FF7A9C",
    fontSize: 14,
    fontWeight: "700",
  },

  emptyContainer: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
  },

  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#11182A",
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
    marginTop: 18,
  },

  emptyText: {
    color: "#8C93A8",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 9,
  },
});