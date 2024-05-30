import createEngine, { DiagramModel, PortModelAlignment } from '@projectstorm/react-diagrams';
import { SimplePortFactory } from './Router/SimplePortFactory';
import { RouterNodeModel } from './Router/RouterNodeModel';
import { RouterPortModel } from './Router/RouterPortModel';
import { RouterNodeFactory } from './Router/RouterNodeFactory';
import { SwitchNodeModel } from './Switch/SwitchNodeModel';
import { SwitchPortModel } from './Switch/SwitchPortModel';
import { SwitchNodeFactory } from './Switch/SwitchNodeFactory';

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

        var node1 = new RouterNodeModel();
        node1.setPosition(100, 200);

        var node2 = new SwitchNodeModel();
        node2.setPosition(500, 200);




        this.diagramEngine.getPortFactories().registerFactory(new SimplePortFactory('router', (config) => new RouterPortModel(PortModelAlignment.LEFT)));
        this.diagramEngine.getNodeFactories().registerFactory(new RouterNodeFactory());
        this.diagramEngine.getPortFactories().registerFactory(new SimplePortFactory('switch', (config) => new SwitchPortModel(PortModelAlignment.LEFT)));
        this.diagramEngine.getNodeFactories().registerFactory(new SwitchNodeFactory());

        this.activeModel.addAll(node1, node2);
    }

    public getActiveDiagram(): DiagramModel {
        return this.activeModel;
    }

    public getDiagramEngine(): any {
        return this.diagramEngine;
    }
}
