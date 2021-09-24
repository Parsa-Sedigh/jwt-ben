import {useQuery} from '@apollo/react-hooks';
import {gql} from 'apollo-boost';
import React from 'react';
import {BrowserRouter, Link, Route, Switch} from 'react-router-dom';
import {useHelloQuery} from './generated/graphql';
import {Home} from './pages/Home';
import {Login} from './pages/Login';
import {Register} from './pages/Register';
import {Bye} from "./pages/Bye";
import {Header} from "./Header";

export const Routes = () => {
    // const {data, loading} = useQuery(gql`
    //   {
    //     hello
    //   }
    // `);
    // const {data, loading} = useHelloQuery();

    // if (loading || !data) {
    //   return <div>loading...</div>
    // }

    // return (
    //   <div>{JSON.stringify(data.hello)}</div>
    // );

    return (
        <BrowserRouter>
            <div>
                <Header />

                <Switch>
                    <Route path="/" component={Home} exact/>
                    <Route path="/register" component={Register} exact/>
                    <Route path="/login" component={Login} exact/>
                    <Route path="/bye" component={Bye} exact/>
                </Switch>
            </div>
        </BrowserRouter>

    );
};
