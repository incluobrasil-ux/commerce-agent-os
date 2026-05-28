export class EcommercePipelineError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'pipeline_root_not_found'
      | 'python_not_found'
      | 'project_not_found'
      | 'step_failed'
      | 'timeout',
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'EcommercePipelineError';
  }
}
