import * as React from 'react';
import { AbstractReactFactory, GenerateWidgetEvent } from '@projectstorm/react-canvas-core';
import { DiagramEngine, DefaultLinkModel } from '@projectstorm/react-diagrams';
import { EditableLabelModel } from './EditableLabelModel';
import { EditableLabelWidget } from './EditableLabelWidget';

export class EditableLabelFactory extends AbstractReactFactory<EditableLabelModel, DiagramEngine> {
    constructor() {
        super('editable-label');
    }

    generateModel(): EditableLabelModel {
        return new EditableLabelModel();
    }

    calculateLinkCenter(link: DefaultLinkModel) {
        const points = link.getPoints();
        if (points.length < 2) return { x: 0, y: 0 };

        const start = points[0].getPosition();
        const end = points[points.length - 1].getPosition();
        return {
            x: (start.x + end.x) / 2,
            y: (start.y + end.y) / 2,
        };
    }

    generateReactWidget(event: GenerateWidgetEvent<EditableLabelModel>): JSX.Element {
        const link = event.model.getParent() as DefaultLinkModel;
        const position = this.calculateLinkCenter(link);
        return <EditableLabelWidget model={event.model} x={position.x} y={position.y} />;
    }
}
