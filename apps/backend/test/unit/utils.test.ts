import { safeInt } from "@repo/shared/src/data.helpers";
import { resolveError } from "~/utils/lib";

describe("safeInt", () => {
  it("doesn't fail when record breaks", () => {
    expect(safeInt("+24")).toBe(24);
    expect(safeInt("hello")).toBe(0);
    expect(safeInt("")).toBe(0);
    expect(safeInt("%20")).toBe(0);
    expect(safeInt(-1)).toBe(-1);
    expect(safeInt(-1.24)).toBe(-1);
  });
});

it("resolve unknown to Error object", () => {
  const error = new Error("No valid");

  expect(resolveError("No valid")).toMatchObject(error);
  expect(resolveError({ message: "No valid" })).toMatchObject(error);
  expect(resolveError(error)).toBe(error);

  expect(resolveError([])).toMatchObject(new Error("Unknown error"));
  expect(resolveError(undefined)).toMatchObject(new Error("Unknown error"));
  expect(resolveError(null)).toMatchObject(new Error("Unknown error"));
  expect(resolveError({})).toMatchObject(new Error("Unknown error"));
});
