import React, { useEffect, useState } from "react"
import {ActivityIndicator,Image,ScrollView,StyleSheet,Text,TouchableOpacity,View} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Ionicons from "@expo/vector-icons/Ionicons"

const NASA_API_KEY = "DEMO_KEY"

export default function HomeScreen({ navigation }: any) {
    const [apod, setApod] = useState<any>(null)

    useEffect(() => {
        fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`)
            .then(res => res.json())
            .then(setApod)
            .catch(() => {})
    }, [])

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.intro}>
                    <Ionicons name="planet-outline" size={40} color="#A78BFA" />

                    <Text style={styles.logo}>NASA EXPLORER</Text>

                    <Text style={styles.title}>
                        Explore o universo{"\n"}todos os dias.
                    </Text>

                    <Text style={styles.description}>
                        Descubra imagens astronômicas da NASA,
                        conheça suas histórias e salve suas favoritas.
                    </Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate("Explore")}
                    >
                        <Ionicons name="rocket-outline" size={20} color="#FFF" />
                        <Text style={styles.buttonText}>Começar a explorar</Text>
                    </TouchableOpacity>

                    <View style={styles.features}>
                        <Text style={styles.feature}>🔭 Explore imagens por data</Text>
                        <Text style={styles.feature}>♡  Salve suas favoritas</Text>
                        <Text style={styles.feature}>🌌 Descubra o universo</Text>
                    </View>
                </View>

                <View style={styles.today}>
                    <Text style={styles.section}>IMAGEM DO DIA</Text>

                    {!apod ? (
                        <ActivityIndicator color="#A78BFA" />
                    ) : (
                        <View style={styles.card}>
                            {apod.media_type === "image" && (
                                <Image
                                    source={{ uri: apod.url }}
                                    style={styles.image}
                                />
                            )}

                            <View style={styles.cardContent}>
                                <Text style={styles.date}>
                                    {apod.date.split("-").reverse().join("/")}
                                </Text>

                                <Text style={styles.cardTitle}>
                                    {apod.title}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#080B18"
    },
    intro: {
        padding: 25,
        paddingTop: 35
    },
    logo: {
        color: "#A78BFA",
        fontSize: 14,
        fontWeight: "700",
        letterSpacing: 2,
        marginTop: 12
    },
    title: {
        color: "#FFF",
        fontSize: 32,
        fontWeight: "bold",
        lineHeight: 40,
        marginTop: 14
    },
    description: {
        color: "#9CA3AF",
        fontSize: 15,
        lineHeight: 22,
        marginTop: 14
    },
    button: {
        height: 52,
        backgroundColor: "#6D28D9",
        borderRadius: 14,
        marginTop: 25,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8
    },
    buttonText: {
        color: "#FFF",
        fontWeight: "700"
    },
    features: {
        marginTop: 28,
        gap: 12
    },
    feature: {
        color: "#B5B8C5",
        fontSize: 14
    },
    today: {
        padding: 20,
        paddingTop: 15
    },
    section: {
        color: "#A78BFA",
        fontSize: 13,
        fontWeight: "700",
        letterSpacing: 1.5,
        marginBottom: 14
    },
    card: {
        backgroundColor: "#12162A",
        borderRadius: 15,
        overflow: "hidden"
    },
    image: {
        width: "100%",
        height: 210
    },
    cardContent: {
        padding: 16
    },
    date: {
        color: "#8B8FA3",
        fontSize: 13
    },
    cardTitle: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "700",
        marginTop: 5
    }
})