import { StyleSheet } from "react-native";
import { SPACING } from "../theme";

export const chatsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 22,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },
  totalBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  totalBadgeText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },
  list: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    gap: 10,
  },
  rowUnread: {
    backgroundColor: "#F8FBFF",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontWeight: "800",
    color: "#0F172A",
  },
  mainCol: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  nombre: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
  },
  nombreUnread: {
    fontWeight: "800",
    color: "#0B1220",
  },
  hora: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  tituloTrabajo: {
    marginTop: 2,
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "700",
  },
  preview: {
    marginTop: 2,
    color: "#475569",
    fontSize: 13,
  },
  previewUnread: {
    color: "#1E293B",
    fontWeight: "700",
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 11,
  },
  separator: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginLeft: SPACING.lg + 54,
  },
  emptyWrap: {
    marginTop: 60,
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
  },
  emptyTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "700",
  },
  emptyText: {
    marginTop: 6,
    color: "#64748B",
    textAlign: "center",
  },
});
