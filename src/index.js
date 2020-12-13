import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';
import { RetryLink } from 'apollo-link-retry';
import { ApolloLink } from 'apollo-link';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const GITHUB_BASE_URL = 'https://api.github.com/graphql';
const ACCESS_TOKEN = process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN;

const httpLink = new HttpLink({
  uri: GITHUB_BASE_URL,
  headers: {
    authorization: `Bearer ${ACCESS_TOKEN}`
  }
});

const retryLink = new RetryLink({
  delay: {
    initial: 500, // milliseconds
    jitter: true,
    max: 5000 // milliseconds
  },
  attempts: {
    max: 3
  }
})

const link = ApolloLink.from([retryLink, httpLink]);

const cache = new InMemoryCache();

const client = new ApolloClient({
  link,
  cache: cache
})

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
