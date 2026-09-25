import React, { useState } from "react"
import {ActivityIndicator,Alert,Image,Linking,Platform,ScrollView,StyleSheet,Text,TouchableOpacity,View} from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { Apod, getApodByDate } from "../services/nasaApi"
import { isFavorite, toggleFavorite } from "../storage/favorites"

export default function ExploreScreen() {
    const [date, setDate] = useState("")
    const [pickerDate, setPickerDate] = useState(new Date())
    const [showPicker, setShowPicker] = useState(false)
    const [apod, setApod] = useState<Apod | null>(null)
    const [loading, setLoading] = useState(false)
    const [favorite, setFavorite] = useState(false)

    function apiDate(value: Date) {
        const year = value.getFullYear()
        const month = String(value.getMonth() + 1).padStart(2, "0")
        const day = String(value.getDate()).padStart(2, "0")
        return `${year}-${month}-${day}`
    }

    function formatDate(value: string) {
        return value.split("-").reverse().join("/")
    }

    async function handleExplore() {
        if (!date) return Alert.alert("Date required", "Choose a date first.")

        try {
            setLoading(true)
            setApod(null)

            const result = await getApodByDate(date)
            setApod(result)
            setFavorite(await isFavorite(result.date))
        } catch {
            Alert.alert("Error", "Could not find a NASA APOD for this date.")
        } finally {
            setLoading(false)
        }
    }

    async function handleFavorite() {
        if (!apod) return
        setFavorite(await toggleFavorite(apod))
    }

    async function handleWatchVideo() {
        if (apod?.url) await Linking.openURL(apod.url)
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.headerIcon}>
                        <Ionicons name="telescope-outline" size={30} color="#A78BFA" />
                    </View>

                    <View>
                        <Text style={styles.title}>Explore the Universe</Text>
                        <Text style={styles.subtitle}>Discover the universe through time</Text>
                    </View>
                </View>

                <View style={styles.searchCard}>
                    <Text style={styles.label}>Choose a date</Text>

                    <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
                        <Ionicons name="calendar-outline" size={21} color="#8B5CF6" />

                        <Text style={[styles.inputText, !date && styles.placeholder]}>
                            {date ? formatDate(date) : "Select a date"}
                        </Text>

                        <Ionicons name="chevron-down" size={18} color="#697086" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.exploreButton} onPress={handleExplore}>
                        <Ionicons name="search-outline" size={20} color="#FFF" />
                        <Text style={styles.exploreButtonText}>Explore</Text>
                    </TouchableOpacity>
                </View>

                {showPicker && (
                    <DateTimePicker
                        value={pickerDate}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        minimumDate={new Date(1995, 5, 16)}
                        maximumDate={new Date()}
                        onChange={(event, selectedDate) => {
                            if (Platform.OS === "android") setShowPicker(false)
                            if (!selectedDate) return

                            setPickerDate(selectedDate)
                            setDate(apiDate(selectedDate))
                        }}
                    />
                )}

                {showPicker && Platform.OS === "ios" && (
                    <TouchableOpacity style={styles.doneButton} onPress={() => setShowPicker(false)}>
                        <Text style={styles.doneText}>Done</Text>
                    </TouchableOpacity>
                )}

                {loading && (
                    <View style={styles.loading}>
                        <ActivityIndicator size="large" color="#8B5CF6" />
                        <Text style={styles.loadingText}>Exploring the universe...</Text>
                    </View>
                )}

                {apod && !loading && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.resultLabel}>ASTRONOMY PICTURE OF THE DAY</Text>
                            <Text style={styles.date}>{formatDate(apod.date)}</Text>
                        </View>

                        {apod.media_type === "image" ? (
                            <Image source={{ uri: apod.url }} style={styles.image} />
                        ) : (
                            <View style={styles.video}>
                                <Ionicons name="play-circle-outline" size={55} color="#A78BFA" />
                                <Text style={styles.videoTitle}>NASA Video</Text>

                                <TouchableOpacity style={styles.watchButton} onPress={handleWatchVideo}>
                                    <Text style={styles.watchButtonText}>Watch Video</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.cardContent}>
                            <Text style={styles.apodTitle}>{apod.title}</Text>
                            <Text style={styles.description}>{apod.explanation}</Text>

                            {apod.copyright && (
                                <Text style={styles.copyright}>© {apod.copyright}</Text>
                            )}

                            <TouchableOpacity
                                style={[styles.favoriteButton, favorite && styles.favoriteActive]}
                                onPress={handleFavorite}
                            >
                                <Ionicons
                                    name={favorite ? "heart" : "heart-outline"}
                                    size={21}
                                    color={favorite ? "#FF6B8A" : "#A78BFA"}
                                />

                                <Text style={styles.favoriteText}>
                                    {favorite ? "Remove from Favorites" : "Add to Favorites"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#070B17"
    },
    content: {
        padding: 20,
        paddingTop: 55,
        paddingBottom: 50
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 30
    },
    headerIcon: {
        width: 54,
        height: 54,
        borderRadius: 17,
        backgroundColor: "#17122D",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 13
    },
    title: {
        color: "#FFF",
        fontSize: 25,
        fontWeight: "800"
    },
    subtitle: {
        color: "#8C93A8",
        fontSize: 13,
        marginTop: 3
    },
    searchCard: {
        backgroundColor: "#11182A",
        padding: 18,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#202A40"
    },
    label: {
        color: "#FFF",
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 10
    },
    input: {
        height: 55,
        backgroundColor: "#090E1B",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#293249",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15
    },
    inputText: {
        flex: 1,
        color: "#FFF",
        fontSize: 16,
        marginLeft: 11
    },
    placeholder: {
        color: "#697086"
    },
    exploreButton: {
        height: 54,
        backgroundColor: "#6D28D9",
        borderRadius: 14,
        marginTop: 15,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8
    },
    exploreButtonText: {
        color: "#FFF",
        fontWeight: "700"
    },
    doneButton: {
        height: 45,
        backgroundColor: "#6D28D9",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10
    },
    doneText: {
        color: "#FFF",
        fontWeight: "700"
    },
    loading: {
        alignItems: "center",
        marginTop: 50
    },
    loadingText: {
        color: "#A5AABD",
        marginTop: 12
    },
    card: {
        backgroundColor: "#11182A",
        borderRadius: 20,
        marginTop: 25,
        overflow: "hidden"
    },
    cardHeader: {
        padding: 18
    },
    resultLabel: {
        color: "#8B5CF6",
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 1
    },
    date: {
        color: "#A5AABD",
        fontSize: 13,
        marginTop: 7
    },
    image: {
        width: "100%",
        height: 260
    },
    video: {
        height: 250,
        backgroundColor: "#090E1B",
        alignItems: "center",
        justifyContent: "center"
    },
    videoTitle: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "700",
        marginTop: 10
    },
    watchButton: {
        backgroundColor: "#6D28D9",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 15
    },
    watchButtonText: {
        color: "#FFF",
        fontWeight: "700"
    },
    cardContent: {
        padding: 18
    },
    apodTitle: {
        color: "#FFF",
        fontSize: 21,
        fontWeight: "800"
    },
    description: {
        color: "#A5AABD",
        fontSize: 14,
        lineHeight: 22,
        marginTop: 14
    },
    copyright: {
        color: "#697086",
        fontSize: 12,
        marginTop: 15
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
        gap: 8
    },
    favoriteActive: {
        borderColor: "#EF476F"
    },
    favoriteText: {
        color: "#A78BFA",
        fontWeight: "700"
    }
})