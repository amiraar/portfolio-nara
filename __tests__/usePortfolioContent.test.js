import { describe, it, expect, vi, beforeEach } from "vitest";

// usePortfolioContent uses fetch + React hooks — we test the caching logic in isolation.
// The module-level cache is reset between tests by re-importing the module.
//
// Since the rewrite, the hook fires a single GET /api/portfolio (no ?section=) that
// returns { [section]: data } for ALL sections.  The response shape is therefore:
//   { hero: {...}, about: {...}, experience: [...], ... }

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

  it("updates data and stops loading after batch fetch resolves", async () => {
    const fetchedData = { name: "From DB" };
    vi.stubGlobal("fetch", () =>
      Promise.resolve({ json: () => Promise.resolve({ hero: fetchedData }) })
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
      Promise.resolve({ json: () => Promise.resolve({ about: fetchedData }) })
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

  it("batch fetch populates multiple sections in a single GET /api/portfolio call", async () => {
    const heroData = { name: "Hero" };
    const aboutData = { heading: "About" };
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ hero: heroData, about: aboutData }),
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const { renderHook, act } = await import("@testing-library/react");
    const { usePortfolioContent } = await import("../lib/usePortfolioContent.js");

    // Mount hero first — this triggers the batch fetch
    const { result: heroResult } = renderHook(() => usePortfolioContent("hero", {}));
    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });

    // Mount about — should be served from cache (no second fetch)
    const { result: aboutResult } = renderHook(() => usePortfolioContent("about", {}));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/portfolio"); // no ?section= param
    expect(heroResult.current.data).toEqual(heroData);
    expect(aboutResult.current.data).toEqual(aboutData);
    expect(aboutResult.current.loading).toBe(false);
  });

  it("treats stale cache entries (>5 min) as a cache miss and re-fetches", async () => {
    const staleData = { name: "Stale" };
    const freshData = { name: "Fresh" };

    let callCount = 0;
    const fetchMock = vi.fn(() => {
      callCount += 1;
      const data = callCount === 1 ? staleData : freshData;
      return Promise.resolve({ json: () => Promise.resolve({ hero: data }) });
    });
    vi.stubGlobal("fetch", fetchMock);

    const nowSpy = vi.spyOn(Date, "now");

    const { renderHook, act } = await import("@testing-library/react");
    const { usePortfolioContent } = await import("../lib/usePortfolioContent.js");

    const t0 = Date.now();
    nowSpy.mockReturnValue(t0);

    // First load — populates cache
    const { result: r1 } = renderHook(() => usePortfolioContent("hero", {}));
    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
    expect(r1.current.data).toEqual(staleData);

    // Advance time past TTL (5 min = 300 000 ms)
    nowSpy.mockReturnValue(t0 + 6 * 60 * 1000);

    // Second load — should see stale and re-fetch
    const { result: r2 } = renderHook(() => usePortfolioContent("hero", {}));
    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(r2.current.data).toEqual(freshData);
  });
});
