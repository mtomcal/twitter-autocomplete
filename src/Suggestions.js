import React, {Component, PropTypes} from 'react';

class Suggestions extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    if (this.props.isLoading) {
      return <div>Loading...</div>;
    }
    if (this.props.isEmpty) {
      return <div>No Results</div>;
    }
    return (
      <ul>
        {this.props.usernames.map((name, index) => {
          return (
            <li key={`name-${index}`}>{name}</li>
          );
        })}
      </ul>
    );
  }
}

Suggestions.propTypes = {
  usernames: PropTypes.array
};

export default Suggestions;
