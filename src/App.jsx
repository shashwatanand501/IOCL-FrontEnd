import { Routes, Route } from "react-router-dom";
import Cart from "./pages/Cart.jsx";
import Settings from "./pages/Settings.jsx";
import "./index.css";
import "./styles/App.css";
import Navbar from "./components/Navbar.jsx";

export default function App() {
  return (
    <div className="app-root">
      <Navbar />
      <main className="app-main">
        <div className="page-container">
          <Routes>
            <Route path="/" element={<Cart />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </main>

      <footer className="app-footer">
        © {new Date().getFullYear()} Construction Cart
      </footer>
    </div>
  );
}
