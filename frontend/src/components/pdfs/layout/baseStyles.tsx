import { StyleSheet } from "@react-pdf/renderer";

export const s = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingHorizontal: 38,
    paddingBottom: 40,
    fontFamily: "Times-Roman",
    fontSize: 11,
    color: "#000",
    lineHeight: 1.15,
  },

  headerWrap: { marginBottom: 10 },
  headerRow: { flexDirection: "row", alignItems: "flex-start" },
  logoCol: { width: 90, alignItems: "center" },
  centerCol: { flex: 1, alignItems: "center" },

  headerLine: { fontFamily: "Times-Bold", fontSize: 12, textAlign: "center" },
  headerLineSmall: { fontFamily: "Times-Bold", fontSize: 11, textAlign: "center" },

  band: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#d6a9ba",
    paddingVertical: 10,
    alignItems: "center",
  },
  bandTitle: { fontFamily: "Times-Bold", fontSize: 14 },
  bandSubTitle: { fontFamily: "Times-Bold", fontSize: 13, marginTop: 6 },

  table: { borderWidth: 1, borderColor: "#b77c8f", marginTop: 0 },
  tr: { flexDirection: "row" },
  td: {
    borderRightWidth: 1,
    borderRightColor: "#b77c8f",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tdLast: { borderRightWidth: 0 },
  label: { fontFamily: "Times-Bold" },

  sectionTitle: { marginTop: 18, fontFamily: "Times-Bold", fontSize: 12 },

  fieldRow: { flexDirection: "row", alignItems: "flex-end", marginTop: 16 },
  fieldLabel: { width: 160, fontFamily: "Times-Bold", fontSize: 12 },

  line: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    height: 14,
    marginLeft: 10,
    flex: 1,
    justifyContent: "flex-end",
  },

  box: { borderWidth: 1, borderColor: "#000", height: 170, marginTop: 10 },
  boxSm: { borderWidth: 1, borderColor: "#000", height: 90, marginTop: 10 },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 38,
    right: 38,
    alignItems: "center",
    fontSize: 10,
  },
  footerLine: { borderBottomWidth: 1, borderBottomColor: "#000", width: 330, marginBottom: 6 },
});
