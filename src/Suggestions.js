import React, {PropTypes} from 'react';
import _ from 'lodash';

function Suggestions({usernames, userMetadata, isLoading, isEmpty}) {
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isEmpty) {
    return <div>No Results</div>;
  }
  return (
    <ul>
      {usernames.map((name, index) => {
        return (
          <li className="list-unstyled" style={{paddingBottom: '1rem'}} key={`name-${index}`}>
            <div className="media">
              <div className="media-left">
                <a href="#">
                  <img className="media-object" src={_.get(userMetadata, [name, 'profile_image_url'])} alt={name} />
                </a>
              </div>
              <div className="media-body">
                <p className="media-heading">{_.get(userMetadata, [name, 'name'])} {'@'}{name}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}


Suggestions.propTypes = {
  usernames: PropTypes.array.isRequired,
  userMetadata: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isEmpty: PropTypes.bool.isRequired
};

export default Suggestions;
