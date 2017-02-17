import React, {Component} from 'react';
import Suggestions from './Suggestions';
import _ from 'lodash';
import trie from 'mnemonist/trie';
import Promise from 'bluebird';

function mockQuery(term) {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve(['watson', 'wilson', 'wally', 'wombat', 'wallace', 'philip', 'philis']);
    }, 1000);
  });
}

export function spliceToken(username) {
  return _.get(username.split('@'), [1])
}

export function parseUsernames(words) {
  const len = words.length;
  let usernames = [];
  // Using for loop for speed rather than map
  for (let i = 0; i < len; i++) {
    if (words[i].match(/^@/)) {
      usernames.push(i);
    }
  }
  return usernames;
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      words: [],
      usernameIndices: [],
      suggestions: [],
      loadingSuggestions: false,
      isEmpty: false
    };
    this.trie = trie.from([]);
    this.onChange = this.onChange.bind(this);
    this.executeSuggestions = this.executeSuggestions.bind(this);
  }
  executeSuggestions(nextState) {
    const lastWordIndex = nextState.words.length - 1;
    if (_.last(nextState.usernameIndices) === lastWordIndex) {
      let query = spliceToken(nextState.words[lastWordIndex]);

      if (query.length < 3) {
        return;
      }

      if (this.trie.get(query).length === 0) {
        this.setState({loadingSuggestions: true});

        mockQuery(query)
          .then((_suggestions) => {
            this.trie = trie.from(_suggestions);
            const suggestions = this.trie.get(query);
            this.setState({loadingSuggestions: false, suggestions, isEmpty: suggestions.length === 0});
          });

      } else {
        this.setState({suggestions: this.trie.get(query), isEmpty: false});
      }
    } else {
      this.setState({suggestions: [], isEmpty: false});
    }
  }
  onChange(event) {
    let nextState = {};
    nextState.words = event.target.value.split(' ');
    nextState.usernameIndices = parseUsernames(nextState.words);
    this.setState(nextState, () => this.executeSuggestions(_.clone(nextState)));
  }
  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-6 col-md-offset-3">
            <h2>Tweet</h2>
            <div className="form-group">
              <textarea className="form-control" onChange={this.onChange} value={this.state.words.join(' ')}></textarea>
            </div>
            <div className="container">
              <div className="row">
                <Suggestions isEmpty={this.state.isEmpty} isLoading={this.state.loadingSuggestions} usernames={this.state.suggestions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
