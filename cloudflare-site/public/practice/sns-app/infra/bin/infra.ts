#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SnsAppStack } from '../lib/sns-app-stack';

const app = new cdk.App();
new SnsAppStack(app, 'SnsAppStack');
