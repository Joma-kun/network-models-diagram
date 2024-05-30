import { LinkModel, PortModel, DefaultLinkModel, PortModelAlignment } from '@projectstorm/react-diagrams';

export class SwitchPortModel extends PortModel {
	constructor(alignment: PortModelAlignment) {
		super({
			type: 'switch',
			name: alignment,
			alignment: alignment
		});
	}

	createLinkModel(): LinkModel {
		return new DefaultLinkModel();
	}
}