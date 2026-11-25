/** Steps to find one name among `n` by reading them one by one (worst case). */
export function linearSteps(n: number): number {
  return Math.max(1, Math.round(n));
}

/** Steps to find one name among `n` sorted names by halving (worst case). */
export function halvingSteps(n: number): number {
  return Math.floor(Math.log2(Math.max(1, n))) + 1;
}

/** 10^exp, the size of the directory for a slider position. */
export function sizeFor(exp: number): number {
  return Math.round(Math.pow(10, exp));
}

/** French number with non-breaking spaces (the narrow one is missing from many fonts). */
export function formatFr(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n).replace(/[  ]/g, ' ');
}
