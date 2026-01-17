import React from "react";
import { View, Text, Image } from "@react-pdf/renderer";
import { s } from "./baseStyles";

type Props = {
  ueceLogoSrc?: string;
  lassuLogoSrc?: string;
};

export function UECEHeader({ ueceLogoSrc, lassuLogoSrc }: Props) {
  return (
    <View style={s.headerWrap} fixed>
      <View style={s.headerRow}>
        <View style={s.logoCol}>
          {ueceLogoSrc ? <Image src={ueceLogoSrc} style={{ width: 70, height: 70 }} /> : null}
        </View>

        <View style={s.centerCol}>
          <Text style={s.headerLine}>UNIVERSIDADE ESTADUAL DO CEARÁ</Text>
          <Text style={s.headerLineSmall}>CENTRO DE HUMANIDADES</Text>
          <Text style={s.headerLineSmall}>CURSO DE PSICOLOGIA</Text>
          <Text style={s.headerLineSmall}>LABORATÓRIO DE SOCIEDADES, SUBJETIVIDADES</Text>
          <Text style={s.headerLineSmall}>E HUMANISMO (LASSU)</Text>
        </View>

        <View style={s.logoCol}>
          {lassuLogoSrc ? <Image src={lassuLogoSrc} style={{ width: 70, height: 70 }} /> : null}
        </View>
      </View>
    </View>
  );
}
