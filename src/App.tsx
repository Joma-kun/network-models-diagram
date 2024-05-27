import React from 'react';
import { Application } from './Application';
import { BodyWidget } from './components/BodyWidget';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { Button } from '@mui/material';

export default () => {
    const app = new Application();

    return <BodyWidget app={app} />;
};
