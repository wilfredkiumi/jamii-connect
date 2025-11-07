/**
 * Logger utility for structured logging
 * Replaces console.log/error with proper logging that can be configured per environment
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  error?: Error
}

class Logger {
  private isDevelopment: boolean
  private minLevel: LogLevel

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production'
    // In production, only log warnings and errors
    this.minLevel = this.isDevelopment ? 'debug' : 'warn'
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    return levels.indexOf(level) >= levels.indexOf(this.minLevel)
  }

  private formatEntry(entry: LogEntry): string {
    const { level, message, timestamp, context } = entry

    if (this.isDevelopment) {
      // Colorful console output for development
      const colors = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m',  // Green
        warn: '\x1b[33m',  // Yellow
        error: '\x1b[31m', // Red
      }
      const reset = '\x1b[0m'

      let output = `${colors[level]}[${level.toUpperCase()}]${reset} ${timestamp} - ${message}`

      if (context && Object.keys(context).length > 0) {
        output += `\n  Context: ${JSON.stringify(context, null, 2)}`
      }

      return output
    }

    // JSON format for production (easier to parse by log aggregators)
    return JSON.stringify(entry)
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } as any : undefined,
    }

    const formatted = this.formatEntry(entry)

    // Send to appropriate console method
    switch (level) {
      case 'debug':
      case 'info':
        console.log(formatted)
        break
      case 'warn':
        console.warn(formatted)
        break
      case 'error':
        console.error(formatted)
        if (error && this.isDevelopment) {
          console.error(error)
        }
        break
    }

    // In production, you could send logs to a service like CloudWatch, Sentry, etc.
    if (!this.isDevelopment && (level === 'error' || level === 'warn')) {
      this.sendToLogService(entry)
    }
  }

  private sendToLogService(entry: LogEntry): void {
    // TODO: Integrate with CloudWatch Logs or similar service
    // For now, this is a placeholder
    // You can use AWS SDK to send logs to CloudWatch:
    // const cloudWatchLogs = new CloudWatchLogsClient({ region: 'us-east-1' })
    // await cloudWatchLogs.send(new PutLogEventsCommand(...))
  }

  /**
   * Debug level logging - verbose information for development
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context)
  }

  /**
   * Info level logging - general informational messages
   */
  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context)
  }

  /**
   * Warning level logging - potentially harmful situations
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context)
  }

  /**
   * Error level logging - error events that might still allow the app to continue
   */
  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', message, context, error)
  }

  /**
   * Log API call for debugging
   */
  api(method: string, url: string, status?: number, duration?: number): void {
    this.info('API Call', {
      method,
      url,
      status,
      duration: duration ? `${duration}ms` : undefined,
    })
  }

  /**
   * Log user action for analytics
   */
  userAction(action: string, details?: Record<string, any>): void {
    this.info('User Action', {
      action,
      ...details,
    })
  }
}

// Export singleton instance
export const logger = new Logger()

// Convenience exports
export const logDebug = (message: string, context?: Record<string, any>) => logger.debug(message, context)
export const logInfo = (message: string, context?: Record<string, any>) => logger.info(message, context)
export const logWarn = (message: string, context?: Record<string, any>) => logger.warn(message, context)
export const logError = (message: string, error?: Error, context?: Record<string, any>) => logger.error(message, error, context)
export const logApi = (method: string, url: string, status?: number, duration?: number) => logger.api(method, url, status, duration)
export const logUserAction = (action: string, details?: Record<string, any>) => logger.userAction(action, details)
