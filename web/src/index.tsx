import {ApolloProvider} from '@apollo/react-hooks';
// import  ApolloClient  from 'apollo-boost';
import React from 'react';
import ReactDOM from 'react-dom';
import {Routes} from './Routes';
import reportWebVitals from './reportWebVitals';
import {getAccessToken, setAccessToken} from "./accessToken";
import {App} from "./App";

import {ApolloClient} from 'apollo-client';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {HttpLink} from 'apollo-link-http';
import {onError} from 'apollo-link-error';
import {ApolloLink, Observable} from 'apollo-link';
import {TokenRefreshLink} from "apollo-link-token-refresh";
import jwtDecode from 'jwt-decode';

const cache = new InMemoryCache({});

const requestLink = new ApolloLink((operation, forward) =>
    new Observable(observer => {
        let handle: any;
        Promise.resolve(operation)
            .then((operation) => {
                // this way we can send the accessToken in header
                const accessToken = getAccessToken();
                if (accessToken) {
                    operation.setContext({
                        headers: {
                            authorization: `bearer ${accessToken}`
                        }
                    });
                }

            })
            .then(() => {
                handle = forward(operation).subscribe({
                    next: observer.next.bind(observer),
                    error: observer.error.bind(observer),
                    complete: observer.complete.bind(observer),
                });
            })
            .catch(observer.error.bind(observer));

        return () => {
            if (handle) handle.unsubscribe();
        };
    })
);

const client = new ApolloClient({
    link: ApolloLink.from([
        new TokenRefreshLink({
            accessTokenField: 'accessToken',
            isTokenValidOrUndefined: () => {
                const token = getAccessToken();
                // if the token is undefined we stop in this if statement
                if (!token) {
                    return true;
                }
                // if there is a token but it's not valid or malformed and if it's expired:
                try {
                    const {exp}: any = jwtDecode(token);

                    // check if it's expired:
                    if (Date.now() >= exp * 1000) {
                        return false;
                    } else {
                        return true;
                    }
                } catch {
                    return false;
                }
            },
            fetchAccessToken: () => {
                return fetch('http://localhost:4000/refresh_token', {method: 'POST', credentials: 'include'});
            },
            handleFetch: accessToken => {
                setAccessToken(accessToken);
            },
            // handleResponse: (operation, accessTokenField) => response => {
            //     // here you can parse response, handle errors, prepare returned token to
            //     // further operations
            //
            //     // returned object should be like this:
            //     // {
            //     //    access_token: 'token string here'
            //     // }
            // },
            handleError: err => {
                // full control over handling token fetch Error
                console.warn('Your refresh token is invalid. Try to relogin');
                console.error(err);

                // your custom action here
                // user.logout();
            }
        }) as any,
        onError(({graphQLErrors, networkError}) => {
            console.log(graphQLErrors, networkError);
        }),
        requestLink,
        new HttpLink({
            uri: 'http://localhost:4000/graphql',
            credentials: 'include'
        })
    ]),
    cache,
});

// cache.writeData({
//     data: {
//         isConnected: true
//     }
// });

// old client:
// const client = new ApolloClient({
//     uri: 'http://localhost:4000/graphql',
//     credentials: 'include',
//     request: (operation) => {
//         const accessToken = getAccessToken();
//         if (accessToken) {
//             operation.setContext({
//                 headers: {
//                     authorization: `bearer ${accessToken}`
//                 }
//             });
//         }
//
//     }
// });

ReactDOM.render(
    <React.StrictMode>
        <ApolloProvider client={client as any}>
            <App/>
        </ApolloProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
