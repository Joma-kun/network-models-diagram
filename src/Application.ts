// Application.ts
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
  // YAML 経路情報
  private blueYamlRoutes: Record<string, string[]> = {};
  private redYamlRoutes: Record<string, string[]> = {};
  // check.json から取得したエラー情報 (key=ID, value=エラー項目)
  public errorInstances: Record<string, string[]> = {};
  public memoCount: number = 0;
  public yamlLoaded: boolean = false;
  // 各ルーターの情報を保持するディクショナリ（キーは小文字）
  public routerInfo: { [routerName: string]: any[] } = {};

  constructor() {
    this.diagramEngine = createEngine();
    this.newModel();
    this.loadErrorInfo();    // ← ここで check.json 読み込み
    this.loadYamlData();
    this.loadRouterInfo()
      .then(info => {
        this.routerInfo = info;
        console.log("Aggregated router info:", this.routerInfo);
      })
      .catch(err => console.error(err));
  }

  /**
   * check.json からエラー対象の ID→フィールド名マップを読み込む
   */
  public async loadErrorInfo(): Promise<void> {
    try {
      const response = await fetch('/data/check.json');
      if (!response.ok) {
        throw new Error(`check.json の取得に失敗: ${response.statusText}`);
      }
      const data: any[] = await response.json();
      data.forEach(entry => {
        const instances = entry.instances;
        if (instances) {
          Object.entries(instances).forEach(([id, field]) => {
            const key = id.trim().toLowerCase();
            if (!this.errorInstances[key]) {
              this.errorInstances[key] = [];
            }
            this.errorInstances[key].push(field as string);
          });
        }
      });
      console.log("Loaded error instances:", this.errorInstances);
    } catch (error) {
      console.error("Error loading error info:", error);
    }
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
      new SimplePortFactory('router', () => new RouterPortModel(PortModelAlignment.LEFT))
    );
    engine.getNodeFactories().registerFactory(new RouterNodeFactory());
    engine.getPortFactories().registerFactory(
      new SimplePortFactory('memo', () => new MemoPortModel(PortModelAlignment.LEFT))
    );
    engine.getNodeFactories().registerFactory(new MemoNodeFactory());
    engine.getLinkFactories().registerFactory(new RedLinkFactory());
    engine.getLinkFactories().registerFactory(new BlueLinkFactory());

    this.createAllNodesForEngine(engine);
    return engine;
  }

  private createAllNodesForEngine(engine: any) {
    const layout: { id: string; x: number; y: number }[] = [
      { id: "cf3", x: 50,  y: 225 },
      { id: "cf2", x: 350, y: 225 },
      { id: "cf9", x: 650, y: 225 },
      { id: "cf4", x: 50,  y: 425 },
      { id: "cf1", x: 350, y: 25  },
      { id: "cf8", x: 650, y: 425 },
      { id: "cf5", x: 50,  y: 625 },
      { id: "cf6", x: 350, y: 625 },
      { id: "cf7", x: 650, y: 625 },
    ];
    layout.forEach(item => {
      const node = new RouterNodeModel(item.id);
      if (node.getOptions) {
        const options = node.getOptions() as any;
        options.name = item.id;
        if (item.id.toLowerCase() === "cf3" || item.id.toLowerCase() === "cf4") {
          options.style = {
            backgroundColor: 'rgba(255, 0, 0, 0.3)',
            border: '2px solid red'
          };
        }
      }
      node.setPosition(item.x, item.y);
      engine.getModel().addNode(node);
    });
    engine.repaintCanvas();
  }

  public newModel() {
    this.activeModel = new DiagramModel();
    this.activeModel.setGridSize(50);
    this.diagramEngine.setModel(this.activeModel);

    this.diagramEngine.getPortFactories().registerFactory(
      new SimplePortFactory('router', () => new RouterPortModel(PortModelAlignment.LEFT))
    );
    this.diagramEngine.getNodeFactories().registerFactory(new RouterNodeFactory());
    this.diagramEngine.getPortFactories().registerFactory(
      new SimplePortFactory('memo', () => new MemoPortModel(PortModelAlignment.LEFT))
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

  public async loadRouterInfo(): Promise<{ [routerName: string]: any[] }> {
    try {
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

      // ID→オブジェクト Map
      const modelById = new Map<string, any>();
      modelData.forEach(item => {
        if (item.id) {
          modelById.set(item.id.trim().toLowerCase(), item);
        }
      });

      // Config クラスのものをルーター単位に集約
      const routers: { [routerName: string]: any[] } = {};
      modelData.forEach(item => {
        if (item.className === "Config" && item.name) {
          const r = item.name.toLowerCase();
          routers[r] = routers[r] || [];
          routers[r].push(item);
        }
      });

      // 関連情報を追加
      kanrenData.forEach(entry => {
        for (const key in entry) {
          if (key === "kanren") continue;
          const objectId = (entry as any)[key] as string;
          (entry.kanren as any[]).forEach(rel => {
            if (rel["Config"]) {
              const configObj = modelById.get(rel["Config"].trim().toLowerCase());
              if (configObj && configObj.name) {
                const r = configObj.name.toLowerCase();
                routers[r] = routers[r] || [];
                const assoc = modelById.get(objectId.trim().toLowerCase());
                if (assoc) routers[r].push(assoc);
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
      const [cfStart, cfEnd] = routeKey.trim().toLowerCase().split("-");
      const blueCount = this.countCfPairsForRoute(cfStart, cfEnd, this.blueYamlRoutes);
      for (const pair in blueCount) {
        blueCounters[pair] = (blueCounters[pair] || 0) + blueCount[pair];
      }
      const redCount = this.countCfPairsForRoute(cfStart, cfEnd, this.redYamlRoutes);
      for (const pair in redCount) {
        redCounters[pair] = (redCounters[pair] || 0) + redCount[pair];
      }
    });

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

    let globalMin = Infinity, globalMax = -Infinity;
    Object.values(linkCounters).forEach(counters => {
      if (counters.blue < globalMin) globalMin = counters.blue;
      if (counters.blue > globalMax) globalMax = counters.blue;
      if (counters.red < globalMin) globalMin = counters.red;
      if (counters.red > globalMax) globalMax = counters.red;
    });
    if (globalMin === Infinity) { globalMin = 0; globalMax = 0; }

    const calculateThickness = (count: number, min: number, max: number) => {
      const minThickness = 1;
      const maxThickness = 15;
      if (max === min) return (minThickness + maxThickness) / 2;
      return minThickness + ((count - min) / (max - min)) * (maxThickness - minThickness);
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
      }
    });

    engine.repaintCanvas();
  }

  private getCfNodesMapForEngine(engine: any): Map<string, any> {
    const map = new Map<string, any>();
    engine.getModel().getNodes().forEach((node: any) => {
      if (node.getOptions && node.getOptions().name) {
        map.set(node.getOptions().name.toLowerCase(), node);
      }
    });
    return map;
  }

  private countCfPairsForRoute(
    cfStart: string,
    cfEnd: string,
    yamlMap: Record<string, string[]>
  ): Record<string, number> {
    const counts: Record<string, number> = {};
    const clStart = cfStart.replace("cf", "cl");
    const clEnd = cfEnd.replace("cf", "cl");
    const keysToCheck = [`${clStart}-${clEnd}`, `${clEnd}-${clStart}`];
    keysToCheck.forEach(yamlKey => {
      if (yamlMap.hasOwnProperty(yamlKey)) {
        const nodes = yamlMap[yamlKey].map(n => n.trim().toLowerCase());
        if (nodes.length < 3) return;
        const cfChain = nodes.slice(1, nodes.length - 1).filter(n => n.startsWith("cf"));
        for (let i = 0; i < cfChain.length - 1; i++) {
          const pairKey = `${cfChain[i]}-${cfChain[i + 1]}`;
          counts[pairKey] = (counts[pairKey] || 0) + 1;
        }
      }
    });
    return counts;
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
            this.blueYamlRoutes[routeKey.toLowerCase()] = icmpRoute.map((node: string) =>
              node.trim().toLowerCase()
            );
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
            this.redYamlRoutes[routeKey.toLowerCase()] = icmpRoute.map((node: string) =>
              node.trim().toLowerCase()
            );
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
    const layout: { id: string; x: number; y: number }[] = [
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
        const options = node.getOptions() as any;
        options.name = item.id;
        if (item.id.toLowerCase() === "cf3" || item.id.toLowerCase() === "cf4") {
          options.style = {
            backgroundColor: 'rgba(255, 0, 0, 0.3)',
            border: '2px solid red'
          };
        }
      }
      node.setPosition(item.x, item.y);
      this.diagramEngine.getModel().addNode(node);
    });
    this.diagramEngine.repaintCanvas();
  }
}
