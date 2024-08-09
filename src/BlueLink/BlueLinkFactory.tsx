import { DefaultLinkFactory } from '@projectstorm/react-diagrams';
import { BlueLinkModel } from './BlueLinkModel';
import { BlueLinkSegment } from './BlueLinkSegment';
import * as React from 'react';

export class BlueLinkFactory extends DefaultLinkFactory {
	constructor() {
		super('blue');
	}

	generateModel(): BlueLinkModel {
		return new BlueLinkModel();
	}

	generateLinkSegment(model: BlueLinkModel, selected: boolean, path: string) {
		return (
			<g>
				<BlueLinkSegment model={model} path={path} />
			</g>
		);
	}
}
