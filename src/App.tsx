import "./App.css";
import { useRoutes } from "react-router";

import ErrorBoundary from "./components/errorBoundary";
import routes from "./routes";

const App = () => {
    const element = useRoutes(routes);
    return (
        <div>
            <ErrorBoundary>{element}</ErrorBoundary>
        </div>
    );
};

export default App;
