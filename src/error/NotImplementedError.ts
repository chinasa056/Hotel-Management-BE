import DomainError from './DomainError';
import { Errors } from '../constant/errors';

export default class NotImplementedError extends DomainError {
  protected error_name = 'not_implemented';

  protected httpCode = 501;

  public constructor(
    message: string = Errors.NOT_IMPLEMENTED,
    error: Error | null,
    data: any = null,
    success = false,
  ) {
    super(message, error, data, success);
    Error.captureStackTrace(this, this.constructor);
  }
}
