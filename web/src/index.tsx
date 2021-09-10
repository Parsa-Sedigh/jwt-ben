import { ApolloProvider } from '@apollo/react-hooks';
import  ApolloClient  from 'apollo-boost';
import React from 'react';
import ReactDOM from 'react-dom';
import {Routes} from './Routes';
import reportWebVitals from './reportWebVitals';

const client = new ApolloClient({
    uri: 'http://localhost:4000/graphql'
});

ReactDOM.render(
  <React.StrictMode>
      <ApolloProvider client={client as any}>
              <Routes />
      </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
