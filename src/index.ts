'use strict';

import { ServerOptions, HasAsyncListen, IServer, promisifyListen } from '@sane/promisify-listen';

export interface IService {
    start(): Promise<void>;
    stop(): Promise<void>;
}

/**
 * Create a group of services. When you start and stop, all services in
 * the group are started or stopped.
 */
export class ServiceGroup implements IService {
    services: IService[];

    constructor(services: IService[]) {
        this.services = services;
    }
    start(): Promise<void> {
        return Promise.all(this.services.map(x => x.start()))
            .then(() => {});
    }
    stop(): Promise<void> {
        return Promise.all(this.services.map(x => x.stop()))
            .then(() => {});
    }
}

/**
 * Wrap a net.Server into a service.
 */
export class Service implements IService {
    server: HasAsyncListen;
    options: ServerOptions;

    constructor(server: IServer, options: ServerOptions) {
        this.server = promisifyListen(server);
        this.options = options;
    }
    start(): Promise<void> {
        return this.server.listenAsync(this.options);
    }
    stop(): Promise<void> {
        return this.server.closeAsync();
    }
}


/**
 * Config for LoopRunner
 */
export interface LoopRunnerConfig {
    onStart?: () => Promise<void>;
    loopFn?: () => Promise<void>;
    onStop?: () => Promise<void>;
}

/**
 * Run an async function over and over, as a service.
 */
export class LoopRunner implements IService {
    runP: Promise<void> = null;
    stopRequested: boolean = false;

    constructor(public config: LoopRunnerConfig) {
        /* Empty */
    }
    /** Request service start, wait for it to happen. Not re-entrant. */
    async start(): Promise<void> {
        if(this.runP !== null) {
            return;
        }
        if(this.config.onStart) {
            await this.config.onStart();
        }
        this.runP = this._run();
    }
    /** Request service stop, wait for it to happen. Not re-entrant. */
    async stop(): Promise<void> {
        if(this.runP === null) {
            return;
        }
        this.stopRequested = true;
        await this.runP;
        if(this.config.onStop) {
            await this.config.onStop();
        }
        this.runP = null;
        this.stopRequested = false;
    }
    /** Run loop. @private */
    async _run(): Promise<void> {
        while(!this.stopRequested) {
            await this.config.loopFn();
        }
    }
}
