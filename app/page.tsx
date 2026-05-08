"use client";

import { useEffect, useState } from "react";
import PiPayment from "@/components/PiPayment";

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
      setError("خطأ: " + err.message);
      setLoading(false);
    }
  };

  if (loading) return <div style={{textAlign: "center", padding: "50px"}}>⏳ جاري التحميل...</div>;
  if (error) return <div style={{color: "red", padding: "20px"}}>❌ {error}</div>;

  if (products.length === 0) {
    return <div style={{textAlign: "center", padding: "50px"}}>⚠️ لا توجد منتجات متاحة</div>;
  }

  return (
    <div style={{padding: "20px", maxWidth: "1200px", margin: "0 auto"}}>
      <h1 style={{textAlign: "center", color: "#8b5cf6"}}>💎 Bijoux Fati</h1>
      
      {selectedProduct ? (
        <div style={{
          maxWidth: "500px",
          margin: "20px auto",
          padding: "20px",
          border: "2px solid #8b5cf6",
          borderRadius: "12px",
          backgroundColor: "#faf5ff"
        }}>
          <button onClick={() => setSelectedProduct(null)}>← رجوع</button>
          <img src={selectedProduct.image_url} alt={selectedProduct.name} style={{width: "100%", height: "300px", objectFit: "cover", borderRadius: "8px", margin: "15px 0"}} />
          <h2>{selectedProduct.name}</h2>
          <p>{selectedProduct.description}</p>
          <p style={{fontSize: "24px", fontWeight: "bold", color: "#8b5cf6"}}>{selectedProduct.price} Pi</p>
          <p>المخزون: {selectedProduct.stock}</p>
          
          <div style={{margin: "15px 0"}}>
            <label>الكمية: </label>
            <input 
              type="number" 
              min={1} 
              max={selectedProduct.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, selectedProduct.stock))}
              style={{width: "60px", padding: "8px"}}
            />
          </div>

          <PiPayment product={selectedProduct} quantity={quantity} />
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px",
          marginTop: "30px"
        }}>
          {products.map((product) => (
            <div 
              key={product.id}
              onClick={() => {setSelectedProduct(product); setQuantity(1);}}
              style={{
                border: "1px solid #e0e0e0",
                borderRadius: "12px",
                padding: "15px",
                cursor: "pointer",
                backgroundColor: "white"
              }}
            >
              <img src={product.image_url} alt={product.name} style={{width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px"}} />
              <h3>{product.name}</h3>
              <p style={{color: "#666"}}>{product.description}</p>
              <p style={{fontSize: "20px", fontWeight: "bold", color: "#8b5cf6"}}>{product.price} Pi</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
