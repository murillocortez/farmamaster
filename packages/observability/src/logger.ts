export interface Logger {
    info(message: string, context?: Record<string, any>): void;
    error(message: string, error?: Error, context?: Record<string, any>): void;
    warn(message: string, context?: Record<string, any>): void;
}

export class JsonLogger implements Logger {
    private serviceName: string;

    constructor(serviceName: string) {
        this.serviceName = serviceName;
    }

    private format(level: string, message: string, context?: Record<string, any>, error?: Error) {
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            service: this.serviceName,
            level,
            message,
            context,
            error: error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : undefined
        });
    }

    info(message: string, context?: Record<string, any>) {
        console.log(this.format('INFO', message, context));
    }

    error(message: string, error?: Error, context?: Record<string, any>) {
        console.error(this.format('ERROR', message, context, error));
    }

    warn(message: string, context?: Record<string, any>) {
        console.warn(this.format('WARN', message, context));
    }
}

export const createLogger = (service: string) => new JsonLogger(service);
