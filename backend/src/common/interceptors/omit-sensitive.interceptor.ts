import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const SENSITIVE_KEYS = new Set(['password', 'refreshTokenHash']);

function isPlainObject(value: object): boolean {
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function omitSensitiveFields<T>(value: T): T {
  return strip(value, new WeakSet()) as T;
}

function strip(value: unknown, seen: WeakSet<object>): unknown {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return value;
  if (typeof value !== 'object') return value;
  if (seen.has(value)) return value;

  if (Array.isArray(value)) {
    seen.add(value);
    return value.map((item) => strip(item, seen));
  }

  if (!isPlainObject(value)) return value;

  seen.add(value);
  const output: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    if (SENSITIVE_KEYS.has(key)) continue;
    output[key] = strip(nested, seen);
  }
  return output;
}

@Injectable()
export class OmitSensitiveInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => omitSensitiveFields(data)));
  }
}
