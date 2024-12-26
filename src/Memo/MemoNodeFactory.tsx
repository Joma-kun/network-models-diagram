import { MemoNodeWidget } from './MemoNodeWidget';
import { MemoNodeModel } from './MemoNodeModel';
import * as React from 'react';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';

export class MemoNodeFactory extends AbstractReactFactory<MemoNodeModel, DiagramEngine> {
    constructor() {
        super('memo');
    }

    generateReactWidget(event: { model: any; }): JSX.Element {
        return <MemoNodeWidget engine={this.engine} size={150} node={event.model} />;
    }

    generateModel(event: any) {
        const memoName = event?.name || 'DefaultMemo';
        return new MemoNodeModel(memoName);
    }
}