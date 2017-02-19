# Twitter Autocomplete

Rolling a tweetbox with autocomplete for the usernames on the Twitter API.

## Libraries:

|Name|Description|
|----|-------------|
| [Bluebird](http://bluebirdjs.com/) | A popular performant promise library that I have used for couple years.|
| [Lodash](https://lodash.com/) | A library that provides useful performance tuned utility functions.|
| [Mnemonist](https://yomguithereal.github.io/mnemonist/) | A data structure library for Javascript that has a [Trie data structure](https://en.wikipedia.org/wiki/Trie) I used for caching autocomplete results|
| [Twitter Bootstrap](http://getbootstrap.com/) | For quick HTML/CSS styling that I have used for years as well. Included the [Paper](https://bootswatch.com/paper/) theme for material design look.|
| [Superagent](http://visionmedia.github.io/superagent/) | An AJAX library that has an intuitive API and has been around for years|

## Install and Run

I used Node v6.x.x to develop this.

Clone this project and...

```
npm install
```

And to run:

```
npm start
```

and do in another terminal session...

```
npm run start:server
```

## Requirements
```
The expected UX for this lookup is:
Screenname suggestions should be shown after a user types the @ character followed by any alphanumeric character(s), without any spaces (e.g. “ Hello @sprout” would trigger a set of suggestions for sprout whereas “Hello @spr out” would trigger a set of suggestions for spr).
```
This should work as expected. I followed an approach similar to that of Facebook's DraftJS library where we parse every word entity and then establish a separate index for tokens of interest in a controlled textarea form element using React state. In the end I took the route where we choose the last username found in the textarea and then provide suggestions. The comments should provide the specifics.

```
Show suggestions when there are at least two characters in the possible screenname, not including the @ (e.g. @ab would trigger a set of suggestions but @a would not)
```
I added this condition in the `executeSuggestions` method on App.js.

```
The suggestions should show up as a list in the application and should display the following fields:
* Name
* Screenname
* User profile image
```

In the Suggestions component I display a list of name, screenname, and user profile image.

```
Bonus Items:
1. Support navigating through the suggested results with the keyboard arrow keys and selection of the highlighted suggestion
2. Handle the case where the entered text contains multiple screennames
3. Use ES6 features (arrow functions, default parameters)
4. Use React to render the suggestions
5. Add client side caching of the Twitter search results
```
I accomplished \#2 through \#5 fairly handily. Particularly, I used the Trie data structure for the client side caching.

In regards \#1, I ran out of time given my schedule to add this feature so I will speak on how I would accomplish this:
* I would add keyUp event listeners for up and down keys on the textarea object in the App component that would pipe into Suggestions an incrementing index value of 0...this.state.suggestions.length.
* I would add keyUp event listener to enter key into App component that would take index value on the suggestions and then replace the this.state.words[last(this.state.usernameIndices)] = suggestions[indexSelectedSuggestion]
