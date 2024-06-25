import { LogLevel, Logger } from "effect";

export const LogDebugLayer = Logger.minimumLogLevel(LogLevel.Debug);
