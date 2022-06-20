#!/usr/bin/env node
import { App } from '@src/App';

App.run().finally(() => console.info('Collector terminated.'));
