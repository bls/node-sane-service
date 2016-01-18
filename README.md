# @sane/service

A service interface, for typescript.

Install
-------

```bash
npm install @sane/service --save
```

Example
-------

```javascript
import * as http from http;
import { Service, ServiceGroup } from '@sane/service';

let sg = new ServiceGroup([
    new Service(http.createServer(), { port: 31337 }),
    new Service(http.createServer(), { port: 31338 })
]);
await sg.start();
// Do stuff; both services are running now
```


Api
---

See [src/index.ts](src/index.ts). New services should implement
IService (just stop and start, no args, returning Promise<void>).

Compatibility
-------------

* Requires Node >= 0.4
* Works fine with JS, if using TypeScript, requires >= 1.5.0.

Release
-------

1. Bump up the version number in package.json
1. Add a section for the new release in CHANGELOG.md
1. Run npm run-script compile to ensure it builds
1. Commit
1. Run npm publish
1. Create a git tag for the new release and push it

