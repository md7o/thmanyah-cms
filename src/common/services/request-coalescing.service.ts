import { Injectable } from '@nestjs/common';

@Injectable()
export class RequestCoalescingService {
  private readonly requestMap = new Map<string, Promise<any>>();

  async execute<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    if (this.requestMap.has(key)) {
      return this.requestMap.get(key);
    }

    const promise = fetcher().finally(() => {
      this.requestMap.delete(key);
    });

    this.requestMap.set(key, promise);
    return promise;
  }

  getInFlightRequestCount(): number {
    return this.requestMap.size;
  }

  clearAll(): void {
    this.requestMap.clear();
  }

  clearKey(key: string): void {
    this.requestMap.delete(key);
  }
}
