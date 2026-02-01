import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiDelete, apiGet } from "../lib/api";

export default function ClientesList() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet(`/api/clientes?page=${page}&limit=${limit}`);
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e.message || "Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page]);

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  async function onDelete(id) {
    const ok = confirm(`Tem certeza que deseja excluir o cliente #${id}?`);
    if (!ok) return;

    setError("");
    setDeletingId(id);
    try {
      await apiDelete(`/api/clientes/${id}`);

      const willBeEmpty = items.length === 1 && page > 1;
      if (willBeEmpty) setPage(page - 1);
      else await load();
    } catch (e) {
      setError(e.message || "Erro ao excluir");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="container">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Clientes</h1>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <Link to="/novo" className="btn btn-primary">+ Novo cliente</Link>
          <button onClick={load} disabled={loading} className="btn">
            {loading ? "Carregando..." : "Recarregar"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", margin: "12px 0" }}>
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1 || loading}
          className="btn"
        >
          Anterior
        </button>

        <span style={{ color: "var(--muted)" }}>
          Página <b style={{ color: "var(--text)" }}>{page}</b> de{" "}
          <b style={{ color: "var(--text)" }}>{totalPages}</b> — Total:{" "}
          <b style={{ color: "var(--text)" }}>{total}</b>
        </span>

        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages || loading}
          className="btn"
        >
          Próxima
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <b>Erro:</b> {error}
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th align="left">ID</th>
              <th align="left">Nome</th>
              <th align="left">Email</th>
              <th align="left">CPF</th>
              <th align="left">Telefone</th>
              <th align="left">CEP</th>
              <th align="left">Cidade/UF</th>
              <th align="left">Ações</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="8">Carregando...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="8">Nenhum cliente cadastrado.</td></tr>
            ) : (
              items.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.nome}</td>
                  <td>{c.email}</td>
                  <td>{c.cpf}</td>
                  <td>{c.telefone || "-"}</td>
                  <td>{c.cep || "-"}</td>
                  <td>{(c.cidade || "-") + (c.estado ? `/${c.estado}` : "")}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Link to={`/clientes/${c.id}/editar`} className="btn btn-secondary">Editar</Link>
                      <button
                        className="btn btn-danger"
                        onClick={() => onDelete(c.id)}
                        disabled={deletingId === c.id}
                        title="Excluir cliente"
                      >
                        {deletingId === c.id ? "Excluindo..." : "Excluir"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
