import createEngine, { DiagramModel, PortModelAlignment } from '@projectstorm/react-diagrams';
import { SimplePortFactory } from './Router/SimplePortFactory';
import { RouterNodeModel } from './Router/RouterNodeModel';
import { RouterPortModel } from './Router/RouterPortModel';
import { RouterNodeFactory } from './Router/RouterNodeFactory';
import { SwitchNodeModel } from './Switch/SwitchNodeModel';
import { SwitchPortModel } from './Switch/SwitchPortModel';
import { SwitchNodeFactory } from './Switch/SwitchNodeFactory';
import { RedLinkFactory } from './RedLink/RedLinkFactory';
import { RedNodeFactory } from './RedLink/RedNodeFactory'
import { BlueNodeFactory } from './BlueLink/BlueNodeFactory';
import { BlueLinkFactory } from './BlueLink/BlueLinkFactory';
import { BluePortModel } from './BlueLink/BluePortModel';
import { RedPortModel } from './RedLink/RedPortModel';


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
        var node2 = new RouterNodeModel();
        var node3 = new RouterNodeModel();
        var node4 = new RouterNodeModel();
        var node5 = new RouterNodeModel();
        var node6 = new RouterNodeModel();
        var node7 = new RouterNodeModel();
        var node8 = new RouterNodeModel();
        var node9 = new RouterNodeModel();
        node1.setPosition(600, 0);
        node2.setPosition(600, 200);
        node3.setPosition(100, 200);
        node4.setPosition(100, 400);
        node5.setPosition(100, 600);
        node6.setPosition(600, 600);
        node7.setPosition(1100, 600);
        node8.setPosition(1100, 400);
        node9.setPosition(1100, 200);





        this.diagramEngine.getPortFactories().registerFactory(new SimplePortFactory('router', (config) => new RouterPortModel(PortModelAlignment.LEFT)));
        this.diagramEngine.getNodeFactories().registerFactory(new RouterNodeFactory());
        this.diagramEngine.getPortFactories().registerFactory(new SimplePortFactory('switch', (config) => new SwitchPortModel(PortModelAlignment.LEFT)));
        this.diagramEngine.getNodeFactories().registerFactory(new SwitchNodeFactory());
        this.diagramEngine.getNodeFactories().registerFactory(new RedNodeFactory());
        this.diagramEngine.getNodeFactories().registerFactory(new BlueNodeFactory());
        this.diagramEngine.getLinkFactories().registerFactory(new RedLinkFactory());
        this.diagramEngine.getLinkFactories().registerFactory(new BlueLinkFactory());
        this.diagramEngine.getPortFactories().registerFactory(
            new SimplePortFactory('red', (config) => new RedPortModel(PortModelAlignment.RIGHT))
        );
        this.diagramEngine.getPortFactories().registerFactory(
            new SimplePortFactory('blue', (config) => new BluePortModel(PortModelAlignment.LEFT))
        );
        
        this.activeModel.addAll(node1, node2, node3, node4, node5, node6, node7, node8, node9);
    }

    public getActiveDiagram(): DiagramModel {
        return this.activeModel;
    }

    public getDiagramEngine(): any {
        return this.diagramEngine;
    }
}
