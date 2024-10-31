import createEngine, { DiagramModel, PortModelAlignment, DefaultLinkModel } from '@projectstorm/react-diagrams';
import { SimplePortFactory } from './Router/SimplePortFactory';
import { RouterNodeModel } from './Router/RouterNodeModel';
import { RouterPortModel } from './Router/RouterPortModel';
import { RouterNodeFactory } from './Router/RouterNodeFactory';
import { RedLinkFactory } from './RedLink/RedLinkFactory';
import { RedNodeFactory } from './RedLink/RedNodeFactory';
import { BlueNodeFactory } from './BlueLink/BlueNodeFactory';
import { BlueLinkFactory } from './BlueLink/BlueLinkFactory';
import yaml from 'js-yaml';

export class Application {
    protected activeModel!: DiagramModel;
    protected diagramEngine: any;
    private cfNodesMap: Map<string, RouterNodeModel>;
    private linkCounter: Map<string, { blue: number; red: number }>; // 色ごとの通過回数

    constructor() {
        this.diagramEngine = createEngine();
        this.cfNodesMap = new Map();
        this.linkCounter = new Map();
        this.newModel();

        // YAMLファイルを読み込み、Cfノードを生成・リンクする非同期関数を呼び出し
        this.loadYamlData();
    }

    // YAMLファイルを非同期に読み込んで、Cfノードを生成するメソッド
    private async loadYamlData() {
        try {
            const responseNone = await fetch('/data/cmd_kiki_none.yaml');
            const textNone = await responseNone.text();
            const parsedYamlNone = yaml.load(textNone);

            const responseInt = await fetch('/data/cmd_kiki_Cf4_int.yaml');
            const textInt = await responseInt.text();
            const parsedYamlInt = yaml.load(textInt);

            const communicationRoutesNone = parsedYamlNone?.['none']?.['communication-route'];
            const communicationRoutesInt = parsedYamlInt?.['none']?.['communication-route'];

            if (!communicationRoutesNone || !communicationRoutesInt) {
                console.warn("communication-routeが見つかりませんでした");
                return;
            }

            const cfNodes = new Set<string>();
            this.countCfLinks(communicationRoutesNone, cfNodes, "blue");
            this.countCfLinks(communicationRoutesInt, cfNodes, "red");

            this.createCfNodes(cfNodes);
            this.createCfLinks("blue", PortModelAlignment.LEFT);
            this.createCfLinks("red", PortModelAlignment.TOP);
        } catch (error) {
            console.error("Error loading YAML:", error);
        }
    }

    private countCfLinks(routes: any, cfNodes: Set<string>, color: "blue" | "red") {
        Object.entries(routes).forEach(([_, routeEntries]: [string, any]) => {
            Object.values(routeEntries).forEach((nodes: any) => {
                const cfNodesInRoute = nodes.filter((node: string) => node.startsWith("Cf"));
                cfNodesInRoute.forEach((node: string) => cfNodes.add(node));

                for (let i = 0; i < cfNodesInRoute.length - 1; i++) {
                    const sourceNode = cfNodesInRoute[i];
                    const targetNode = cfNodesInRoute[i + 1];
                    const linkKey = [sourceNode, targetNode].sort().join("-");

                    const currentCounts = this.linkCounter.get(linkKey) || { blue: 0, red: 0 };
                    currentCounts[color] += 1;
                    this.linkCounter.set(linkKey, currentCounts);
                }
            });
        });
    }

    private createCfNodes(cfNodes: Set<string>) {
        let x = 100;
        let y = 100;

        const sortedCfNodes = Array.from(cfNodes).sort((a, b) => {
            const numA = parseInt(a.replace("Cf", ""), 10);
            const numB = parseInt(b.replace("Cf", ""), 10);
            return numA - numB;
        });

        sortedCfNodes.forEach((nodeId) => {
            const node = new RouterNodeModel(nodeId);
            node.setPosition(x, y);
            this.activeModel.addNode(node);
            this.cfNodesMap.set(nodeId, node);

            x += 200;
            if (x > 800) {
                x = 100;
                y += 200;
            }
        });

        this.diagramEngine.repaintCanvas();
    }

    private createCfLinks(color: "blue" | "red", portAlignment: PortModelAlignment) {
        this.linkCounter.forEach((count, linkKey) => {
            const [sourceNodeId, targetNodeId] = linkKey.split("-");
            const linkCount = count[color];
            if (linkCount > 0) {
                this.createLink(sourceNodeId, targetNodeId, color, portAlignment);
            }
        });
    }

    private createLink(sourceNodeId: string, targetNodeId: string, color: string, portAlignment: PortModelAlignment) {
        const sourceNode = this.cfNodesMap.get(sourceNodeId);
        const targetNode = this.cfNodesMap.get(targetNodeId);

        if (sourceNode && targetNode) {
            const link = new DefaultLinkModel({ color: color });
            link.getOptions().curvyness = 0;
            link.setSourcePort(sourceNode.getPort(portAlignment));
            link.setTargetPort(targetNode.getPort(portAlignment));
            this.activeModel.addLink(link);
        }
    }

    public newModel() {
        this.activeModel = new DiagramModel();
        this.diagramEngine.setModel(this.activeModel);

        this.diagramEngine.getPortFactories().registerFactory(new SimplePortFactory('router', (config) => new RouterPortModel(PortModelAlignment.LEFT)));
        this.diagramEngine.getNodeFactories().registerFactory(new RouterNodeFactory());
        this.diagramEngine.getNodeFactories().registerFactory(new RedNodeFactory());
        this.diagramEngine.getNodeFactories().registerFactory(new BlueNodeFactory());
        this.diagramEngine.getLinkFactories().registerFactory(new RedLinkFactory());
        this.diagramEngine.getLinkFactories().registerFactory(new BlueLinkFactory());
    }

    public getActiveDiagram(): DiagramModel {
        return this.activeModel;
    }

    public getDiagramEngine(): any {
        return this.diagramEngine;
    }
}
