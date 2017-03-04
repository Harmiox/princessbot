const Discord = require("discord.js");
const db = require('sqlite');
function getCommands() {
    let commands = {
        "p":{
            "description": '`!p <attribute> <command1 "command2 arg ..." command3>;<args>`',
            "type": "cog"
        },
        "alias": {
            "description":"",
            "type": "cog"
        },
        "alias add": {
            "description":"",
            "type": "cog"
        },
        "alias del": {
            "description":"",
            "type": "cog"
        },
        "alias edit": {
            "description":"",
            "type": "cog"
        },
        "alias show": {
            "description":"",
            "type": "cog"
        },
        "addcom": {
            "description":"",
            "type": "cog"
        },
        "delcom": {
            "description":"",
            "type": "cog"
        },
        "editcom": {
            "description":"",
            "type": "cog"
        }
    }
    return commands;
}
function getDefaultSettings() {
    let settings = {};
    return settings;
}
function editCommand(msg) {
    db.all(`SELECT * FROM permissions WHERE guildId =?`,[msg.guild.id]).then(rows => {
        let split = msg.content.split(";");
        let action = split[0].split(" ")[1];
        let attribute = split[0].split(" ")[2];
        let setting = split[0].split(" ")[3]
        let commands = split[0].match(/[^\s"]+|"([^"]*)"/g).slice(4);
        let args = split[1];
        let argsSet = split[1];
        let actions = ["view","set","reset"];
        let attributes = ["description","sends","alias","cooldown","users","roles","channels"];
        let settings = ["allowed","denied"];
        //Check if a valid action was given
        if (actions.indexOf(action)<0) {
            msg.reply("Invalid Action: " + action);
            return;
        }
        //Check if a valid attribute was given
        if (attributes.indexOf(attribute)<0) {
            msg.reply("Invalid Attribute: " + attribute);
            return;
        }

        //Check if a setting is given
        if (settings.indexOf(setting)<0) {
            commands = split[0].match(/[^\s"]+|"([^"]*)"/g).slice(3);
        }
        //Get rid of quotes
        console.log("COMS: " + commands);
        for (let command in commands) {
            commands[command] = commands[command].replace(/"/g,"");

        }
        //Check if commands are valid, remove command if invalid
        let invalids = []
        for (let command in commands) {
            console.log("CHECKING COMMAND: " + commands[command])
            let found = false;
            let cog = false;
            for (let row in rows) {
                if (rows[row].command === commands[command]) {
                    found = true;
                    if (!msg.member.hasPermission("ADMINISTRATOR")){
                        if (rows[row].type === "cog") {
                            cog = true;
                        }
                    }
                }
            }
            if (cog === true) {
                msg.channel.sendMessage("`" + commands[command] + "`" + " is a cog command. You can't edit this.");
                invalids.push(commands[command]);
            }
            if (found === false) {
                msg.channel.sendMessage("`" + commands[command] + "`" + " is not a command!");
                invalids.push(commands[command]);
            }
        }
        for (let invalid in invalids) {
            commands.splice(commands.indexOf(invalids[invalid]),1);
        }
        //Check if commands were given
        if (settings.indexOf(setting)<0) {
            if (commands.length === 0) {
                msg.reply("No commands given.");
                return;
            }
        } else {
            if (commands.length === 0) {
                msg.reply("No commands given.");
                return;
            }
        }
        console.log("COMS: " + commands);
        //TODO View Settings
        if (action === "view") {
            const response = new Discord.RichEmbed();
            //response.setTitle(`\`${attribute}\` for \`${commands}\``)
            response.setColor(0x00AE86)
            for (let command in commands) {
                for (let row in rows) {
                    if (rows[row].command === commands[command]) {
                        if (attributes.indexOf(attribute)<4) {
                            response.addField(`__${commands[command]}__`, `${rows[row][attribute]}`, true);
                        } else {
                            let things = "";
                            if (rows[row][attribute] != null) {
                                let json = JSON.parse(rows[row][attribute].toString());
                                let toSend = "";
                                toSend += "`allowed`"
                                for (let allow in json.allowed) {
                                    if(attribute === "users") {
                                        if (isNaN(parseInt(allow))) {
                                            let username = allow.slice(0,allow.length-5);
                                            let disc = allow.slice(allow.length-4,allow.length);
                                            let foundUser = msg.guild.members.find(val => val.user.username === username && val.user.discriminator === disc);
                                            toSend += "\n" + foundUser;
                                        } else {
                                            let foundUser = msg.guild.members.find(val => val.user.id === allow);
                                            toSend += "\n" + foundUser;
                                        }
                                    }
                                    if(attribute === "roles") {
                                        if (isNaN(parseInt(allow))) {
                                            let foundRole = msg.guild.roles.find(val => val.name === allow);
                                            toSend += "\n" + foundRole;
                                        } else {
                                            let foundRole = msg.guild.roles.find(val => val.id === allow);
                                            toSend += "\n" + foundRole;
                                        }
                                    }
                                    if(attribute === "channels") {
                                        if (isNaN(parseInt(allow))) {
                                            let foundChannel = msg.guild.channels.find(val => val.name === allow);
                                            toSend += "\n" + foundChannel;
                                        } else {
                                            let foundChannel = msg.guild.channels.find(val => val.id === allow);
                                            toSend += "\n" + foundChannel;
                                        }
                                    }
                                }
                                toSend += "\n`denied`"
                                for (let deny in json.denied) {
                                    if(attribute === "users") {
                                        if (isNaN(parseInt(deny))) {
                                            let username = deny.slice(0,deny.length-5);
                                            let disc = deny.slice(deny.length-4,deny.length);
                                            let foundUser = msg.guild.members.find(val => val.user.username === username && val.user.discriminator === disc);
                                            toSend += "\n" + foundUser;
                                        } else {
                                            let foundUser = msg.guild.members.find(val => val.user.id === deny);
                                            toSend += "\n" + foundUser;
                                        }
                                    }
                                    if(attribute === "roles") {
                                        if (isNaN(parseInt(deny))) {
                                            let foundRole = msg.guild.roles.find(val => val.name === deny);
                                            toSend += "\n" + foundRole;
                                        } else {
                                            let foundRole = msg.guild.roles.find(val => val.id === deny);
                                            toSend += "\n" + foundRole;
                                        }
                                    }
                                    if(attribute === "channels") {
                                        if (isNaN(parseInt(deny))) {
                                            let foundChannel = msg.guild.channels.find(val => val.name === deny);
                                            toSend += "\n" + foundChannel;
                                        } else {
                                            let foundChannel = msg.guild.channels.find(val => val.id === deny);
                                            toSend += "\n" + foundChannel;
                                        }
                                    }
                                }
                                response.addField(`__${commands[command]}__`, `${toSend}`, true);
                            } else {
                                response.addField(`__${commands[command]}__`, `${rows[row][attribute]}`, true);
                            }
                        }
                    }
                }
            }
            msg.channel.sendEmbed(
              response,
              `**The ${attribute} for ${commands}**`,
              { disableEveryone: true }
            );
            return;
        }
        //Check if arguments were given
        if ((!args) && (action === "set")) {
            msg.reply("No arguments were given.");
            return;
        }
        //Edit The Command(s)
        for (let command in commands) {
            commands[command] = commands[command].replace(/'/g,"''");
        }
        //db.all(`SELECT * FROM permissions WHERE guildId =? AND command IN (?)`,[msg.guild.id,commands.join(',')]).then(rows => {
        console.log("commands: " + commands)
        db.all(`SELECT * FROM permissions WHERE guildId ='${msg.guild.id}' AND command IN ('${commands.join("','")}')`).then(rows => {
            if (settings.indexOf(setting)>=0 && actions.indexOf(action)<2) {
                args = args.match(/[^\s"]+|"([^"]*)"/g);
            }
            console.log("ROWS");
            for (row in rows) {
                console.log("ROW");
                cmd = rows[row].command;
                console.log("CMD: " + cmd)
                if (attributes.indexOf(attribute)<4) {
                    //"description","sends","alias","cooldown"
                    if (action === "reset") {
                        db.run(`UPDATE permissions SET '${attribute}' =NULL WHERE guildId =? AND command =?`,[msg.guild.id,cmd]).then(() => {
                            //msg.channel.sendMessage("`" + cmd + "`'s " + attribute + " attribute was reset.");
                        }).catch(() => {
                            msg.channel.sendMessage("`Error updating database: permissions`");
                        });
                        if (attribute ==="cooldown") {
                            db.get(`SELECT * FROM cooldowns WHERE guildId =? AND object =?`,[msg.guild.id,cmd]).then(row => {
                                let json = {}
                                if(!row) {
                                    db.run('INSERT INTO cooldowns (guildId, object, json) VALUES (?, ?, ?)', [msg.guild.id,cmd,JSON.stringify(json,null,"\t")]).then(() => {
                                        //success!
                                    }).catch(() => {
                                        msg.channel.sendMessage("`Error intserting into database: cooldowns.`");
                                    });
                                } else {
                                    db.run(`UPDATE cooldowns SET json =? WHERE guildId =? AND object =?`,[JSON.stringify(json,null,"\t"),msg.guild.id,cmd]).then(() => {
                                        //succeess!
                                    }).catch((err) => {
                                        msg.channel.sendMessage("`Error updating database: cooldowns.`");
                                    });
                                }
                            });
                        }
                    } else {
                        if (attribute === "cooldown") {
                            let seconds = parseInt(args);
                            if (isNaN(seconds)) {seconds = 0;}
                            if (seconds<0) {seconds = 0;}
                            console.log("COOLDOWN");
                            db.run(`UPDATE permissions SET '${attribute}' =? WHERE guildId =? AND command =?`,[seconds,msg.guild.id,cmd]).then(() => {
                                db.get(`SELECT * FROM cooldowns WHERE guildId =? AND object =?`,[msg.guild.id,cmd]).then(row => {
                                    let json = {}
                                    if(!row) {
                                        db.run('INSERT INTO cooldowns (guildId, object, json) VALUES (?, ?, ?)', [msg.guild.id,cmd,JSON.stringify(json,null,"\t")]).then(() => {
                                            //success!
                                        }).catch(() => {
                                            msg.channel.sendMessage("`Error intserting into database: cooldowns.`");
                                        });
                                    } else {
                                        db.run(`UPDATE cooldowns SET json =? WHERE guildId =? AND object =?`,[JSON.stringify(json,null,"\t"),msg.guild.id,cmd]).then(() => {
                                            //succeess!
                                        }).catch((err) => {
                                            msg.channel.sendMessage("`Error updating database: cooldowns.`");
                                        });
                                    }
                                });
                            }).catch(() => {
                                msg.channel.sendMessage("`Error is database: permissions.`");
                            });
                        } else {
                            db.run(`UPDATE permissions SET '${attribute}' =? WHERE guildId =? AND command =?`,[args,msg.guild.id,cmd]).then(() => {
                                //msg.channel.sendMessage("`" + cmd + "`'s " + attribute + " attribute has been set to: " + args);
                            }).catch(() => {
                                msg.channel.sendMessage("`Database error.`");
                            });
                        }
                    }
                } else {
                    if(settings.indexOf(setting)<0) {
                        msg.reply(" you didn't specify `allowed` or `denied`.");
                        return;
                    }
                    //"users","roles","channels"
                    let json = {
                        "allowed":{},
                        "denied":{}
                    };
                    if (rows[row][attribute] != null) {
                        json = JSON.parse(rows[row][attribute].toString());
                    }
                    if (setting === "allowed") {
                        json["allowed"] = {};
                        if (action === "reset") {
                            //msg.reply(` Allowed ${attribute} for ${cmd} has been reset.`);
                        } else {
                            for (let arg in args) {
                                args[arg] = args[arg].replace(/"|<@&|<!@|<@!|<@|<&|<#|>/g,"");
                                json["allowed"][args[arg]] = attribute;
                            }
                        }
                    } else if (setting === "denied") {
                        json["denied"] = {};
                        if (action === "reset") {
                            //msg.reply(` Denied ${attribute} for ${cmd} has been reset.`);
                        } else {
                            for (let arg in args) {
                                args[arg] = args[arg].replace(/"|<@&|<!@|<@!|<@|<&|<#|>/g,"");
                                json["denied"][args[arg]] = attribute;
                            }
                        }
                    }
                    console.log("ROLESSS");
                    db.run(`UPDATE permissions SET '${attribute}' =? WHERE guildId =? AND command =?`,[JSON.stringify(json,null,"\t"),msg.guild.id,cmd]).then(() => {
                        // :D
                        msg.reply("yup");
                    }).catch((err) => {
                        console.log(err)
                        // D:
                        msg.channel.sendMessage("`Database error.`");
                    });
                }
            }
            if (action === "set") {
                if (settings.indexOf(setting)<0) {
                    msg.channel.sendMessage(`The \`${attribute}\` for command(s) \`${commands}\` has been set to **${argsSet}**`);
                } else {
                    msg.channel.sendMessage(`The \`${setting}\` \`${attribute}\` for command(s) \`${commands}\` has been set to **${argsSet}**`);
                }
            } else {
                if (settings.indexOf(setting)<0) {
                    msg.channel.sendMessage(`The \`${attribute}\` for command(s) \`${commands}\` has been **reset**.`);
                } else {
                    msg.channel.sendMessage(`The \`${setting}\` \`${attribute}\` for command(s) \`${commands}\` has been **reset**.`);
                }
            }
        });
    });
}
var permissions = function() {
    var self = this;
    self.onMsg = function(cmd,msg) {
        if (cmd === "p") {
            editCommand(msg);
        }
        if(cmd === "alias") {
            console.log("alias?");
            command = msg.content.split(" ").slice(1).join(" ");
            db.get(`SELECT * FROM permissions WHERE guildId =? AND command =?`,[msg.guild.id, command]).then(row => {
                if (!row) {
                    msg.reply(`the alias **${command}** does not exist.`);
                    return;
                }
                if (row.alias != null) {
                    msg.reply(`**${command}** is an alias for **${row.alias}**.`);
                } else {
                    msg.reply(`**${command}** is not an alias for anything.`);
                }
            });
        }
        if(cmd === "alias add") {
            let args = msg.content.match(/[^\s"]+|"([^"]*)"/g);
            for (let arg in args) {
                args[arg] = args[arg].replace(/"/g,"");
            }
            let alias = args[2];
            let command = args[3]
            db.get(`SELECT * FROM permissions WHERE guildId =? AND command =?`,[msg.guild.id, alias]).then(row => {
                if (!row) {
                    db.run('INSERT INTO permissions (guildId, command, alias, type) VALUES (?, ?, ?, ?)', [msg.guild.id,alias,command,"alias"]).then(() => {
                        msg.reply(`Added **${alias}** as an alias for **${command}**, say \`undo\` if this is not correct.`)
                    });
                    const filter = m => (m.content.match("undo") && m.author.id === msg.author.id);
                    msg.channel.awaitMessages(filter, {
                            max: 1,
                            time: 30000,
                            errors: ['time']
                        })
                        .then(function() {
                            db.run(`DELETE FROM permissions WHERE guildId =? AND command =? AND alias =?`,[msg.guild.id, alias, command]).then(() => {
                                msg.reply("undo successful.");
                            });
                        }).catch(() => {});
                } else {
                    msg.reply(`the alias **${alias}** already exists.`)
                }
            });
        }
        if(cmd === "alias del") {
            let alias = msg.content.split(" ").slice(2).join(" ");
            db.get(`SELECT * FROM permissions WHERE guildId =? AND command =?`,[msg.guild.id, alias]).then(row => {
                if (!row) {
                    msg.reply(`**${alias}** does not exist.`);
                } else {
                    if (row.type != "cog") {
                        let delRow = row;
                        db.run(`DELETE FROM permissions WHERE guildId =? AND command =?`,[msg.guild.id, alias]).then(() => {
                            msg.reply(`Deleted the alias **${alias}**, say \`undo\` if this is not correct.`)
                            const filter = m => (m.content.match("undo") && m.author.id === msg.author.id);
                            msg.channel.awaitMessages(filter, {
                                    max: 1,
                                    time: 30000,
                                    errors: ['time']
                                })
                                .then(function() {
                                    db.run('INSERT INTO permissions (guildId, command, description, type, sends, alias, cooldown, users, roles, channels) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [delRow.guildId, delRow.command, delRow.description, delRow.type, delRow.sends, delRow.alias, delRow.cooldown, delRow.users, delRow.roles, delRow.channels]).then(() => {
                                        msg.reply(`Added back **${alias}** as an alias for **${command}**.`)
                                    });
                                }).catch(() => {});
                        });
                    } else {
                        msg.reply("you can't edit cog commands.");
                    }
                }
            });
        }
        if(cmd === "alias show") {
            let alias = msg.content.split(" ").slice(2).join(" ");
            db.get(`SELECT * FROM permissions WHERE guildId =? AND command =?`,[msg.guild.id, alias]).then(row => {
                if (!row) {
                    msg.reply(`the alias **${alias}** does not exist.`);
                } else {
                    let response = "```\n";
                    response += row.alias;
                    response += "\n```";
                    msg.reply(`the command for **${alias}** is\n${response}`);
                }
            });
        }
        if(cmd === "addcom") {
            let args = msg.content.match(/[^\s"]+|"([^"]*)"/g);
            for (let arg in args) {
                args[arg] = args[arg].replace(/"/g,"");
            }
            let command = args[1];
            if (!command) {
                msg.reply("no command was given.");
                return;
            }
            console.log("COMMAND: " + command)
            let sends = msg.content.slice((msg.content.indexOf(command)+command.length+1),msg.content.length);
            console.log("SENDS: " + sends)
            if (sends === "") {
                msg.reply("you didn't give anything for the command.");
                return;
            }
            db.get(`SELECT * FROM permissions WHERE guildId =? AND command =?`,[msg.guild.id, command]).then(row => {
                if (!row) {
                    console.log("command: " + command)
                    console.log("sends: " + sends)
                    db.run('INSERT INTO permissions (guildId, command, sends, type) VALUES (?, ?, ?, ?)', [msg.guild.id,command,sends,"command"]).then(() => {
                        msg.reply(`Added **${command}** as an command, say \`undo\` if this is not correct.`)
                    });
                    const filter = m => (m.content.match("undo") && m.author.id === msg.author.id);
                    msg.channel.awaitMessages(filter, {
                            max: 1,
                            time: 30000,
                            errors: ['time']
                        })
                        .then(function() {
                            db.run(`DELETE FROM permissions WHERE guildId =? AND command =?`,[msg.guild.id, command]).then(() => {
                                msg.channel.sendMessage(`**${command}** was deleted.`);
                            });
                        }).catch(() => {});
                } else {
                    msg.reply(`the command **${command}** already exists.`)
                }
            });
        }
        if(cmd === "delcom") {
            let command = msg.content.split(" ").slice(1).join(" ");
            if (command === "") {
                msg.reply("no command was given.");
                return;
            }
            db.get(`SELECT * FROM permissions WHERE guildId =? AND command =?`,[msg.guild.id, command]).then(row => {
                if (!row) {
                    msg.reply(`the command **${command}** does not exist.`);
                } else {
                    if (row.type != "cog") {
                        let delRow = row;
                        db.run(`DELETE FROM permissions WHERE guildId =? AND command =?`,[msg.guild.id, command]).then(() => {
                            msg.reply(`Deleted the command **${command}**, say \`undo\` if this is not correct.`)
                            const filter = m => (m.content.match("undo") && m.author.id === msg.author.id);
                            msg.channel.awaitMessages(filter, {
                                    max: 1,
                                    time: 30000,
                                    errors: ['time']
                                })
                                .then(function() {
                                    db.run('INSERT INTO permissions (guildId, command, description, type, sends, alias, cooldown, users, roles, channels) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [delRow.guildId, delRow.command, delRow.description, delRow.type, delRow.sends, delRow.alias, delRow.cooldown, delRow.users, delRow.roles, delRow.channels]).then(() => {
                                        msg.channel.sendMessage(`**${command}** was added back.`);
                                    });
                                }).catch(() => {});
                        });
                    } else {
                        msg.reply("you can't edit cog commands.");
                    }
                }
            });
        }
        if(cmd === "editcom") {
            let args = msg.content.match(/[^\s"]+|"([^"]*)"/g);
            for (let arg in args) {
                args[arg] = args[arg].replace(/"/g,"");
            }
            let command = args[1];
            let sends = msg.content.slice((msg.content.indexOf(command)+command.length+1),msg.content.length)
            db.get(`SELECT * FROM permissions WHERE guildId =? AND command =?`,[msg.guild.id, command]).then(row => {
                if (!row) {
                    msg.reply(`the command **${command}** does not exist!`);
                } else {
                    let oldSends = row.sends;
                    db.run(`UPDATE permissions SET sends =? WHERE guildId =? AND command =?`,[sends,msg.guild.id, command]).then(() => {
                        msg.reply(`The command for **${command}** was successfully edited. say \`undo\` if you wish to undo the edit.`);
                        const filter = m => (m.content.match("undo") && m.author.id === msg.author.id);
                        msg.channel.awaitMessages(filter, {
                                max: 1,
                                time: 30000,
                                errors: ['time']
                            })
                            .then(function() {
                                db.run(`UPDATE permissions SET sends =? WHERE guildId =? AND command =?`,[oldSends,msg.guild.id, command]).then(() => {
                                    msg.channel.sendMessage(`**${command}** was changed back.`);
                                }).catch(() => {});
                            });
                    });
                }
            });
        }
    }
    self.load = function(database) {
        self.db = database;
        console.log("permissions.js loaded");
    }
    self.loadPerms = function(msg) {
        let commands = getCommands();
        for (let command in commands) {
            let cmd = commands[command];
            db.get(`SELECT * FROM permissions WHERE guildId =? AND command =?`,[msg.guild.id, command]).then(row => {
                if (!row) {
                    db.run('INSERT INTO permissions (guildId, command, description, type, sends, alias, cooldown, roles, users, channels) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [msg.guild.id, command, cmd.description, cmd.type, cmd.sends, cmd.alias, cmd.cooldown, cmd.roles, cmd.users, cmd.channels]).then(() => {
                    });
                }
            });
        }
        msg.channel.sendMessage("`permissions.js` has been enabled!");
    }
}

module.exports = permissions;
