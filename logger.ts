
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  details?: any[];
  expanded?: boolean;
}

type Listener = (logs: LogEntry[]) => void;

class LoggerService {
  private logs: LogEntry[] = [];
  private listeners: Listener[] = [];
  private static instance: LoggerService;
  private maxLogs = 200;

  private constructor() {
    this.hijackConsole();
    this.listenGlobalErrors();
    this.addLog('info', ['Logger initialized successfully']);
  }

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  public info(...args: any[]) {
    this.addLog('info', args);
  }

  public warn(...args: any[]) {
    this.addLog('warn', args);
  }

  public error(...args: any[]) {
    this.addLog('error', args);
  }

  public debug(...args: any[]) {
    this.addLog('debug', args);
  }

  private hijackConsole() {
    const originalLog = console.log.bind(console);
    const originalWarn = console.warn.bind(console);
    const originalError = console.error.bind(console);
    const originalDebug = console.debug.bind(console);

    console.log = (...args) => {
      this.addLog('info', args);
      originalLog(...args);
    };

    console.warn = (...args) => {
      this.addLog('warn', args);
      originalWarn(...args);
    };

    console.error = (...args) => {
      this.addLog('error', args);
      originalError(...args);
    };

    console.debug = (...args) => {
      this.addLog('debug', args);
      originalDebug(...args);
    };
  }

  private listenGlobalErrors() {
    window.addEventListener('error', (event) => {
      this.addLog('error', [`Uncaught Exception: ${event.message}`, event.filename, event.lineno, event.colno, event.error]);
    });

    window.addEventListener('unhandledrejection', (event) => {
      let msg = 'Unhandled Rejection';
      let details = event.reason;
      
      try {
        if (event.reason) {
          if (event.reason instanceof Error) {
            msg += `: ${event.reason.message}`;
            details = event.reason.stack;
          } else if (typeof event.reason === 'string') {
            msg += `: ${event.reason}`;
          } else {
             msg += `: ${JSON.stringify(event.reason)}`;
          }
        }
      } catch (e) {
        msg += ': (Circular or unstringifiable reason)';
      }
      
      this.addLog('error', [msg, details]);
    });
  }

  private addLog(level: LogEntry['level'], args: any[]) {
    // Run in a microtask to avoid blocking or recursion issues
    Promise.resolve().then(() => {
      try {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const timestamp = new Date().toLocaleTimeString();
        
        let message = '';
        try {
          message = args.map(arg => {
              if (arg === null) return 'null';
              if (arg === undefined) return 'undefined';
              if (typeof arg === 'string') return arg;
              if (typeof arg === 'number') return arg.toString();
              if (typeof arg === 'boolean') return arg.toString();
              if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
              if (typeof arg === 'object') {
                try {
                  return JSON.stringify(arg);
                } catch {
                  return '[Object]';
                }
              }
              return String(arg);
          }).join(' ');
        } catch (e) {
          message = 'Error formatting log message';
        }

        const entry: LogEntry = {
          id,
          timestamp,
          level,
          message: message.substring(0, 300), // Limit length
          details: args,
          expanded: false
        };

        this.logs.unshift(entry);
        if (this.logs.length > this.maxLogs) {
          this.logs.pop();
        }
        this.notify();
      } catch (err) {
        // Safe fail
      }
    });
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    listener(this.logs);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.logs));
  }

  clear() {
    this.logs = [];
    this.notify();
  }
}

export const logger = LoggerService.getInstance();
