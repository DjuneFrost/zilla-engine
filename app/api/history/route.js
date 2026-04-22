export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const coinId = searchParams.get("id") || "solana";
  const days = searchParams.get("days") || "60";
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`,
      { next: { revalidate: 300 } }
    );
    const data = await res.json();
    return Response.json(data);
  } catch {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}