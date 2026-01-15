export function isISODateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function normalizeToDateOnly(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function validateBirthDateISO(birthDateISO: string, opts?: { maxAge?: number }) {
  const maxAge = opts?.maxAge ?? 120;
  if (!birthDateISO || !isISODateString(birthDateISO)) {
    return { valid: false, message: "Data de nascimento inválida." };
  }

  const birth = new Date(birthDateISO + "T00:00:00");
  if (Number.isNaN(birth.getTime())) {
    return { valid: false, message: "Data de nascimento inválida." };
  }

  const today = normalizeToDateOnly(new Date());
  const b = normalizeToDateOnly(birth);

  if (b > today) {
    return { valid: false, message: "Data de nascimento não pode ser no futuro." };
  }

  const age = today.getFullYear() - b.getFullYear() - (today < new Date(today.getFullYear(), b.getMonth(), b.getDate()) ? 1 : 0);
  if (age < 0) {
    return { valid: false, message: "Idade inválida." };
  }
  if (age > maxAge) {
    return { valid: false, message: `Idade inválida (máximo ${maxAge} anos).` };
  }

  return { valid: true, message: "" };
}

export function validateSessionDateISO(dateISO: string) {
  if (!dateISO || !isISODateString(dateISO)) {
    return { valid: false, message: "Data inválida." };
  }
  const d = new Date(dateISO + "T00:00:00");
  if (Number.isNaN(d.getTime())) return { valid: false, message: "Data inválida." };

  const today = normalizeToDateOnly(new Date());
  const target = normalizeToDateOnly(d);
  if (target < today) return { valid: false, message: "Não é permitido agendar sessões para datas passadas." };
  return { valid: true, message: "" };
}

export function validateSessionHourNotPast(dateISO: string, hourNumber: number) {
  // Regra: se a sessão for hoje, o horário precisa ser estritamente maior que a hora atual.
  if (!isISODateString(dateISO) || Number.isNaN(hourNumber)) return { valid: true, message: "" };
  const now = new Date();
  const todayISO = now.toISOString().split("T")[0];
  if (dateISO !== todayISO) return { valid: true, message: "" };

  if (hourNumber <= now.getHours()) {
    return { valid: false, message: "Para hoje, escolha um horário futuro." };
  }
  return { valid: true, message: "" };
}
