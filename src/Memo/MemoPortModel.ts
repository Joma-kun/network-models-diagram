import { LinkModel, PortModel, DefaultLinkModel, PortModelAlignment } from '@projectstorm/react-diagrams';

export class MemoPortModel extends PortModel {
    constructor(alignment: PortModelAlignment) {
        super({
            type: 'memo',
            name: alignment,
            alignment: alignment
        });
    }

    createLinkModel(): LinkModel {
        return new DefaultLinkModel();
    }
}