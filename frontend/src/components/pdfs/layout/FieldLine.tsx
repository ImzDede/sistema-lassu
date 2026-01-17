import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { s } from "./baseStyles";

export function FieldLine({ label, value }: { label: string; value?: string }) {
  return (
    <View style={s.fieldRow}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={s.line}>
        <Text>{value || ""}</Text>
      </View>
    </View>
  );
}
