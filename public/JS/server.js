const express = require('express');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT;
const apiKey = process.env.apiKey;

app.use('/CSS', express.static(path.join(__dirname, '../CSS')), cors());
app.use('/JS', express.static(path.join(__dirname, '../JS')), cors());
app.use('/IMG', express.static(path.join(__dirname, '../IMG')), cors());
app.use('/HTML', express.static(path.join(__dirname, '../HTML')), cors());

app.get('/resolve-vanity-url/:vanityurl', async (req, res) => {
    const vanityUrl = req.params.vanityurl;
    try {
        const response = await fetch(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${apiKey}&vanityurl=${vanityUrl}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/get-player-summaries/:steamid', async (req, res) => {
    const steamId = req.params.steamid;
    try {
        const response = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0001/?key=${apiKey}&steamids=${steamId}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/get-games/:steamid", async (req, res) => {
    const steamId = req.params.steamid;
    try {
        const response = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

})

app.get("/get-friends/:steamid", async (req, res) => {
    const steamId = req.params.steamid;
    try {
        const response = await fetch(`http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${apiKey}&steamid=${steamId}&relationship=all&format=json`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

})

app.get("/get-achievement/:appId", async (req, res) => {
    const appId = req.params.appId;
    const steamId = req.query.steamId;
    try {
        const response = await fetch(`http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appId}&key=${apiKey}&steamid=${steamId}`);
        const data = await response.json();
        res.json({
            appId: appId,
            steamId: steamId,
            achievements: data
        });
    } catch (error) {
        console.error('Error fetching app achievements:', error);
        res.status(500).json({ error: 'Error fetching app achievements' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '/HTML/index.html'));
});

app.listen(port, () => {
    console.log(`Serveur lancé`);
});