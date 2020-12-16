import { Mutation } from 'react-apollo';
import Link from '../../Link';
import Button from '../../Button';
import { STAR_REPOSITORY, UNSTAR_REPOSITORY, WATCH_REPOSITORY } from '../../../GraphQL/mutations';
import { REPOSITORY_FRAGMENT } from '../../../GraphQL/fragments';

import '../style.css';

const VIEWER_SUBSCRIPTIONS = {
  subscribed: 'SUBSCRIBED',
  unsubscribed: 'UNSUBSCRIBED',
};

function isWatch(viewerSubscription) {
  return viewerSubscription === VIEWER_SUBSCRIPTIONS.subscribed;
}

function updateWatch(client, mutationResult) {
  const { updateSubscription: { subscribable: { id, viewerSubscription }}} = mutationResult.data;

  const cachedRepository = client.readFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
  })

  let { totalCount } = cachedRepository.watchers;

  totalCount = viewerSubscription === VIEWER_SUBSCRIPTIONS.subscribed ? totalCount + 1 : totalCount - 1;

  client.writeFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
    data: {
      ...cachedRepository,
      watchers: {
        ...cachedRepository.watchers,
        totalCount
      }
    }
  })
}

function updateAddStar(client, mutationResult) {
  const { addStar: { starrable: { id, viewerHasStarred } }} = mutationResult.data;

  client.writeFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
    data: getUpdatedStarData(client, id, viewerHasStarred)
  })
}

function updateRemoveStar(client, mutationResult) {
  const { removeStar: { starrable: { id, viewerHasStarred } }} = mutationResult.data;

  client.writeFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
    data: getUpdatedStarData(client, id, viewerHasStarred)
  })
}

function getUpdatedStarData(client, id, viewerHasStarred) {
  const cachedRepository = client.readFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
  });

  let { totalCount } = cachedRepository.stargazers;
  totalCount = viewerHasStarred ? totalCount + 1 : totalCount - 1;

  return {
    ...cachedRepository,
    stargazers: {
      ...cachedRepository.stargazers,
      totalCount,
    },
  };
};

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
              ? VIEWER_SUBSCRIPTIONS.unsubscribed
              : VIEWER_SUBSCRIPTIONS.subscribed,
          }}
          optimisticResponse={{
            updateSubscription: {
              __typename: 'Mutation',
              subscribable: {
                __typename: 'Repository',
                id,
                viewerSubscription: isWatch(viewerSubscription)
                ? VIEWER_SUBSCRIPTIONS.unsubscribed
                : VIEWER_SUBSCRIPTIONS.subscribed
              }
            }
          }}
          update={updateWatch}>
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
          <Mutation
            mutation={STAR_REPOSITORY}
            variables={{ id }}
            optimisticResponse={{
              addStar: {
                __typename: 'Mutation',
                starrable: {
                  __typename: 'Repository',
                  id,
                  viewerHasStarred: !viewerHasStarred,
                },
              },
            }}
            update={updateAddStar}>
            {(addStar) => (
              <Button 
                className={'RepositoryItem-title-action'}
                onClick={addStar}>
                {stargazers.totalCount} Star
              </Button>
            )}
          </Mutation> 
        ) : (
          <Mutation
            mutation={UNSTAR_REPOSITORY}
            optimisticResponse={{
              removeStar: {
                __typename: 'Mutation',
                starrable: {
                  __typename: 'Repository',
                  id,
                  viewerHasStarred: !viewerHasStarred,
                },
              },
            }}
            update={updateRemoveStar}>
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
