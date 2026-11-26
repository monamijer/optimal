import { halvingSteps, linearSteps, sizeFor } from './scale-steps';

describe('scale-steps', () => {
  it('halving needs about log2(n) steps', () => {
    expect(halvingSteps(1)).toBe(1);
    expect(halvingSteps(10)).toBe(4);
    expect(halvingSteps(1000)).toBe(10);
    expect(halvingSteps(1_000_000)).toBe(20);
    expect(halvingSteps(1_000_000_000)).toBe(30);
  });
  it('linear reading needs n steps', () => {
    expect(linearSteps(1_000_000)).toBe(1_000_000);
  });
  it('sizeFor gives powers of ten', () => {
    expect(sizeFor(6)).toBe(1_000_000);
    expect(sizeFor(1)).toBe(10);
  });
});
