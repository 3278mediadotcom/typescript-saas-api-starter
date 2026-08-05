/**
 * Structured JSON logger.
 *
 * Production systems need searchable logs.
 * Every log line is a JSON object so it can be
 * parsed, filtered, and indexed by tools like
 * Datadog, CloudWatch, or pino transports.
 */

type LogLevel = "debug" | "info" | "warn" | "error";


function log(level: LogLevel, message: string, meta?: unknown): void {
  const entry = {
    level,

    message,

    meta: meta ?? undefined,

    timestamp: new Date().toISOString(),
  };

  const line = JSON.stringify(entry);

  switch (level) {
    case "debug":
      if (process.env.NODE_ENV === "development") {
        console.debug(line);
      }

      break;

    case "info":
      console.info(line);

      break;

    case "warn":
      console.warn(line);

      break;

    case "error":
      console.error(line);

      break;
  }
}


export const logger = {
  debug(message: string, meta?: unknown): void {
    log("debug", message, meta);
  },

  info(message: string, meta?: unknown): void {
    log("info", message, meta);
  },

  warn(message: string, meta?: unknown): void {
    log("warn", message, meta);
  },

  error(message: string, meta?: unknown): void {
    log("error", message, meta);
  },
};