const db = require('sqlite');;
function getCommands() {
    let commands = {
        "blackjack": {
            "description": "`!blackjack <//TODO>`",
        }
    }
    return commands;
}
//Don't touch those!


//TODO Functions

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

Function drawHand() {
    var cards = new Array("A", "J", "Q", "K");
    

    return "A" + " " + "A";
}

var blackjack = function () {
    var self = this;
    self.onMsg = function (cmd, msg) {
        if (cmd === "!sit" || cmd === "!blackjack") {
            //Actual stuff happening
            message.channel.sendMessage("Please place your bet.");
            const filter = m => (m.content.match("yes") && m.author.id === msg.author.id);

            msg.channel.awaitMessages(filter, {
                max: 1,
                time: 15000,
                errors: ['time']
            })
                .then(function (m) {
                    //m is the messages caught by filter
                    var stringResponse = m.content;
                    var userBet = parseInt(stringResponse); 

                    message.channel.sendMessage("Insert hand here");
                })
                .catch(function () {
                    //TODO, caught
                    "Invalid Response."
                });
        }
    }

    //Don't touch these!
    self.load = function (database) {
        self.db = database;
        console.log("blackjack.js loaded");
    }
    self.loadPerms = function (msg) {
        let commands = getCommands();
        for (let command in commands) {
            let cmd = commands[command];
            db.get(`SELECT * FROM permissions WHERE guildId ='${msg.guild.id}' AND command ='${command}'`).then(row => {
                if (!row) {
                    db.run('INSERT INTO permissions (guildId, command, description, children, sends, alias, cooldown, rolesDenied, rolesAllowed, usersDenied, usersAllowed, channelsDenied, channelsAllowed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [msg.guild.id, command, cmd.description, cmd.children, cmd.sends, cmd.alias, cmd.cooldown, cmd.rolesDenied, cmd.rolesAllowed, cmd.usersDenied, cmd.usersAllowed, cmd.channelsDenied, cmd.channelsAllowed]).then(() => {
                    });
                }
            });
        }
        msg.channel.sendMessage("`blackjack.js` has been enabled!");
    }
}
module.exports = blackjack;
