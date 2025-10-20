import DomainError from './DomainError';
import { Errors } from '../constant/errors';

export default class InternalServerError extends DomainError {
  protected error_name = 'server_error';

  protected httpCode = 500;

  public constructor(
    message: string = Errors.SERVER_ERROR,
    error: Error,
    data: any = null,
    success = false,
  ) {
    super(message, error, data, success);
    Error.captureStackTrace(this, this.constructor);
  }
}
