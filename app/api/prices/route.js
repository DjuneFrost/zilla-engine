export async function GET() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana,hyperliquid&vs_currencies=usd&include_24hr_change=true",
      { next: { revalidate: 30 } }
    );
    const data = await res.json();
    return Response.json(data);
  } catch {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}