import { FormEvent } from "react";
import environment from "../../constants/env";

const Login: React.FC = () => {
    const login = (param: { username: string, password: string }) => {
        fetch(`${environment.apiBaseUrl}/login`, {
            method: "POST", headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(param)
        });
    };
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const username = (e.currentTarget.elements[0] as HTMLInputElement).value;
        const password = (e.currentTarget.elements[1] as HTMLInputElement).value;
        login({username, password});
    };
    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor={"username"}>username</label>
                <input type={"text"} id={"username"} />
            </div>
            <div>
                <label htmlFor={"password"}>password</label>
                <input type={"password"} id={"password"} />
            </div>
            <button type={"submit"}>Login</button>
        </form>
    );
};

export default Login;
