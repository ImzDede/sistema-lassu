import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { s } from "./baseStyles";

type Props = {
  line1?: string;
  line2?: string;
  line3?: string;
};

export function UECEFooter({
  line1 = "Layza Castelo Branco Mendes - CRP 11/2767",
  line2 = "Supervisora do Projeto de Extensão Combate à Violência Contra a Mulher",
  line3 = "Email: lassu.uece@gmail.com",
}: Props) {
  return (
    <View style={s.footer} fixed>
      <View style={s.footerLine} />
      <Text>{line1}</Text>
      <Text>{line2}</Text>
      <Text>{line3}</Text>
    </View>
  );
}
