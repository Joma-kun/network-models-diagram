import * as React from 'react';
import { RedLinkModel } from './RedLinkModel';

export class RedLinkSegment extends React.Component<{ model: RedLinkModel; path: string }> {
	path: SVGPathElement | null = null;
	circle: SVGCircleElement | null = null;
	callback: () => any;
	percent: number;
	mounted: boolean;

	constructor(props: { model: RedLinkModel; path: string }) {
		super(props);
		this.percent = 0;
		this.mounted = false;
		this.callback = () => {};
	}

	componentDidMount() {
		this.mounted = true;
		this.callback = () => {
			if (!this.circle || !this.path) {
				return;
			}

			this.percent += 0.25;
			if (this.percent > 100) {
				this.percent = 0;
			}

			const point = this.path.getPointAtLength(this.path.getTotalLength() * (this.percent / 100.0));

			this.circle.setAttribute('cx', `${point.x}`);
			this.circle.setAttribute('cy', `${point.y}`);

			if (this.mounted) {
				requestAnimationFrame(this.callback);
			}
		};
		requestAnimationFrame(this.callback);
	}

	componentWillUnmount() {
		this.mounted = false;
	}

	render() {
		return (
			<g>
				<path
					fill="none"
					ref={(ref) => {
						this.path = ref;
					}}
					strokeWidth={this.props.model.getOptions().width}
					stroke="rgba(255,0,0,0.5)"
					d={this.props.path}
				/>
				<circle
					ref={(ref) => {
						this.circle = ref;
					}}
					r={5}
					fill="red"
				/>
			</g>
		);
	}
}
