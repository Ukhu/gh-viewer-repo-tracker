import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Loading from '../Loading';
import RepositoryList from '../Repository';
import ErrorMessage from '../Error';

import './style.css';

const GET_REPOSITORIES_OF_CURRENT_USER = gql`
  {
    viewer {
      name
      repositories(
        first: 5
        orderBy: { direction: DESC, field: STARGAZERS }
      ) {
        edges {
          node {
            id
            name
            url
            descriptionHTML
            primaryLanguage {
              name
            }
            owner {
              login
              url
            }
            stargazers {
              totalCount
            }
            viewerHasStarred
            watchers {
              totalCount
            }
            viewerSubscription
          }
        }
      }
    }
  }
`;

const Profile = () => (
  <Query query={GET_REPOSITORIES_OF_CURRENT_USER}>
    {({data, loading, error}) => {
      if (error) {
        return <ErrorMessage error={error} />
      }

      if (loading || !data) {
        return (
          <Loading />
        )
      }

      const { viewer } = data;

      return (
        <>
          <h1>{viewer.name}</h1>
          <RepositoryList repositories={viewer.repositories}/>
        </>
      )
    }}
  </Query>
);

export default Profile;
