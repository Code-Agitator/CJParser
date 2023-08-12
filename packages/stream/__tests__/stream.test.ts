import {stream} from "../index";

import {strict} from 'assert'

strict.strictEqual(stream(), 'Hello from stream');
console.info('stream tests passed');
