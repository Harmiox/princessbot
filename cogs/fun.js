const db = require('sqlite');;
function getCommands() {
    let commands = {
        "wolf": {
			"description": "`!wolf <endCharacter>`",
            "type": "cog"
		},
		"sprains": {
			"description": "`!sprains`",
            "type": "cog"
		},
		"armoredtruck": {
			"description": "`!armoredtruck`",
            "type": "cog"
		}
    }
    return commands;
}
function wolf(msg) {
    let args = msg.content.split(" ");
    if (args.length > 1) {
        let position = parseInt(args[1]);
        if (position >= 0) {
            var name = msg.member.nickname;
            if (!name) {
                name = msg.member.user.username;
            }
            let newName = name.substring(0,position) + "wolf";
            msg.member.setNickname(newName);
            msg.channel.sendMessage(msg.author + " You've been wolf'd!");
        } else {
            msg.channel.sendMessage("That number is not allowed!");
        }
    } else {
        msg.channel.sendMessage("Usage: `!wolf <endCharacterPosition>`\nExample: **1998cr:** `!wolf 4` => **1998wolf**");
    }
}
sprains = 13;
function wrists(msg) {
    sprains += 1;
    msg.channel.sendMessage("Another round of circlejerking! Wrists sprained to date: " + sprains);
}
function armoredtruck(msg) {
    let commands = [
        "!banks",
        "!delgs",
        "yes",
        "!deltd",
        "yes",
        "!delgv",
        "yes",
        "!delgm",
        "yes",
        "!newbank",
        "Goblin Shop",
        "5",
        "600000",
        "1000000",
        "15",
        "!newbank",
        "Troop Depot",
        "10",
        "2500000",
        "3000000",
        "7",
        "!newbank",
        "Gold Vault",
        "20",
        "4500000",
        "6000000",
        "5",
        "!newbank",
        "Gem Mines",
        "50",
        "15000000",
        "20000000",
        "2",
        "!banks"
    ]
    msg.channel.sendMessage("Are you sure you'd like to refill the banks? Say `yes` to continue.");
    const filter = m => (m.content.match("yes") && m.author.id === msg.author.id);
    msg.channel.awaitMessages(filter, {
            max: 1,
            time: 15000,
            errors: ['time']
        })
        .then(function() {
            msg.channel.sendMessage("Armored-Truck Initiated");
            let gameInterval = setInterval(()=>{
                let nextCmd = commands.shift();
                if (!nextCmd) {clearInterval(gameInterval);inSession=false;}
                if (nextCmd != undefined) {msg.channel.sendMessage(nextCmd);}
            }, 5000);
        })
        .catch(function() {
            msg.channel.sendMessage("Armored-Truck Cancelled");
        });
}
var fun = function() {
    var self = this;
    self.onMsg = function(cmd,msg) {
        if (cmd === "wolf") {
            wolf(msg);
        }
        if (cmd === "sprains") {
            wrists(msg);
        }
        if (cmd === "armoredtruck") {
            armoredtruck(msg);
        }
    }
    self.load = function(database) {
        self.db = database;
        console.log("fun.js loaded");
    }
    self.loadPerms = function(msg) {
        let commands = getCommands();
        for (let command in commands) {
            let cmd = commands[command];
            db.get(`SELECT * FROM permissions WHERE guildId ='${msg.guild.id}' AND command ='${command}'`).then(row => {
                if (!row) {
                    db.run('INSERT INTO permissions (guildId, command, description, type, sends, alias, cooldown, roles, users, channels) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [msg.guild.id, command, cmd.description, cmd.type, cmd.sends, cmd.alias, cmd.cooldown, cmd.roles, cmd.users, cmd.channels]).then(() => {
                    });
                }
            });
        }
        msg.channel.sendMessage("`fun.js` has been enabled!");
    }
}
module.exports = fun;
