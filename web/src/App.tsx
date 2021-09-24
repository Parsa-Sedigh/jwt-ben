import {FC, useEffect, useState} from "react";
import {Routes} from "./Routes";
import {setAccessToken} from "./accessToken";

export const App: FC = () => {
    const [loading, setLoading] = useState(true);

    // when the application mounts, try to refresh our token and get a new accessToken:
    useEffect(() => {
        fetch('http://localhost:4000/refresh_token', {method: 'POST', credentials: 'include'})
            .then(async res => {
                const {accessToken} = await res.json();
                setAccessToken(accessToken);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>loading...</div>;
    }

    return (<Routes />);
};
