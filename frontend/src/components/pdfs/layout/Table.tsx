import React from "react";
import { View } from "@react-pdf/renderer";
import { s } from "./baseStyles";

export function Table({ children, style }: any) {
  return <View style={[s.table, style]}>{children}</View>;
}

export function TR({ children, style }: any) {
  return <View style={[s.tr, style]}>{children}</View>;
}

export function TD({ children, width, last = false, style }: any) {
  return <View style={[s.td, last ? s.tdLast : null, width ? { width } : null, style]}>{children}</View>;
}
