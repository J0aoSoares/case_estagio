import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClientesList from "./pages/ClientesList";
import ClienteCreate from "./pages/ClienteCreate";
import ClienteEdit from "./pages/ClienteEdit";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClientesList />} />
        <Route path="/novo" element={<ClienteCreate />} />
        <Route path="/clientes/:id/editar" element={<ClienteEdit />} />
      </Routes>
    </BrowserRouter>
  );
}
