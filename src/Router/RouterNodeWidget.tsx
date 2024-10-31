// @ts-nocheck
import * as React from 'react';
import { RouterNodeModel } from './RouterNodeModel';
import { DiagramEngine, PortModelAlignment, PortWidget } from '@projectstorm/react-diagrams';
import styled from '@emotion/styled';

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

    handleButtonClick = () => {
        this.setState({ isMenuVisible: true });
    };

    handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, inputName: string) => {
        this.setState({ [inputName]: event.target.value } as any);
    };

    handleInputSubmit = () => {
        const { inputValueA, inputValueB} = this.state;
        this.props.node.setInputs({ DeviceModel: inputValueA, Hostname: inputValueB});
        this.setState({ isMenuVisible: false });
    };

    render() {
        const node = this.props.node;
        if (!node) return null;

        return (
            <div
                className={'router-node'}
                style={{
                    position: 'relative',
                    width: this.props.size,
                    height: this.props.size
                }}
            >
                <p style={{
                position: 'absolute',
                left: '50%',
                transform: 'translate(-50%, -90%)',
                fontSize: '28px',
                color: 'white'
            }}>{node.getRouterName()}</p>
                <S.ImageContainer size={this.props.size}>
                    <img src="router.png" alt="Router" draggable="false"/>
                </S.ImageContainer>
                {/* <button
                    style={{
                        position: 'absolute',
                        top: '65%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}
                    onClick={this.handleButtonClick}
                >
                    Menu
                </button> */}
                {/* {this.state.isMenuVisible &&
                    <div style={{ position: 'absolute', top: '50%', left: '100%', transform: 'translate(0, -50%)', background: 'white', border: '1px solid black', padding: '10px' }}>
                        <div>
                            <label>
                                DeviceModel
                                <input
                                    type="text"
                                    value={this.state.inputValueA}
                                    onChange={(e) => this.handleInputChange(e, 'inputValueA')}
                                />
                            </label>
                        </div>
                        <div>
                            <label>
                                Hostname
                                <input
                                    type="text"
                                    value={this.state.inputValueB}
                                    onChange={(e) => this.handleInputChange(e, 'inputValueB')}
                                />
                            </label>
                        </div>
                        <button onClick={this.handleInputSubmit}>Close</button>
                    </div>
                } */}
				<PortWidget
					style={{
						left: this.props.size / 2 - 43,
						top: this.props.size / 2 + 17,
						position: 'absolute'
					}}
					port={node.getPort(PortModelAlignment.LEFT)}
					engine={this.props.engine}
				>
					<S.Port />
				</PortWidget>
                <PortWidget
					style={{
						left: this.props.size / 2 + 28,
						top: this.props.size / 2 - 37,
						position: 'absolute'
					}}
					port={node.getPort(PortModelAlignment.TOP)}
					engine={this.props.engine}
				>
					<S.Port />
				</PortWidget>
                <PortWidget
					style={{
						left: this.props.size / 2 + 28,
						top: this.props.size / 2 + 17,
						position: 'absolute'
					}}
					port={node.getPort(PortModelAlignment.RIGHT)}
					engine={this.props.engine}
				>
					<S.Port />
				</PortWidget>
                <PortWidget
					style={{
						left: this.props.size / 2 - 43,
						top: this.props.size / 2 - 37,
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
