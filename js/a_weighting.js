export default function aWeighting(f) {
  const f2 = f*f

  const numerator = 148693636 * f2 * f2 
  const denom1 = 148693636 + f2
  const denom2 = 424.36    + f2
  const denom3 = 11599.29  + f2
  const denom4 = 544496.41 + f2

  return numerator/(denom1 * denom2 * Math.sqrt(denom3 * denom4))
}
