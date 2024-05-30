import { NodeModel, NodeModelGenerics, PortModelAlignment } from '@projectstorm/react-diagrams';
import { SwitchPortModel } from './SwitchPortModel';

export interface SwitchNodeModelGenerics {
	PORT: SwitchPortModel;
}

export class SwitchNodeModel extends NodeModel<NodeModelGenerics & SwitchNodeModelGenerics> {
	inputs: { DeviceModel: string; Hostname: string;};

	constructor() {
		super({
			type: 'switch'
		});
		this.addPort(new SwitchPortModel(PortModelAlignment.TOP));
		this.addPort(new SwitchPortModel(PortModelAlignment.LEFT));
		this.addPort(new SwitchPortModel(PortModelAlignment.BOTTOM));
		this.addPort(new SwitchPortModel(PortModelAlignment.RIGHT));

		this.inputs = { DeviceModel: '', Hostname: ''};
    }

    setInputs(inputs: { DeviceModel: string; Hostname: string;}) {
        this.inputs = inputs;
    }

    getInputs() {
        return this.inputs;
    }
}
