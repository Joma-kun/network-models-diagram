import { Application } from './Application';
import { BodyWidget } from './components/BodyWidget';

export default () => {
    const app = new Application();

    return <BodyWidget app={app} />;
};
