import createEngine, { DiagramModel, DefaultNodeModel, PortModelAlignment } from '@projectstorm/react-diagrams';
import { DiamondNodeModel } from './diamond/DiamondNodeModel';
import { DiamondPortModel } from './diamond/DiamondPortModel';
import { SimplePortFactory } from './diamond/SimplePortFactory';
import { DiamondNodeFactory } from './diamond/DiamondNodeFactory';

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

        var node3 = new DiamondNodeModel();
        node3.setPosition(250, 200);

        let link1 = port.link(port2);

        // ファクトリーを登録
        this.diagramEngine.getPortFactories().registerFactory(new SimplePortFactory('diamond', (config) => new DiamondPortModel(PortModelAlignment.LEFT)));
        this.diagramEngine.getNodeFactories().registerFactory(new DiamondNodeFactory());

        this.activeModel.addAll(node1, node2, node3, link1);
    }

    public getActiveDiagram(): DiagramModel {
        return this.activeModel;
    }

    public getDiagramEngine(): any {
        return this.diagramEngine;
    }
}
