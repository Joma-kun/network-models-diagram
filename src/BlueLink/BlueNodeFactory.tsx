import { RouterNodeWidget } from '../Router/RouterNodeWidget';
import { RouterNodeModel } from '../Router/RouterNodeModel';
import * as React from 'react';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';

export class BlueNodeFactory extends AbstractReactFactory<RouterNodeModel, DiagramEngine> {
	constructor() {
		super('blue');
	}

	generateReactWidget(event: { model: any; }): JSX.Element {
		return <RouterNodeWidget engine={this.engine} size={150} node={event.model} />;
	}

	generateModel(event: any) {
		return new RouterNodeModel();
	}
}