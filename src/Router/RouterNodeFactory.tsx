import { RouterNodeWidget } from './RouterNodeWidget';
import { RouterNodeModel } from './RouterNodeModel';
import * as React from 'react';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';

export class RouterNodeFactory extends AbstractReactFactory<RouterNodeModel, DiagramEngine> {
	constructor() {
		super('router');
	}

	generateReactWidget(event: { model: any; }): JSX.Element {
		return <RouterNodeWidget engine={this.engine} size={150} node={event.model} />;
	}

	generateModel(event: any) {
		const routerName = event?.name || 'DefaultRouter';
        return new RouterNodeModel(routerName);
	}
}