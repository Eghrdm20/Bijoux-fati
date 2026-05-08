"use client";

import PiPayment from "@/components/PiPayment";

const testProduct = {
  id: "test-001",
  name: "منتج تجريبي",
  price: 0.1,  // سعر رخيص للاختبار
};

export default function TestPayment() {
  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1>اختبار الدفع</h1>
      <p>منتج: {testProduct.name}</p>
      <p>السعر: {testProduct.price} Pi</p>
      <PiPayment product={testProduct} quantity={1} />
    </div>
  );
}
