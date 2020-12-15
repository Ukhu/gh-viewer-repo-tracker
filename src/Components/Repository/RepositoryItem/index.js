import { Mutation } from 'react-apollo';
import Link from '../../Link';
import Button from '../../Button';
import { STAR_REPOSITORY, UNSTAR_REPOSITORY, WATCH_REPOSITORY } from '../../../GraphQL/mutations';

import '../style.css';

const VIEWER_SUBSCRIPTIONS = {
  SUBSCRIBED: 'SUBSCRIBED',
  UNSUBSCRIBED: 'UNSUBSCRIBED',
};

const isWatch = (viewerSubscription) =>
  viewerSubscription === VIEWER_SUBSCRIPTIONS.SUBSCRIBED;

const RepositoryItem = ({
  id,
  name,
  url,
  descriptionHTML,
  primaryLanguage,
  owner,
  stargazers,
  watchers,
  viewerSubscription,
  viewerHasStarred
}) => (
  <div>
    <div className="RepositoryItem-title">
      <h2>
        <Link href={url}>{name}</Link>
      </h2>

      <div>
        <Mutation
          mutation={WATCH_REPOSITORY}
          variables={{
            id,
            viewerSubscription: isWatch(viewerSubscription)
              ? VIEWER_SUBSCRIPTIONS.UNSUBSCRIBED
              : VIEWER_SUBSCRIPTIONS.SUBSCRIBED,
          }}>
          {(updateSubscription, { data, loading, error }) => {
            if (error) {
              console.log(error.toString());
            }

            return (
              <Button
                className="RepositoryItem-title-action"
                data-test-id="updateSubscription"
                onClick={updateSubscription}>
                {watchers.totalCount}{' '}
                {isWatch(viewerSubscription) ? 'Unwatch' : 'Watch'}
              </Button>
            )
          }}
        </Mutation>

        { !viewerHasStarred ? (
          <Mutation mutation={STAR_REPOSITORY} variables={{ id }}>
            {(addStar) => (
              <Button 
                className={'RepositoryItem-title-action'}
                onClick={addStar}>
                {stargazers.totalCount} Star
              </Button>
            )}
          </Mutation> 
        ) : (
          <Mutation mutation={UNSTAR_REPOSITORY}>
            {(removeStar) => (
              <Button
                className={'RepositoryItem-title-action'}
                onClick={() => removeStar({variables: { id }})}>
                {stargazers.totalCount} UnStar
              </Button>
            )}
          </Mutation>
        )}
      </div>
    </div>

    <div className="RepositoryItem-description">
      <div
        className="RepositoryItem-description-info"
        dangerouslySetInnerHTML={{ __html: descriptionHTML }}
      />
      <div className="RepositoryItem-description-details">
        <div>
          {primaryLanguage && (
            <span>Language: {primaryLanguage.name}</span>
          )}
        </div>
        <div>
          {owner && (
            <span>
              Owner: <a href={owner.url}>{owner.login}</a>
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default RepositoryItem;
