const db = require('sqlite');
let cogs = {};
function getJson() {
    fs = require('fs');
    let economyJson = JSON.parse(fs.readFileSync("./cogs/battles.json").toString());
    return economyJson;
}

var players = [null,null];
var current;
var opponent;
var card;
var scenario;
var inSession = false;

function switchPlayer() {
    if (current === 0) {
        current = 1;
        opponent = 0;
    } else if (current === 1) {
        current = 0;
        opponent = 1;
    }
}
function chooseCard(battlesJson) {
    card = battlesJson.cards[(Math.floor((Math.random() * battlesJson.cards.length) + 1)-1)];
}
function chooseScenario() {
    scenario = card.scenarios[(Math.floor((Math.random() * card.scenarios.length) + 1)-1)];
}
function whiteSpace(spaceCount) {
    var spaces = "";
    for (var i=0;i<spaceCount;i+=1) {
        spaces += " ";
    }
    return spaces;
}
function editStats(user,stat,battlesJson) {
    if (!battlesJson.users[user.id]) {
        battlesJson.users[user.id] = {
            "wins":0,
            "losses":0,
            "draws":0,
            "total":0,
            "ratio":0
        }
    }
    battlesJson.users[user.id][stat] += 1;
    battlesJson.users[user.id].total += 1;
    battlesJson.users[user.id].ratio = battlesJson.users[user.id].wins / battlesJson.users[user.id].losses;
    battlesJson.users[user.id]["username"] = user.username;
    fs.writeFileSync("./cogs/battles.json",JSON.stringify(battlesJson,null,"\t"));
}
function getBoard(msg) {
    let battlesJson = getJson();
    var size = 10;
    if (!msg.mentions.users.first()) {
        size = msg.content.split(" ")[1];
    }
    if (!size) {size = 10;}
    var board = [];
    for (var user in battlesJson.users) {
        if (msg.mentions.users.first()) {
            if (user === msg.mentions.users.first().id) {
                board.push(battlesJson.users[msg.mentions.users.first().id]);
            }
        } else {
            if (board.length === 0) {
                board.push(battlesJson.users[user]);
            } else {
                let boardLength = board.length;
                let lower = true;
                for (var i=0;i<boardLength;i+=1) {
                    if (battlesJson.users[user].ratio > board[i].ratio) {
                        board.splice(i,0,battlesJson.users[user]);
                        lower = false;
                        break;
                    }
                }
                if (lower === true) {
                    board.push(battlesJson.users[user]);
                }
            }
        }
    }

    var message = "```Python\n#  Name                 wins    losses  draws   total   ratio   ";
    let height = size;
    if (height > board.length) {
        height = board.length;
        if (height > 30) {
            height = 30;
        }
    }
    for (var i=0;i<height;i+=1) {
        let username = board[i].username;
        let wins = board[i].wins;
        let losses = board[i].losses;
        let draws = board[i].draws;
        let total = board[i].total;
        let ratio = board[i].ratio;
        if (i<9) {
            message += "\n" + (i+1) + "  " + username.slice(0,20) + whiteSpace(21 - username.slice(0,20).length) + wins + whiteSpace(8 - wins.toString().length) + losses + whiteSpace(8 - losses.toString().length) + draws + whiteSpace(8 - draws.toString().length) + total + whiteSpace(8 - total.toString().length) + ratio.toFixed(2) + whiteSpace(8 - ratio.toString().length);
        } else {
            message += "\n" + (i+1) + " " + username.slice(0,20) + whiteSpace(21 - username.slice(0,20).length) + wins + whiteSpace(8 - wins.toString().length) + losses + whiteSpace(8 - losses.toString().length) + draws + whiteSpace(8 - draws.toString().length) + total + whiteSpace(8 - total.toString().length) + ratio.toFixed(2) + whiteSpace(8 - ratio.toString().length);
        }
    }
    if (board.length === 0) {
        message += "\nEmpty";
    }
    message += "\n```";
    msg.channel.sendMessage(message);
}
function friendlyBattle(msg) {
    let battlesJson = getJson();
    if (inSession === false) {
        inSession = true;
        players[0] = msg.author;
        players[1] = msg.mentions.users.first();
        if (!msg.mentions.users.first()) {
            msg.channel.sendMessage("You must battle someone! `!battle @user`");
            inSession = false;
            return;
        }
        if (msg.mentions.users.first().id === msg.author.id) {
            msg.channel.sendMessage("You can't battle yourself!");
            inSession = false;
            return;
        }
        /*if (battlesJson.users[players[0].id]["protected"] === false) {
            msg.channel.sendMessage("You can't battle if you're protected! Use `!unprotect` to unprotect yourself.");
            return;
        }
        if (battlesJson.users[players[1].id]["protected"] === false) {
            msg.channel.sendMessage("You can't battle someone who is protected!");
            return;
        }*/
        msg.channel.sendMessage("**" + players[0].username + "** challenges **" + players[1].username + "** to a friendly battle! Let the battles begin!");

        battlesJson.towers["king tower"][0] = battlesJson.towers["king tower"].health;
        battlesJson.towers["king tower"][1] = battlesJson.towers["king tower"].health;

        current = (Math.floor((Math.random() * 2) + 1)-1);
        if (current === 0) {
            opponent = 1;
        } else if (current ===1) {
            opponent = 0;
        }
        msg.channel.sendMessage("**" + players[current].username + "** decides to play a card first!");

        let moves = [];
        while(battlesJson.towers["king tower"][0] > 0 && battlesJson.towers["king tower"][1] > 0) {
            chooseCard(battlesJson);
            chooseScenario();
            battlesJson.towers["king tower"][opponent] -= scenario.damage;
            let attacker = players[current].username;
            let defender = players[opponent].username;
            let damage = scenario.damage;
            let name = card.name;
            let hp = battlesJson.towers["king tower"][opponent];
            let message = scenario.message.replace(/\$user/g,(`**${attacker}**`)).replace(/\$card/g,(`**${name}**`)).replace(/\$opponent/g,(`**${defender}**`)).replace(/\$damage/g,(`**${damage}**`));
            if (moves.length <= 12) {
                if (battlesJson.towers["king tower"][opponent] <= 0) {
                    moves.push(`${message} **(${damage}dmg)(${defender}: ${hp}hp)**`);
                    moves.push("**" + players[current] + " three crowned "  + players[opponent].username + "!**");
                    editStats(players[current],"wins",battlesJson);
                    editStats(players[opponent],"losses",battlesJson);
                } else {
                    moves.push(`${message} **(${damage}dmg)(${defender}: ${hp}hp)**`);
                    switchPlayer();
                }
            } else {
                moves.push("**__Time ran out, the match ended in a draw!__**");
                editStats(players[current],"draws",battlesJson);
                editStats(players[opponent],"draws",battlesJson);
                break;
            }
        }
        let gameInterval = setInterval(()=>{
            let nextMove = moves.shift();
            if (!nextMove) {clearInterval(gameInterval);inSession=false;}
            if (nextMove != undefined) {msg.channel.sendMessage(nextMove);}
        }, 1500);
    } else {
        msg.channel.sendMessage("A battle is currently in progress.");
    }
}
function unprotect(msg) {
    let battlesJson = getJson();
    battlesJson.users[msg.author.id]["protected"] = false;
    msg.channel.sendMessage("You're no longer protected.");
    fs.writeFileSync("./cogs/battles.json",JSON.stringify(battlesJson,null,"\t"));
}
function protect(msg) {
    let battlesJson = getJson();
    battlesJson.users[msg.author.id]["protected"] = true;
    msg.channel.sendMessage("You're are now protected.");
    fs.writeFileSync("./cogs/battles.json",JSON.stringify(battlesJson,null,"\t"));
}
var battles = function() {
    var self = this;
    self.returnJson = getJson();
    self.onReady = function(cogsFile){
        cogs = cogsFile;
        console.log("battles.js loaded");
    }
    self.onMsg = function(cmd,msg) {
        let prefix = "!";
        if (cmd === "battles") {
            getBoard(msg);
        } else if (cmd === "battle") {
            friendlyBattle(msg);
        }/* else if (msg.content.startsWith(prefix + "unprotect")) {
            unprotect(msg);
        } else if (msg.content.startsWith(prefix + "protect")) {
            protect(msg);
        }*/
    }
    self.load = function(database) {
        self.db = database;
        console.log("battles.js loaded");
    }
}

module.exports = battles;
