import type { AlertRule, AlertHit, TelemetrySample } from './AlertRule.js';
import { OffRouteRule, OverspeedRule, StoppedTooLongRule } from './telemetryRules.js';

// Rol Context del patron Strategy: corre todas las reglas aplicables
// sobre una muestra y junta las alertas que se disparan.
export class AlertRuleEngine {
  constructor(private readonly rules: AlertRule[]) {}

  run(sample: TelemetrySample): AlertHit[] {
    return this.rules
      .filter((rule) => rule.applies(sample))
      .map((rule) => rule.evaluate(sample))
      .filter((hit): hit is AlertHit => hit !== null);
  }
}

// Motor con las tres reglas del RF-14 registradas.
export const telemetryAlertEngine = new AlertRuleEngine([
  new OffRouteRule(),
  new OverspeedRule(),
  new StoppedTooLongRule(),
]);
