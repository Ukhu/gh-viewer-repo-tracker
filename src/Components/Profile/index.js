import { Query } from 'react-apollo';
import Loading from '../Loading';
import RepositoryList from '../Repository';
import ErrorMessage from '../Error';
import { GET_REPOSITORIES_OF_CURRENT_USER } from '../../GraphQL/queries';

import './style.css';

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
