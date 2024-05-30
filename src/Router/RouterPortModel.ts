import { LinkModel, PortModel, DefaultLinkModel, PortModelAlignment } from '@projectstorm/react-diagrams';

export class RouterPortModel extends PortModel {
	constructor(alignment: PortModelAlignment) {
		super({
			type: 'router',
			name: alignment,
			alignment: alignment
		});
	}

	createLinkModel(): LinkModel {
		return new DefaultLinkModel();
	}
}