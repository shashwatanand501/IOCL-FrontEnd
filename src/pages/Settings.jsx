import { useEffect, useState } from "react";
import { getProducts, updateProduct, createProduct } from "../services/api";
import "../styles/Settings.css";

export default function Settings() {
  const [products, setProducts] = useState([]);
  const [saving, setSaving] = useState({});
  const [globalSaving, setGlobalSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [newProduct, setNewProduct] = useState({
    itemCode: "",
    description: "",
    unit: "",
    price: ""
  });
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState("");

  useEffect(() => {
    getProducts().then((res) => setProducts(res.data || []));
  }, []);

  function handleChange(id, field, value) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  }

  async function saveOne(p) {
    setSaving((s) => ({ ...s, [p.id]: true }));
    try {
      await updateProduct(p.id, {
        itemCode: p.itemCode,
        description: p.description,
        unit: p.unit,
        price: p.price,
      });
      setMsg("Saved");
      setTimeout(() => setMsg(""), 1200);
    } catch (e) {
      setMsg("Save failed");
    } finally {
      setSaving((s) => ({ ...s, [p.id]: false }));
    }
  }

  async function saveAll() {
    setGlobalSaving(true);
    try {
      await Promise.all(
        products.map((p) =>
          updateProduct(p.id, {
            itemCode: p.itemCode,
            description: p.description,
            unit: p.unit,
            price: p.price,
          })
        )
      );
      setMsg("All saved");
      setTimeout(() => setMsg(""), 1400);
    } catch (e) {
      setMsg("Some saves failed");
    } finally {
      setGlobalSaving(false);
    }
  }

  function onNewChange(field, value) {
    setNewProduct((s) => ({ ...s, [field]: value }));
  }

  async function addProduct(e) {
    e.preventDefault();
    if (!newProduct.itemCode) {
      setAddMsg("Item code required");
      setTimeout(() => setAddMsg(""), 1800);
      return;
    }
    setAdding(true);
    try {
      const res = await createProduct({
        itemCode: newProduct.itemCode,
        description: newProduct.description || "",
        unit: newProduct.unit || "",
        price: Number(newProduct.price) || 0,
      });
      const created = res.data;
      setProducts((p) => [...p, created]);
      setAddMsg("Product added");
      setNewProduct({ itemCode: "", description: "", unit: "", price: "" });
      setTimeout(() => setAddMsg(""), 1400);
    } catch (err) {
      setAddMsg("Add failed");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="settings-page">
      <div className="settings-head">
        <h2>Product Settings</h2>
        <div className="settings-actions">
          <button onClick={saveAll} disabled={globalSaving}>
            {globalSaving ? "Saving..." : "Save All"}
          </button>
          <span className="settings-msg">{msg}</span>
        </div>
      </div>

      <form className="add-product-form" onSubmit={addProduct}>
        <div className="add-product-row">
          <input
            placeholder="Item Code"
            value={newProduct.itemCode}
            onChange={(e) => onNewChange("itemCode", e.target.value)}
            required
          />
          <input
            placeholder="Description"
            value={newProduct.description}
            onChange={(e) => onNewChange("description", e.target.value)}
          />
          <input
            placeholder="Unit"
            value={newProduct.unit}
            onChange={(e) => onNewChange("unit", e.target.value)}
          />
          <input
            placeholder="Price"
            type="number"
            step="0.01"
            value={newProduct.price}
            onChange={(e) => onNewChange("price", e.target.value)}
          />
          <button type="submit" disabled={adding}>
            {adding ? "Adding..." : "Add Product"}
          </button>
        </div>
        <div style={{marginTop:8, color:"var(--muted)"}}>{addMsg}</div>
      </form>

      <div className="settings-table-wrap" style={{marginTop:16}}>
        <table className="settings-table">
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Description</th>
              <th>Unit</th>
              <th>Price</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <input
                    value={p.itemCode || ""}
                    onChange={(e) =>
                      handleChange(p.id, "itemCode", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    value={p.description || ""}
                    onChange={(e) =>
                      handleChange(p.id, "description", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    value={p.unit || ""}
                    onChange={(e) => handleChange(p.id, "unit", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    value={p.price ?? ""}
                    onChange={(e) => handleChange(p.id, "price", e.target.value)}
                  />
                </td>
                <td>
                  <button
                    onClick={() => saveOne(p)}
                    disabled={!!saving[p.id]}
                  >
                    {saving[p.id] ? "Saving..." : "Save"}
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 20 }}>
                  No products
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
