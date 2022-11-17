import { useState } from "react";
import Register from "../components/register";
import Login from "../components/login";
import { Card } from "antd";

const AuthLayout = () => {
    const [isRegistered, setIsRegistered] = useState(false);
    return (
        <div style={{ display: "flex", justifyContent: "center" }}>
            <Card>
                {isRegistered ? (
                    <Login />
                ) : (
                    <Register setIsRegistered={setIsRegistered} />
                )}
                <button onClick={() => setIsRegistered(!isRegistered)}>
                    Switch to {isRegistered ? "Register" : "Login"}
                </button>
            </Card>
        </div>
    );
};

export default AuthLayout;
