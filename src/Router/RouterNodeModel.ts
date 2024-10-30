import { NodeModel, NodeModelGenerics, PortModelAlignment } from '@projectstorm/react-diagrams';
import { RouterPortModel } from './RouterPortModel';
import { RedPortModel } from '../RedLink/RedPortModel';
import { BluePortModel } from '../BlueLink/BluePortModel';

export interface RouterNodeModelGenerics {
    PORT: RouterPortModel;
}

export class RouterNodeModel extends NodeModel<NodeModelGenerics & RouterNodeModelGenerics> {
    inputs: { DeviceModel: string; Hostname: string; };
    routerName: string;

    constructor(routerName: string) {
        super({
            type: 'router'
        });
        this.routerName = routerName;
        this.addPort(new BluePortModel(PortModelAlignment.TOP));
        this.addPort(new BluePortModel(PortModelAlignment.LEFT));
        this.addPort(new RedPortModel(PortModelAlignment.BOTTOM));
        this.addPort(new RedPortModel(PortModelAlignment.RIGHT));

        this.inputs = { DeviceModel: '', Hostname: ''};
    }

    setInputs(inputs: { DeviceModel: string; Hostname: string;}) {
        this.inputs = inputs;
    }

    getInputs() {
        return this.inputs;
    }
    
    getRouterName() {
        return this.routerName;
    }
}
