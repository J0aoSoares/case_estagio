function onlyDigits(value) {
  return String(value ?? "").replace(/\D/g, "");
}

function isValidEmail(email) {
  const e = String(email ?? "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function isValidCEP(cep) {
  const c = onlyDigits(cep);
  return c.length === 8;
}

function isValidTelefone(telefone) {
  const t = onlyDigits(telefone);
  return t.length === 10 || t.length === 11;
}

function isValidCPF(cpf) {
  const c = onlyDigits(cpf);
  if (c.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(c)) return false;

  const calcDV = (base) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i], 10) * (base.length + 1 - i);
    }
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const base9 = c.slice(0, 9);
  const dv1 = calcDV(base9);
  const base10 = c.slice(0, 10);
  const dv2 = calcDV(base10);

  return dv1 === parseInt(c[9], 10) && dv2 === parseInt(c[10], 10);
}

module.exports = {
  onlyDigits,
  isValidEmail,
  isValidCPF,
  isValidCEP,
  isValidTelefone
};
