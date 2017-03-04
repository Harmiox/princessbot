function chestLevel(amount,guildJson) {
    let chestLevel = "`Error`"
    for (var chest in guildJson.chests) {
        if (guildJson.chests.hasOwnProperty(chest)) {
            if (amount >= (guildJson.gemDollarValue * guildJson.chests[chest])) {
                chestLevel = chest;
                continue;
            } else {
                break;
            }
        }
    }
    return chestLevel;
}
function getDefaultSettings() {
    settings = {
        "gemCreditsValue": 18182,
        "gemDollarValue": 110,
        "levels": {
            "1": {
                "xp": 500,
                "freechest": 0
            },
            "2": {
                "xp": 500,
                "freechest": 0
            },
            "3": {
                "xp": 500,
                "freechest": 0
            },
            "4": {
                "xp": 500,
                "freechest": 0
            },
            "5": {
                "xp": 500,
                "freechest": 0
            },
            "6": {
                "xp": 500,
                "freechest": 0
            },
            "7": {
                "xp": 500,
                "freechest": 0
            },
            "8": {
                "xp": 500,
                "freechest": 0
            },
            "9": {
                "xp": 500,
                "freechest": 0
            },
            "10": {
                "xp": 500,
                "freechest": 0
            },
            "11": {
                "xp": 500,
                "freechest": 0
            },
            "12": {
                "xp": 500,
                "freechest": 0
            },
            "13": {
                "xp": 500,
                "freechest": 0
            }
        },
        "chests": {
            "Wooden Chest": 0,
            "Silver Chest": 25,
            "Gold Chest": 50,
            "Giant Chest": 75,
            "Epic Chest": 100,
            "Super Magical Chest": 200,
            "Legendary Chest": 500
        }
    }
    return JSON.stringify(settings,null,"\t");
}
function getCommands() {
    let commands = {
		"chest": {
			"description": "`!chest` `!chest @user`"
		},
		"chest open": {
			"description": "`!chest open @user <amount>`"
		},
		"chest transfer": {
			"description": "`!chest transfer @user <amount>`"
		},
		"chest set": {
			"description": "`!chest set @user <amount>`"
		},
		"chest add": {
			"description": "`!chest add @user <amount>`"
		},
		"chest reset": {
			"description": "`!chest reser @user`"
		},
		"freechest": {
			"description": "`!freechest`"
		}
    }
    return commands;
}
var economy = function() {
    var self = this;
    self.getCmds = getCommands();
    self.onMsg = function(cmd,msg) {
        let guild = msg.guild.id;
        let args = msg.content.split(" ");
        var economyJson = null;
        econ.get(`SELECT * FROM settings WHERE guildId ='${msg.guild.id}'`).then(row => {
            if (!row) {
                econ.run('INSERT INTO settings (guildId, json) VALUES (?, ?)', [msg.guild.id, getDefaultSettings()]);
                economyJson = JSON.parse(row.json.toString());
            } else {
                economyJson = JSON.parse(row.json.toString());
            }
        });

        if (cmd === "chest") {
            let toSend = msg.mentions.users.first();
            if (toSend) {
                econ.get(`SELECT * FROM users WHERE userId ='${toSend.id}' AND guildId ='${msg.guild.id}'`).then(row => {
                    if (!row) {
                        msg.channel.sendMessage("That user doesn't have a chest.");
                    } else {
                      //econ.run(`UPDATE users SET gems = ${row.gems + 1} WHERE userId = ${msg.author.id}`);
                      msg.channel.sendMessage(`${toSend.username}'s ${chestLevel(row.gems,economyJson)} contains **${row.gems}** gems.`);
                    }
                  }).catch(() => {
                    console.error;
                    econ.run('CREATE TABLE IF NOT EXISTS users (guildId TEXT, userId TEXT, king INTEGER, xp INTEGER, chest TEXT, gems INTEGER)').then(() => {
                      msg.channel.sendMessage("That user doesn't have a chest.");
                    });
                });
                return;
            }
            econ.get(`SELECT * FROM users WHERE userId ='${msg.author.id}' AND guildId ='${msg.guild.id}'`).then(row => {
                if (!row) {
                    msg.channel.sendMessage(msg.author + " You don't own a chest, use `!chest open` to open a chest in order to start collecting gems.");
                } else {
                  //econ.run(`UPDATE users SET gems = ${row.gems + 1} WHERE userId = ${msg.author.id}`);
                  msg.channel.sendMessage(`${msg.author} Your ${chestLevel(row.gems,economyJson)} contains **${row.gems}** gems.`);
                }
              }).catch(() => {
                console.error;
                msg.channel.sendMessage(msg.author + " You don't own a chest, use `!chest open` to open a chest in order to start collecting gems.");
            });
        }
        if (cmd === "chest open") {
            econ.get(`SELECT * FROM users WHERE userId ='${msg.author.id}' AND guildId ='${msg.guild.id}'`).then(row => {
                if (!row) {
                  econ.run('INSERT INTO users (userId, gems, guildId, chest) VALUES (?, ?, ?, ?)', [msg.author.id, 0, msg.guild.id, "Wooden Chest"]);
                  msg.channel.sendMessage(msg.author + " You've opened a Wooden Chest! You can now collect gems from `!freechest`. The more gems you have in your chest, the bigger your chest gets!");
                } else {
                  //econ.run(`UPDATE users SET gems = ${row.gems + 1} WHERE userId = ${msg.author.id}`);
                  msg.channel.sendMessage("You already own a " + chestLevel(row.gems,economyJson) + "!");
                }
              }).catch(() => {
                console.error;
                econ.run('INSERT INTO users (userId, gems, guildId, chest) VALUES (?, ?, ?, ?)', [msg.author.id, 0, msg.guild.id, "Wooden Chest"]);
                msg.channel.sendMessage(msg.author + " You've opened a Wooden Chest! You can now collect gems from `!freechest`. The more gems you have in your chest, the bigger your chest gets!");
            });
        }
        if (cmd === "chest transfer") {
            econ.get(`SELECT * FROM users WHERE userId ='${msg.author.id}' AND guildId ='${msg.guild.id}'`).then(sender => {
                if (!sender) {
                    msg.channel.sendMessage(msg.author + " You don't own a chest, use `!chest open` to open a chest in order to start collecting gems.");
                } else {
                    let toSend = msg.mentions.users.first();
                    if (toSend) {
                        econ.get(`SELECT * FROM users WHERE userId ='${toSend.id}' AND guildId ='${msg.guild.id}'`).then(receiver => {
                            let amount = parseInt(msg.content.split(" ")[3]);
                            if (!amount) {
                                msg.channel.sendMessage(msg.author + " You must specify an amount to send. `!chest transfer @user <amount>`");
                                return;
                            }
                            if (amount <= 0) {
                                msg.channel.sendMessage(msg.author + " You must send more than 0 gems.");
                                return;
                            }
                            if (amount > sender.gems) {
                                msg.channel.sendMessage(msg.author + " You do not have enough gems in your chest.");
                                return;
                            }
                            econ.run(`UPDATE users SET gems = ${sender.gems - amount} WHERE userId = ${msg.author.id}`);
                            econ.run(`UPDATE users SET gems = ${receiver.gems + amount} WHERE userId = ${toSend.id}`);
                            msg.channel.sendMessage(msg.author + " the transfer of **" + amount + "** gems to " + toSend.username + " was successful");
                        }).catch(() => {
                            msg.channel.sendMessage(msg.author + " That user doesn't have a chest.");
                        });
                    } else {
                        msg.channel.sendMessage(msg.author + " Please specify a user to send gems to. `!chest transfer @user <amount>`");
                    }
                }
              }).catch(() => {
                console.error;
                msg.channel.sendMessage(msg.author + " You don't own a chest, use `!chest open` to open a chest in order to start collecting gems.");
            });
        }
        if (cmd === "chest set") {
            let toSend = msg.mentions.users.first();
            if (toSend) {
                econ.get(`SELECT * FROM users WHERE userId ='${toSend.id}' AND guildId ='${msg.guild.id}'`).then(receiver => {
                    let amount = parseInt(msg.content.split(" ")[3]);
                    if (!amount) {
                        msg.channel.sendMessage(msg.author + " You must specify an amount to send. `!chest set @user <amount>`");
                        return;
                    }
                    if (amount <= 0) {
                        msg.channel.sendMessage(msg.author + " You must send more than 0 gems.");
                        return;
                    }
                    econ.run(`UPDATE users SET gems = ${amount} WHERE userId = ${toSend.id}`);
                    msg.channel.sendMessage(msg.author + " the chest of " + toSend.username + " has been set to **" + amount + "** gems ");
                }).catch(() => {
                    msg.channel.sendMessage(msg.author + " That user doesn't have a chest.");
                });
            } else {
                msg.channel.sendMessage(msg.author + " Please specify a user to set their chest to. `!chest set @user <amount>`");
            }
        }
        if (cmd === "chest add") {
            let toSend = msg.mentions.users.first();
            if (toSend) {
                econ.get(`SELECT * FROM users WHERE userId ='${toSend.id}' AND guildId ='${msg.guild.id}'`).then(receiver => {
                    let amount = parseInt(msg.content.split(" ")[3]);
                    if (!amount) {
                        msg.channel.sendMessage(msg.author + " You must specify an amount to send. `!chest add @user <amount>`");
                        return;
                    }
                    if (amount <= 0) {
                        msg.channel.sendMessage(msg.author + " You must send more than 0 gems.");
                        return;
                    }
                    econ.run(`UPDATE users SET gems = ${receiver.gems + amount} WHERE userId = ${toSend.id}`);
                    msg.channel.sendMessage(msg.author + " **" + amount + "** gems have been added to " + toSend.username + "'s chest.");
                }).catch(() => {
                    msg.channel.sendMessage(msg.author + " That user doesn't have a chest.");
                });
            } else {
                msg.channel.sendMessage(msg.author + " Please specify a user to add to their chest. `!chest add @user <amount>`");
            }
        }
        if (cmd === "chest reset") {
            let toSend = msg.mentions.users.first();
            if (toSend) {
                econ.get(`SELECT * FROM users WHERE userId ='${toSend.id}' AND guildId ='${msg.guild.id}'`).then(receiver => {
                    msg.channel.sendMessage(msg.author + " Are you sure you would like to reset " + toSend.username + "'s chest? Say `yes` to continue.");
                    const filter = m => (m.content.match("yes") && m.author.id === msg.author.id);
                    msg.channel.awaitMessages(filter, {
                            max: 1,
                            time: 5000,
                            errors: ['time']
                        })
                        .then(function() {
                            econ.run(`UPDATE users SET gems = ${0} WHERE userId = ${toSend.id}`);
                            msg.channel.sendMessage(msg.author + " "+ toSend.username + "'s chest has been reset.")
                        })
                        .catch(function() {
                            msg.channel.sendMessage(msg.author + " you took too long to respond.");
                        });
                }).catch(() => {
                    msg.channel.sendMessage(msg.author + " That user doesn't have a chest.");
                });
            } else {
                msg.channel.sendMessage(msg.author + " Please specify a user to reset their chest. `!chest reset @user <amount>`");
            }
        }
        if (cmd === "freechest") {
            econ.get(`SELECT * FROM users WHERE userId ='${msg.author.id}' AND guildId ='${msg.guild.id}'`).then(row => {
                if (!row) {
                  msg.channel.sendMessage(msg.author + " You don't own a chest, use `!chest open` to open a chest in order to start collecting gems.");
                } else {
                    msg.channel.sendMessage(`**${1}** gems have been added to your ${chestLevel(row.gems,economyJson)}!`);
                    econ.run(`UPDATE users SET gems = ${row.gems + 1} WHERE userId = ${msg.author.id}`);
                }
              }).catch(() => {
                console.error;
                msg.channel.sendMessage(msg.author + " You don't own a chest, use `!chest open` to open a chest in order to start collecting gems.");
            });
        }
    };
};

module.exports = economy;
