import type { APIRoute } from "astro";
import { getAllProducts, toCatalogItem } from "../lib/medusa";

export const prerender = true;

export const GET: APIRoute = async () => {
  const products = await getAllProducts();
  const items = products.map(toCatalogItem).map((i) => ({
    title: i.title,
    handle: i.handle,
    thumbnail: i.thumbnail,
    price: i.price,
    currency: i.currency,
  }));
  return new Response(JSON.stringify(items), {
    headers: { "Content-Type": "application/json" },
  });
};
