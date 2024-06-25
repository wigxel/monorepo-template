import { floatToFrac } from "~/libs/math";

it("should convert floats to fractions", () => {
  expect(floatToFrac(0.33)).toBe("33/100");
  expect(floatToFrac(0.1)).toBe("1/10");
  expect(floatToFrac(3 / 4)).toBe("3/4");
  expect(floatToFrac(1 / 4)).toBe("1/4");
});
