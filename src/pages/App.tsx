import "../App.css";
import { useAuth } from "../utils/context/authContext";
import MainLayout from "../layouts/mainLayout";
import AuthLayout from "../layouts/authLayout";

function App() {
    const { user } = useAuth();
    return (
        <>
            {user ? <MainLayout /> : <AuthLayout />}
        </>
    );
}

export default App;
