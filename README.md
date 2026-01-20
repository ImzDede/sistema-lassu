# 🧠 Sistema de Gestão LASSU

![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-8257e5?style=for-the-badge)
![Squad](https://img.shields.io/badge/Squad-NOCTA-2e1065?style=for-the-badge)
![License](https://img.shields.io/badge/License-Proprietária-red?style=for-the-badge)

> **Laboratório de Subjetividade, Humanismo e Sociedades (UECE)**

O **Sistema LASSU** é uma plataforma web integrada desenvolvida para modernizar o fluxo de atendimento da clínica escola de psicologia. O projeto substitui processos manuais e fragmentados (papel e planilhas) por um prontuário eletrônico unificado, garantindo segurança, integridade dos dados e otimização do tempo das extensionistas.

---

## 🎯 O Problema vs. Solução

| 🔴 Antes (Dores) | 🟢 Depois (Solução LASSU) |
| :--- | :--- |
| **Fragmentação:** Dados espalhados em papel, Excel e Google Drive. | **Centralização:** Tudo em um único sistema web. |
| **Perda de Dados:** Fichas de papel extraviadas ou ilegíveis. | **Segurança:** Banco de dados robusto (PostgreSQL) com backups. |
| **Retrabalho:** Redigitar anamneses do papel para o Word. | **Digitalização:** Preenchimento direto no sistema. |
| **Burocracia:** Dificuldade em agendar e encontrar horários. | **Gestão:** Agenda integrada e controle de disponibilidade. |

---

## 🚀 Arquitetura e Módulos

O projeto adota uma arquitetura de **Monorepo** dividida em camadas de responsabilidade. Cada parte do sistema possui sua própria documentação técnica detalhada.

### 🎨 [Frontend (Aplicação Web)](./frontend)
Interface focada em acessibilidade e usabilidade para terapeutas e administração.
* **Tech Stack:** Next.js 14, TypeScript, Tailwind CSS.
* **Funcionalidades:** Prontuário Digital, Agenda, Geração de PDFs.

### ⚙️ [Backend (API Rest)](./backend)
Núcleo de regras de negócio, persistência de dados e segurança.
* **Tech Stack:** Node.js, Express/Fastify, PostgreSQL, Docker.
* **Funcionalidades:** Autenticação JWT, Upload Seguro (Multer), Validação Zod.

---

## 🛠️ Como Rodar o Projeto

Este projeto é modular. Para configurar o ambiente de desenvolvimento, **consulte o guia de instalação específico dentro do README de cada módulo:**

* 📄 **Instruções do Frontend:** [frontend/README.md](./frontend/README.md)
* 📄 **Instruções do Backend:** [backend/README.md](./backend/README.md)

> **Nota:** É necessário rodar ambos os serviços simultaneamente (e ter o banco de dados configurado) para que a aplicação funcione por completo.

---

## 👥 Squad NOCTA

Projeto desenvolvido durante a disciplina de **Projeto Integrado I (SMD/UFC)** pela equipe NOCTA.

| Membro | Função Principal |
| :--- | :--- |
| **André Felipe** | *Desenvolvedor Backend (API & Banco de Dados)* |
| **Evandro Alves** | *Desenvolvedor Frontend (Interface & Integração)* |
| **Edwiges Rocha** | *UI/UX Design (Prototipação)* |
| **Anna Fátima** | *Apoio Frontend & Design* |
| **Erick Henry** | *Documentação Acadêmica e Apoio Design|
| **Gabriel Vieira** | *Documentação Acadêmica e Apoio Design* |

---

## 📄 Licença e Direitos

Este software foi desenvolvido para uso exclusivo do **Laboratório LASSU (UECE)**. A reprodução, distribuição ou uso comercial sem autorização prévia é proibida.

---
*Desenvolvido com 💜 por NOCTA - 2026*