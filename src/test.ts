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

describe('service', function() {
    it('should start/stop a service', function(done) {
        var s = new Service(http.createServer(), { port: 31337 });
        s.start().then(function() {
            return s.stop();
        }).then(function() {
            done();
        }).catch(done);
    });
    it('should start/stop a service group', function(done) {
        var sg = new ServiceGroup([
            new Service(http.createServer(), { port: 31337 }),
            new Service(http.createServer(), { port: 31338 })
        ]);
        sg.start().then(function () {
            return sg.stop();
        }).then(function () {
            done();
        }).catch(done);
    });
    it('service group should fail on failure of a service', function(done) {
        var sg = new ServiceGroup([
            new Service(http.createServer(), { port: 31337 }),
            new FailingService()
        ]);
        sg.start().then(function () {
            done(Error('It should not have worked'));
        }).catch(function (err) {
            done();
        });
    });
});
