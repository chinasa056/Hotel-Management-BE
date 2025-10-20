import DomainError from './DomainError';
import { Errors } from '../constant/errors';

export default class ConflictError extends DomainError {
  protected error_name = 'conflict';

  protected httpCode = 400;

  public constructor(
    message: string = Errors.CONFLICT,
    error: Error | null,
    data: any = null,
    success = false,
  ) {
    super(message, error, data, success);
    Error.captureStackTrace(this, this.constructor);
  }
}
