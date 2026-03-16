import { StripePaymentDriver } from './stripe';
import { PolarPaymentDriver } from './polar';
import type { PaymentDriver, PaymentDriverConfig } from './types';

const drivers: Record<string, (config: PaymentDriverConfig) => PaymentDriver> = {
  stripe: (config) => new StripePaymentDriver(config),
  polar: (config) => new PolarPaymentDriver(config),
};

export function createPaymentDriver(config: PaymentDriverConfig): PaymentDriver {
  const factory = drivers[config.driver];
  if (!factory) throw new Error(`Payment driver "${config.driver}" not found`);
  return factory(config);
}
