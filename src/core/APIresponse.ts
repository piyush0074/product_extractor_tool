import { Response } from 'express';

// Helper code for the API consumer to understand the error and handle is accordingly
enum Status {
  SUCCESS = 200,
  CREATE = 201,
  DUPLICATE = 409,
  FAILURE = 400,
  RETRY = 10002,
}

enum ResponseStatus {
  SUCCESS = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  DUPLICATE = 409,
  INTERNAL_ERROR = 500,
}
/* tslint:disable:max-classes-per-file */
abstract class ApiResponse {
    constructor(
      protected statusCode: Status,
      protected status: ResponseStatus,
      protected message: string,
    ) {}

    protected prepare<T extends ApiResponse>(res: Response, response: T): Response {
      return res.status(this.status).json(ApiResponse.sanitize(response));
    }

    public send(res: Response): Response {
      return this.prepare<ApiResponse>(res, this);
    }

    private static sanitize<T extends ApiResponse>(response: T): T {
      const clone: T = {} as T;
      Object.assign(clone, response);
      // @ts-ignore
      delete clone.status;
      for (const i in clone) if (typeof clone[i] === 'undefined') delete clone[i];
      return clone;
    }
  }

  export class AuthFailureResponse extends ApiResponse {
    constructor(message = 'Authentication Failure') {
      super(Status.FAILURE, ResponseStatus.UNAUTHORIZED, message);
    }
  }

  export class NotFoundResponse extends ApiResponse {
    private url: string | undefined;

    constructor(message = 'Not Found') {
      super(Status.FAILURE, ResponseStatus.NOT_FOUND, message);
    }

    override send(res: Response): Response {
      this.url = res.req?.originalUrl;
      return super.prepare<NotFoundResponse>(res, this);
    }
  }

  export class ForbiddenResponse extends ApiResponse {
    constructor(message = 'Forbidden') {
      super(Status.FAILURE, ResponseStatus.FORBIDDEN, message);
    }
  }

  export class BadRequestResponse extends ApiResponse {
    constructor(message = 'Bad Parameters') {
      super(Status.FAILURE, ResponseStatus.BAD_REQUEST, message);
    }
  }

  export class InternalErrorResponse extends ApiResponse {
    constructor(message = 'Internal Error') {
      super(Status.FAILURE, ResponseStatus.INTERNAL_ERROR, message);
    }
  }

  export class SuccessMsgResponse extends ApiResponse {
    constructor(status: string) {
      super(Status.SUCCESS, ResponseStatus.SUCCESS, status);
    }
  }

  export class CreateResponse extends ApiResponse{
    constructor(status: string) {
      super(Status.CREATE, ResponseStatus.CREATED, status);
    }
  }
  export class DuplicateResponse extends ApiResponse{
    constructor(status: string) {
      super(Status.DUPLICATE, ResponseStatus.DUPLICATE,status);
    }
  }
  export class FailureMsgResponse extends ApiResponse {
    constructor(message: string) {
      super(Status.FAILURE, ResponseStatus.SUCCESS, message);
    }
  }

  export class SuccessResponse<T> extends ApiResponse {
    constructor(message: string, private data: T) {
      super(Status.SUCCESS, ResponseStatus.SUCCESS, message);
    }

    override send(res: Response): Response {
      return super.prepare<SuccessResponse<T>>(res, this);
    }
  }

