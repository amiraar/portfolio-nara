import { describe, it, expect, vi, beforeEach } from "vitest";

// usePortfolioContent uses fetch + React hooks — we test the caching logic in isolation.
// The module-level cache is reset between tests by re-importing the module.

describe("usePortfolioContent cache", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("resolves to defaultData immediately when cache is empty", async () => {
    // Simulate a slow fetch that never resolves in this test
    vi.stubGlobal("fetch", () => new Promise(() => {}));

    const { renderHook } = await import("@testing-library/react");
    const { usePortfolioContent } = await import("../lib/usePortfolioContent.js");

    const defaultData = { name: "Test" };
    const { result } = renderHook(() => usePortfolioContent("hero", defaultData));

    expect(result.current.data).toEqual(defaultData);
    expect(result.current.loading).toBe(true);
  });

  it("updates data and stops loading after fetch resolves", async () => {
    const fetchedData = { name: "From DB" };
    vi.stubGlobal("fetch", () =>
      Promise.resolve({ json: () => Promise.resolve({ content: fetchedData }) })
    );

    const { renderHook, act } = await import("@testing-library/react");
    const { usePortfolioContent } = await import("../lib/usePortfolioContent.js");

    const defaultData = { name: "Default" };
    const { result } = renderHook(() => usePortfolioContent("hero", defaultData));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.data).toEqual(fetchedData);
    expect(result.current.loading).toBe(false);
  });

  it("uses cached value and skips fetch on second render of same section", async () => {
    const fetchedData = { name: "Cached" };
    const fetchMock = vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve({ content: fetchedData }) })
    );
    vi.stubGlobal("fetch", fetchMock);

    const { renderHook, act } = await import("@testing-library/react");
    const { usePortfolioContent } = await import("../lib/usePortfolioContent.js");

    const { result: r1 } = renderHook(() => usePortfolioContent("about", {}));
    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });

    // Second instance (same module = shared cache)
    const { result: r2 } = renderHook(() => usePortfolioContent("about", {}));

    expect(fetchMock).toHaveBeenCalledTimes(1); // Only fetched once
    expect(r2.current.loading).toBe(false);
    expect(r2.current.data).toEqual(fetchedData);
  });

  it("falls back to defaultData when fetch rejects", async () => {
    vi.stubGlobal("fetch", () => Promise.reject(new Error("Network error")));

    const { renderHook, act } = await import("@testing-library/react");
    const { usePortfolioContent } = await import("../lib/usePortfolioContent.js");

    const defaultData = { name: "Fallback" };
    const { result } = renderHook(() => usePortfolioContent("hero", defaultData));

    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });

    expect(result.current.data).toEqual(defaultData);
    expect(result.current.loading).toBe(false);
  });
});
