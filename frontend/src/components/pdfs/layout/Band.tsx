import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { s } from "./baseStyles";

export function Band({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={s.band}>
      <Text style={s.bandTitle}>{title}</Text>
      <Text style={s.bandSubTitle}>{subtitle}</Text>
    </View>
  );
}
