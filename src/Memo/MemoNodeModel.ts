import { DefaultPortModel, NodeModel, NodeModelGenerics, PortModelAlignment } from '@projectstorm/react-diagrams';
import { MemoPortModel } from './MemoPortModel';
import { RedPortModel } from '../RedLink/RedPortModel';
import { BluePortModel } from '../BlueLink/BluePortModel';

export interface MemoNodeModelGenerics {
    PORT: MemoPortModel;
}

export class MemoNodeModel extends NodeModel<NodeModelGenerics & MemoNodeModelGenerics> {
    inputs: { DeviceModel: string; Hostname: string; };
    memoName: string;

    constructor(memoName: string) {
        super({
            type: 'memo'
        });
        this.memoName = memoName;
        this.addPort(new DefaultPortModel(true, PortModelAlignment.BOTTOM));

        this.inputs = { DeviceModel: '', Hostname: ''};
    }

    setInputs(inputs: { DeviceModel: string; Hostname: string;}) {
        this.inputs = inputs;
    }

    getInputs() {
        return this.inputs;
    }
    
    getMemoName() {
        return this.memoName;
    }
}
