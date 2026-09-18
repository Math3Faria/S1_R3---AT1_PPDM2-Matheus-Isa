import AsyncStorage from "@react-native-async-storage/async-storage";
import { Apod } from "../services/nasaApi";

const FAVORITES_KEY = "@nasa_explorer:favorites";

export async function getFavorites(): Promise<Apod[]> {
  try {
    const favorites = await AsyncStorage.getItem(FAVORITES_KEY);

    if (!favorites) {
      return [];
    }

    return JSON.parse(favorites);
  } catch (error) {
    console.log("Erro ao carregar favoritos:", error);
    return [];
  }
}

export async function addFavorite(apod: Apod): Promise<void> {
  try {
    const favorites = await getFavorites();

    const alreadyExists = favorites.some(
      (favorite) => favorite.date === apod.date
    );

    if (alreadyExists) {
      return;
    }

    const updatedFavorites = [apod, ...favorites];

    await AsyncStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(updatedFavorites)
    );
  } catch (error) {
    console.log("Erro ao adicionar favorito:", error);
  }
}

export async function removeFavorite(date: string): Promise<void> {
  try {
    const favorites = await getFavorites();

    const updatedFavorites = favorites.filter(
      (favorite) => favorite.date !== date
    );

    await AsyncStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(updatedFavorites)
    );
  } catch (error) {
    console.log("Erro ao remover favorito:", error);
  }
}

export async function isFavorite(date: string): Promise<boolean> {
  const favorites = await getFavorites();

  return favorites.some((favorite) => favorite.date === date);
}

export async function toggleFavorite(apod: Apod): Promise<boolean> {
  const favorite = await isFavorite(apod.date);

  if (favorite) {
    await removeFavorite(apod.date);
    return false;
  }

  await addFavorite(apod);
  return true;
}