'use strict';

import { ServerOptions, HasAsyncListen, IServer, promisifyListen } from '@sane/promisify-listen';

export interface IService {
    start(): Promise<void>;
    stop(): Promise<void>;
}

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

