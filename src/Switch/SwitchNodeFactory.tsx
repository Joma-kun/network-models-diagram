import { SwitchNodeWidget } from './SwitchNodeWidget';
import { SwitchNodeModel } from './SwitchNodeModel';
import * as React from 'react';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';

export class SwitchNodeFactory extends AbstractReactFactory<SwitchNodeModel, DiagramEngine> {
	constructor() {
		super('switch');
	}

	generateReactWidget(event: { model: any; }): JSX.Element {
		return <SwitchNodeWidget engine={this.engine} size={150} node={event.model} />;
	}

	generateModel(event: any) {
		return new SwitchNodeModel();
	}
}