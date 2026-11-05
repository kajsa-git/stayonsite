// Applied only to explicitly labelled internal test records. A test can be
// visited through its direct link, but must not be advertised as real housing.
export const HUS_TEST_MARKER = "[HUS E2E TEST]";

export function isHusTestProperty(notes: string | null | undefined): boolean {
  return (notes ?? "").includes(HUS_TEST_MARKER);
}
