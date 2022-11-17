import { useState } from "react";
import Register from "../components/register";
import Login from "../components/login";

const AuthLayout = () => {
    const [isRegistered, setIsRegistered] = useState(false);
    return (
        <>
            {isRegistered ? <Register /> : <Login />}
            <button onClick={() => setIsRegistered(!isRegistered)}>
                Switch to {isRegistered ? "Login" : "Register"}
            </button>
        </>
    );
};

export default AuthLayout;
