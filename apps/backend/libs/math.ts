export function floatToFrac(float_num: number) {
  function gcd(a: number, b: number) {
    if (b < 0.0000001) return a; // Since there is a limited precision we need to limit the value.

    return gcd(b, Math.floor(a % b)); // Discard any fractions due to limitations in precision.
  }

  const fraction = float_num;
  const len = fraction.toString().length - 2;

  const denominator = 10 ** len;
  const numerator = fraction * denominator;

  const divisor = gcd(numerator, denominator);

  const numerator_ = numerator / divisor;
  const denominator_ = denominator / divisor;

  return `${Math.floor(numerator_)}/${Math.floor(denominator_)}`;
}
