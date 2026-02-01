import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../lib/api";

function onlyDigits(v) {
  return String(v ?? "").replace(/\D/g, "");
}

export default function ClienteCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: ""
  });

  const [loadingCep, setLoadingCep] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState([]);
  const [success, setSuccess] = useState("");

  const cepDigits = useMemo(() => onlyDigits(form.cep), [form.cep]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function buscarCep() {
    setError(""); setFieldErrors([]); setSuccess("");
    const cep = onlyDigits(form.cep);
    if (cep.length !== 8) { setError("CEP inválido: use 8 dígitos."); return; }

    try {
      setLoadingCep(true);
      const data = await apiGet(`/api/cep/${cep}`);
      setForm((prev) => ({
        ...prev,
        logradouro: data.logradouro ?? "",
        bairro: data.bairro ?? "",
        cidade: data.localidade ?? "",
        estado: data.uf ?? ""
      }));
    } catch (e) {
      setError(e.message || "Erro ao consultar CEP");
    } finally {
      setLoadingCep(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(""); setFieldErrors([]); setSuccess("");

    const payload = {
      nome: form.nome.trim(),
      email: form.email.trim(),
      cpf: onlyDigits(form.cpf),
      telefone: form.telefone.trim() ? onlyDigits(form.telefone) : null,
      cep: form.cep.trim() ? onlyDigits(form.cep) : null,
      logradouro: form.logradouro.trim() || null,
      numero: form.numero.trim() || null,
      complemento: form.complemento.trim() || null,
      bairro: form.bairro.trim() || null,
      cidade: form.cidade.trim() || null,
      estado: form.estado.trim() || null
    };

    try {
      setSaving(true);
      const created = await apiPost("/api/clientes", payload);
      setSuccess(`Cliente criado! ID: ${created.id}`);
      setForm({
        nome: "", email: "", cpf: "", telefone: "", cep: "",
        logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: ""
      });
    } catch (e) {
      setError(e.message || "Erro ao cadastrar");
      if (Array.isArray(e.details?.errors)) setFieldErrors(e.details.errors);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Cadastrar Cliente</h1>
        <div style={{ marginLeft: "auto" }}>
          <Link to="/" className="btn btn-ghost">← Voltar</Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <b>Erro:</b> {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <b>Sucesso:</b> {success}
          <button onClick={() => navigate("/")} className="btn" style={{ marginLeft: 12 }}>
            Ir para listagem
          </button>
        </div>
      )}

      {fieldErrors.length > 0 && (
        <div className="alert alert-warn">
          <b>Campos para corrigir:</b>
          <ul style={{ marginTop: 8 }}>
            {fieldErrors.map((x, idx) => (
              <li key={idx}><b>{x.field}:</b> {x.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="card" style={{ padding: 16 }}>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label>Nome *
              <input name="nome" value={form.nome} onChange={onChange} className="input" />
            </label>

            <label>Email *
              <input name="email" value={form.email} onChange={onChange} className="input" />
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label>CPF *
              <input name="cpf" value={form.cpf} onChange={onChange} className="input" />
            </label>

            <label>Telefone
              <input name="telefone" value={form.telefone} onChange={onChange} className="input" />
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "end" }}>
            <label>CEP
              <input name="cep" value={form.cep} onChange={onChange} className="input" placeholder="01001-000" />
              <small style={{ color: "var(--muted)" }}>Dígitos: {cepDigits.length}/8</small>
            </label>

            <button type="button" onClick={buscarCep} disabled={loadingCep} className="btn">
              {loadingCep ? "Buscando..." : "Buscar CEP"}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
            <label>Logradouro
              <input name="logradouro" value={form.logradouro} onChange={onChange} className="input" />
            </label>

            <label>Número
              <input name="numero" value={form.numero} onChange={onChange} className="input" />
            </label>

            <label>Complemento
              <input name="complemento" value={form.complemento} onChange={onChange} className="input" />
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px", gap: 12 }}>
            <label>Bairro
              <input name="bairro" value={form.bairro} onChange={onChange} className="input" />
            </label>

            <label>Cidade
              <input name="cidade" value={form.cidade} onChange={onChange} className="input" />
            </label>

            <label>UF
              <input name="estado" value={form.estado} onChange={onChange} className="input" placeholder="SP" />
            </label>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? "Salvando..." : "Cadastrar"}
            </button>

            <button
              type="button"
              disabled={saving || loadingCep}
              className="btn"
              onClick={() => setForm({
                nome: "", email: "", cpf: "", telefone: "", cep: "",
                logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: ""
              })}
            >
              Limpar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
