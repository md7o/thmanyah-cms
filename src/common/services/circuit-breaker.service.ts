import { Injectable, Logger } from '@nestjs/common';
import CircuitBreaker from 'opossum';

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);

  createBreaker<T>(
    action: (...args: any[]) => Promise<T>,
    options: CircuitBreaker.Options = {},
  ): CircuitBreaker<any[], T> {
    const breaker = new CircuitBreaker(action, {
      timeout: 6000, // If action takes longer than 6 seconds, trigger failure
      errorThresholdPercentage: 50, // When 50% of requests fail, open the circuit
      resetTimeout: 10000, // After 10 seconds, try again
      ...options,
    });

    breaker.on('open', () => this.logger.warn(`Circuit breaker opened for ${action.name}`));
    breaker.on('halfOpen', () => this.logger.log(`Circuit breaker half-open for ${action.name}`));
    breaker.on('close', () => this.logger.log(`Circuit breaker closed for ${action.name}`));
    breaker.on('fallback', () => this.logger.warn(`Fallback triggered for ${action.name}`));

    return breaker;
  }
}
