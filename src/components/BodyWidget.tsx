// @ts-nocheck
import React from 'react';
import _keys from 'lodash/keys';
import styled from '@emotion/styled';
import { TrayWidget } from '../components/TrayWidget';
import { Application } from '../Application';
import { TrayItemWidget } from '../components/TrayItemWidget';
import { DefaultNodeModel, DiagramModel } from '@projectstorm/react-diagrams';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { DiagramCanvasWidget } from '../DiagramCanvasWidget';
import { Button, Grid } from '@mui/material';
import { RouterNodeModel } from '../Router/RouterNodeModel';
import { SwitchNodeModel } from '../Switch/SwitchNodeModel';

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

const ButtonGrid = styled(Grid)`
    && {
        margin-left: 20px;
    }
`;

export class BodyWidget extends React.Component<{ app: Application }> {

    handleSerialize = (key) => {
        const { app } = this.props;
        const engine = app.getDiagramEngine();

        const model = engine.getModel();
        const serializedData = JSON.stringify(model.serialize());
        localStorage.setItem(key, serializedData);
        console.log(`Diagram serialized and saved to ${key} in localStorage`);
        console.log(serializedData);
    };

    handleDeserialize = (key) => {
        const { app } = this.props;
        const engine = app.getDiagramEngine();

        const savedDiagram = localStorage.getItem(key);
        if (savedDiagram) {
            const model2 = new DiagramModel();
            model2.deserializeModel(JSON.parse(savedDiagram), engine);
            engine.setModel(model2);
            this.forceUpdate();
            console.log(`Diagram deserialized and loaded from ${key} in localStorage`);
        }
    };

    handleSerializeToFile = () => {
        const { app } = this.props;
        const engine = app.getDiagramEngine();

        const model = engine.getModel();
        const serializedData = JSON.stringify(model.serialize(), null, 2);
        const blob = new Blob([serializedData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diagram.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Diagram serialized and saved as a file');
    };

    handleDrop = (event) => {
        const { app } = this.props;
        const engine = app.getDiagramEngine();

        var data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
        var nodesCount = _keys(engine.getModel().getNodes()).length;

        var node: DefaultNodeModel | null = null;
        if (data.type === 'in') {
            node = new DefaultNodeModel('Node ' + (nodesCount + 1), 'rgb(192,255,0)');
            node.addInPort('In');
        } else if (data.type === 'router') {
            node = new RouterNodeModel();
        } else if (data.type === 'switch') {
            node = new SwitchNodeModel();
        } else {
            node = new DefaultNodeModel('Node ' + (nodesCount + 1), 'rgb(0,192,255)');
            node.addOutPort('Out');
        }
        var point = engine.getRelativeMousePoint(event);
        node.setPosition(point);
        engine.getModel().addNode(node);
        this.forceUpdate();
    };

    render() {
        const { app } = this.props;
        return (
            <S.Body>
                <S.Header>
                    <div className="title">Diagram to Model</div>
                    <ButtonGrid container spacing={2}>
                        <Grid item>
                            <Button variant="contained" color="primary" onClick={() => this.handleSerialize('savedDiagram1')}>Save Slot 1</Button>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" color="primary" onClick={() => this.handleSerialize('savedDiagram2')}>Save Slot 2</Button>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" color="primary" onClick={() => this.handleSerialize('savedDiagram3')}>Save Slot 3</Button>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" color="primary" onClick={() => this.handleSerialize('savedDiagram4')}>Save Slot 4</Button>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" color="primary" onClick={() => this.handleSerialize('savedDiagram5')}>Save Slot 5</Button>
                        </Grid>
                        <Grid item>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" onClick={this.handleSerializeToFile}>Save to File</Button>
                        </Grid>
                    </ButtonGrid>
                </S.Header>
                <S.Content>
                    <TrayWidget>
                        <TrayItemWidget model={{ type: 'router' }} name="Router Node" color="rgb(192,255,0)" />
                        <TrayItemWidget model={{ type: 'switch' }} name="Switch Node" color="rgb(0,192,255)" />
                    </TrayWidget>
                    <S.Layer
                        onDrop={this.handleDrop}
                        onDragOver={(event) => {
                            event.preventDefault();
                        }}
                    >
                        <DiagramCanvasWidget app={app}>
                            <CanvasWidget engine={app.getDiagramEngine()} />
                        </DiagramCanvasWidget>
                    </S.Layer>
                </S.Content>
            </S.Body>
        );
    }
}
