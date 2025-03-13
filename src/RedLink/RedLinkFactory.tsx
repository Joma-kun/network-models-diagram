import { DefaultLinkFactory } from '@projectstorm/react-diagrams';
import { RedLinkModel } from './RedLinkModel';
import { RedLinkSegment } from './RedLinkSegment';
import * as React from 'react';

export class RedLinkFactory extends DefaultLinkFactory {
	constructor() {
		super('red');
	}

	generateModel(): RedLinkModel {
		return new RedLinkModel();
	}

	generateLinkSegment(model: RedLinkModel, selected: boolean, path: string) {
		return (
			<g>
				<RedLinkSegment model={model} path={path} />
			</g>
		);
	}
}
