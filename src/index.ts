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
 * Run an async function over and over, as a service.
 */
export class LoopRunner implements IService {
    runP: Promise<void> = null;
    stopRequested: boolean = false;

    constructor(public loopFn: () => Promise<void>) {
        /* Empty */
    }
    async start(): Promise<void> {
        if(this.runP === null) {
            this.runP = this._run();
        }
    }
    async stop(): Promise<void> {
        if(this.runP !== null) {
            this.stopRequested = true;
            await this.runP;
            this.runP = null;
            this.stopRequested = false;
        }
    }
    async _run(): Promise<void> {
        while(!this.stopRequested) {
            await this.loopFn();
        }
    }
}
