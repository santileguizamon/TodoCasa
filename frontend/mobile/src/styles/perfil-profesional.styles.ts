import { StyleSheet } from "react-native";
import { SPACING, RADIUS } from "../theme";

export const perfilProfesionalStyles = StyleSheet.create({
  container: {
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
  suscripcionCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  suscripcionActiva: {
    backgroundColor: "#EAF8EF",
    borderColor: "#A7E0BA",
  },
  suscripcionVencida: {
    backgroundColor: "#FFF1F1",
    borderColor: "#FFCACA",
  },
  suscripcionInactiva: {
    backgroundColor: "#F3F4F6",
    borderColor: "#D1D5DB",
  },
  suscripcionTitle: {
    fontWeight: "800",
    marginBottom: 6,
  },
  suscripcionTitleActiva: {
    color: "#166534",
  },
  suscripcionTitleVencida: {
    color: "#B91C1C",
  },
  suscripcionTitleInactiva: {
    color: "#4B5563",
  },
  suscripcionTexto: {
    fontWeight: "700",
  },
  suscripcionTextoActiva: {
    color: "#2E7D32",
  },
  suscripcionTextoVencida: {
    color: "#C62828",
  },
  suscripcionTextoInactiva: {
    color: "#555",
  },
  botonRenovar: {
    marginTop: SPACING.md,
    backgroundColor: "#2563EB",
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignItems: "center",
  },
  botonTexto: {
    color: "#fff",
    fontWeight: "700",
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
  primaryButton: {
    marginTop: 2,
    backgroundColor: "#2563EB",
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  logoutCard: {
    backgroundColor: "#F8E6E8",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E7BFC5",
    shadowColor: "#BE123C",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logoutTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#B42318",
  },
  logoutText: {
    marginTop: 5,
    color: "#7A4950",
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    textAlign: "center",
    color: "#64748B",
  },
  emptyButton: {
    marginTop: 14,
  },
});
