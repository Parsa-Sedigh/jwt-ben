import {FC, useState} from "react";
import {useRegisterMutation} from "../generated/graphql";
import {RouteComponentProps} from "react-router-dom";

export const Register: FC<RouteComponentProps> = ({history}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [register] = useRegisterMutation();

    return (
        <form onSubmit={async e => {
            e.preventDefault();
            const response = await register({
                variables: {
                    email,
                    password
                }
            });

            console.log(response);
            history.push('/');
        }}>
            <div>
                <input value={email} placeholder="email" onChange={e => {
                    setEmail(e.target.value);
                }} />
            </div>

            <div>
                <input value={password} type="password" placeholder="password" onChange={e => {
                    setPassword(e.target.value);
                }} />
            </div>

            <button type="submit">register</button>
        </form>
    );
}
