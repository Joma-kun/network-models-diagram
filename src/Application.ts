import createEngine, { DiagramModel, PortModelAlignment, DefaultLinkModel } from '@projectstorm/react-diagrams';
import { SimplePortFactory } from './Router/SimplePortFactory';
import { RouterNodeModel } from './Router/RouterNodeModel';
import { RouterPortModel } from './Router/RouterPortModel';
import { RouterNodeFactory } from './Router/RouterNodeFactory';
import yaml from 'js-yaml';
import { MemoPortModel } from './Memo/MemoPortModel';
import { MemoNodeFactory } from './Memo/MemoNodeFactory';
import { RedLinkFactory } from './RedLink/RedLinkFactory';
import { BlueLinkFactory } from './BlueLink/BlueLinkFactory';

export class Application {
    protected activeModel!: DiagramModel;
    protected diagramEngine: any;
    private cfNodesMap: Map<string, RouterNodeModel>;
    private blueYamlRoutes: Record<string, string[]> = {}; // 青いリンク用のYAML経路データ
    private redYamlRoutes: Record<string, string[]> = {}; // 赤いリンク用のYAML経路データ
    private linkCounters: Record<string, { blue: number; red: number }> = {}; // 各リンクの通過回数

    constructor() {
        this.diagramEngine = createEngine();
        this.cfNodesMap = new Map();
        this.newModel();

        // YAMLファイルを読み込み
        this.loadYamlData();
    }

    private async loadYamlData() {
        try {
            // 青いリンク用のYAMLをロード
            const responseBlue = await fetch('/data/cmd_kiki_none.yaml');
            const textBlue = await responseBlue.text();
            const parsedYamlBlue = yaml.load(textBlue);

            const communicationRoutesBlue = parsedYamlBlue?.['none']?.['communication-route'];
            if (communicationRoutesBlue) {
                Object.entries(communicationRoutesBlue).forEach(([routeKey, routeData]: [string, any]) => {
                    const icmpRoute = routeData?.icmp;
                    if (icmpRoute && Array.isArray(icmpRoute)) {
                        this.blueYamlRoutes[routeKey.toLowerCase()] = icmpRoute.map((node: string) => node.toLowerCase());
                    }
                });
            }

            // 赤いリンク用のYAMLをロード
            const responseRed = await fetch('/data/cmd_kiki_Cf4_int.yaml');
            const textRed = await responseRed.text();
            const parsedYamlRed = yaml.load(textRed);

            const communicationRoutesRed = parsedYamlRed?.['none']?.['communication-route'];
            if (communicationRoutesRed) {
                Object.entries(communicationRoutesRed).forEach(([routeKey, routeData]: [string, any]) => {
                    const icmpRoute = routeData?.icmp;
                    if (icmpRoute && Array.isArray(icmpRoute)) {
                        this.redYamlRoutes[routeKey.toLowerCase()] = icmpRoute.map((node: string) => node.toLowerCase());
                    }
                });
            }

            // 全ノードを生成
            this.createAllNodes();
        } catch (error) {
            console.error("Error loading YAML:", error);
        }
    }

    private createAllNodes() {
        const cfNodes = new Set<string>();
        Object.values(this.blueYamlRoutes).forEach((routeNodes) => {
            routeNodes.forEach((node) => {
                if (node.startsWith("cf")) {
                    cfNodes.add(node);
                }
            });
        });

        Object.values(this.redYamlRoutes).forEach((routeNodes) => {
            routeNodes.forEach((node) => {
                if (node.startsWith("cf")) {
                    cfNodes.add(node);
                }
            });
        });

        this.createCfNodes(cfNodes);
    }

    public updateDisplayedRoutes(selectedRoutes: Record<string, boolean>) {
        const model = this.getActiveDiagram();
    
        // 現在のリンクを削除 (Memo-Router 間のリンクは除外)
        Object.values(model.getLinks()).forEach((link) => {
            const sourcePort = link.getSourcePort();
            const targetPort = link.getTargetPort();
    
            // Memo-Router 間のリンクは削除対象から除外
            const isMemoRouterLink =
                (sourcePort && sourcePort.getNode().getType() === 'memo' &&
                 targetPort && targetPort.getNode().getType() === 'router') ||
                (sourcePort && sourcePort.getNode().getType() === 'router' &&
                 targetPort && targetPort.getNode().getType() === 'memo');
    
            if (!isMemoRouterLink) {
                model.removeLink(link);
            }
        });
    
        // リンクの通過回数をリセット
        this.linkCounters = {};
    
        // 選択された経路に基づいて通過回数をカウント（青と赤）
        Object.entries(selectedRoutes).forEach(([routeKey, isSelected]) => {
            if (isSelected) {
                const [startNode, endNode] = routeKey.split("-");
                this.countPassagesForRoute(startNode.toLowerCase(), endNode.toLowerCase(), this.blueYamlRoutes, 'blue');
                this.countPassagesForRoute(startNode.toLowerCase(), endNode.toLowerCase(), this.redYamlRoutes, 'red');
            }
        });
    
        // 通過回数に基づいてリンクを再生成（青と赤）
        Object.entries(selectedRoutes).forEach(([routeKey, isSelected]) => {
            if (isSelected) {
                const [startNode, endNode] = routeKey.split("-");
                this.createLinksForRoute(startNode.toLowerCase(), endNode.toLowerCase(), this.blueYamlRoutes, 'blue', PortModelAlignment.LEFT);
                this.createLinksForRoute(startNode.toLowerCase(), endNode.toLowerCase(), this.redYamlRoutes, 'red', PortModelAlignment.TOP);
            }
        });
    
        // 再描画
        this.diagramEngine.repaintCanvas();
    }
    

    private countPassagesForRoute(
        startNode: string,
        endNode: string,
        routes: Record<string, string[]>,
        color: 'blue' | 'red'
    ) {
        // 対応する `cl` を取得
        const matchingRouteKey = Object.keys(routes).find((routeKey) => {
            const [clStart, clEnd] = routeKey.split("-");
            return clStart === startNode.replace("cf", "cl") && clEnd === endNode.replace("cf", "cl");
        });

        if (!matchingRouteKey) {
            console.warn(`指定されたYAML経路が見つかりませんでした: ${startNode} -> ${endNode}`);
            return;
        }

        const nodes = routes[matchingRouteKey];
        const startIndex = nodes.indexOf(startNode);
        const endIndex = nodes.indexOf(endNode);

        if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
            console.log(`カウント中のYAML経路: ${matchingRouteKey} -> 経路: ${nodes.slice(startIndex, endIndex + 1).join(" -> ")}`);

            for (let i = startIndex; i < endIndex; i++) {
                const linkKey = `${nodes[i]}-${nodes[i + 1]}`;
                if (!this.linkCounters[linkKey]) {
                    this.linkCounters[linkKey] = { blue: 0, red: 0 };
                }
                this.linkCounters[linkKey][color] += 1;
            }
        } else {
            console.warn(`指定された経路のインデックスが不正です: ${startNode} -> ${endNode}`);
        }
    }

    private createLinksForRoute(
        startNode: string,
        endNode: string,
        routes: Record<string, string[]>,
        color: string,
        portAlignment: PortModelAlignment
    ) {
        const calculateThickness = (passageCount: number) => {
            return Math.min(Math.ceil(passageCount / 2), 10); // 太さを通過回数に応じて計算
        };
    
        let routeFound = false;
    
        const filteredRoutes = Object.entries(routes).filter(([routeKey, nodes]) => {
            return nodes.includes(startNode) && nodes.includes(endNode);
        });
    
        filteredRoutes.forEach(([routeKey, nodes]) => {
            const startIndex = nodes.indexOf(startNode);
            const endIndex = nodes.indexOf(endNode);
    
            if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
                routeFound = true;
    
                console.log(`参照しているYAML経路: ${routeKey} -> 経路: ${nodes.slice(startIndex, endIndex + 1).join(" -> ")}`);
    
                for (let i = startIndex; i < endIndex; i++) {
                    const sourceNode = this.cfNodesMap.get(nodes[i]);
                    const targetNode = this.cfNodesMap.get(nodes[i + 1]);
                    const linkKey = `${nodes[i]}-${nodes[i + 1]}`;
                    const passageCount = this.linkCounters?.[linkKey]?.[color as 'blue' | 'red'] || 0;
    
                    if (sourceNode && targetNode) {
                        const thickness = calculateThickness(passageCount);
                        console.log(`リンク ${linkKey} の太さ: ${thickness}, 通過回数: ${passageCount}`);
    
                        const link = new DefaultLinkModel({ color });
                        link.getOptions().curvyness = 0; // 直線に設定
                        link.getOptions().width = passageCount/2; // 太さを設定　よう確認
                        link.addLabel(`${passageCount}回`); // 通過回数ラベル
    
                        link.setSourcePort(sourceNode.getPort(portAlignment));
                        link.setTargetPort(targetNode.getPort(portAlignment));
                        this.activeModel.addLink(link);
                    }
                }
            }
        });
    
        if (!routeFound) {
            console.warn(`指定された経路が見つかりませんでした: ${startNode} -> ${endNode}`);
        }
    }
    
    

    private createCfNodes(cfNodes: Set<string>) {
        let x = 100;
        let y = 100;

        const sortedCfNodes = Array.from(cfNodes).sort((a, b) => {
            const numA = parseInt(a.replace("cf", ""), 10);
            const numB = parseInt(b.replace("cf", ""), 10);
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

    public newModel() {
        this.activeModel = new DiagramModel();
        this.activeModel.setGridSize(50);
        this.diagramEngine.setModel(this.activeModel);

        this.diagramEngine.getPortFactories().registerFactory(new SimplePortFactory('router', (config) => new RouterPortModel(PortModelAlignment.LEFT)));
        this.diagramEngine.getNodeFactories().registerFactory(new RouterNodeFactory());
        this.diagramEngine.getPortFactories().registerFactory(new SimplePortFactory('memo', (config) => new MemoPortModel(PortModelAlignment.LEFT)));
        this.diagramEngine.getNodeFactories().registerFactory(new MemoNodeFactory());
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
