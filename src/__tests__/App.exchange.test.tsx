import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../App";

const mockRates = `
31 Jan 2025 #21
Country|Currency|Amount|Code|Rate
Australia|dollar|1|AUD|15.123
EMU|euro|1|EUR|25.987
USA|dollar|1|USD|23.456
`;

describe("Currency Exchange Logic", () => {
  beforeEach(() => {
    // mock fetch used inside App.tsx
    global.fetch = vi.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve(mockRates),
      })
    ) as any;
  });

  it("parses and displays currency rates", async () => {
    render(<App />);

    // Wait until rates are displayed (after fetch mock resolves)
    await waitFor(() => {
      expect(screen.getByText("EUR")).toBeInTheDocument();
      expect(screen.getByText("USD")).toBeInTheDocument();
    });
  });

  it("converts CZK to selected currency correctly", async () => {
    render(<App />);

    await waitFor(() => screen.getByText("EUR"));

    // Find currency dropdown
    const select = screen.getByRole('combobox');

    // Select EUR
    fireEvent.change(select, { target: { value: "EUR" } });

    // Find input field
    const input = screen.getByPlaceholderText(/Amount in CZK/i);

    // Enter CZK = 1000
    fireEvent.input(input, { target: { value: "1000" } });

    // Check displayed result
    await waitFor(() => {
    // 1000 CZK -> EUR using rate 25.987
    const expectedValue = (1000 / 25.987).toFixed(2);

    // Find the result element (it contains "Result: ... EUR")
    const resultEl = screen.getByText(/Result:/);

    // Extract only numbers and decimal point
    const numericValue = resultEl.textContent?.replace(/[^\d.]/g, "");

    // Assert the numeric part matches
    expect(numericValue).toBe(expectedValue);
    });

  });
});
