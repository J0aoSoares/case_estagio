const { Router } = require("express");
const prisma = require("../lib/prisma");

const {
  onlyDigits,
  isValidEmail,
  isValidCPF,
  isValidCEP,
  isValidTelefone
} = require("../utils/validators");

const router = Router();

router.get("/health", (req, res) => {
  return res.status(200).json({ status: "ok" });
});

router.get("/api/clientes", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const limitRaw = parseInt(req.query.limit ?? "10", 10);
    const limit = Math.min(Math.max(limitRaw, 1), 100);
    const skip = (page - 1) * limit;

    const [total, items] = await prisma.$transaction([
      prisma.cliente.count(),
      prisma.cliente.findMany({
        skip,
        take: limit,
        orderBy: { id: "desc" }
      })
    ]);

    return res.status(200).json({ page, limit, total, items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro interno ao listar clientes" });
  }
});

router.post("/api/clientes", async (req, res) => {
  try {
    const body = req.body ?? {};

    const nome = body.nome;
    const email = body.email;
    const cpf = body.cpf;

    const telefone = body.telefone;
    const cep = body.cep;

    const logradouro = body.logradouro;
    const numero = body.numero;
    const complemento = body.complemento;
    const bairro = body.bairro;
    const cidade = body.cidade;
    const estado = body.estado;

    const errors = [];

    // obrigatórios
    if (!nome || String(nome).trim().length < 2) {
      errors.push({ field: "nome", message: "nome é obrigatório (mín. 2 caracteres)" });
    }

    if (!email || !isValidEmail(email)) {
      errors.push({ field: "email", message: "email inválido" });
    }

    if (!cpf || !isValidCPF(cpf)) {
      errors.push({ field: "cpf", message: "cpf inválido" });
    }

    // opcionais (se vier, valida)
    if (telefone != null && String(telefone).trim() !== "" && !isValidTelefone(telefone)) {
      errors.push({ field: "telefone", message: "telefone inválido (10 ou 11 dígitos com DDD)" });
    }

    if (cep != null && String(cep).trim() !== "" && !isValidCEP(cep)) {
      errors.push({ field: "cep", message: "cep inválido (8 dígitos)" });
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: "Dados inválidos", errors });
    }

    const created = await prisma.cliente.create({
      data: {
        nome: String(nome).trim(),
        email: String(email).trim().toLowerCase(),
        cpf: onlyDigits(cpf),
        telefone: telefone != null && String(telefone).trim() !== "" ? onlyDigits(telefone) : null,
        cep: cep != null && String(cep).trim() !== "" ? onlyDigits(cep) : null,
        logradouro: logradouro != null && String(logradouro).trim() !== "" ? String(logradouro).trim() : null,
        numero: numero != null && String(numero).trim() !== "" ? String(numero).trim() : null,
        complemento: complemento != null && String(complemento).trim() !== "" ? String(complemento).trim() : null,
        bairro: bairro != null && String(bairro).trim() !== "" ? String(bairro).trim() : null,
        cidade: cidade != null && String(cidade).trim() !== "" ? String(cidade).trim() : null,
        estado: estado != null && String(estado).trim() !== "" ? String(estado).trim().toUpperCase() : null
      }
    });

    return res.status(201).json(created);
  } catch (err) {

    if (err && err.code === "P2002") {
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(", ") : "campo único";
      return res.status(409).json({ message: `Conflito: ${target} já cadastrado` });
    }

    console.error(err);
    return res.status(500).json({ message: "Erro interno ao criar cliente" });
  }
});

router.get("/api/cep/:cep", async (req, res) => {
  try {
    const cep = onlyDigits(req.params.cep);

    if (!isValidCEP(cep)) {
      return res.status(400).json({ message: "cep inválido (8 dígitos)" });
    }

    const url = `https://viacep.com.br/ws/${cep}/json/`;
    const response = await fetch(url, {
      headers: { "Accept": "application/json" }
    });

    if (!response.ok) {
      return res.status(502).json({ message: "Falha ao consultar ViaCEP" });
    }

    const data = await response.json();

    // ViaCEP retorna { erro: true } quando não encontra
    if (data.erro) {
      return res.status(404).json({ message: "CEP não encontrado" });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro interno ao consultar CEP" });
  }
});


router.get("/api/clientes/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "id inválido" });
    }

    const cliente = await prisma.cliente.findUnique({ where: { id } });

    if (!cliente) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    return res.status(200).json(cliente);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro interno ao buscar cliente" });
  }
});

router.put("/api/clientes/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "id inválido" });
    }

    const current = await prisma.cliente.findUnique({ where: { id } });
    if (!current) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    const body = req.body ?? {};

    const data = {};

    if (body.nome !== undefined) {
      if (!body.nome || String(body.nome).trim().length < 2) {
        return res.status(400).json({ message: "Dados inválidos", errors: [{ field: "nome", message: "nome inválido" }] });
      }
      data.nome = String(body.nome).trim();
    }

    if (body.email !== undefined) {
      if (!body.email || !isValidEmail(body.email)) {
        return res.status(400).json({ message: "Dados inválidos", errors: [{ field: "email", message: "email inválido" }] });
      }
      data.email = String(body.email).trim().toLowerCase();
    }

    if (body.cpf !== undefined) {
      if (!body.cpf || !isValidCPF(body.cpf)) {
        return res.status(400).json({ message: "Dados inválidos", errors: [{ field: "cpf", message: "cpf inválido" }] });
      }
      data.cpf = onlyDigits(body.cpf);
    }

    if (body.telefone !== undefined) {
      if (body.telefone != null && String(body.telefone).trim() !== "" && !isValidTelefone(body.telefone)) {
        return res.status(400).json({ message: "Dados inválidos", errors: [{ field: "telefone", message: "telefone inválido" }] });
      }
      data.telefone = body.telefone != null && String(body.telefone).trim() !== "" ? onlyDigits(body.telefone) : null;
    }

    if (body.cep !== undefined) {
      if (body.cep != null && String(body.cep).trim() !== "" && !isValidCEP(body.cep)) {
        return res.status(400).json({ message: "Dados inválidos", errors: [{ field: "cep", message: "cep inválido" }] });
      }
      data.cep = body.cep != null && String(body.cep).trim() !== "" ? onlyDigits(body.cep) : null;
    }

    // Endereço (opcionais, sem validação pesada)
    const optStr = (v) => (v != null && String(v).trim() !== "" ? String(v).trim() : null);

    if (body.logradouro !== undefined) data.logradouro = optStr(body.logradouro);
    if (body.numero !== undefined) data.numero = optStr(body.numero);
    if (body.complemento !== undefined) data.complemento = optStr(body.complemento);
    if (body.bairro !== undefined) data.bairro = optStr(body.bairro);
    if (body.cidade !== undefined) data.cidade = optStr(body.cidade);
    if (body.estado !== undefined) data.estado = optStr(body.estado)?.toUpperCase() ?? null;

    // nada pra atualizar?
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "Nenhum campo para atualizar" });
    }

    const updated = await prisma.cliente.update({
      where: { id },
      data
    });

    return res.status(200).json(updated);
  } catch (err) {
    if (err && err.code === "P2002") {
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(", ") : "campo único";
      return res.status(409).json({ message: `Conflito: ${target} já cadastrado` });
    }

    console.error(err);
    return res.status(500).json({ message: "Erro interno ao atualizar cliente" });
  }
});

router.delete("/api/clientes/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "id inválido" });
    }

    const exists = await prisma.cliente.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    await prisma.cliente.delete({ where: { id } });
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro interno ao excluir cliente" });
  }
});




module.exports = router;
