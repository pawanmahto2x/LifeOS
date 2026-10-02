export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}

export class AIConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIConfigurationError';
  }
}
