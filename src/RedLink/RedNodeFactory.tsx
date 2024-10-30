import { RouterNodeWidget } from '../Router/RouterNodeWidget';
import { RouterNodeModel } from '../Router/RouterNodeModel';
import * as React from 'react';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';

export class RedNodeFactory extends AbstractReactFactory<RouterNodeModel, DiagramEngine> {
	constructor() {
		super('red');
	}

	generateReactWidget(event: { model: any; }): JSX.Element {
		return <RouterNodeWidget engine={this.engine} size={150} node={event.model} />;
	}

	generateModel(event: any) {
		const routerName = event?.name || 'DefaultRouter';
        return new RouterNodeModel(routerName);
	}
}