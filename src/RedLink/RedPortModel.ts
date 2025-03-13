import { LinkModel, PortModel, DefaultLinkModel, PortModelAlignment } from '@projectstorm/react-diagrams';
import { RedLinkModel } from "./RedLinkModel"

export class RedPortModel extends PortModel {
	constructor(alignment: PortModelAlignment) {
		super({
			type: 'red',
			name: alignment,
			alignment: alignment
		});
	}

	createLinkModel(): RedLinkModel {
		return new RedLinkModel();
	}
}