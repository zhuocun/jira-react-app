import { FormEvent } from "react";
import { useAuth } from "context/authContext";

const Login: React.FC = () => {
    const { login, user } = useAuth();
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const username = (e.currentTarget.elements[0] as HTMLInputElement)
            .value;
        const password = (e.currentTarget.elements[1] as HTMLInputElement)
            .value;
        login({ username, password });
    };
    return (
        <form onSubmit={handleSubmit}>
            {user?.name}
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
