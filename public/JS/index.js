//#region MAIN
function submitForm() {
    const inputElement = document.getElementById('steam-input');
    const input = inputElement.value.trim();
    const minLength = inputElement.getAttribute('minlength');
    const maxLength = inputElement.getAttribute('maxlength');

    if (input.length < minLength || input.length > maxLength) {
        displayError(`L'entrée doit comporter entre ${minLength} et ${maxLength} caractères.`);
        return;
    }

    if (!isNaN(input)) {
        // ID
        fetchPlayerSummaries(input);
    } else {
        // Texte
        fetchSteamProfile(input);
    }
}

function convertTimeCreated(timecreated) {
    const milliseconds = timecreated * 1000;
    const date = new Date(milliseconds);
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    return formattedDate;
}

function showTransition(result) {
    if (result) {
        const resultsH = document.getElementsByClassName("home");
        for (let i = 0; i < resultsH.length; i++) {
            resultsH[i].classList.add("show-after");
            resultsH[i].classList.add("img-fluid");
        }
        const resultsI = document.getElementsByClassName("infos");
        for (let i = 0; i < resultsI.length; i++) {
            resultsI[i].classList.add("show-after");
            resultsI[i].classList.add("img-fluid");
        }
        const resultsF = document.getElementsByClassName("friends");
        for (let i = 0; i < resultsF.length; i++) {
            resultsF[i].classList.add("show-after");
            resultsF[i].classList.add("img-fluid");
        }
    }
}

function whatURL() {
    let url = ["https://steam.tsukizo.fr", "http://steam.tsukizo.fr"]
    if (window.location.origin === url[1]) {
        return url[1]
    } else {
        return url[0]
    }
}
//#endregion MAIN

//#region FETCH 
async function fetchSteamProfile(input) {
    try {
        let url = whatURL();
        let newUrl = `${url}/resolve-vanity-url/${input}`;
        const response = await fetch(newUrl);
        const data = await response.json();
        if (data.response.success === 1) {
            const steamId = data.response.steamid;
            fetchPlayerSummaries(steamId);
        } else {
            throw new Error('Profil Steam introuvable');
        }
    } catch (error) {
        displayError(error.message);
        console.log(error);
    }
}


async function fetchPlayerSummaries(steamId) {
    // Texte & ID
    try {
        let url = whatURL()
        const response = await fetch(`${url}/get-player-summaries/${steamId}`);
        const data = await response.json();
        const player = data.response.players.player[0];
        displayProfile(player);
        fetchPlayerFriends(steamId)
        fetchPlayerGames(steamId)
    } catch (error) {
        displayError(error.message);
    }
}

async function fetchPlayerFriends(steamId) {
    try {
        let url = whatURL()
        const response = await fetch(`${url}/get-friends/${steamId}`);
        const data = await response.json();

        if (data.friendslist && data.friendslist.friends.length > 0) {
            const friends = data.friendslist.friends;
            const friendsDetails = [];

            for (const friend of friends) {
                const friendResponse = await fetch(`${url}/get-player-summaries/${friend.steamid}`);
                const friendData = await friendResponse.json();

                const friendInfo = {
                    avatar: friendData.response.players.player[0].avatarfull,
                    name: friendData.response.players.player[0].personaname,
                    link: friendData.response.players.player[0].profileurl,
                };

                friendsDetails.push(friendInfo);
            }

            displayFriends(friendsDetails);
        } else {
            displayFriends([]);
        }
    } catch (error) {
        console.log(error)
        displayFriends([]);
    }
}

async function fetchAppAchievement(appId, steamId) {
    try {
        let url = whatURL()
        const response = await fetch(`${url}/get-achievement/${appId}?steamId=${steamId}`);
        const data = await response.json();
        displayAchivement(data);
    } catch (error) {
        console.error('Error fetching app achievements:', error);
    }
}

async function fetchPlayerGames(steamId) {
    try {
        let url = whatURL()
        const response = await fetch(`${url}/get-games/${steamId}`);
        const data = await response.json();
        displayGames(data, steamId);
    } catch (error) {
        displayError(error.message);
        displayGames(false);
    }
}
//#endregion FETCH

//#region DISPLAY
function displayProfile(player) {
    let time = convertTimeCreated(player.timecreated);
    const profileInfo = `
            <img src="${player.avatarfull}" alt="Avatar" class="InfosImg">
            <h2 class="infosText">${player.personaname}</h2>
            <p class="infosText"><a href="${player.profileurl}" target="_blank">Lien vers le Profil</a></p>
            <p class="infosText">Nom Réel: ${player.realname || 'Non spécifié'}</p>
            <p class="infosText">Pays: ${player.loccountrycode || 'Non spécifié'}</p>
            <p class="infosText">Date de création : ${time}</p>
            `;
    showTransition(true)
    document.getElementById('profile-info').innerHTML = profileInfo;
}

function displayFriends(friends) {
    if (friends.length > 0) {
        let friendsList = '';
        friends.forEach(friend => {
            const friendName = friend.name;
            const friendAvatar = friend.avatar;
            const friendLink = friend.link;

            friendsList += `
                <div>
                    <a href="${friendLink}" target="_blank">
                        <img src="${friendAvatar}" alt="Avatar de ${friendName}" style="width: 100%;">
                    </a>
                    <p>${friendName}</p>
                </div>`;
        });

        if ($('.responsiveFriend').hasClass('slick-initialized')) {
            $('.responsiveFriend').slick('unslick');
        }

        document.getElementById('profile-friends').innerHTML = friendsList;

        $('.responsiveFriend').slick({
            dots: true,
            infinite: false,
            speed: 300,
            slidesToShow: 4,
            slidesToScroll: 4,
            arrows: false,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                        infinite: true,
                        dots: true
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
            ]
        });
    } else {
        document.getElementById('profile-friends').innerHTML = '<p class="errorFriend">Les amis de ce membre ne sont pas visible !</p>';
    }
}

function displayGames(player, steamId) {
    const games = player.response.games;
    if (games.length > 0) {
        let gamesList = '';
        games.forEach(game => {
            let appId = game.appid;
            let imgUrl = game.img_icon_url;
            let image = `http://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${imgUrl}.jpg`;

            const appName = game.name;
            const playtimeHours = Math.round(game.playtime_forever / 60);
            let lastPlayed = game.rtime_last_played ? new Date(game.rtime_last_played * 1000) : "Non spécifié";

            gamesList += `
                <div data-app-id="${appId}" class="game-item">
                    <img src="${image}" alt="${appName}" style="width: 184px;">
                    <p>${appName}</p>
                </div>`;
        });

        if ($('.responsiveGames').hasClass('slick-initialized')) {
            $('.responsiveGames').slick('unslick');
        }

        document.getElementById('profile-games').innerHTML = gamesList;

        $('.responsiveGames').slick({
            dots: true,
            infinite: true,
            speed: 300,
            slidesToShow: 4,
            slidesToScroll: 4,
            arrows: false,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                        infinite: true,
                        dots: true
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
            ]
        });

        document.querySelectorAll('.game-item').forEach(item => {
            item.addEventListener('click', async function () {
                const appId = this.getAttribute('data-app-id');
                // await fetchAppAchievement(appId, steamId);
            });
        });
    } else {
        document.getElementById('profile-games').innerHTML = '<p>Ce joueur ne possède aucun jeu.</p>';
    }
}

function displayAchivement(appdata) {
    if (appdata && appdata.achievements && appdata.achievements.playerstats) {
        const playerstats = appdata.achievements.playerstats;

        if (playerstats.error) {
            alert(playerstats.error);
        } else if (playerstats.achievements) {
            console.log(playerstats.achievements);
        }
    }
    let json = {
        "appId": "4000",
        "steamId": "76561198955321441",
        "achievements": {
            "playerstats": {
                "steamID": "76561198955321441",
                "gameName": "Garry's Mod",
                "achievements": [
                    {
                        "apiname": "GMA_PLAY_SINGLEPLAYER",
                        "achieved": 1,
                        "unlocktime": 1561673285
                    },
                ],
                "success": true
            }
        }
    };
}

function displayError(message) {
    document.getElementById('errorText').innerHTML = `<p class="error">${message}</p>`;
}
//#endregion DISPLAY