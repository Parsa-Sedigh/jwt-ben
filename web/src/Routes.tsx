import {useQuery} from '@apollo/react-hooks';
import {gql} from 'apollo-boost';
import React from 'react';
import {BrowserRouter, Link, Route, Switch} from 'react-router-dom';
import {useHelloQuery} from './generated/graphql';
import {Home} from './pages/Home';
import {Login} from './pages/Login';
import {Register} from './pages/Register';

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
                <header>
                    <div><Link to='/'>Home</Link></div>
                    <div><Link to='/register'>Register</Link></div>
                    <div><Link to='/login'>Login</Link></div>
                </header>

                <Switch>
                    <Route path="/" component={Home} exact/>
                    <Route path="/register" component={Register} exact/>
                    <Route path="/login" component={Login} exact/>
                </Switch>
            </div>
        </BrowserRouter>

    );
};
