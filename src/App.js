import React, {Component} from 'react';
import Suggestions from './Suggestions';
import _ from 'lodash';
import request from 'superagent';
import {routes} from './config';
import trie from 'mnemonist/trie';
import Promise from 'bluebird';

export function searchQuery(term) {
  return new Promise((resolve, reject) => {
    request.get(routes.API_USERNAME_SEARCH)
      .query({username: `${term}`})
      .end(function (err, results) {
        if (err) {
          return reject(err);
        }
        // Create a metadata object
        const userMetadata = {};
        // Place usernames in an array for the Trie
        const usernames = _.get(results, 'body.users', []).map((userData) => {
          // Add the metadata keyed by username
          userMetadata[userData.screen_name] = userData;
          return userData.screen_name;
        });
        // Return both normalized data structures
        resolve([usernames, userMetadata]);
      });
  });
}

export function spliceToken(username) {
  // Simple splice of the @ symbol from a username
  return _.get(username.split('@'), [1])
}

export function parseUsernames(words) {
  // Take the words AST and find indices of usernames by token @
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
      userMetadata: {},
      suggestions: [],
      loadingSuggestions: false,
      isEmpty: false
    };
    // Using a Trie data structure library to build a prefix tree for caching
    // username results from Twitter API
    this.trie = trie.from([]);

    // Bind Class functions to class context
    this.onChange = this.onChange.bind(this);
    this.pruneTrieData = this.pruneTrieData.bind(this);

    // Add a debounce for good measure to further throttle API usage in addition to Trie caching
    this.executeSuggestions = _.debounce(this.executeSuggestions.bind(this), 200);
  }
  pruneTrieData() {
    // Need to trim trie size if it gets too big (> 500 items) from caching all the username searches
    // Don't want theoretical memory leaks
    return new Promise((resolve) => {
      if (this.trie.size > 500) {
        this.trie.clear();
        this.setState({userMetadata: {}}, resolve);
      } else {
        resolve();
      }
    });
  }
  executeQuery(query) {
    // Trigger load screen on suggestions component
    this.setState({loadingSuggestions: true});

    // Prune trie usernames exceeding 500 usernames
    // as well as clearing the userMetadata
    return this.pruneTrieData()
      // Run the AJAX query
      .then(() => searchQuery(query))
      // Destructure normalized username results
      .then(([usernames, userMetadata]) => {
        // Check if the trie has missing usernames
        usernames
          .filter((user) => !this.trie.has(user))
          // If true add username to trie
          .forEach((user) => this.trie.add(user));
        // Retrieve suggestions from trie
        const suggestions = this.trie.get(query);
        // Set the state
        this.setState({
          loadingSuggestions: false,
          suggestions,
          // Need shallow merge new userMetadata with existing
          userMetadata: _.assign(this.state.userMetadata, userMetadata),
          isEmpty: suggestions.length === 0
        });
      });
  }
  executeSuggestions(state, nextState) {
    // Going to take a naive approach of eagerly choosing last username word index
    // from old a new state
    const prevIndex = _.last(state.usernameIndices);
    const nextIndex = _.last(nextState.usernameIndices);
    // Is it the same username by index in state.words
    // Check if indices are numbers not undefined
    const isEqualIndex = prevIndex === nextIndex && _.isNumber(prevIndex) && _.isNumber(nextIndex);
    // @todo We could diff username values as well to determine if one was added to and needs suggestions
    // it will defeat one of the requirements of Hello @spr out

    if (isEqualIndex) {
      // Grab the username and splice the @ token
      let query = spliceToken(nextState.words[nextIndex]);
      // If query less than 3 characters ignore
      if (query.length < 2) {
        return;
      }
      // If Trie doesnt return results go run an AJAX fetch
      if (this.trie.get(query).length === 0) {
        this.executeQuery(query);
      } else {
        // If there are cached trie results set the state with them now
        this.setState({suggestions: this.trie.get(query), isEmpty: false});
      }
    } else {
      // If not isEqualIndex than no suggestions needed
      this.setState({suggestions: [], isEmpty: false});
    }
  }
  onChange(event) {
    let nextState = {};
    // Create an array of words
    nextState.words = event.target.value.split(' ');
    // Create an index of usernames
    nextState.usernameIndices = parseUsernames(nextState.words);
    // Bind context and old and new state to this.executeSuggestions before a setState happens
    // Perform shallow clone to get new references so mutation conditions don't happen as easily
    // @todo Use immutable datastructure library here perhaps
    const executeSuggestions = this.executeSuggestions.bind(this, _.clone(this.state), _.clone(nextState));
    // Set the state immediately after tapping the words and username indexes to prevent loss of textarea typing performance
    // Run the suggestions after transaction is complete to prevent crazy re-renders
    this.setState(nextState, () => executeSuggestions());
  }
  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-6 col-md-offset-3">
            <h2>Tweet</h2>
            <div className="form-group">
              {/* Bind listener and join words array to value as a controlled input field */}
              <textarea className="form-control" onChange={this.onChange} value={this.state.words.join(' ')}></textarea>
            </div>
            <div className="container">
              <div className="row">
                {/* Suggestions Stateless Component */}
                <Suggestions isEmpty={this.state.isEmpty}
                             isLoading={this.state.loadingSuggestions}
                             userMetadata={this.state.userMetadata}
                             usernames={this.state.suggestions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
