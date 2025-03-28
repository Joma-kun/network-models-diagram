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
  // YAML 経路情報（none 部のみ、キーは小文字で保持）
  private blueYamlRoutes: Record<string, string[]> = {};
  private redYamlRoutes: Record<string, string[]> = {};
  public memoCount: number = 0;
  public yamlLoaded: boolean = false;

  // 追加：各ルーターの情報を保持するディクショナリ
  public routerInfo: { [routerName: string]: any[] } = {};

  constructor() {
    this.diagramEngine = createEngine();
    this.newModel();
    this.loadYamlData();
    // JSON からルーター情報を取得して出力
    this.loadRouterInfo().then(info => {
      this.routerInfo = info;
      console.log("Aggregated router info:", this.routerInfo);
    }).catch(err => console.error(err));
  }

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

    this.createAllNodesForEngine(engine);
    return engine;
  }

  // 初期配置：9セルのレイアウト（各セルの配置は指定通り）
  private createAllNodesForEngine(engine: any) {
    const layout: { id: string, x: number, y: number }[] = [
      { id: "cf3", x: 50,  y: 225 },
      { id: "cf2", x: 350, y: 225 },
      { id: "cf9", x: 650, y: 225 },
      { id: "cf4", x: 50,  y: 425 },
      { id: "cf1", x: 350, y: 25 },
      { id: "cf8", x: 650, y: 425 },
      { id: "cf5", x: 50,  y: 625 },
      { id: "cf6", x: 350, y: 625 },
      { id: "cf7", x: 650, y: 625 },
    ];
    layout.forEach(item => {
      const node = new RouterNodeModel(item.id);
      if (node.getOptions) {
        (node.getOptions() as any).name = item.id;
      }
      node.setPosition(item.x, item.y);
      engine.getModel().addNode(node);
    });
    engine.repaintCanvas();
  }

  // cfX-cfY ルート選択時のカウントロジック（既存のコード）
  private countCfPairsForRoute(
    cfStart: string, cfEnd: string,
    yamlMap: Record<string, string[]>
  ): Record<string, number> {
    const counts: Record<string, number> = {};
    const clStart = cfStart.replace("cf", "cl");
    const clEnd = cfEnd.replace("cf", "cl");
    const keysToCheck = [`${clStart}-${clEnd}`, `${clEnd}-${clStart}`];
    keysToCheck.forEach(yamlKey => {
      if (yamlMap.hasOwnProperty(yamlKey)) {
        const nodes = yamlMap[yamlKey].map(n => n.trim().toLowerCase());
        console.log(`YAML key ${yamlKey} icmp array: ${JSON.stringify(nodes)}`);
        if (nodes.length < 3) return; // CF 部分がない
        const cfChain = nodes.slice(1, nodes.length - 1).filter(n => n.startsWith("cf"));
        console.log(`Extracted CF chain for ${yamlKey}: ${JSON.stringify(cfChain)}`);
        for (let i = 0; i < cfChain.length - 1; i++) {
          const pairKey = `${cfChain[i]}-${cfChain[i+1]}`;
          counts[pairKey] = (counts[pairKey] || 0) + 1;
          console.log(`Count for pair ${pairKey}: ${counts[pairKey]}`);
        }
      }
    });
    return counts;
  }

  // ルート選択に基づくリンク生成（既存のコード）
  public updateDisplayedRoutesForEngine(engine: any, selectedRoutes: Record<string, boolean>) {
    const model = engine.getModel();
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

    const blueCounters: Record<string, number> = {};
    const redCounters: Record<string, number> = {};

    Object.entries(selectedRoutes).forEach(([routeKey, isSelected]) => {
      if (!isSelected) return;
      console.log(`--- Selected route: ${routeKey} ---`);
      const [cfStart, cfEnd] = routeKey.trim().toLowerCase().split("-");
      console.log(`Processing route for YAML keys: ${cfStart.replace("cf","cl")}-${cfEnd.replace("cf","cl")} and reverse`);

      const blueCount = this.countCfPairsForRoute(cfStart, cfEnd, this.blueYamlRoutes);
      for (const pair in blueCount) {
        blueCounters[pair] = (blueCounters[pair] || 0) + blueCount[pair];
      }
      const redCount = this.countCfPairsForRoute(cfStart, cfEnd, this.redYamlRoutes);
      for (const pair in redCount) {
        redCounters[pair] = (redCounters[pair] || 0) + redCount[pair];
      }
    });

    // 両側のカウンタを合算
    const linkCounters: Record<string, { blue: number; red: number }> = {};
    Object.keys(blueCounters).forEach(key => {
      linkCounters[key] = { blue: blueCounters[key], red: 0 };
    });
    Object.keys(redCounters).forEach(key => {
      if (!linkCounters[key]) {
        linkCounters[key] = { blue: 0, red: redCounters[key] };
      } else {
        linkCounters[key].red += redCounters[key];
      }
    });
    console.log("Final aggregated linkCounters:", linkCounters);

    let globalMin = Infinity, globalMax = -Infinity;
    Object.values(linkCounters).forEach(counters => {
      if (counters.blue < globalMin) globalMin = counters.blue;
      if (counters.blue > globalMax) globalMax = counters.blue;
      if (counters.red < globalMin) globalMin = counters.red;
      if (counters.red > globalMax) globalMax = counters.red;
    });
    if (globalMin === Infinity) { globalMin = 0; globalMax = 0; }
    console.log(`Global counts: min=${globalMin}, max=${globalMax}`);

    const calculateThickness = (count: number, globalMin: number, globalMax: number) => {
      const minThickness = 1;
      const maxThickness = 15;
      if (globalMax === globalMin) return (minThickness + maxThickness) / 2;
      return minThickness + ((count - globalMin) / (globalMax - globalMin)) * (maxThickness - minThickness);
    };

    const cfNodesMap = this.getCfNodesMapForEngine(engine);
    Object.entries(linkCounters).forEach(([pairKey, counters]) => {
      if (counters.blue > 0) {
        const [cfA, cfB] = pairKey.split("-");
        const sNode = cfNodesMap.get(cfA);
        const tNode = cfNodesMap.get(cfB);
        if (!sNode || !tNode) return;
        const thickness = calculateThickness(counters.blue, globalMin, globalMax);
        const link = new DefaultLinkModel({ color: 'blue' });
        link.getOptions().curvyness = 0;
        link.getOptions().width = thickness;
        link.addLabel(`${counters.blue}回`);
        link.setSourcePort(sNode.getPort(PortModelAlignment.LEFT));
        link.setTargetPort(tNode.getPort(PortModelAlignment.LEFT));
        engine.getModel().addLink(link);
        console.log(`Blue link generated for ${pairKey} with count ${counters.blue}, thickness ${thickness}`);
      }
    });
    Object.entries(linkCounters).forEach(([pairKey, counters]) => {
      if (counters.red > 0) {
        const [cfA, cfB] = pairKey.split("-");
        const sNode = cfNodesMap.get(cfA);
        const tNode = cfNodesMap.get(cfB);
        if (!sNode || !tNode) return;
        const thickness = calculateThickness(counters.red, globalMin, globalMax);
        const link = new DefaultLinkModel({ color: 'red' });
        link.getOptions().curvyness = 0;
        link.getOptions().width = thickness;
        link.addLabel(`${counters.red}回`);
        link.setSourcePort(sNode.getPort(PortModelAlignment.TOP));
        link.setTargetPort(tNode.getPort(PortModelAlignment.TOP));
        engine.getModel().addLink(link);
        console.log(`Red link generated for ${pairKey} with count ${counters.red}, thickness ${thickness}`);
      }
    });

    engine.repaintCanvas();
  }

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

  private async loadYamlData() {
    try {
      const responseBlue = await fetch('/data/cmd_kiki_none copy.yaml');
      const textBlue = await responseBlue.text();
      const parsedYamlBlue = yaml.load(textBlue) as any;
      const communicationRoutesBlue = parsedYamlBlue?.none?.['communication-route'];
      if (communicationRoutesBlue) {
        Object.entries(communicationRoutesBlue).forEach(([routeKey, routeData]: [string, any]) => {
          const icmpRoute = routeData?.icmp;
          if (icmpRoute && Array.isArray(icmpRoute)) {
            this.blueYamlRoutes[routeKey.toLowerCase()] = icmpRoute.map((node: string) => node.trim().toLowerCase());
          }
        });
      }
      const responseRed = await fetch('/data/cmd_kiki_Cf4_int copy.yaml');
      const textRed = await responseRed.text();
      const parsedYamlRed = yaml.load(textRed) as any;
      const communicationRoutesRed = parsedYamlRed?.none?.['communication-route'];
      if (communicationRoutesRed) {
        Object.entries(communicationRoutesRed).forEach(([routeKey, routeData]: [string, any]) => {
          const icmpRoute = routeData?.icmp;
          if (icmpRoute && Array.isArray(icmpRoute)) {
            this.redYamlRoutes[routeKey.toLowerCase()] = icmpRoute.map((node: string) => node.trim().toLowerCase());
          }
        });
      }
      this.createAllNodes();
      this.yamlLoaded = true;
    } catch (error) {
      console.error("Error loading YAML:", error);
    }
  }

  private createAllNodes() {
    const cfNodes = new Set<string>();
    Object.values(this.blueYamlRoutes).forEach(routeNodes => {
      routeNodes.forEach(node => { if (node.startsWith("cf")) cfNodes.add(node); });
    });
    Object.values(this.redYamlRoutes).forEach(routeNodes => {
      routeNodes.forEach(node => { if (node.startsWith("cf")) cfNodes.add(node); });
    });
    // 9セルのレイアウト（手動配置）
    const layout: { id: string, x: number, y: number }[] = [
      { id: "cf3", x: 50,  y: 225 },
      { id: "cf2", x: 350, y: 225 },
      { id: "cf9", x: 650, y: 225 },
      { id: "cf4", x: 50,  y: 425 },
      { id: "cf1", x: 350, y: 25 },
      { id: "cf8", x: 650, y: 425 },
      { id: "cf5", x: 50,  y: 625 },
      { id: "cf6", x: 350, y: 625 },
      { id: "cf7", x: 650, y: 625 },
    ];
    layout.forEach(item => {
      const node = new RouterNodeModel(item.id);
      if (node.getOptions) {
        (node.getOptions() as any).name = item.id;
      }
      node.setPosition(item.x, item.y);
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

  // ★ JSON から各ルーター情報を取得し、ディクショナリ形式にまとめる処理
  public async loadRouterInfo(): Promise<{ [routerName: string]: any[] }> {
    try {
      // 両方のJSONファイルを並行取得
      const [modelResponse, kanrenResponse] = await Promise.all([
        fetch('/data/networkmodel.json'),
        fetch('/data/networkmodelkanren.json')
      ]);
      if (!modelResponse.ok) {
        throw new Error(`networkmodel.json の取得に失敗: ${modelResponse.statusText}`);
      }
      if (!kanrenResponse.ok) {
        throw new Error(`networkmodelkanren.json の取得に失敗: ${kanrenResponse.statusText}`);
      }
      const modelData: any[] = await modelResponse.json();
      const kanrenData: any[] = await kanrenResponse.json();

      // modelData を ID で参照できる Map に格納
      const modelById = new Map<string, any>();
      modelData.forEach(item => {
        if (item.id) {
          modelById.set(item.id, item);
        }
      });

      // ルーター情報（Config クラスのオブジェクト）を基点とするディクショナリを作成
      const routers: { [routerName: string]: any[] } = {};
      // modelData から Config クラス（各ルーター）のみ抽出
      modelData.forEach(item => {
        if (item.className === "Config" && item.name) {
          const routerName = item.name.toLowerCase();
          if (!routers[routerName]) {
            routers[routerName] = [];
          }
          routers[routerName].push(item);
        }
      });

      // kanrenData を処理し、各関連情報を追加
      kanrenData.forEach(entry => {
        for (const key in entry) {
          if (key === "kanren") continue;
          const objectId = entry[key];
          const relations = entry.kanren;
          relations.forEach((rel: any) => {
            if (rel["Config"]) {
              const configId = rel["Config"];
              const configObj = modelById.get(configId);
              if (configObj && configObj.name) {
                const routerName = configObj.name.toLowerCase();
                if (!routers[routerName]) {
                  routers[routerName] = [];
                }
                const associatedObj = modelById.get(objectId);
                if (associatedObj) {
                  routers[routerName].push(associatedObj);
                }
              }
            }
          });
        }
      });

      return routers;
    } catch (error) {
      console.error("Error loading router info:", error);
      throw error;
    }
  }
}
