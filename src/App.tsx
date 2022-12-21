import "./App.css";
import { useRoutes } from "react-router";

import routes from "./routes";

const App = () => {
    const element = useRoutes(routes);
    return <div>{element}</div>;
};

export default App;
