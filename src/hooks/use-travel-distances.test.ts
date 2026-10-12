import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTravelDistances } from "./use-travel-distances";

const { load, matrix } = vi.hoisted(() => ({ load: vi.fn(), matrix: vi.fn() }));
vi.mock("./use-google-places", () => ({ loadGoogleMapsLibrary: load }));

beforeEach(() => {
  vi.resetAllMocks();
  load.mockResolvedValue({ DistanceMatrixService: class { getDistanceMatrix = matrix; } });
});

describe("city driving times", () => {
  it("requests every destination without matching city names and keeps exact seconds", async () => {
    matrix.mockImplementation((_request, callback) => callback({ rows: [{ elements: [
      { status: "OK", distance: { text: "25 km", value: 25000 }, duration: { text: "30 min", value: 1801 } },
      { status: "ZERO_RESULTS" },
    ] }] }, "OK"));
    const { result } = renderHook(() => useTravelDistances("Stockholm, Sverige", [
      { id: "ronninge", address: "Dånviksvägen 30, Rönninge, Sverige" },
      { id: "unknown", address: "Okänd adress" },
    ]));
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(matrix.mock.calls[0][0]).toMatchObject({ origins: ["Stockholm, Sverige"], travelMode: "DRIVING" });
    expect(result.current.results.ronninge.durationSeconds).toBe(1801);
    expect(result.current.results.unknown).toBeUndefined();
  });

  it("reports API rejection instead of claiming an empty successful search", async () => {
    matrix.mockImplementation((_request, callback) => callback(null, "REQUEST_DENIED"));
    const { result } = renderHook(() => useTravelDistances("Gävle, Sverige", [{ id: "a", address: "Valbo" }]));
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.results).toEqual({});
  });

  it("does not show old city's routes while a new search is pending", async () => {
    const callbacks: Array<(response: unknown, status: string) => void> = [];
    matrix.mockImplementation((_request, callback) => callbacks.push(callback));
    const { result, rerender } = renderHook(({ city }) => useTravelDistances(city, [{ id: "a", address: "Valbo" }]), {
      initialProps: { city: "Gävle" },
    });
    await waitFor(() => expect(callbacks).toHaveLength(1));
    rerender({ city: "Stockholm" });
    expect(result.current.results).toEqual({});
    await waitFor(() => expect(callbacks).toHaveLength(2));
    act(() => callbacks[0]({ rows: [{ elements: [{ status: "OK", distance: { text: "1 km", value: 1000 }, duration: { text: "1 min", value: 60 } }] }] }, "OK"));
    expect(result.current.results).toEqual({});
    act(() => callbacks[1](null, "REQUEST_DENIED"));
    await waitFor(() => expect(result.current.status).toBe("error"));
  });
});
