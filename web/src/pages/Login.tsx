import {FC, useState} from "react";
import {MeDocument, MeQuery, useLoginMutation, useRegisterMutation} from "../generated/graphql";
import {RouteComponentProps} from "react-router-dom";
import {setAccessToken} from "../accessToken";

export const Login: FC<RouteComponentProps> = ({history}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [login] = useLoginMutation();

    return (
        <form onSubmit={async e => {
            e.preventDefault();
            const response = await login({
                variables: {
                    email,
                    password
                },
                update: (store, {data}) => {
                    if (!data) {
                        return null;
                    }

                    // update the cache and set the current user equal to data.login.user :
                    store.writeQuery<MeQuery>({
                        query: MeDocument,
                        data: {
                            // __typename: 'Query', this line is optional
                            me:  data.login.user
                        }
                    });

                }
            });

            if (response && response.data) {
                setAccessToken(response.data.login.accessToken);
            }

            console.log(response);
            history.push('/');
        }}>
            <div>
                <input value={email} placeholder="email" onChange={e => {
                    setEmail(e.target.value);
                }}/>
            </div>

            <div>
                <input value={password} type="password" placeholder="password" onChange={e => {
                    setPassword(e.target.value);
                }}/>
            </div>

            <button type="submit">login</button>
        </form>
    );
}
