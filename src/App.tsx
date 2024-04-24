import createEngine, { DiagramModel, DefaultNodeModel, DefaultLinkModel } from '@projectstorm/react-diagrams';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { DiagramCanvasWidget } from "./DiagramCanvasWidget";
import { Button } from "@mui/material";

export default () => {
    const engine = createEngine();
    const model = new DiagramModel();

    const node1 = new DefaultNodeModel({
        name: "ノード1",
        color: "rgb(0, 199, 255)"
    });
    node1.setPosition(100, 200);
    node1.addOutPort("1-1");
    node1.addOutPort("1-2");

    const node2 = new DefaultNodeModel({
        name: "ノード2",
        color: "rgb(199, 0, 255)"
    });
    node2.setPosition(300, 200);
    node2.addInPort("2-1");

    const node3 = new DefaultNodeModel({
        name: "ノード3",
        color: "rgb(255, 199, 0)"
    });
    node3.setPosition(300, 300);
    node3.addInPort("3-1");

    const link1 = new DefaultLinkModel();
    link1.addLabel("temp");
    link1.setSourcePort(node1.getPort("1-1")!);
    link1.setTargetPort(node2.getPort("2-1")!);

    model.addAll(node1, node2, node3, link1);
    engine.setModel(model);


    var jsonString = JSON.stringify(model.serialize());
    var jsonObject = JSON.parse(jsonString);

    // リンクのsourceとtargetのIDを抜き出す
    var linksData = jsonObject.layers
        .filter((layer: any) => layer.type === 'diagram-links')
        .map((layer: any) => Object.values(layer.models))
        .flat()
        .map((link: any) => ({ source: link.source, target: link.target }));

    // ノードのIDを抜き出す
    var nodesData = jsonObject.layers
        .filter((layer: any) => layer.type === 'diagram-nodes')
        .map((layer: any) => Object.keys(layer.models));


    return (
        <DiagramCanvasWidget>
            <div>
                <Button onClick={() => console.log(linksData, nodesData)}>aaa</Button>
            </div>
            <CanvasWidget engine={engine} />
        </DiagramCanvasWidget>
    );
};
