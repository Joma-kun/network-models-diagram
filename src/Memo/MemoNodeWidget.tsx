import * as React from 'react';
import { MemoNodeModel } from './MemoNodeModel';
import { DiagramEngine, PortModelAlignment, PortWidget } from '@projectstorm/react-diagrams';
import styled from '@emotion/styled';

export interface MemoNodeWidgetProps {
	node: MemoNodeModel;
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

	export const NodeContainer = styled.div<{ size: number }>`
		width: 200px;
		height: 100px;
		position: relative;
		background: #fffbe6;
		border: 2px solid #f5c469;
		border-radius: 8px;
		box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 10px;
	`;

	export const Title = styled.p`
		margin: 0;
		font-size: 16px;
		font-weight: bold;
		color: #555;
		text-align: center;
	`;

	export const TextField = styled.textarea`
		width: 90%;
		height: 80%;
		margin-top: 10px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 14px;
		padding: 5px;
		resize: none;
        overflow: scroll;
		box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
	`;
}

export class MemoNodeWidget extends React.Component<MemoNodeWidgetProps, { text: string }> {
	constructor(props: MemoNodeWidgetProps) {
		super(props);
		this.state = {
			text: ''
		};
	}

	handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		this.setState({ text: event.target.value });
	};

	render() {
		const { node, size = 150 } = this.props;
		if (!node) return null;

		const bottomPort = node.getPort(PortModelAlignment.BOTTOM);

		return (
			<S.NodeContainer size={size}>
				<S.Title>{node.getMemoName()}</S.Title>
				<S.TextField
					value={this.state.text}
					onChange={this.handleTextChange}
					placeholder="メモを入力してください..."
				/>
				{bottomPort && (
					<PortWidget
						style={{
							left: size / 2 + 28,
							top: size - 25,
							position: 'absolute'
						}}
						port={bottomPort}
						engine={this.props.engine}
					>
						<S.Port />
					</PortWidget>
				)}
			</S.NodeContainer>
		);
	}
}
