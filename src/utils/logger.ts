/**
 * Professional logging utility
 * In production, these would typically integrate with a logging service
 */

/* eslint-disable no-console */
export const logger = {
  error: (message: string, ...args: unknown[]) => {
    if (__DEV__) {
      console.error(`[ERROR] ${message}`, ...args);
    }
    // In production, send to logging service (Sentry, LogRocket, etc.)
  },
  
  warn: (message: string, ...args: unknown[]) => {
    if (__DEV__) {
      console.warn(`[WARN] ${message}`, ...args);
    }
    // In production, send to logging service
  },
  
  info: (message: string, ...args: unknown[]) => {
    if (__DEV__) {
      console.info(`[INFO] ${message}`, ...args);
    }
    // In production, send to logging service
  },
  
  debug: (message: string, ...args: unknown[]) => {
    if (__DEV__) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
    // Debug logs typically not sent to production logging
  }
};