async function parseBody(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return await res.json();
  return await res.text();
}

function makeError(res, body) {
  const msg = typeof body === "string" ? body : (body?.message || "Erro na API");
  const err = new Error(msg);
  err.details = body;
  err.status = res.status;
  return err;
}

export async function apiGet(path) {
  const res = await fetch(path, { headers: { Accept: "application/json" } });
  const body = await parseBody(res);
  if (!res.ok) throw makeError(res, body);
  return body;
}

export async function apiPost(path, data) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  const body = await parseBody(res);
  if (!res.ok) throw makeError(res, body);
  return body;
}

export async function apiPut(path, data) {
  const res = await fetch(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  const body = await parseBody(res);
  if (!res.ok) throw makeError(res, body);
  return body;
}

export async function apiDelete(path) {
  const res = await fetch(path, { method: "DELETE", headers: { Accept: "application/json" } });
  if (res.status === 204) return null;

  const body = await parseBody(res);
  if (!res.ok) throw makeError(res, body);
  return body;
}
