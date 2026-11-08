import { planDeCierre } from './cierre';

describe('planDeCierre', () => {
  it('si sobró Libre, lo mueve al ahorro el último día del mes', () => {
    expect(planDeCierre('2026-11', 125_000)).toEqual({ sobrante: 125_000, fecha: '2026-11-30' });
  });

  it('Libre en 0: no se mueve nada', () => {
    expect(planDeCierre('2026-11', 0)).toBeNull();
  });

  it('Libre negativo: no se mueve nada (el ahorro no tapa el hueco solo)', () => {
    expect(planDeCierre('2026-11', -40_000)).toBeNull();
  });

  it('en febrero usa el día 28', () => {
    expect(planDeCierre('2026-02', 100)?.fecha).toBe('2026-02-28');
  });
});
