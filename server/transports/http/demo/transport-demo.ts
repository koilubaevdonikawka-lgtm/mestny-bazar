import { buildCompositionRoot } from "@server/bootstrap";
import { ExpressBootstrap } from "@server/transports/http";

const DEMO_PORT = 3456;

async function runDemo(): Promise<void> {
  const context = buildCompositionRoot();
  const bootstrap = await ExpressBootstrap.start(context, {
    port: DEMO_PORT,
    host: "127.0.0.1",
    cors: true,
    compression: true,
  });

  const baseUrl = `http://127.0.0.1:${DEMO_PORT}`;

  try {
    const sellerResponse = await fetch(`${baseUrl}/api/sellers`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Demo Seller",
        phone: "+996700000000",
        email: "seller@local.bazar",
        address: "Bishkek, Kyrgyzstan",
      }),
    });

    const sellerBody = await sellerResponse.json();
    console.log("POST /api/sellers", sellerResponse.status, sellerBody.success);

    const sellerId = sellerBody.data?.id as string;

    const productResponse = await fetch(`${baseUrl}/api/products`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sellerId,
        name: "Demo Product",
        priceAmount: 150,
        priceCurrency: "KGS",
        inventoryQuantity: 10,
      }),
    });

    const productBody = await productResponse.json();
    console.log("POST /api/products", productResponse.status, productBody.success);

    const productId = productBody.data?.id as string;

    const getResponse = await fetch(`${baseUrl}/api/products/${productId}`);
    const getBody = await getResponse.json();
    console.log("GET /api/products/:id", getResponse.status, getBody.data?.name);
  } finally {
    await ExpressBootstrap.stop(bootstrap);
  }
}

runDemo().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
