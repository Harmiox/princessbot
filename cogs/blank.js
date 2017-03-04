const db = require('sqlite');;
//Don't touch that!

//TODO Command Logs
function getCommands() {
    let commands = {
        "blackjack": {
			"description": "`!blackjack <//TODO>`",
		}
    }
    return commands;
}

//TODO Functions

var blank = function() {
    var self = this;
    self.onMsg = function(cmd,msg) {
        //TODO Commands
        if (cmd === "blank") {
            //TODO Stuff
        }
    }

    //Don't touch these!
    self.load = function(database) {
        self.db = database;
        console.log("blank.js loaded");
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
        msg.channel.sendMessage("`blank.js` has been enabled!");
    }
}
module.exports = blank;
