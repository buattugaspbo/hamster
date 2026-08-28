const base = process.env.SMOKE_BASE_URL || "http://localhost:3000";

async function check(name, path, options = {}, expected = [200]) {
  const response = await fetch(`${base}${path}`, { ...options, redirect: "manual" });
  if (!expected.includes(response.status)) {
    const body = (await response.text()).slice(0, 400);
    throw new Error(`${name}: expected ${expected.join("/")}, got ${response.status}: ${body}`);
  }
  console.log(`${name}: ${response.status}`);
  return response;
}

await check("home", "/");
await check("shop", "/shop");
const products = await check("products", "/api/products");
const productPayload = await products.json();
if (!Array.isArray(productPayload.products) || productPayload.products.length < 1) throw new Error("products: katalog kosong");
const shipping = await check("shipping", "/api/shipping/quote", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ regencyCode: "3273" }),
});
const shippingPayload = await shipping.json();
if (!shippingPayload.quote || shippingPayload.quote.cost < 10000) throw new Error("shipping: hasil tidak valid");
const admin = await check("admin guard", "/admin", {}, [307]);
if (!admin.headers.get("location")?.startsWith("/login")) throw new Error("admin guard: tidak diarahkan ke login");
