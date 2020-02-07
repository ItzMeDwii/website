const express = require('express');
const config = require('./config.json');
const fs = require('fs');
const { Client } = require('discord.js');
require('dotenv').config();  

const app = express();
app.use('/assets', express.static(__dirname + '/assets'));
const bot = new Client({ disableEveryone: true });

bot.on('ready', () => console.log('Bot is Ready!'));

app.get('/', (req, res) => {
    res.status(200).sendFile('index.html', { root: '.' });
    log(req);
});

app.get('/myAvatar', (req, res) => {
    res.setHeader('content-type', 'application/json');
    bot.fetchUser("295792353485258754").then(u => {
        res.redirect(u.displayAvatarURL.replace('?size=2048', '?size=128'));
    });
});

app.get('/redir/:name', async (request, response) => {
    let name = request.params.name;
    if (!name) response.redirect(301, '/');
    let redirList = JSON.parse(fs.readFileSync('./config.json', {
        encoding: 'utf8'
    }));
    let redirect = redirList.redirLinks[name];
    const path = request.route.path.split('/');
    path[2] = name;
    request.route.path = path.join('/');
    if (redirect === undefined) return response.status(301).redirect(301, '/');
    log(request);
    response.status(301).redirect(301, redirect);
});

function getIP(request) {
    const headers = request.headers;
    const state = {};
    state[0] = headersHas(headers, 'true-client-ip');
    state[1] = headersHas(headers, 'x-real-ip');
    state[2] = headersHas(headers, 'cf-connecting-ip');
    state[3] = headersHas(headers, 'x-forwarded-for');
    if (state[0] === true) {
        return headers['true-client-ip'];
    } else if (state[1] === true) {
        return headers['x-real-ip'];
    } else if (state[2] === true) {
        return headers['cf-connecting-ip'];
    } else if (state[3] === true) {
        return headers['x-forwarded-for'].split(",")[0];
    } else {
        return "0.0.0.0";
    }
    function headersHas(headers, header) {
        if (headers[header] !== undefined) return true;
        else return false;
      }
}

function log(request) {
    function getUserAgent(request) {
        return request.headers['user-agent'];
    }
    if (getUserAgent(request) === "Mozilla/5.0+(compatible; UptimeRobot/2.0; http://www.uptimerobot.com/)") return;
    console.log(`[DEBUG] [${new Date().toString().split(" ", 5).join(" ")}] [${getIP(request)}] [${getUserAgent(request)}] ${getIP(request)} is requesting ${request.method} to ${request.route.path}`);
}

app.listen(config.port, () => console.log(`Web server is listening on port ${config.port}!`));

bot.login(process.env.TOKEN);