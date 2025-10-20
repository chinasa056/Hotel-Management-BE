import DomainError from './DomainError';
import { Errors } from '../constant/errors';

export default class AuthenticationErrorError extends DomainError {
  protected error_name = 'not-authenticated';

  protected httpCode = 401;

  public constructor(
    message: string = Errors.NOT_AUTHENTICATED,
    error: Error | null,
    data: any = null,
    success = false,
  ) {
    super(message, error, data, success);
    Error.captureStackTrace(this, this.constructor);
  }
}
