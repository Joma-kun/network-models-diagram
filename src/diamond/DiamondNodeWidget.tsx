// @ts-nocheck
import * as React from 'react';
import { DiamondNodeModel } from './DiamondNodeModel';
import { DiagramEngine, PortModelAlignment, PortWidget } from '@projectstorm/react-diagrams';
import styled from '@emotion/styled';

export interface DiamondNodeWidgetProps {
	node: DiamondNodeModel;
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
}

export class DiamondNodeWidget extends React.Component<DiamondNodeWidgetProps, { inputValue: string, isInputVisible: boolean }> {
    constructor(props: DiamondNodeWidgetProps) {
        super(props);
        this.state = {
            inputValue: '',
            isInputVisible: false
        };
    }

    handleButtonClick = () => {
        this.setState({ isInputVisible: true });
    };

    handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ inputValue: event.target.value });
    };

    handleInputSubmit = () => {
        this.setState({ isInputVisible: false });
    };

    render() {
        const node = this.props.node;
        if (!node) return null;

        return (
            <div
                className={'diamond-node'}
                style={{
                    position: 'relative',
                    width: this.props.size,
                    height: this.props.size
                }}
            >
                <svg
                    width={this.props.size}
                    height={this.props.size}
                    dangerouslySetInnerHTML={{
                        __html:
                            `
          <g id="Layer_1">
          </g>
          <g id="Layer_2">
            <polygon fill="mediumpurple" stroke="${
                                node.isSelected() ? 'white' : '#000000'
                            }" stroke-width="3" stroke-miterlimit="10" points="5,5 ` +
                            (this.props.size - 5) +
                            `,5 ` +
                            (this.props.size - 5) +
                            `,` +
                            (this.props.size - 5) +
                            ` 5,` +
                            (this.props.size - 5) +
                            `"/>
          </g>
        `
                    }}
                />
                <button
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}
                    onClick={this.handleButtonClick}
                >
                    Menu
                </button>
                {this.state.isInputVisible &&
                    <input
                        type="text"
                        value={this.state.inputValue}
                        onChange={this.handleInputChange}
                        onBlur={this.handleInputSubmit}
                        style={{
                            position: 'absolute',
                            top: '60%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '100px'
                        }}
                    />
                }
                <PortWidget
					style={{
						top: this.props.size / 2 - 8,
						left: -8,
						position: 'absolute'
					}}
					port={node.getPort(PortModelAlignment.LEFT)}
					engine={this.props.engine}
				>
					<S.Port />
				</PortWidget>
				<PortWidget
					style={{
						left: this.props.size / 2 - 8,
						top: -8,
						position: 'absolute'
					}}
					port={node.getPort(PortModelAlignment.TOP)}
					engine={this.props.engine}
				>
					<S.Port />
				</PortWidget>
				<PortWidget
					style={{
						left: this.props.size - 8,
						top: this.props.size / 2 - 8,
						position: 'absolute'
					}}
					port={node.getPort(PortModelAlignment.RIGHT)}
					engine={this.props.engine}
				>
					<S.Port />
				</PortWidget>
				<PortWidget
					style={{
						left: this.props.size / 2 - 8,
						top: this.props.size - 8,
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
