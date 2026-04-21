import { StyleSheet } from "react-native";

export const authStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  hero: {
    paddingTop: 88,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  brand: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1E3A8A",
    letterSpacing: 0.4,
    textAlign: "center",
  },
  tagline: {
    marginTop: 8,
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: "#F8FAFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#D6E1F5",
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  inputBlock: {
    marginTop: 12,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#94A3B8",
    marginBottom: 8,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  passwordWrap: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 78,
  },
  toggleBtn: {
    position: "absolute",
    right: 14,
    top: 12,
  },
  toggleText: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 12,
  },
  errorText: {
    marginTop: 10,
    color: "#EF4444",
    fontSize: 13,
  },
  submit: {
    marginTop: 18,
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  submitDisabled: {
    backgroundColor: "#93C5FD",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
  },
  secondaryText: {
    color: "#64748B",
  },
  secondaryLink: {
    color: "#2563EB",
    fontWeight: "700",
  },
  roleRow: {
    flexDirection: "row",
    gap: 12,
  },
  roleCard: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  roleCardActive: {
    borderColor: "#2563EB",
    backgroundColor: "#E0F2FE",
  },
  roleCardInactive: {
    borderColor: "#D6E1F5",
    backgroundColor: "#FFFFFF",
  },
  roleText: {
    fontWeight: "700",
  },
  roleTextActive: {
    color: "#1E3A8A",
  },
  roleTextInactive: {
    color: "#475569",
  },
  proNotice: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  proNoticeText: {
    color: "#1E3A8A",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },
  bottomAccent: {
    marginTop: 40,
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#2563EB",
  },
  bottomAccentText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
