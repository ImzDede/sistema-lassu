"use client";

import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { s } from "./layout/baseStyles";
import { UECEHeader } from "./layout/UECEHeader";
import { UECEFooter } from "./layout/UECEFooter";
import { Band } from "./layout/Band";
import { Table, TR, TD } from "./layout/Table";

interface SintesePDFProps {
  pacienteNome: string;
  respostas: any;
  ueceLogoSrc?: string;
  lassuLogoSrc?: string;
}

const getRespText = (respostas: any, id: string) => {
  const r = respostas?.[id];
  if (!r) return "";
  if (typeof r === "string") return r;
  if (Array.isArray(r)) return r.map((x) => x?.label || x?.id).filter(Boolean).join(", ");
  if (typeof r === "object") return r.label ? (r.complemento ? `${r.label} (${r.complemento})` : r.label) : r.id;
  return "";
};

const Check = ({ label }: { label: string }) => (
  <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 18 }}>
    <View style={{ width: 12, height: 12, borderWidth: 1, borderColor: "#000", marginRight: 8 }} />
    <Text style={{ fontFamily: "Times-Bold" }}>{label}</Text>
  </View>
);

export const SintesePDF: React.FC<SintesePDFProps> = ({ pacienteNome, respostas, ueceLogoSrc, lassuLogoSrc }) => (
  <Document>
    <Page size="A4" style={s.page}>
      <UECEHeader ueceLogoSrc={ueceLogoSrc} lassuLogoSrc={lassuLogoSrc} />
      <Band title="PLANTÃO ACOLHEDOR" subtitle="FICHA DE SÍNTESE DE ATENDIMENTO" />

      {/* TABELA INICIAL */}
      <Table style={{ marginTop: -1 }}>
        <TR>
          <TD width="28%"><Text style={s.label}>Data de atendimento(s):</Text></TD>
          <TD width="24%"></TD>
          <TD width="24%"></TD>
          <TD width="24%" last></TD>
        </TR>
        <TR>
          <TD width="100%" last><Text style={s.label}>Estagiária(s):</Text></TD>
        </TR>
        <TR>
          <TD width="55%"><Text style={s.label}>Matrícula/CRP:</Text></TD>
          <TD width="45%" last></TD>
        </TR>
      </Table>

      {/* IDENTIFICAÇÃO */}
      <View style={{ borderWidth: 1, borderColor: "#000", marginTop: 18 }}>
        <View style={{ borderBottomWidth: 1, borderBottomColor: "#000", padding: 6, alignItems: "center" }}>
          <Text style={{ fontFamily: "Times-Bold", fontSize: 12 }}>IDENTIFICAÇÃO DA ATENDIDA</Text>
        </View>

        {[
          { label: "NOME:", value: pacienteNome },
          { label: "IDADE:", value: "" },
          { label: "DATA DOS ATENDIMENTOS:", value: "" },
        ].map((r, i) => (
          <View key={i} style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#000" }}>
            <View style={{ width: 140, padding: 8 }}>
              <Text style={{ fontFamily: "Times-Bold" }}>{r.label}</Text>
            </View>
            <View style={{ flex: 1, padding: 8 }}>
              <Text>{r.value}</Text>
            </View>
          </View>
        ))}

        <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#000" }}>
          <View style={{ width: "34%", borderRightWidth: 1, borderRightColor: "#000", height: 36 }} />
          <View style={{ width: "33%", borderRightWidth: 1, borderRightColor: "#000", height: 36 }} />
          <View style={{ width: "33%", height: 36 }} />
        </View>

        <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#000" }}>
          <View style={{ width: 220, padding: 8 }}>
            <Text style={{ fontFamily: "Times-Bold" }}>CHEGOU AO PLANTÃO POR:</Text>
          </View>
          <View style={{ flex: 1, padding: 8, flexDirection: "row", gap: 30 }}>
            <Check label="LIVRE DEMANDA" />
            <Check label="ENCAMINHAMENTO" />
          </View>
        </View>

        <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#000" }}>
          <View style={{ width: 240, padding: 8 }}>
            <Text style={{ fontFamily: "Times-Bold" }}>ORIGEM DO ENCAMINHAMENTO:</Text>
          </View>
          <View style={{ flex: 1, padding: 8 }} />
        </View>

        <View style={{ flexDirection: "row" }}>
          <View style={{ width: 170, padding: 8 }}>
            <Text style={{ fontFamily: "Times-Bold" }}>DATA DA SÍNTESE:</Text>
          </View>
          <View style={{ flex: 1, padding: 8 }} />
        </View>
      </View>

      {/* BLOCOS (1,2,3...) */}
      <View style={{ marginTop: 22 }}>
        <Text style={{ fontFamily: "Times-Bold" }}>1) &nbsp; Avaliação da Sessão</Text>
        <View style={{ marginTop: 10, marginLeft: 18 }}>
          <Text>• &nbsp; Humor:</Text>
          <View style={s.boxSm}><Text style={{ padding: 8 }}>{getRespText(respostas, "q-humor")}</Text></View>

          <Text style={{ marginTop: 10 }}>• &nbsp; Cooperação:</Text>
          <View style={s.boxSm}><Text style={{ padding: 8 }}>{getRespText(respostas, "q-cooperacao")}</Text></View>
        </View>
      </View>

      <View style={{ marginTop: 18 }}>
        <Text style={{ fontFamily: "Times-Bold" }}>2) &nbsp; Desenvolvimento (Temas e Intervenções)</Text>
        <View style={{ marginTop: 10, marginLeft: 18 }}>
          <Text>• &nbsp; Principais temas abordados:</Text>
          <View style={s.box}><Text style={{ padding: 8 }}>{getRespText(respostas, "q-temas")}</Text></View>

          <Text style={{ marginTop: 10 }}>• &nbsp; Intervenções realizadas:</Text>
          <View style={s.box}><Text style={{ padding: 8 }}>{getRespText(respostas, "q-intervencoes")}</Text></View>
        </View>
      </View>

      <View style={{ marginTop: 18 }}>
        <Text style={{ fontFamily: "Times-Bold" }}>3) &nbsp; Fechamento</Text>
        <View style={{ marginTop: 10, marginLeft: 18 }}>
          <Text>• &nbsp; Tarefas de casa?</Text>
          <View style={s.boxSm}><Text style={{ padding: 8 }}>{getRespText(respostas, "q-tarefas")}</Text></View>

          <Text style={{ marginTop: 10 }}>• &nbsp; Planejamento para próxima sessão:</Text>
          <View style={s.boxSm}><Text style={{ padding: 8 }}>{getRespText(respostas, "q-prox-sessao")}</Text></View>
        </View>
      </View>

      <UECEFooter />
    </Page>
  </Document>
);
