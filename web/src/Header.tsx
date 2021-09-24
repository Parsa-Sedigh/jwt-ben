import {Link} from "react-router-dom";
import React from "react";
import {useLogoutMutation, useMeQuery} from "./generated/graphql";
import {setAccessToken} from "./accessToken";

export const Header = () => {
    const {data, loading} = useMeQuery(
        // {fetchPolicy: 'network-only'}
    );
    const [logout, {client}] = useLogoutMutation();

    let body: any = null;

    /* If you wanna display multiple different states for a particular one single space, you can go with this approach: */
    if (loading) {
        body = null;
    } else if (data && data.me) {
        body = <div>You are logged in as: {data.me.email}</div>;
    } else {
        body = <div>not logged in</div>;
    }

    return (
        <header>
            <div><Link to='/'>Home</Link></div>
            <div><Link to='/register'>Register</Link></div>
            <div><Link to='/login'>Login</Link></div>
            <div><Link to='/bye'>Bye</Link></div>
            {!loading && data && data.me ?
            <div><button onClick={async () => {
                await logout(); // clear refreshToken
                setAccessToken(''); // clear accessToken
                await client.resetStore(); // clear the cache
            }}>logout</button></div> : null}

            {/*{data && data.me ? <div>You are logged in as: {data.me.email}</div> : <div>not logged in</div>}*/}
            {body}
        </header>
    );
};
