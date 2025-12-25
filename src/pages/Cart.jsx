import { useEffect, useState } from "react";
import { getProducts, downloadBill } from "../services/api";
import { calculateQty } from "../utils/calculations";
import "../styles/Cart.css";

export default function Cart() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [dlError, setDlError] = useState("");

  useEffect(() => {
    getProducts()
      .then(res => {
        console.log("PRODUCT API RESPONSE:", res.data);
        setProducts(res.data);
      })
      .catch(err => {
        console.error("API ERROR:", err);
      });
  }, []);

  const addToCart = () => {
    if (!selectedProduct) return;
    
    const product = products.find(p => p.itemCode === selectedProduct);
    if (!product) return;

    // Check if already in cart
    const existingIndex = cart.findIndex(item => item.itemCode === product.itemCode);
    
    if (existingIndex > -1) {
      // Update quantity
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      // Add new item
      setCart(prev => [...prev, {
        ...product,
        quantity: 1,
        length: 0,
        width: 0,
        height: 0
      }]);
    }
    
    setSelectedProduct("");
  };

  const updateQuantity = (index, newQty) => {
    if (newQty < 1) newQty = 1;
    const updatedCart = [...cart];
    updatedCart[index].quantity = newQty;
    setCart(updatedCart);
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  async function handleDownload() {
    try {
      setDlError("");
      setDownloading(true);
      // build items array expected by API: [{ itemCode, qty }, ...]
      const items = (cart || []).map((it) => ({
        itemCode: it.itemCode || it.id,
        qty: it.qty || 1,
      }));
      if (!items.length) {
        setDlError("Cart is empty");
        return;
      }
      const blob = await downloadBill(items);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bill.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setDlError(err.message || "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  const grandTotal = cart.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  const dropdownOptions = products.map(p => (
    <option key={p.itemCode} value={p.itemCode}>
      {p.description} - ₹{p.price}/{p.unit}
    </option>
  ));

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Shopping Cart</h2>
        <div className="add-product">
          <select 
            value={selectedProduct} 
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="product-dropdown"
          >
            <option value="">Select Product</option>
            {dropdownOptions}
          </select>
          <button onClick={addToCart} className="add-btn">Add to Cart</button>
        </div>
      </div>

      <div className="cart-items">
        {cart.map((item, index) => (
          <div key={item.itemCode} className="cart-item">
            <div className="item-details">
              <h4>{item.description}</h4>
              <p>₹{item.price}/{item.unit}</p>
            </div>
            
            <div className="quantity-controls">
              <button 
                onClick={() => updateQuantity(index, item.quantity - 1)}
                className="qty-btn minus"
              >
                -
              </button>
              <span className="qty-display">{item.quantity}</span>
              <button 
                onClick={() => updateQuantity(index, item.quantity + 1)}
                className="qty-btn plus"
              >
                +
              </button>
            </div>
            
            <div className="item-total">
              ₹{(item.price * item.quantity).toFixed(2)}
            </div>
            
            <button 
              onClick={() => removeFromCart(index)}
              className="delete-btn"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="cart-footer">
          <div className="grand-total">
            <strong>Grand Total: ₹{grandTotal.toFixed(2)}</strong>
          </div>
          <div>
            <button
              className="download-btn"
              onClick={handleDownload}
              disabled={downloading || !(cart && cart.length)}
            >
              {downloading ? "Downloading..." : "Download Bill"}
            </button>
            {dlError && <div style={{ color: "crimson", marginTop: 8 }}>{dlError}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
