import { NodeModel, NodeModelGenerics, PortModelAlignment } from '@projectstorm/react-diagrams';
import { RouterPortModel } from './RouterPortModel';

export interface RouterNodeModelGenerics {
	PORT: RouterPortModel;
}

export class RouterNodeModel extends NodeModel<NodeModelGenerics & RouterNodeModelGenerics> {
	inputs: { DeviceModel: string; Hostname: string;};

	constructor() {
		super({
			type: 'router'
		});
		this.addPort(new RouterPortModel(PortModelAlignment.TOP));
		this.addPort(new RouterPortModel(PortModelAlignment.LEFT));
		this.addPort(new RouterPortModel(PortModelAlignment.BOTTOM));
		this.addPort(new RouterPortModel(PortModelAlignment.RIGHT));

		this.inputs = { DeviceModel: '', Hostname: ''};
    }

    setInputs(inputs: { DeviceModel: string; Hostname: string;}) {
        this.inputs = inputs;
    }

    getInputs() {
        return this.inputs;
    }
}
