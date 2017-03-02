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

var fun = function() {
    var self = this;
    self.onMsg = function(cmd,msg) {
        //TODO Commands
        if (cmd === "????") {
            //TODO Stuff
        }
    }

    //Don't touch these!
    self.load = function(database) {
        self.db = database;
        console.log("blackjack.js loaded");
    }
    self.loadPerms = function(msg) {
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
module.exports = fun;
