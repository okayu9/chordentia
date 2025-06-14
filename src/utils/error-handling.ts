/**
 * Centralized error handling utilities
 */

// Custom error types
export class ChordParsingError extends Error {
  constructor(
    message: string,
    public readonly input: string
  ) {
    super(message);
    this.name = 'ChordParsingError';
  }
}

export class InvalidNoteError extends Error {
  constructor(note: string) {
    super(`Invalid note: ${note}`);
    this.name = 'InvalidNoteError';
  }
}

export class InvalidChordQualityError extends Error {
  constructor(quality: string) {
    super(`Invalid chord quality: ${quality}`);
    this.name = 'InvalidChordQualityError';
  }
}

export class AudioContextError extends Error {
  constructor(message: string) {
    super(`Audio context error: ${message}`);
    this.name = 'AudioContextError';
  }
}

// Error handling utilities
export function isChordentiaError(
  error: unknown
): error is ChordParsingError | InvalidNoteError | InvalidChordQualityError | AudioContextError {
  return (
    error instanceof ChordParsingError ||
    error instanceof InvalidNoteError ||
    error instanceof InvalidChordQualityError ||
    error instanceof AudioContextError
  );
}

export function handleError(error: unknown, context: string): void {
  if (isChordentiaError(error)) {
    console.warn(`${context}: ${error.message}`);
  } else if (error instanceof Error) {
    console.error(`${context}: ${error.message}`);
  } else {
    console.error(`${context}: Unknown error occurred`);
  }
}

export function safeExecute<T>(fn: () => T, fallback: T, context: string): T {
  try {
    return fn();
  } catch (error) {
    handleError(error, context);
    return fallback;
  }
}

export function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  fallback: T,
  context: string
): Promise<T> {
  return fn().catch(error => {
    handleError(error, context);
    return fallback;
  });
}
