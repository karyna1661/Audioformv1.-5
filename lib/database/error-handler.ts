export interface DatabaseError {
  code: string
  message: string
  details?: any
  hint?: string
}

export class SurveyDatabaseError extends Error {
  public code: string
  public details?: any
  public hint?: string

  constructor(error: DatabaseError) {
    super(error.message)
    this.name = "SurveyDatabaseError"
    this.code = error.code
    this.details = error.details
    this.hint = error.hint
  }
}

export function handleDatabaseError(error: any): SurveyDatabaseError {
  console.error("Database error:", error)

  // Handle specific Supabase error codes
  switch (error.code) {
    case "PGRST116":
      return new SurveyDatabaseError({
        code: "NOT_FOUND",
        message: "Survey not found or no longer available",
        details: error.details,
        hint: "The survey may have been deleted or expired",
      })

    case "PGRST106":
      return new SurveyDatabaseError({
        code: "MULTIPLE_ROWS",
        message: "Multiple surveys found with the same ID",
        details: error.details,
        hint: "Database integrity issue - contact support",
      })

    case "23505":
      return new SurveyDatabaseError({
        code: "DUPLICATE_RESPONSE",
        message: "Response already exists for this survey",
        details: error.details,
        hint: "You may have already responded to this survey",
      })

    case "23503":
      return new SurveyDatabaseError({
        code: "FOREIGN_KEY_VIOLATION",
        message: "Invalid survey or question reference",
        details: error.details,
        hint: "The survey or question may no longer exist",
      })

    default:
      return new SurveyDatabaseError({
        code: "UNKNOWN_ERROR",
        message: error.message || "An unexpected database error occurred",
        details: error.details,
        hint: "Please try again or contact support if the issue persists",
      })
  }
}

export function logDatabaseOperation(operation: string, data: any, result?: any, error?: any) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    operation,
    data: JSON.stringify(data, null, 2),
    result: result ? JSON.stringify(result, null, 2) : null,
    error: error ? JSON.stringify(error, null, 2) : null,
  }

  console.log(`[DB Operation] ${operation}:`, logEntry)

  // In production, you might want to send this to a logging service
  if (process.env.NODE_ENV === "production" && error) {
    // Send to logging service like Sentry, LogRocket, etc.
  }
}
