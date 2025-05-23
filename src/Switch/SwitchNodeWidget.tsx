// @ts-nocheck
import * as React from 'react';
import { SwitchNodeModel } from './SwitchNodeModel';
import { DiagramEngine, PortModelAlignment, PortWidget } from '@projectstorm/react-diagrams';
import styled from '@emotion/styled';

export interface SwitchNodeWidgetProps {
	node: SwitchNodeModel;
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

export class SwitchNodeWidget extends React.Component<SwitchNodeWidgetProps, { inputValueA: string, inputValueB: string, isMenuVisible: boolean }> {
    constructor(props: SwitchNodeWidgetProps) {
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
                className={'switch-node'}
                style={{
                    position: 'relative',
                    width: this.props.size,
                    height: this.props.size
                }}
            >
                <S.ImageContainer size={this.props.size}>
                    <img src="switch.png" alt="Switch" draggable="false"/>
                </S.ImageContainer>
                <button
                    style={{
                        position: 'absolute',
                        top: '65%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}
                    onClick={this.handleButtonClick}
                >
                    Menu
                </button>
                {this.state.isMenuVisible &&
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
                }
				<PortWidget
					style={{
						left: this.props.size / 2 - 8,
						top: this.props.size /2 - 10,
						position: 'absolute'
					}}
					port={node.getPort(PortModelAlignment.RIGHT)}
					engine={this.props.engine}
				>
					<S.Port />
				</PortWidget>
            </div>
        );
    }
}
