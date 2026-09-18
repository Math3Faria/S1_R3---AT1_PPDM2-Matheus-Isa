import React, { useEffect, useState } from "react"
import { ActivityIndicator, Image, Linking, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type Apod = {
    title: string
    date: string
    explanation: string
    url: string
    hdurl?: string
    media_type: string
}

const NASA_API_KEY = "DEMO_KEY"

export default function HomeScreen() {
    const [apod, setApod] = useState<Apod | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [favorito, setFavorito] = useState(false)

    async function buscarApod() {
        try {
            setLoading(true)
            setError(false)
            const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`)
            if (!response.ok) throw new Error()
            const data = await response.json()
            setApod(data)
        } catch {
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        buscarApod()
    }, [])

    function formatarData(data: string) {
        const [ano, mes, dia] = data.split("-")
        return `${dia}/${mes}/${ano}`
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.texto}>Carregando...</Text>
            </SafeAreaView>
        )
    }

    if (error || !apod) {
        return (
            <SafeAreaView style={styles.center}>
                <Text style={styles.texto}>Erro ao carregar a imagem.</Text>
                <TouchableOpacity style={styles.botao} onPress={buscarApod}>
                    <Text style={styles.botaoTexto}>Tentar novamente</Text>
                </TouchableOpacity>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.logo}>NASA Explorer</Text>
                    <Text style={styles.subtitulo}>Imagem astronômica do dia</Text>
                </View>

                <View style={styles.card}>
                    {apod.media_type === "image" ? (
                        <Image source={{ uri: apod.hdurl || apod.url }} style={styles.image} />
                    ) : (
                        <TouchableOpacity style={styles.video} onPress={() => Linking.openURL(apod.url)}>
                            <Text style={styles.texto}>Assistir vídeo</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.content}>
                        <Text style={styles.data}>{formatarData(apod.date)}</Text>
                        <Text style={styles.title}>{apod.title}</Text>
                        <Text style={styles.description}>{apod.explanation}</Text>

                        <TouchableOpacity style={[styles.botao, favorito && styles.favoritado]} onPress={() => setFavorito(!favorito)}>
                            <Text style={styles.botaoTexto}>{favorito ? "Favoritado" : "Favoritar"}</Text>
                        </TouchableOpacity>
                    </View>
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
    center: {
        flex: 1,
        backgroundColor: "#080B18",
        justifyContent: "center",
        alignItems: "center"
    },
    header: {
        padding: 20
    },
    logo: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "bold"
    },
    subtitulo: {
        color: "#999999",
        marginTop: 5
    },
    card: {
        backgroundColor: "#12162A",
        margin: 15,
        borderRadius: 15,
        overflow: "hidden"
    },
    image: {
        width: "100%",
        height: 280
    },
    video: {
        height: 250,
        justifyContent: "center",
        alignItems: "center"
    },
    content: {
        padding: 18
    },
    data: {
        color: "#999999",
        marginBottom: 8
    },
    title: {
        color: "#FFFFFF",
        fontSize: 21,
        fontWeight: "bold",
        marginBottom: 15
    },
    description: {
        color: "#CCCCCC",
        fontSize: 14,
        lineHeight: 21
    },
    texto: {
        color: "#FFFFFF",
        marginTop: 10
    },
    botao: {
        backgroundColor: "#FFFFFF",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20
    },
    favoritado: {
        backgroundColor: "#5968E9"
    },
    botaoTexto: {
        color: "#080B18",
        fontWeight: "bold"
    }
})