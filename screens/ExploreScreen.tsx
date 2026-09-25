import React, { useState } from "react"
import {View,Text,TouchableOpacity,Image,StyleSheet,ScrollView,ActivityIndicator,Alert,KeyboardAvoidingView,Platform,Linking,Modal} from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { Apod, getApodByDate } from "../services/nasaApi"
import { isFavorite, toggleFavorite } from "../storage/favorites"

export default function ExploreScreen() {
    const [date, setDate] = useState("")
    const [apod, setApod] = useState<Apod | null>(null)
    const [loading, setLoading] = useState(false)
    const [favorite, setFavorite] = useState(false)
    const [calendarVisible, setCalendarVisible] = useState(false)
    const [showMonthPicker, setShowMonthPicker] = useState(false)
    const [showYearPicker, setShowYearPicker] = useState(false)

    const [calendarMonth, setCalendarMonth] = useState(() => {
        const today = new Date()
        return new Date(today.getFullYear(), today.getMonth(), 1)
    })

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    const years = Array.from(
        { length: new Date().getFullYear() - 1995 + 1 },
        (_, index) => new Date().getFullYear() - index
    )

    function formatDateForApi(year: number, month: number, day: number) {
        return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    }

    function formatDate(value: string) {
        const [year, month, day] = value.split("-")
        return `${day}/${month}/${year}`
    }

    function openCalendar() {
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            const [year, month] = date.split("-").map(Number)
            setCalendarMonth(new Date(year, month - 1, 1))
        }

        setShowMonthPicker(false)
        setShowYearPicker(false)
        setCalendarVisible(true)
    }

    function closeCalendar() {
        setShowMonthPicker(false)
        setShowYearPicker(false)
        setCalendarVisible(false)
    }

    function selectCalendarDay(day: number) {
        const year = calendarMonth.getFullYear()
        const month = calendarMonth.getMonth()

        setDate(formatDateForApi(year, month, day))
        closeCalendar()
    }

    function selectMonth(month: number) {
        const year = calendarMonth.getFullYear()
        setCalendarMonth(new Date(year, month, 1))
        setShowMonthPicker(false)
    }

    function selectYear(year: number) {
        const currentMonth = calendarMonth.getMonth()
        const today = new Date()

        const month =
            year === today.getFullYear() && currentMonth > today.getMonth()
                ? today.getMonth()
                : currentMonth

        setCalendarMonth(new Date(year, month, 1))
        setShowYearPicker(false)
    }

    function renderCalendarDays() {
        const year = calendarMonth.getFullYear()
        const month = calendarMonth.getMonth()
        const firstWeekday = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const today = new Date()
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const apodStartDate = new Date(1995, 5, 16)
        const cells = []

        for (let i = 0; i < firstWeekday; i++) {
            cells.push(
                <View
                    key={`empty-${i}`}
                    style={styles.calendarDay}
                />
            )
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const current = new Date(year, month, day)
            const future = current > todayOnly
            const beforeApod = current < apodStartDate
            const disabled = future || beforeApod
            const value = formatDateForApi(year, month, day)
            const selected = date === value

            cells.push(
                <TouchableOpacity
                    key={day}
                    style={[
                        styles.calendarDay,
                        selected && styles.calendarDaySelected
                    ]}
                    onPress={() => selectCalendarDay(day)}
                    disabled={disabled}
                >
                    <Text
                        style={[
                            styles.calendarDayText,
                            disabled && styles.calendarDayDisabled,
                            selected && styles.calendarDayTextSelected
                        ]}
                    >
                        {day}
                    </Text>
                </TouchableOpacity>
            )
        }

        return cells
    }

    async function handleExplore() {
        if (!date.trim()) {
            Alert.alert("Date required", "Choose a date first.")
            return
        }

        try {
            setLoading(true)
            setApod(null)

            const result = await getApodByDate(date)

            setApod(result)

            const saved = await isFavorite(result.date)
            setFavorite(saved)
        } catch (error) {
            console.log("Error fetching APOD:", error)
            Alert.alert("Error", "Could not find a NASA APOD for this date.")
        } finally {
            setLoading(false)
        }
    }

    async function handleFavorite() {
        if (!apod) return

        try {
            const newStatus = await toggleFavorite(apod)
            setFavorite(newStatus)
        } catch (error) {
            console.log("Error updating favorite:", error)
            Alert.alert("Error", "Could not update your favorites.")
        }
    }

    async function handleWatchVideo() {
        if (!apod?.url) return

        try {
            const supported = await Linking.canOpenURL(apod.url)

            if (supported) {
                await Linking.openURL(apod.url)
            } else {
                Alert.alert("Error", "This video URL cannot be opened.")
            }
        } catch (error) {
            console.log("Error opening video:", error)
            Alert.alert("Error", "Could not open this video.")
        }
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
                        <Ionicons name="telescope-outline" size={30} color="#A78BFA" />
                    </View>

                    <View style={styles.headerText}>
                        <Text style={styles.title}>Explore the Universe</Text>
                        <Text style={styles.subtitle}>Discover the universe through time</Text>
                    </View>
                </View>

                <View style={styles.searchCard}>
                    <Text style={styles.label}>Choose a date</Text>

                    <TouchableOpacity
                        style={styles.inputContainer}
                        onPress={openCalendar}
                    >
                        <Ionicons name="calendar-outline" size={21} color="#8B5CF6" />

                        <Text style={[styles.input, !date && styles.inputPlaceholder]}>
                            {date ? formatDate(date) : "Select a date"}
                        </Text>

                        <Ionicons name="chevron-down" size={18} color="#697086" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.exploreButton}
                        onPress={handleExplore}
                    >
                        <Ionicons name="search-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.exploreButtonText}>Explore</Text>
                    </TouchableOpacity>
                </View>

                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#8B5CF6" />
                        <Text style={styles.loadingText}>Exploring the universe...</Text>
                    </View>
                )}

                {apod && !loading && (
                    <View style={styles.resultCard}>
                        <View style={styles.resultHeader}>
                            <Text style={styles.resultLabel}>
                                ASTRONOMY PICTURE OF THE DAY
                            </Text>

                            <View style={styles.dateRow}>
                                <Ionicons name="calendar-outline" size={15} color="#8C93A8" />
                                <Text style={styles.resultDate}>{formatDate(apod.date)}</Text>
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
                                    <Ionicons name="play" size={34} color="#FFFFFF" />
                                </View>

                                <Text style={styles.videoTitle}>NASA Video</Text>

                                <Text style={styles.videoText}>
                                    The Astronomy Picture of the Day for this date is a video.
                                </Text>

                                <TouchableOpacity
                                    style={styles.watchButton}
                                    onPress={handleWatchVideo}
                                >
                                    <Ionicons name="play-circle-outline" size={21} color="#FFFFFF" />
                                    <Text style={styles.watchButtonText}>Watch Video</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.resultContent}>
                            <View style={styles.apodTitleRow}>
                                <Ionicons
                                    name={apod.media_type === "video" ? "videocam-outline" : "planet-outline"}
                                    size={22}
                                    color="#A78BFA"
                                />

                                <Text style={styles.apodTitle}>{apod.title}</Text>
                            </View>

                            <Text style={styles.description}>
                                {apod.explanation}
                            </Text>

                            {apod.copyright && (
                                <View style={styles.copyrightRow}>
                                    <Ionicons name="person-outline" size={15} color="#697086" />
                                    <Text style={styles.copyright}>{apod.copyright}</Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={[
                                    styles.favoriteButton,
                                    favorite && styles.favoriteButtonActive
                                ]}
                                onPress={handleFavorite}
                            >
                                <Ionicons
                                    name={favorite ? "heart" : "heart-outline"}
                                    size={22}
                                    color={favorite ? "#FF6B8A" : "#A78BFA"}
                                />

                                <Text
                                    style={[
                                        styles.favoriteText,
                                        favorite && styles.favoriteTextActive
                                    ]}
                                >
                                    {favorite ? "Remove from Favorites" : "Add to Favorites"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>

            <Modal
                visible={calendarVisible}
                transparent
                animationType="fade"
                onRequestClose={closeCalendar}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.calendarCard}>
                        <View style={styles.calendarHeader}>
                            <TouchableOpacity
                                style={styles.calendarSelect}
                                onPress={() => {
                                    setShowYearPicker(false)
                                    setShowMonthPicker(true)
                                }}
                            >
                                <Text style={styles.calendarSelectText}>
                                    {monthNames[calendarMonth.getMonth()]}
                                </Text>

                                <Ionicons name="chevron-down" size={16} color="#A78BFA" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.calendarSelect}
                                onPress={() => {
                                    setShowMonthPicker(false)
                                    setShowYearPicker(true)
                                }}
                            >
                                <Text style={styles.calendarSelectText}>
                                    {calendarMonth.getFullYear()}
                                </Text>

                                <Ionicons name="chevron-down" size={16} color="#A78BFA" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.weekRow}>
                            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                                <Text
                                    key={`${day}-${index}`}
                                    style={styles.weekDay}
                                >
                                    {day}
                                </Text>
                            ))}
                        </View>

                        <View style={styles.calendarGrid}>
                            {renderCalendarDays()}
                        </View>

                        <TouchableOpacity
                            style={styles.calendarCancel}
                            onPress={closeCalendar}
                        >
                            <Text style={styles.calendarCancelText}>Cancel</Text>
                        </TouchableOpacity>

                        {showMonthPicker && (
                            <View style={styles.pickerOverlay}>
                                <View style={styles.pickerHeader}>
                                    <Text style={styles.pickerTitle}>Choose month</Text>

                                    <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                                        <Ionicons name="close" size={24} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.monthGrid}>
                                    {monthNames.map((month, index) => {
                                        const today = new Date()

                                        const disabled =
                                            calendarMonth.getFullYear() === today.getFullYear() &&
                                            index > today.getMonth()

                                        return (
                                            <TouchableOpacity
                                                key={month}
                                                style={[
                                                    styles.monthOption,
                                                    calendarMonth.getMonth() === index &&
                                                    styles.pickerOptionSelected
                                                ]}
                                                disabled={disabled}
                                                onPress={() => selectMonth(index)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.pickerOptionText,
                                                        disabled && styles.pickerOptionDisabled
                                                    ]}
                                                >
                                                    {month.substring(0, 3)}
                                                </Text>
                                            </TouchableOpacity>
                                        )
                                    })}
                                </View>
                            </View>
                        )}

                        {showYearPicker && (
                            <View style={styles.pickerOverlay}>
                                <View style={styles.pickerHeader}>
                                    <Text style={styles.pickerTitle}>Choose year</Text>

                                    <TouchableOpacity onPress={() => setShowYearPicker(false)}>
                                        <Ionicons name="close" size={24} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView
                                    style={styles.yearList}
                                    showsVerticalScrollIndicator={false}
                                >
                                    {years.map(year => (
                                        <TouchableOpacity
                                            key={year}
                                            style={[
                                                styles.yearOption,
                                                calendarMonth.getFullYear() === year &&
                                                styles.pickerOptionSelected
                                            ]}
                                            onPress={() => selectYear(year)}
                                        >
                                            <Text style={styles.pickerOptionText}>
                                                {year}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
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
    headerText: {
        flex: 1
    },
    title: {
        color: "#FFFFFF",
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
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 10
    },
    inputContainer: {
        height: 55,
        backgroundColor: "#090E1B",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#293249",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15
    },
    input: {
        flex: 1,
        color: "#FFFFFF",
        fontSize: 16,
        marginLeft: 11
    },
    inputPlaceholder: {
        color: "#697086"
    },
    exploreButton: {
        height: 54,
        backgroundColor: "#6D28D9",
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 15,
        flexDirection: "row",
        gap: 8
    },
    exploreButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700"
    },
    loadingContainer: {
        alignItems: "center",
        marginTop: 50
    },
    loadingText: {
        color: "#A5AABD",
        marginTop: 12,
        fontSize: 14
    },
    resultCard: {
        backgroundColor: "#11182A",
        borderRadius: 22,
        marginTop: 25,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#202A40"
    },
    resultHeader: {
        padding: 18
    },
    resultLabel: {
        color: "#8B5CF6",
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 1
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8
    },
    resultDate: {
        color: "#A5AABD",
        marginLeft: 6,
        fontSize: 13
    },
    image: {
        width: "100%",
        height: 260,
        backgroundColor: "#090E1B"
    },
    videoPlaceholder: {
        minHeight: 270,
        backgroundColor: "#090E1B",
        justifyContent: "center",
        alignItems: "center",
        padding: 25
    },
    videoIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "#6D28D9",
        justifyContent: "center",
        alignItems: "center"
    },
    videoTitle: {
        color: "#FFFFFF",
        fontSize: 19,
        fontWeight: "800",
        marginTop: 15
    },
    videoText: {
        color: "#A5AABD",
        fontSize: 13,
        textAlign: "center",
        lineHeight: 19,
        marginTop: 7,
        maxWidth: 280
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
        marginTop: 18
    },
    watchButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700"
    },
    resultContent: {
        padding: 18
    },
    apodTitleRow: {
        flexDirection: "row",
        alignItems: "flex-start"
    },
    apodTitle: {
        flex: 1,
        color: "#FFFFFF",
        fontSize: 21,
        fontWeight: "800",
        lineHeight: 28,
        marginLeft: 9
    },
    description: {
        color: "#A5AABD",
        fontSize: 14,
        lineHeight: 22,
        marginTop: 14
    },
    copyrightRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 15
    },
    copyright: {
        color: "#697086",
        fontSize: 12,
        marginLeft: 6,
        flex: 1
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
    favoriteButtonActive: {
        backgroundColor: "#29143A",
        borderColor: "#EF476F"
    },
    favoriteText: {
        color: "#A78BFA",
        fontSize: 15,
        fontWeight: "700"
    },
    favoriteTextActive: {
        color: "#FF7A9C"
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.72)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20
    },
    calendarCard: {
        width: "100%",
        maxWidth: 380,
        backgroundColor: "#11182A",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#202A40",
        padding: 18,
        overflow: "hidden"
    },
    calendarHeader: {
        flexDirection: "row",
        marginBottom: 20,
        gap: 10
    },
    calendarSelect: {
        flex: 1,
        height: 48,
        backgroundColor: "#171F33",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#293249",
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    calendarSelectText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700"
    },
    weekRow: {
        flexDirection: "row",
        marginBottom: 6
    },
    weekDay: {
        width: "14.2857%",
        textAlign: "center",
        color: "#697086",
        fontSize: 12,
        fontWeight: "700"
    },
    calendarGrid: {
        flexDirection: "row",
        flexWrap: "wrap"
    },
    calendarDay: {
        width: "14.2857%",
        height: 42,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10
    },
    calendarDaySelected: {
        backgroundColor: "#6D28D9"
    },
    calendarDayText: {
        color: "#E5E7EB",
        fontSize: 14,
        fontWeight: "600"
    },
    calendarDayDisabled: {
        color: "#3F4658"
    },
    calendarDayTextSelected: {
        color: "#FFFFFF",
        fontWeight: "800"
    },
    calendarCancel: {
        height: 46,
        marginTop: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#171F33"
    },
    calendarCancelText: {
        color: "#A78BFA",
        fontSize: 14,
        fontWeight: "700"
    },
    pickerOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#11182A",
        padding: 18,
        zIndex: 10
    },
    pickerHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16
    },
    pickerTitle: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "800"
    },
    monthGrid: {
        flexDirection: "row",
        flexWrap: "wrap"
    },
    monthOption: {
        width: "33.333%",
        height: 62,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12
    },
    yearList: {
        maxHeight: 330
    },
    yearOption: {
        height: 48,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        marginBottom: 4
    },
    pickerOptionSelected: {
        backgroundColor: "#6D28D9"
    },
    pickerOptionText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700"
    },
    pickerOptionDisabled: {
        color: "#3F4658"
    }
})