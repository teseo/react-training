var axios = require('axios');
var params = '?client_id=f9966a8b64d9203b6aed&client_secret=35f0818ce1518115612b57bcb4265d150d188021';
function getProfile(username){
  return axios.get('https://api.github.com/users/' + username + params)
  .then(function(user){
    return user.data;
  });
}
function getRepos(username){
  return axios.get('https://api.github.com/users/'+ username +'/repos' +  params + '&per_page=100')
}

function getStartCount(repos){
  return repos.data.reduce(function(count, repo){
    return count + repo.stargazers_count;
  },0);
}

function calculateScore(profile, repos){
  var followers = profile.followers;
  var totalStars = getStartCount(repos);

  return (followers * 3) + totalStars;
}

function handleError(error) {
  console.warn(error);
  return null;
}

function getUserData(player) {
  return axios.all([
    getProfile(player),
    getRepos(player)
  ]).then(function(data){
    var profile = data[0];
    var repos = data[1];

    return {
      profile: profile,
      score: calculateScore(profile, repos)
    }
  });
}

function sortPlayers(players){
  return players.sort(function (a,b){
    return b.score - a.score;
  });
}

module.exports = {
  battle: function(players){
    return axios.all(players.map(getUserData))
      .then(sortPlayers)
      .catch(handleError)
  },
  fetchPopularRepos: function (language) {
    var encodedURI = window.encodeURI('https://api.github.com/search/repositories?q=stars:>1+language:'+ language + '&sort=stars&order=desc&type=Repositories');

    return axios.get(encodedURI)
      .then(function(response){
        return response.data.items;
      })
  }
}
