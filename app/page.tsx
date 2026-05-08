"use client";

import { useEffect, useState } from "react";
import PiPayment from "@/components/PiPayment";
import PiLoginButton from "@/components/PiLoginButton";
import { usePiAuth } from "@/contexts/PiAuthContext";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  category: string;
}

export default function Home() {
  const { isAuthenticated, user } = usePiAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setProducts(data.products || []);
      setLoading(false);
    } catch (err: any) {
      setError("فشل تحميل المنتجات: " + err.message);
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: "50px", fontSize: "18px" }}>
      ⏳ جاري التحميل...
    </div>
  );

  if (error) return (
    <div style={{ color: "red", padding: "20px", textAlign: "center" }}>
      ❌ {error}
    </div>
  );

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header مع تسجيل الدخول */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        padding: "15px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ color: "#8b5cf6", margin: 0, fontSize: "24px" }}>
          💎 Bijoux Fati
        </h1>
        <PiLoginButton />
      </div>

      {/* إذا لم يسجل الدخول */}
      {!isAuthenticated && (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          backgroundColor: "#faf5ff",
          borderRadius: "12px",
          border: "2px dashed #8b5cf6"
        }}>
          <h2 style={{ color: "#8b5cf6", marginBottom: "15px" }}>
            👋 مرحباً بك في Bijoux Fati
          </h2>
          <p style={{ color: "#666", marginBottom: "25px", fontSize: "16px" }}>
            متجر المجوهرات الفاخرة على Pi Network
          </p>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            يرجى تسجيل الدخول عبر Pi Network للمتابعة
          </p>
          <PiLoginButton />
        </div>
      )}

      {/* إذا سجل الدخول - عرض المنتجات */}
      {isAuthenticated && (
        <>
          <div style={{
            textAlign: "center",
            padding: "15px",
            backgroundColor: "#f0fdf4",
            borderRadius: "8px",
            marginBottom: "20px",
            color: "#166534"
          }}>
            👋 مرحباً <strong>{user?.username}</strong>! اختر منتجاً للشراء
          </div>

          {products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
              ⚠️ لا توجد منتجات متاحة حالياً
            </div>
          ) : selectedProduct ? (
            <div style={{
              maxWidth: "500px",
              margin: "20px auto",
              padding: "20px",
              border: "2px solid #8b5cf6",
              borderRadius: "12px",
              backgroundColor: "#faf5ff"
            }}>
              <button 
                onClick={() => setSelectedProduct(null)}
                style={{
                  marginBottom: "15px",
                  padding: "8px 16px",
                  backgroundColor: "#eee",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                ← رجوع للمنتجات
              </button>

              <img 
                src={selectedProduct.image_url} 
                alt={selectedProduct.name}
                style={{
                  width: "100%",
                  height: "300px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "15px"
                }}
              />

              <h2 style={{ margin: "10px 0", color: "#333" }}>
                {selectedProduct.name}
              </h2>
              <p style={{ color: "#666", marginBottom: "10px" }}>
                {selectedProduct.description}
              </p>
              <p style={{ fontSize: "24px", fontWeight: "bold", color: "#8b5cf6" }}>
                {selectedProduct.price} Pi
              </p>
              <p style={{ color: "#666", marginBottom: "15px" }}>
                المخزون: {selectedProduct.stock} قطعة
              </p>

              <div style={{ margin: "15px 0", display: "flex", alignItems: "center", gap: "10px" }}>
                <label style={{ fontWeight: "bold" }}>الكمية:</label>
                <input 
                  type="number" 
                  min={1} 
                  max={selectedProduct.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, selectedProduct.stock))}
                  style={{
                    width: "60px",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    textAlign: "center"
                  }}
                />
              </div>

              <PiPayment product={selectedProduct} quantity={quantity} />
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
              marginTop: "20px"
            }}>
              {products.map((product) => (
                <div 
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product);
                    setQuantity(1);
                  }}
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "12px",
                    padding: "15px",
                    cursor: "pointer",
                    backgroundColor: "white",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                  }}
                >
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      marginBottom: "10px"
                    }}
                  />
                  <h3 style={{ margin: "10px 0", color: "#333" }}>{product.name}</h3>
                  <p style={{ color: "#666", fontSize: "14px", marginBottom: "10px" }}>
                    {product.description}
                  </p>
                  <p style={{
                    fontSize: "20px", 
                    fontWeight: "bold", 
                    color: "#8b5cf6",
                    marginTop: "10px"
                  }}>
                    {product.price} Pi
                  </p>
                  <p style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}>
                    المخزون: {product.stock} | {product.category}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
