'use strict';

import * as http from 'http';
import { IService, Service, ServiceGroup } from './index';

class FailingService implements IService {
    start(): Promise<void> {
        return Promise.reject('Aieeeeee');
    }
    stop(): Promise<void> {
        return Promise.reject('IT BURNS');
    }
}

describe('service', () => {
    it('should start/stop a service', (done) => {
        var s = new Service(http.createServer(), { port: 31337 });
        s.start().then(() => {
            return s.stop();
        }).then(() => {
            done();
        }).catch(done);
    });
    it('should start/stop a service group', (done) => {
        var sg = new ServiceGroup([
            new Service(http.createServer(), { port: 31337 }),
            new Service(http.createServer(), { port: 31338 })
        ]);
        sg.start().then(() => {
            return sg.stop();
        }).then(() => {
            done();
        }).catch(done);
    });
    it('service group should fail on failure of a service', (done) => {
        var sg = new ServiceGroup([
            new Service(http.createServer(), { port: 31337 }),
            new FailingService()
        ]);
        sg.start().then(() => {
            done(Error('It should not have worked'));
        }).catch((err) => {
            done();
        });
    });
});
