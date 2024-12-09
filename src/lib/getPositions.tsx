export function getPositions(meta: any[]): number[] {
  const flatOffset = 0;
  const diagonalOffset = 0.5;
  const perpendicularOffset = 0.75;

  const newPositions: number[] = meta.map((entry) => {
    const rotation = entry.rotation;
    const spacing = entry.spacing / 100;
    if (rotation == 0) {
      return flatOffset + spacing;
    }
    if (rotation === 45) {
      return diagonalOffset + spacing;
    }
    if (rotation === 90) {
      return perpendicularOffset + spacing;
    }
    return 0;
  });
  return newPositions;
}
