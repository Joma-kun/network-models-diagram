import React from 'react';
import _keys from 'lodash/keys';
import styled from '@emotion/styled';
import { TrayWidget } from '../components/TrayWidget';
import { Application } from '../Application';
import { TrayItemWidget } from '../components/TrayItemWidget';
import { DefaultNodeModel } from '@projectstorm/react-diagrams';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { DiagramCanvasWidget } from '../DiagramCanvasWidget';

export interface BodyWidgetProps {
    app: Application;
}

const S = {
    Body: styled.div`
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        min-height: 100%;
    `,
    Header: styled.div`
        display: flex;
        background: rgb(30, 30, 30);
        flex-grow: 0;
        flex-shrink: 0;
        color: white;
        font-family: Helvetica, Arial, sans-serif;
        padding: 10px;
        align-items: center;
    `,
    Content: styled.div`
        display: flex;
        flex-grow: 1;
    `,
    Layer: styled.div`
        position: relative;
        flex-grow: 1;
    `
};

export class BodyWidget extends React.Component<BodyWidgetProps> {
    render() {
        return (
            <S.Body>
                <S.Header>
                    <div className="title">Storm React Diagrams - DnD demo</div>
                </S.Header>
                <S.Content>
                    <TrayWidget>
                        <TrayItemWidget model={{ type: 'in' }} name="In Node" color="rgb(192,255,0)" />
                        <TrayItemWidget model={{ type: 'out' }} name="Out Node" color="rgb(0,192,255)" />
                    </TrayWidget>
                    <S.Layer
                        onDrop={(event) => {
                            var data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
                            var nodesCount = _keys(this.props.app.getDiagramEngine().getModel().getNodes()).length;

                            var node: DefaultNodeModel | null = null;
                            if (data.type === 'in') {
                                node = new DefaultNodeModel('Node ' + (nodesCount + 1), 'rgb(192,255,0)');
                                node.addInPort('In');
                            } else {
                                node = new DefaultNodeModel('Node ' + (nodesCount + 1), 'rgb(0,192,255)');
                                node.addOutPort('Out');
                            }
                            var point = this.props.app.getDiagramEngine().getRelativeMousePoint(event);
                            node.setPosition(point);
                            this.props.app.getDiagramEngine().getModel().addNode(node);
                            this.forceUpdate();
                        }}
                        onDragOver={(event) => {
                            event.preventDefault();
                        }}
                    >
                        <DiagramCanvasWidget app={this.props.app}>
                            <CanvasWidget engine={this.props.app.getDiagramEngine()} />
                        </DiagramCanvasWidget>
                    </S.Layer>
                </S.Content>
            </S.Body>
        );
    }
}
