import * as React from 'react';
import { BlueLinkModel } from './BlueLinkModel';

export class BlueLinkSegment extends React.Component<{ model: BlueLinkModel; path: string }> {
	path: SVGPathElement | null = null;
	circle: SVGCircleElement | null = null;
	callback: () => any;
	percent: number;
	mounted: boolean;

	constructor(props: { model: BlueLinkModel; path: string }) {
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
					stroke="rgba(0,0,255,0.5)"
					d={this.props.path}
				/>
				<circle
					ref={(ref) => {
						this.circle = ref;
					}}
					r={5}
					fill="blue"
				/>
			</g>
		);
	}
}
