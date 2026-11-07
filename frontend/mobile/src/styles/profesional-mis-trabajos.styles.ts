import { StyleSheet } from "react-native";
import { SPACING, RADIUS } from "../theme";

export const profesionalMisTrabajosStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4EFFF",
    paddingHorizontal: SPACING.lg,
    paddingTop: 30,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: SPACING.lg,
  },
  headerBlock: {
    marginBottom: SPACING.md,
  },
  heroCard: {
    backgroundColor: "#E2D4FF",
    borderColor: "#D1BCFB",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: SPACING.md,
  },
  heroKicker: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4C2D87",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroTitle: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: "800",
    color: "#2A125E",
  },
  heroSubtitle: {
    marginTop: 6,
    color: "#5B3D98",
    lineHeight: 19,
  },
  tabsContainer: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  tabButton: {
    flex: 1,
    minHeight: 40,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1BCFB",
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonActive: {
    backgroundColor: "#7C3AED",
    borderColor: "#7C3AED",
  },
  tabButtonText: {
    color: "#6D28D9",
    fontWeight: "700",
    fontSize: 13,
  },
  tabButtonTextActive: {
    color: "#FFFFFF",
  },
  card: {
    backgroundColor: "#FAF7FF",
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: "#E9E1F7",
    shadowColor: "#7C3AED",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  titulo: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2A125E",
    flex: 1,
  },
  cliente: {
    marginTop: 8,
    color: "#5B3D98",
    fontWeight: "600",
  },
  estadoBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  estadoBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  metaRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    color: "#6B4BAA",
    fontSize: 12,
    fontWeight: "600",
  },
  ratingBlock: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  valoracion: {
    color: "#9A3412",
    fontWeight: "600",
    flex: 1,
  },
  emptyContainer: {
    marginTop: 36,
    alignItems: "center",
    backgroundColor: "#FAF7FF",
    borderWidth: 1,
    borderColor: "#E9E1F7",
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
  },
  emptyTitle: {
    color: "#3B0764",
    fontWeight: "800",
    fontSize: 15,
  },
  emptyText: {
    marginTop: 6,
    color: "#6B4BAA",
    textAlign: "center",
  },
});
