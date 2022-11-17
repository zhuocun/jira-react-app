import { FormEvent } from "react";
import { register } from "../../utils/authProvider";

const Register: React.FC<{
    setIsRegistered: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setIsRegistered }) => {
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const username = (e.currentTarget.elements[0] as HTMLInputElement)
            .value;
        const password = (e.currentTarget.elements[1] as HTMLInputElement)
            .value;
        register({ username, password }).then((res) => {
            if (res.ok) {
                setIsRegistered(true);
            }
        });
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
            <button type={"submit"}>Register</button>
        </form>
    );
};

export default Register;
