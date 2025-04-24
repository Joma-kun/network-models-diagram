// RouterNodeWidget.tsx
// @ts-nocheck
import * as React from 'react';
import { RouterNodeModel } from './RouterNodeModel';
import { DiagramEngine, PortModelAlignment, PortWidget } from '@projectstorm/react-diagrams';
import styled from '@emotion/styled';
import Tooltip from '@mui/material/Tooltip';
import RouterSettingsDrawer from './RouterSettingsDrawer';
import { Application } from '../Application';

export interface RouterNodeWidgetProps {
  node: RouterNodeModel;
  engine: DiagramEngine;
  size?: number;
}

interface RouterNodeWidgetState {
  inputValueA: string;
  inputValueB: string;
  isMenuVisible: boolean;
  errorInstances: Record<string, string[]>;
}

// エラー有無に応じて赤いグローを付与するコンテナ
const NodeContainer = styled.div<{ size: number; hasError: boolean }>`
  position: relative;
  width: ${p => p.size}px;
  height: ${p => p.size}px;
  transition: box-shadow 0.2s ease;
  ${p => p.hasError && `box-shadow: 0 0 0 4px rgba(255, 0, 0, 0.6);`}
`;

// ポート用ドットスタイル
const PortDot = styled.div`
  width: 16px;
  height: 16px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  cursor: pointer;
  &:hover { background: rgba(0, 0, 0, 1); }
`;

export class RouterNodeWidget extends React.Component<RouterNodeWidgetProps, RouterNodeWidgetState> {
  constructor(props: RouterNodeWidgetProps) {
    super(props);
    const inputs = props.node.getInputs();
    this.state = {
      inputValueA: inputs.DeviceModel || '',
      inputValueB: inputs.Hostname || '',
      isMenuVisible: false,
      errorInstances: {}
    };
  }

  componentDidMount() {
    // エラー情報を非同期で読み込む
    const app = new Application();
    app.loadErrorInfo()
      .then(() => this.setState({ errorInstances: app.errorInstances }))
      .catch(err => console.error(err));
  }

  // 右クリックでドロワーを開く
  handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    this.setState({ isMenuVisible: true });
  };

  handleCloseDrawer = () => this.setState({ isMenuVisible: false });

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: 'DeviceModel' | 'Hostname') => {
    this.setState({ [name === 'DeviceModel' ? 'inputValueA' : 'inputValueB']: e.target.value } as any);
  };

  handleInputSubmit = () => {
    const { inputValueA, inputValueB } = this.state;
    this.props.node.setInputs({ DeviceModel: inputValueA, Hostname: inputValueB });
    this.handleCloseDrawer();
  };

  render() {
    const { node, size = 150, engine } = this.props;
    const { errorInstances, isMenuVisible, inputValueA, inputValueB } = this.state;
    if (!node) return null;

    // 読み込んだエラー情報から判定
    const nameLower = node.getRouterName().toLowerCase();
    const matchingIds = Object.keys(errorInstances || {}).filter(fullId => fullId.includes(`/${nameLower}_`));
    const errTypes = matchingIds.flatMap(id => errorInstances[id] || []);
    const uniqueErrTypes = Array.from(new Set(errTypes));
    const hasError = uniqueErrTypes.length > 0;

    // アイコン設定（エラー有りは switch, 通常は router）
    const icon = 'router.png';
    const altText = 'Router';

    return (
      <NodeContainer size={size} hasError={hasError} onContextMenu={this.handleContextMenu}>
        {/* ノード名 */}
        <p style={{
          position: 'absolute',
          left: '50%',
          transform: 'translate(-50%, -90%)',
          fontSize: '28px',
          color: 'white',
        }}>
          {node.getRouterName()}
        </p>

        {/* エラー機器のみツールチップ表示 */}
        {hasError ? (
          <Tooltip title={uniqueErrTypes.join(', ')} arrow placement="top">
            <div style={{ width: size, height: size, position: 'relative', cursor: 'pointer' }}>
              <img src={icon} alt={altText} style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable="false" />
            </div>
          </Tooltip>
        ) : (
          <div style={{ width: size, height: size, position: 'relative' }}>
            <img src={icon} alt={altText} style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable="false" />
          </div>
        )}

        {/* 設定ドロワー */}
        <RouterSettingsDrawer
          isOpen={isMenuVisible}
          onClose={this.handleCloseDrawer}
          inputValueA={inputValueA}
          inputValueB={inputValueB}
          onInputChange={this.handleInputChange}
          onSave={this.handleInputSubmit}
          routerName={node.getRouterName().toLowerCase()}
        />

        {/* ポートウィジェット */}
        {[PortModelAlignment.LEFT, PortModelAlignment.TOP, PortModelAlignment.RIGHT, PortModelAlignment.BOTTOM].map((align, i) => (
          <PortWidget
            key={i}
            style={{
              position: 'absolute',
              left: size / 2 + (i % 2 === 0 ? -43 : 28),
              top: size / 2 + (i < 2 ? 17 : -37),
            }}
            port={node.getPort(align)}
            engine={engine}
          >
            <PortDot />
          </PortWidget>
        ))}
      </NodeContainer>
    );
  }
}
