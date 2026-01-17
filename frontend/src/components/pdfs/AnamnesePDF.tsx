"use client";

import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { s } from "./layout/baseStyles";
import { UECEHeader } from "./layout/UECEHeader";
import { UECEFooter } from "./layout/UECEFooter";
import { Band } from "./layout/Band";
import { Table, TR, TD } from "./layout/Table";
import { FieldLine } from "./layout/FieldLine";

interface AnamnesePDFProps {
  pacienteNome: string;
  respostas: any;
  ueceLogoSrc?: string;
  lassuLogoSrc?: string;
}

// Pega string, ou {label/complemento}, ou array [{label/complemento}...]
const getRespText = (respostas: any, id: string) => {
  const r = respostas?.[id];
  if (!r) return "";
  if (typeof r === "string") return r;

  // múltipla escolha
  if (Array.isArray(r)) {
    return r
      .map((x) => (x?.label ? (x.complemento ? `${x.label} (${x.complemento})` : x.label) : x?.id))
      .filter(Boolean)
      .join(", ");
  }

  // única escolha
  if (typeof r === "object") {
    if (r.label) return r.complemento ? `${r.label} (${r.complemento})` : r.label;
    return r.complemento ? `${r.id} (${r.complemento})` : r.id;
  }

  return "";
};

export const AnamnesePDF: React.FC<AnamnesePDFProps> = ({
  pacienteNome,
  respostas,
  ueceLogoSrc,
  lassuLogoSrc,
}) => (
  <Document>
    <Page size="A4" style={s.page}>
      <UECEHeader ueceLogoSrc={ueceLogoSrc} lassuLogoSrc={lassuLogoSrc} />
      <Band title="PLANTÃO ACOLHEDOR" subtitle="FICHA DE ANAMNESE" />

      {/* TABELA INICIAL */}
      <Table style={{ marginTop: -1 }}>
        <TR>
          <TD width="28%">
            <Text style={s.label}>Data de atendimento(s):</Text>
          </TD>
          <TD width="28%"></TD>
          <TD width="24%"></TD>
          <TD width="20%" last></TD>
        </TR>

        <TR>
          <TD width="55%">
            <Text style={s.label}>Estagiária:</Text>
          </TD>
          <TD width="45%" last>
            <Text style={s.label}>Contato: ( &nbsp;&nbsp; )</Text>
          </TD>
        </TR>

        <TR>
          <TD width="55%">
            <Text style={s.label}>Matrícula/CRP:</Text>
          </TD>
          <TD width="45%" last>
            <Text style={s.label}>Modalidade de atendimento:</Text>
          </TD>
        </TR>
      </Table>

      <Text style={s.sectionTitle}>1 DADOS PESSOAIS E DEMOGRÁFICOS</Text>

      <FieldLine label="Nome Completo:" value={pacienteNome} />
      <FieldLine label="Nome Social*:" value={getRespText(respostas, "q-nome")} />
      <FieldLine label="Profissão/Ocupação:" value={getRespText(respostas, "q-prof")} />
      <FieldLine label="Estado Civil:" value={getRespText(respostas, "q-civil")} />
      <FieldLine label="Tem filhos?:" value={getRespText(respostas, "q-filhos")} />
      <FieldLine label="Quantos?:" value={getRespText(respostas, "q-qtd-filhos")} />

      <Text style={s.sectionTitle}>2 HÁBITOS E SAÚDE</Text>
      <FieldLine label="Tabagismo:" value={getRespText(respostas, "q-fuma")} />
      <FieldLine label="Cigarros/dia:" value={getRespText(respostas, "q-cigarros")} />
      <FieldLine label="Consome álcool?:" value={getRespText(respostas, "q-bebe")} />
      <FieldLine label="Frequência:" value={getRespText(respostas, "q-freq-alcool")} />

      <Text style={s.sectionTitle}>3 QUEIXA PRINCIPAL E HISTÓRICO</Text>

      <View style={{ marginTop: 10, marginLeft: 18 }}>
        <Text>• &nbsp; Relato inicial da mulher sobre o que a levou a buscar ajuda:</Text>
        <View style={s.box}>
          <Text style={{ padding: 8 }}>{getRespText(respostas, "q-motivo")}</Text>
        </View>
      </View>

      <UECEFooter />
    </Page>
  </Document>
);
