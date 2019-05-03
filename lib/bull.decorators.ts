import {Inject} from '@nestjs/common';
import {getQueueToken} from './bull.utils';
import {
    BULL_MODULE_QUEUE_LISTENER,
    BULL_MODULE_PROCESS,
    BULL_MODULE_ON_ERROR,
    BULL_MODULE_ON_WAITING,
    BULL_MODULE_ON_ACTIVE,
    BULL_MODULE_ON_STALLED,
    BULL_MODULE_ON_PROGRESS,
    BULL_MODULE_ON_COMPLETED,
    BULL_MODULE_ON_FAILED,
    BULL_MODULE_ON_PAUSED,
    BULL_MODULE_ON_RESUMED,
    BULL_MODULE_ON_CLEANED,
    BULL_MODULE_ON_DRAINED,
    BULL_MODULE_ON_REMOVED,
    BULL_MODULE_ON_GLOBAL_ERROR,
    BULL_MODULE_ON_GLOBAL_WAITING,
    BULL_MODULE_ON_GLOBAL_ACTIVE,
    BULL_MODULE_ON_GLOBAL_STALLED,
    BULL_MODULE_ON_GLOBAL_PROGRESS,
    BULL_MODULE_ON_GLOBAL_COMPLETED,
    BULL_MODULE_ON_GLOBAL_FAILED,
    BULL_MODULE_ON_GLOBAL_PAUSED,
    BULL_MODULE_ON_GLOBAL_RESUMED,
    BULL_MODULE_ON_GLOBAL_CLEANED,
    BULL_MODULE_ON_GLOBAL_DRAINED,
    BULL_MODULE_ON_GLOBAL_REMOVED,
    BULL_MODULE_ON_EVENT
} from './bull.constants';
import {BullQueueEvent} from './bull.types';

export function InjectQueue(name?: string): ParameterDecorator {
    return Inject(getQueueToken(name));
}

export const QueueListener = (options?: { name?: string }): ClassDecorator => {
    return (target: any) => {
        Reflect.defineMetadata(
            BULL_MODULE_QUEUE_LISTENER,
            options || {},
            target
        );
    };
};

export const Process = (options?: { name?: string, concurrency?: number }) => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_PROCESS,
            options,
            target,
            propertyName,
        );
    };
};

export const OnEvent = (eventName: BullQueueEvent) => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_ON_EVENT,
            { eventName },
            target,
            propertyName
        );
    };
};

export const OnError = () => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_ON_ERROR,
            null,
            target,
            propertyName,
        );
    };
};

export const OnWaiting = () => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_ON_WAITING,
            null,
            target,
            propertyName,
        );
    };
};

export const OnActive = () => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_ON_ACTIVE,
            null,
            target,
            propertyName,
        );
    };
};

export const OnStalled = () => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_ON_STALLED,
            null,
            target,
            propertyName,
        );
    };
};

export const OnProgress = () => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_ON_PROGRESS,
            null,
            target,
            propertyName,
        );
    };
};

export const OnCompleted = () => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_ON_COMPLETED,
            null,
            target,
            propertyName,
        );
    };
};

export const OnFailed = () => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_ON_FAILED,
            null,
            target,
            propertyName,
        );
    };
};

export const OnPaused = () => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_ON_PAUSED,
            null,
            target,
            propertyName,
        );
    };
};

export const OnResumed = () => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_ON_RESUMED,
            null,
            target,
            propertyName,
        );
    };
};

export const OnCleaned = () => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_ON_CLEANED,
            null,
            target,
            propertyName,
        );
    };
};

export const OnDrained = () => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_ON_DRAINED,
            null,
            target,
            propertyName,
        );
    };
};

export const OnRemoved = () => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_ON_REMOVED,
            null,
            target,
            propertyName,
        );
    };
};

export const OnGlobalError = () => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_ON_GLOBAL_ERROR,
            null,
            target,
            propertyName,
        );
    };
};

export const OnGlobalWaiting = () => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_ON_GLOBAL_WAITING,
            null,
            target,
            propertyName,
        );
    };
};

export const OnGlobalActive = () => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_ON_GLOBAL_ACTIVE,
            null,
            target,
            propertyName,
        );
    };
};

export const OnGlobalStalled = () => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_ON_GLOBAL_STALLED,
            null,
            target,
            propertyName,
        );
    };
};

export const OnGlobalProgress = () => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_ON_GLOBAL_PROGRESS,
            null,
            target,
            propertyName,
        );
    };
};

export const OnGlobalCompleted = () => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_ON_GLOBAL_COMPLETED,
            null,
            target,
            propertyName,
        );
    };
};

export const OnGlobalFailed = () => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_ON_GLOBAL_FAILED,
            null,
            target,
            propertyName,
        );
    };
};

export const OnGlobalPaused = () => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_ON_GLOBAL_PAUSED,
            null,
            target,
            propertyName,
        );
    };
};

export const OnGlobalResumed = () => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_ON_GLOBAL_RESUMED,
            null,
            target,
            propertyName,
        );
    };
};

export const OnGlobalCleaned = () => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_ON_GLOBAL_CLEANED,
            null,
            target,
            propertyName,
        );
    };
};

export const OnGlobalDrained = () => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_ON_GLOBAL_DRAINED,
            null,
            target,
            propertyName,
        );
    };
};

export const OnGlobalRemoved = () => {
    return (target: any, propertyName: string) => {
        Reflect.defineMetadata(
            BULL_MODULE_ON_GLOBAL_REMOVED,
            null,
            target,
            propertyName,
        );
    };
};
