import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

export const restaurantStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: COLORS.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textLight,
    },
    listContainer: {
        padding: 20,
    },
    restaurantCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: "hidden",
    },
    restaurantImage: {
        width: "100%",
        height: 180,
    },
    restaurantInfo: {
        padding: 16,
    },
    restaurantName: {
        fontSize: 18,
        fontWeight: "bold",
        color: COLORS.text,
        marginBottom: 4,
    },
    restaurantCuisine: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: "600",
        marginBottom: 8,
    },
    restaurantDescription: {
        fontSize: 14,
        color: COLORS.textLight,
        lineHeight: 20,
        marginBottom: 12,
    },
    restaurantMeta: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        marginRight: 12,
    },
    restaurantAddress: {
        fontSize: 12,
        color: COLORS.textLight,
        marginLeft: 4,
        flex: 1,
    },
    viewMenuButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    viewMenuText: {
        color: COLORS.white,
        fontWeight: "600",
        fontSize: 14,
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: COLORS.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: COLORS.textLight,
        textAlign: "center",
        lineHeight: 24,
    },
});