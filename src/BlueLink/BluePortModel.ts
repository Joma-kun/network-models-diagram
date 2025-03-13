import { LinkModel, PortModel, DefaultLinkModel, PortModelAlignment } from '@projectstorm/react-diagrams';
import { BlueLinkModel } from "./BlueLinkModel"

export class BluePortModel extends PortModel {
	constructor(alignment: PortModelAlignment) {
		super({
			type: 'blue',
			name: alignment,
			alignment: alignment
		});
	}

	createLinkModel(): BlueLinkModel {
		return new BlueLinkModel();
	}
}