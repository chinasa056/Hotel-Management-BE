import DomainError from './DomainError';
import { Errors } from '../constant/errors';

export default class AuthorizationError extends DomainError {
  protected error_name = 'conflict';

  protected httpCode = 403;

  public constructor(
    message: string = Errors.NOT_AUTHORIZED,
    error: Error | null,
    data: any = null,
    success = false,
  ) {
    super(message, error, data, success);
    Error.captureStackTrace(this, this.constructor);
  }
}
