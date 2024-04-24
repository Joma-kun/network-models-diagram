import createEngine, { DiagramModel, DefaultNodeModel, DefaultLinkModel } from '@projectstorm/react-diagrams';
import * as React from 'react';
import { CanvasWidget } from '@projectstorm/react-canvas-core';

import { DemoCanvasWidget} from "./DemoCanvasWidget"

function App() {
    const engine = createEngine();
    const model = new DiagramModel();

    const node1 = new DefaultNodeModel({
        name: "ノード1",
        color: "rgb(0, 199, 255)"
    });
    node1.setPosition(300, 200);
    node1.addOutPort("1-1");
    node1.addInPort("1-1");
    node1.addOutPort("1-2");

    const node2 = new DefaultNodeModel({
        name: "ノード2",
        color: "rgb(199, 0, 255)"
    });
    node2.setPosition(600, 200);
    node2.addInPort("2-1");


    const link1 = new DefaultLinkModel();
    link1.setSourcePort(node1.getPort("1-1")!);
    link1.setTargetPort(node2.getPort("2-1")!);

    model.addAll(node1, node2, link1);
    engine.setModel(model);

    return (
        <DemoCanvasWidget>
            <CanvasWidget engine={engine} />
        </DemoCanvasWidget>
    )
}

export default App