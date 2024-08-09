import { DefaultLinkModel} from '@projectstorm/react-diagrams';

export class RedLinkModel extends DefaultLinkModel {
	constructor() {
		super({
			type: 'red',
			width: 3
		});
	}
}