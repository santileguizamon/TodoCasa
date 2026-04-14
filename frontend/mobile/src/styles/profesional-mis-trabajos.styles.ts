import { StyleSheet } from "react-native";
import { SPACING, RADIUS } from "../theme";

export const profesionalMisTrabajosStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF2FF",
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
    backgroundColor: "#C7DBFF",
    borderColor: "#AFC9F9",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: SPACING.md,
  },
  heroKicker: {
    fontSize: 11,
    fontWeight: "800",
    color: "#27538D",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroTitle: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: "800",
    color: "#0F2A52",
  },
  heroSubtitle: {
    marginTop: 6,
    color: "#365D8F",
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
    borderColor: "#BED4FA",
    backgroundColor: "#E9F1FF",
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  tabButtonText: {
    color: "#245CB8",
    fontWeight: "700",
    fontSize: 13,
  },
  tabButtonTextActive: {
    color: "#FFFFFF",
  },
  card: {
    backgroundColor: "#F7FAFF",
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: "#D6E2F5",
    shadowColor: "#2563EB",
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
    color: "#0F2A52",
    flex: 1,
  },
  cliente: {
    marginTop: 8,
    color: "#3D628F",
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
    color: "#486A96",
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
    backgroundColor: "#F7FAFF",
    borderWidth: 1,
    borderColor: "#D6E2F5",
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
  },
  emptyTitle: {
    color: "#173A6B",
    fontWeight: "800",
    fontSize: 15,
  },
  emptyText: {
    marginTop: 6,
    color: "#4B6E98",
    textAlign: "center",
  },
});
