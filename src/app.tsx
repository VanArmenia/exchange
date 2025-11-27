import React, { useEffect, useState } from "react";

interface Rate {
  country: string;
  currency: string;
  amount: number;
  code: string;
  rate: number;
}

export default function App() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [czkAmount, setCzkAmount] = useState<number>();
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");

  useEffect(() => {
    async function fetchRates() {
      try {
        const response = await fetch('http://localhost:4000/api/rates');
        const text = await response.text();
        const parsed = parseCnbData(text);
        setRates(parsed);
        setSelectedCurrency(parsed[0]?.code || "");
      } catch (err) {
        setError("Failed to fetch exchange rates");
      } finally {
        setLoading(false);
      }
    }

    fetchRates();
  }, []);

  function parseCnbData(text: string): Rate[] {
    const lines = text.trim().split("\n");
    const dataLines = lines.slice(2);

    return dataLines.map((line) => {
      const [country, currency, amount, code, rate] = line.split("|");
      return {
        country,
        currency,
        amount: Number(amount),
        code,
        rate: Number(rate),
      };
    });
  }

  function convert(): string {
    if (!selectedCurrency) return "0";
    const r = rates.find((r) => r.code === selectedCurrency);
    if (!r) return "0";
    return (czkAmount / (r.rate / r.amount)).toFixed(2);
  }

  if (loading) return <div className="p-4 text-lg">Loading…</div>;
  if (error) return <div className="p-4 text-red-500 text-lg">{error}</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8 bg-green-50">
      <h1 className="text-3xl font-bold mb-4">CNB Exchange Rates</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rates.map((r) => (
          <div key={r.code} className="border rounded-xl p-4 shadow-sm">
            <h2 className="text-xl font-semibold">{r.code}</h2>
            <p>{r.country}</p>
            <p>
              {r.amount} {r.currency} = {r.rate} CZK
            </p>
          </div>
        ))}
      </div>

      <div className="p-6 border rounded-2xl shadow-md space-y-4">
        <h2 className="text-2xl font-semibold">Convert CZK → Currency</h2>

        <input
          type="number"
          className="border p-2 rounded w-full"
          value={czkAmount}
          onChange={(e) => setCzkAmount(e.target.value ? Number(e.target.value) : undefined)}
          placeholder="Amount in CZK"
        />

        <select
          className="border p-2 rounded w-full"
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
        >
          {rates.map((r) => (
            <option key={r.code} value={r.code}>
              {r.code} — {r.currency}
            </option>
          ))}
        </select>

        <div className="pt-2 text-xl font-medium">
          Result: {convert()} {selectedCurrency}
        </div>
      </div>
    </div>
  );
}
