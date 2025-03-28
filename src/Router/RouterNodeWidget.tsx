// RouterNodeWidget.tsx
// @ts-nocheck
import * as React from 'react';
import { RouterNodeModel } from './RouterNodeModel';
import { DiagramEngine, PortModelAlignment, PortWidget } from '@projectstorm/react-diagrams';
import styled from '@emotion/styled';
import RouterSettingsDrawer from './RouterSettingsDrawer';

export interface RouterNodeWidgetProps {
  node: RouterNodeModel;
  engine: DiagramEngine;
  size?: number;
}

namespace S {
  export const Port = styled.div`
    width: 16px;
    height: 16px;
    z-index: 10;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    cursor: pointer;

    &:hover {
      background: rgba(0, 0, 0, 1);
    }
  `;

  export const ImageContainer = styled.div<{ size: number }>`
    width: ${(props) => props.size}px;
    height: ${(props) => props.size}px;
    position: relative;

    & img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  `;
}

export class RouterNodeWidget extends React.Component<RouterNodeWidgetProps, { inputValueA: string, inputValueB: string, isMenuVisible: boolean }> {
  constructor(props: RouterNodeWidgetProps) {
    super(props);
    const inputs = props.node.getInputs();
    this.state = {
      inputValueA: inputs.A || '',
      inputValueB: inputs.B || '',
      isMenuVisible: false
    };
  }

  handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault(); // デフォルトのコンテキストメニューを無効化
    this.setState({ isMenuVisible: true });
  };

  handleCloseDrawer = () => {
    this.setState({ isMenuVisible: false });
  };

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, inputName: string) => {
    this.setState({ [inputName]: event.target.value } as any);
  };

  handleInputSubmit = () => {
    const { inputValueA, inputValueB } = this.state;
    this.props.node.setInputs({ DeviceModel: inputValueA, Hostname: inputValueB });
    this.handleCloseDrawer();
  };

  render() {
    const { node, size } = this.props;
    if (!node) return null;

    return (
      <div
        className={'router-node'}
        style={{
          position: 'relative',
          width: size,
          height: size
        }}
        onContextMenu={this.handleContextMenu} // 右クリックでメニューを開く
      >
        <p style={{
          position: 'absolute',
          left: '50%',
          transform: 'translate(-50%, -90%)',
          fontSize: '28px',
          color: 'white'
        }}>{node.getRouterName()}</p>
        <S.ImageContainer size={size}>
          <img src="router.png" alt="Router" draggable="false"/>
        </S.ImageContainer>

        {/* 設定モーダル (右クリックで開く) */}
        <RouterSettingsDrawer
          isOpen={this.state.isMenuVisible}
          onClose={this.handleCloseDrawer}
          inputValueA={this.state.inputValueA}
          inputValueB={this.state.inputValueB}
          onInputChange={this.handleInputChange}
          onSave={this.handleInputSubmit}
          routerName={node.getRouterName().toLowerCase()}
        />

        {/* 各ポートのウィジェット */}
        <PortWidget
          style={{
            left: size / 2 - 43,
            top: size / 2 + 17,
            position: 'absolute'
          }}
          port={node.getPort(PortModelAlignment.LEFT)}
          engine={this.props.engine}
        >
          <S.Port />
        </PortWidget>
        <PortWidget
          style={{
            left: size / 2 + 28,
            top: size / 2 - 37,
            position: 'absolute'
          }}
          port={node.getPort(PortModelAlignment.TOP)}
          engine={this.props.engine}
        >
          <S.Port />
        </PortWidget>
        <PortWidget
          style={{
            left: size / 2 + 28,
            top: size / 2 + 17,
            position: 'absolute'
          }}
          port={node.getPort(PortModelAlignment.RIGHT)}
          engine={this.props.engine}
        >
          <S.Port />
        </PortWidget>
        <PortWidget
          style={{
            left: size / 2 - 43,
            top: size / 2 - 37,
            position: 'absolute'
          }}
          port={node.getPort(PortModelAlignment.BOTTOM)}
          engine={this.props.engine}
        >
          <S.Port />
        </PortWidget>
        <PortWidget
          style={{
            left: size / 2 - 8,
            top: size / 2 - 9,
            position: 'absolute'
          }}
          port={node.getPort(PortModelAlignment.BOTTOM)}
          engine={this.props.engine}
        >
          <S.Port />
        </PortWidget>
      </div>
    );
  }
}
