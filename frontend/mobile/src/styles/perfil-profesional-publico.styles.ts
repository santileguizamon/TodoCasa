import { StyleSheet } from "react-native";
import { SPACING, RADIUS } from "../theme";

export const perfilProfesionalPublicoStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF2FF",
  },
  content: {
    paddingTop: 30,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    gap: SPACING.md,
  },
  heroCard: {
    backgroundColor: "#C7DBFF",
    borderColor: "#AFC9F9",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    shadowColor: "#2563EB",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
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
    marginTop: 4,
    color: "#3F628E",
    fontWeight: "600",
  },
  heroMetaRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EDF5FF",
    borderWidth: 1,
    borderColor: "#C8DCFF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  heroPillText: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 12,
  },
  infoCard: {
    backgroundColor: "#F7FAFF",
    borderWidth: 1,
    borderColor: "#D6E2F5",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    shadowColor: "#2563EB",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: SPACING.sm,
    color: "#173A6B",
  },
  sectionText: {
    color: "#496C97",
    lineHeight: 20,
  },
  infoLabel: {
    marginTop: 2,
    marginBottom: 6,
    color: "#2A4E81",
    fontWeight: "700",
    fontSize: 13,
  },
  infoDivider: {
    marginVertical: 12,
    height: 1,
    backgroundColor: "#D5E4FF",
  },
  commentCard: {
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "#CFE0FF",
    borderRadius: RADIUS.sm,
    padding: 12,
    marginBottom: 10,
  },
  commentRating: {
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 4,
  },
  commentText: {
    color: "#435E84",
  },
  emptyText: {
    color: "#64748B",
  },
  notFoundWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.lg,
  },
  notFoundText: {
    color: "#64748B",
    textAlign: "center",
  },
});
