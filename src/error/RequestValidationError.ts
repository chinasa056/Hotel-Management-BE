import DomainError from './DomainError';
import { Errors } from '../enum/error';

export default class RequestValidationError extends DomainError {
  protected error_name = 'validation_error';

  protected httpCode = 422;

  public constructor(
    message: string = Errors.REQUEST_VALIDATION,
    error: Error,
    data: any = null,
    success = false,
  ) {
    super(message, error, data, success);
    Error.captureStackTrace(this, this.constructor);
  }
}
