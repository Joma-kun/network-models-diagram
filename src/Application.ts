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
  // cfNodesMap や YAML 経路情報は、メイン用のものとして保持
  private cfNodesMap: Map<string, RouterNodeModel>;
  private blueYamlRoutes: Record<string, string[]> = {};
  private redYamlRoutes: Record<string, string[]> = {};
  public memoCount: number = 0; // グローバルなメモカウント
  public yamlLoaded: boolean = false; // YAML 読み込み完了フラグ

  constructor() {
    this.diagramEngine = createEngine();
    this.cfNodesMap = new Map();
    this.newModel();
    this.loadYamlData();
  }

  // 分割表示用のエンジンを生成する
  public createDiagramEngine(): any {
    if (!this.yamlLoaded) {
      console.warn("YAML data not loaded yet. Right engine may have no nodes.");
    }
    const engine = createEngine();
    const newModel = new DiagramModel();
    newModel.setGridSize(50);
    engine.setModel(newModel);

    engine.getPortFactories().registerFactory(
      new SimplePortFactory('router', (config) => new RouterPortModel(PortModelAlignment.LEFT))
    );
    engine.getNodeFactories().registerFactory(new RouterNodeFactory());
    engine.getPortFactories().registerFactory(
      new SimplePortFactory('memo', (config) => new MemoPortModel(PortModelAlignment.LEFT))
    );
    engine.getNodeFactories().registerFactory(new MemoNodeFactory());
    engine.getLinkFactories().registerFactory(new RedLinkFactory());
    engine.getLinkFactories().registerFactory(new BlueLinkFactory());

    // 右側エンジン用のノードをグリッド状に配置（位置を若干オフセット）
    this.createAllNodesForEngine(engine);

    return engine;
  }

  // 新規エンジン用のノード生成（グリッドレイアウト）
  private createAllNodesForEngine(engine: any) {
    const cfNodes = new Set<string>();
    // blue, red 両方の YAML 経路情報から cf ノードを抽出
    Object.values(this.blueYamlRoutes).forEach(routeNodes => {
      routeNodes.forEach(node => { if (node.startsWith("cf")) cfNodes.add(node); });
    });
    Object.values(this.redYamlRoutes).forEach(routeNodes => {
      routeNodes.forEach(node => { if (node.startsWith("cf")) cfNodes.add(node); });
    });
    const sortedCfNodes = Array.from(cfNodes).sort((a, b) => {
      const numA = parseInt(a.replace("cf", ""), 10);
      const numB = parseInt(b.replace("cf", ""), 10);
      return numA - numB;
    });
    const N = sortedCfNodes.length;
    const columns = Math.ceil(Math.sqrt(N)); // おおよその正方形グリッド
    const cellWidth = 250;
    const cellHeight = 150;
    const marginX = 50;
    const marginY = 50;
    sortedCfNodes.forEach((nodeId, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = marginX + col * cellWidth;
      const y = marginY + row * cellHeight;
      const node = new RouterNodeModel(nodeId);
      // ノードオプションに名前を明示的にセット
      if (node.getOptions) {
        (node.getOptions() as any).name = nodeId;
      }
      node.setPosition(x, y);
      engine.getModel().addNode(node);
    });
    engine.repaintCanvas();
  }

  // 対象エンジン／モデルに対して、選択された経路に基づくリンク更新を行う
  public updateDisplayedRoutesForEngine(engine: any, selectedRoutes: Record<string, boolean>) {
    const model = engine.getModel();
    // 既存リンクの削除（Memo-Router 間は除外）
    Object.values(model.getLinks() as any).forEach((link: any) => {
      const sourcePort = link.getSourcePort();
      const targetPort = link.getTargetPort();
      const isMemoRouterLink =
        (sourcePort && sourcePort.getNode().getType() === 'memo' &&
         targetPort && targetPort.getNode().getType() === 'router') ||
        (sourcePort && sourcePort.getNode().getType() === 'router' &&
         targetPort && targetPort.getNode().getType() === 'memo');
      if (!isMemoRouterLink) { model.removeLink(link); }
    });

    // 各選択経路ごとにリンクを生成する（シンプルに生成）
    Object.entries(selectedRoutes).forEach(([routeKey, isSelected]) => {
      if (isSelected) {
        const [startNode, endNode] = routeKey.split("-");
        // blue 側
        this.createLinksForRouteForEngine(startNode.toLowerCase(), endNode.toLowerCase(), this.blueYamlRoutes, 'blue', PortModelAlignment.LEFT, engine);
        // red 側
        this.createLinksForRouteForEngine(startNode.toLowerCase(), endNode.toLowerCase(), this.redYamlRoutes, 'red', PortModelAlignment.TOP, engine);
      }
    });

    engine.repaintCanvas();
  }

  // ユーザー選択の経路に対応する YAML 経路に沿ってリンクを生成する
  // YAML 経路が見つからない／インデックスが不正な場合は、直接リンク生成
  private createLinksForRouteForEngine(
    startNode: string,
    endNode: string,
    routes: Record<string, string[]>,
    color: 'blue' | 'red',
    portAlignment: PortModelAlignment,
    engine: any
  ) {
    const directKey = `${startNode}-${endNode}`;
    const convertedKey = `${startNode.replace("cf", "cl")}-${endNode.replace("cf", "cl")}`;
    const matchingRouteKey = Object.keys(routes).find(routeKey =>
      routeKey === directKey || routeKey === convertedKey
    );
    const cfNodesMap = this.getCfNodesMapForEngine(engine);
    const sourceNode = cfNodesMap.get(startNode);
    const targetNode = cfNodesMap.get(endNode);
    if (!sourceNode || !targetNode) {
      console.warn(`ノードが見つかりません: ${startNode} または ${endNode}`);
      return;
    }
    if (matchingRouteKey) {
      const nodes = routes[matchingRouteKey];
      const startIndex = nodes.indexOf(startNode);
      const endIndex = nodes.indexOf(endNode);
      if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
        console.log(`使用する YAML 経路: ${matchingRouteKey} -> ${nodes.slice(startIndex, endIndex + 1).join(" -> ")}`);
        for (let i = startIndex; i < endIndex; i++) {
          const sNode = cfNodesMap.get(nodes[i]);
          const tNode = cfNodesMap.get(nodes[i + 1]);
          if (sNode && tNode) {
            const link = new DefaultLinkModel({ color });
            link.getOptions().curvyness = 0;
            link.getOptions().width = 5;
            link.addLabel("link");
            link.setSourcePort(sNode.getPort(portAlignment));
            link.setTargetPort(tNode.getPort(portAlignment));
            engine.getModel().addLink(link);
          }
        }
        return;
      } else {
        console.warn(`経路のインデックスが不正です: ${startNode} -> ${endNode}`);
      }
    }
    // フォールバック：直接リンク生成
    console.log(`直接リンク生成: ${startNode} -> ${endNode}`);
    const link = new DefaultLinkModel({ color });
    link.getOptions().curvyness = 0;
    link.getOptions().width = 5;
    link.addLabel("link");
    link.setSourcePort(sourceNode.getPort(portAlignment));
    link.setTargetPort(targetNode.getPort(portAlignment));
    engine.getModel().addLink(link);
  }

  // 対象エンジン内の RouterNodeModel を再構築する（単純な例）
  private getCfNodesMapForEngine(engine: any): Map<string, any> {
    const map = new Map<string, any>();
    const nodes = engine.getModel().getNodes();
    nodes.forEach((node: any) => {
      if (node.getOptions && node.getOptions().name) {
        map.set(node.getOptions().name.toLowerCase(), node);
      }
    });
    return map;
  }

  // YAML ファイルを読み込み、経路情報を保持する
  private async loadYamlData() {
    try {
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

      // メインエンジン用の全ノード生成
      this.createAllNodes();
      this.yamlLoaded = true;
    } catch (error) {
      console.error("Error loading YAML:", error);
    }
  }

  // メインエンジン用の全ノード生成（グリッドレイアウト）
  private createAllNodes() {
    const cfNodes = new Set<string>();
    Object.values(this.blueYamlRoutes).forEach(routeNodes => {
      routeNodes.forEach(node => { if (node.startsWith("cf")) cfNodes.add(node); });
    });
    Object.values(this.redYamlRoutes).forEach(routeNodes => {
      routeNodes.forEach(node => { if (node.startsWith("cf")) cfNodes.add(node); });
    });
    const sortedCfNodes = Array.from(cfNodes).sort((a, b) => {
      const numA = parseInt(a.replace("cf", ""), 10);
      const numB = parseInt(b.replace("cf", ""), 10);
      return numA - numB;
    });
    const N = sortedCfNodes.length;
    const columns = Math.ceil(Math.sqrt(N)); // おおよその正方形グリッド
    const cellWidth = 250;
    const cellHeight = 150;
    const marginX = 50;
    const marginY = 50;
    sortedCfNodes.forEach((nodeId, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = marginX + col * cellWidth;
      const y = marginY + row * cellHeight;
      const node = new RouterNodeModel(nodeId);
      if (node.getOptions) {
        (node.getOptions() as any).name = nodeId;
      }
      node.setPosition(x, y);
      this.diagramEngine.getModel().addNode(node);
    });
    this.diagramEngine.repaintCanvas();
  }

  public newModel() {
    this.activeModel = new DiagramModel();
    this.activeModel.setGridSize(50);
    this.diagramEngine.setModel(this.activeModel);

    this.diagramEngine.getPortFactories().registerFactory(
      new SimplePortFactory('router', (config) => new RouterPortModel(PortModelAlignment.LEFT))
    );
    this.diagramEngine.getNodeFactories().registerFactory(new RouterNodeFactory());
    this.diagramEngine.getPortFactories().registerFactory(
      new SimplePortFactory('memo', (config) => new MemoPortModel(PortModelAlignment.LEFT))
    );
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
