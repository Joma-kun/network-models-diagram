import { DefaultLinkModel} from '@projectstorm/react-diagrams';

export class BlueLinkModel extends DefaultLinkModel {
	constructor() {
		super({
			type: 'blue',
			width: 3
		});
	}
}