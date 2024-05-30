// @ts-nocheck
import React from 'react';
import _keys from 'lodash/keys';
import styled from '@emotion/styled';
import { TrayWidget } from '../components/TrayWidget';
import { Application } from '../Application';
import { TrayItemWidget } from '../components/TrayItemWidget';
import { DefaultNodeModel } from '@projectstorm/react-diagrams';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { DiagramCanvasWidget } from '../DiagramCanvasWidget';
import { Button } from '@mui/material';
import { RouterNodeModel } from '../Router/RouterNodeModel';
import { SwitchNodeModel } from '../Switch/SwitchNodeModel';

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
    handleSerialize = () => {
        const { app } = this.props;
        const model = app.getActiveDiagram();
        const serializedData = JSON.stringify(model.serialize());
        const jsonObject = JSON.parse(serializedData);

        const linksData = jsonObject.layers
            .filter((layer: any) => layer.type === 'diagram-links')
            .map((layer: any) => Object.values(layer.models))
            .flat()
            .map((link: any) => ({ source: link.source, target: link.target }));

        const nodesData = jsonObject.layers
            .filter((layer: any) => layer.type === 'diagram-nodes')
            .map((layer: any) => Object.values(layer.models))
            .flat()
            .map((node: any) => {
                const modelNode = app.getDiagramEngine().getModel().getNode(node.id);
                if (modelNode instanceof RouterNodeModel) {
                    return {
                        id: node.id,
                        inputs: modelNode.getInputs()
                    };
                } else if (modelNode instanceof SwitchNodeModel) {
                    return {
                        id: node.id,
                        inputs: modelNode.getInputs()
                    };
                }
                return { id: node.id };
            });
            
        console.log("Links Data:", linksData);
        console.log("Nodes Data:", nodesData);
    };

    render() {
        return (
            <S.Body>
                <S.Header>
                    <div className="title">Diagram to Model</div>
                    <Button onClick={this.handleSerialize}>出力</Button>
                </S.Header>
                <S.Content>
                    <TrayWidget>
                        {/* <TrayItemWidget model={{ type: 'in' }} name="In Node" color="rgb(192,255,0)" />
                        <TrayItemWidget model={{ type: 'out' }} name="Out Node" color="rgb(0,192,255)" />
                        <TrayItemWidget model={{ type: 'diamond' }} name="Diamond Node" color="rgb(0,192,255)" /> */}
                        <TrayItemWidget model={{ type: 'router' }} name="Router Node" color="rgb(192,255,0)" />
                        <TrayItemWidget model={{ type: 'switch' }} name="Switch Node" color="rgb(0,192,255)" />
                    </TrayWidget>
                    <S.Layer
                        onDrop={(event) => {
                            var data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
                            var nodesCount = _keys(this.props.app.getDiagramEngine().getModel().getNodes()).length;

                            var node: DefaultNodeModel | null = null;
                            if (data.type === 'in') {
                                node = new DefaultNodeModel('Node ' + (nodesCount + 1), 'rgb(192,255,0)');
                                node.addInPort('In');
                            } else if(data.type === "diamond") {
                                node = new DiamondNodeModel();
                            } else if(data.type === "router") {
                                node = new RouterNodeModel();
                            } else if(data.type === "switch") {
                                node = new SwitchNodeModel();
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
