import createEngine, { DiagramModel, DefaultNodeModel } from '@projectstorm/react-diagrams';

export class Application {
    protected activeModel!: DiagramModel;
    protected diagramEngine: any;

    constructor() {
        this.diagramEngine = createEngine();
        this.newModel();
    }

    public newModel() {
        this.activeModel = new DiagramModel();
        this.diagramEngine.setModel(this.activeModel);

        var node1 = new DefaultNodeModel('Node 1', 'rgb(0,192,255)');
        let port = node1.addOutPort('Out');
        node1.setPosition(100, 100);

        var node2 = new DefaultNodeModel('Node 2', 'rgb(192,255,0)');
        let port2 = node2.addInPort('In');
        node2.setPosition(400, 100);

        let link1 = port.link(port2);

        this.activeModel.addAll(node1, node2, link1);
    }

    public getActiveDiagram(): DiagramModel {
        return this.activeModel;
    }

    public getDiagramEngine(): any {
        return this.diagramEngine;
    }
    
}
