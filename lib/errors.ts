export class GoogleApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'GoogleApiError';
  }
}

export class RateLimitError extends GoogleApiError {
  constructor(message = 'Rate limit exceeded. Please try again later.') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

export class QuotaExceededError extends GoogleApiError {
  constructor(message = 'Quota exceeded.') {
    super(message, 403);
    this.name = 'QuotaExceededError';
  }
}

export class SheetNotFoundError extends GoogleApiError {
  constructor(message = 'Spreadsheet not found.') {
    super(message, 404);
    this.name = 'SheetNotFoundError';
  }
}

export class PermissionDeniedError extends GoogleApiError {
  constructor(message = 'Permission denied to access the spreadsheet.') {
    super(message, 403);
    this.name = 'PermissionDeniedError';
  }
}

export class TokenExpiredError extends GoogleApiError {
  constructor(message = 'Access token expired.') {
    super(message, 401);
    this.name = 'TokenExpiredError';
  }
}
