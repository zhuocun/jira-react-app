import { useState } from "react";
import Register from "../components/register";
import Login from "../components/login";

const AuthLayout = () => {
    const [isRegistered, setIsRegistered] = useState(false);
    return (
        <>
            {isRegistered ? (
                <Login />
            ) : (
                <Register setIsRegistered={setIsRegistered} />
            )}
            <button onClick={() => setIsRegistered(!isRegistered)}>
                Switch to {isRegistered ? "Register" : "Login"}
            </button>
        </>
    );
};

export default AuthLayout;
