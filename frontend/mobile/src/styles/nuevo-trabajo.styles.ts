import { StyleSheet } from "react-native";
import { RADIUS, SPACING } from "../theme";

export const nuevoTrabajoColors = {
  primary: "#2563EB",
  primaryDark: "#1E40AF",
  background: "#EAF2FF",
  card: "#F7FAFF",
  cardSoft: "#DCEBFF",
  text: "#0F2A52",
  textSecondary: "#3D628F",
  border: "#C8DAF6",
  warningBg: "#FFF4D8",
  warningBorder: "#F6C453",
  warningText: "#8A5A00",
};

export const nuevoTrabajoStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: nuevoTrabajoColors.background,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 30,
    paddingBottom: 120,
    gap: SPACING.md,
  },
  heroCard: {
    backgroundColor: "#C7DBFF",
    borderColor: "#AFC9F9",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
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
    color: nuevoTrabajoColors.text,
  },
  heroSubtitle: {
    marginTop: 6,
    color: nuevoTrabajoColors.textSecondary,
    lineHeight: 19,
  },
  sectionCard: {
    backgroundColor: nuevoTrabajoColors.card,
    borderColor: nuevoTrabajoColors.border,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    shadowColor: "#2563EB",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    color: "#173A6B",
    fontWeight: "800",
    fontSize: 15,
  },
  label: {
    marginBottom: 6,
    color: "#2A4E81",
    fontWeight: "700",
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: nuevoTrabajoColors.border,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    backgroundColor: "#ECF4FF",
    color: nuevoTrabajoColors.text,
  },
  inputMultiline: {
    height: 98,
    textAlignVertical: "top",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#BED4FA",
    backgroundColor: "#E9F1FF",
  },
  chipSelected: {
    backgroundColor: nuevoTrabajoColors.primary,
    borderColor: nuevoTrabajoColors.primary,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipText: {
    color: "#245CB8",
    fontWeight: "700",
    fontSize: 12,
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
  helperText: {
    color: nuevoTrabajoColors.textSecondary,
    fontWeight: "600",
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  col: {
    flex: 1,
  },
  urgenteRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  urgenteTitle: {
    fontWeight: "700",
    color: nuevoTrabajoColors.text,
  },
  urgenteSubtitle: {
    marginTop: 2,
    color: nuevoTrabajoColors.textSecondary,
    fontSize: 12,
  },
  warningCard: {
    marginTop: 10,
    backgroundColor: nuevoTrabajoColors.warningBg,
    borderColor: nuevoTrabajoColors.warningBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  warningText: {
    color: nuevoTrabajoColors.warningText,
    fontWeight: "600",
    fontSize: 12,
  },
  linkText: {
    color: nuevoTrabajoColors.primary,
    marginBottom: 8,
    fontWeight: "700",
  },
  suggestionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#D5E4FF",
  },
  suggestionText: {
    color: nuevoTrabajoColors.text,
    fontWeight: "600",
  },
  bottomBar: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
  submitButton: {
    backgroundColor: nuevoTrabajoColors.primary,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
});
