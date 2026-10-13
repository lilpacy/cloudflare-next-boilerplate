export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = "Unauthorized") {
    super(message);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = "Forbidden") {
    super(message);
  }
}

export class NotFoundError extends DomainError {
  constructor(message = "Not found") {
    super(message);
  }
}

export class ValidationError extends DomainError {}
