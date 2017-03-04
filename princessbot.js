const Discord = require("discord.js");
const discordBot = new Discord.Client({
    disableEveryone: true,
    messageCacheMaxSize: 1000,
    messageCacheLifetime: 300,
    messageSweepInterval: 60
});
//Princess
//discordBot.login("MjY5MzI0OTk3NjkxMDQ3OTM2.C4HFPw.jHXClYZhSgBhZGoPegWtzw548_w");
//BOT
discordBot.login("Mjg0MTE5MTY3NjA5ODY0MTky.C4_ACQ.VJEd70TVo2oa34O2J-PEvLdRl-M");

const Cogs = require("./cogs/index.js");
const cogs = new Cogs();
const db = require('sqlite');

var clever_bot = require("cleverbot.io"),
cleverBot = new clever_bot("HpazOSZiRHuxnZpv", "ntsnNHMlZxkYmrAP1e20wXOAI3nOV2xv");

discordBot.on('ready', () => {
    cogs.load();
});

discordBot.on('guildCreate', guild => {
    cogs.add(guild);
});
function getTimeRemaining(endtime) {
    var t = Date.parse(endtime) - Date.parse(new Date());
    var seconds = Math.floor((t / 1000) % 60);
    var minutes = Math.floor((t / 1000 / 60) % 60);
    var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    var days = Math.floor(t / (1000 * 60 * 60 * 24));
    return {
        'total': t,
        'days': days,
        'hours': hours,
        'minutes': minutes,
        'seconds': seconds
    };
}
function cmdCheck(msg) {
    db.all(`SELECT * FROM permissions WHERE guildId ='${msg.guild.id}'`).then(rows => {
        console.log("checking msg: " + msg);
        var returnMsg = msg;
        var command = "";
        let member = msg.member;
        let channel = msg.channel;
        if (!rows) {
            return null;
        }
        for (var row in rows) {
            if (msg.content.match("!" + rows[row].command)) {
                console.log("found: " + rows[row].command);
                if (command.length <= rows[row].command.length) {
                    command = rows[row].command;
                }
            }
        }
        if(command == "") {
            console.log("not found");
            return null;
        }
        if (!(msg.content.startsWith("!" + command + " ") || msg.content === ("!" + command))) {
            return;
        }
        console.log("command: " + command);
        db.get(`SELECT * FROM permissions WHERE guildId =? AND command =?`,[msg.guild.id, command]).then(row => {
            if (!row) {
                msg.reply("invalid command");
                return null;
            }
            console.log("checking command");
            if (row.alias != null) {
                returnMsg.content = ("!" + row.alias + returnMsg.content.replace(command,"").replace("!",""));
                console.log("alias: " + returnMsg.content);
                if(cmdCheck(returnMsg)===null){return;}
            }
            if (row.users != null) {
                console.log("users");
                let json = JSON.parse(row.users.toString());
                if (Object.keys(json.allowed).length > 0) {
                    for (user in json.allowed) {
                        if (isNaN(parseInt(user))) {
                            console.log("Not a user ID, getting ID!");
                            let username = user.slice(0,user.length-5);
                            console.log("username: " + username);
                            let disc = user.slice(user.length-4,user.length);
                            console.log("disc: " + disc);
                            let foundUser = msg.guild.members.find(val => val.user.username === username && val.user.discriminator === disc);
                            delete json[user];
                            json.allowed[foundUser.id] = "foundUser";
                        }
                    }
                    if(!json.allowed.hasOwnProperty(msg.author.id)) {
                        msg.reply("You're not allowed you that command!");
                        return null;
                    }
                } else if(Object.keys(json.denied).length > 0) {
                    for (user in json.denied) {
                        if (isNaN(parseInt(user))) {
                            console.log("Not a user ID, getting ID!");
                            let username = user.slice(0,user.length-5);
                            console.log("username: " + username);
                            let disc = user.slice(user.length-4,user.length);
                            console.log("disc: " + disc);
                            let foundUser = msg.guild.members.find(val => val.user.username === username && val.user.discriminator === disc);
                            delete json[user];
                            json.denied[foundUser.id] = "foundUser";
                        }
                    }
                    if(json.denied.hasOwnProperty(msg.author.id)) {
                        msg.reply("You're not allowed you that command!");
                        return null;
                    }
                }
            }
            if (row.roles != null) {
                console.log("roles");
                let json = JSON.parse(row.roles.toString());
                if (Object.keys(json.allowed).length > 0) {
                    for (role in json.allowed) {
                        if (isNaN(parseInt(role))) {
                            console.log("Not a role ID, getting ID!");
                            let foundRole = msg.guild.roles.find(val => val.name === role);
                            console.log("FoundRole: " + foundRole.name);
                            delete json[role];
                            json.allowed[foundRole.id] = "foundRole";
                        }
                    }
                    let found = false;
                    for (const memberRole of msg.member.roles.values()) {
                        console.log("id: " + memberRole.id);
                        if(json.allowed.hasOwnProperty(memberRole.id)) {
                            found = true;
                        }
                    }
                    if (found === false) {
                        msg.reply("You lack roles to use that command!");
                        return null;
                    }
                } else if(Object.keys(json.denied).length > 0) {
                    for (role in json.denied) {
                        if (isNaN(parseInt(role))) {
                            console.log("Not a role ID, getting ID!");
                            let foundRole = msg.guild.roles.find(val => val.name === role);
                            delete json[role];
                            json.denied[foundRole.id] = "foundRole";
                        }
                    }
                    let found = false;
                    for (const memberRole of msg.member.roles.values()) {
                        if(json.denied.hasOwnProperty(memberRole.id)) {
                            found = true;
                        }
                    }
                    if (found === false) {
                        msg.reply("Your roles don't allow you to use that command!");
                        return null;
                    }
                }
            }
            if (row.channels != null) {
                console.log("channels");
                let json = JSON.parse(row.channels.toString());
                if (Object.keys(json.allowed).length > 0) {
                    for (channel in json.allowed) {
                        if (isNaN(parseInt(channel))) {
                            console.log("Not a channel ID, getting ID!");
                            let foundChannel = msg.guild.channels.find(val => val.name === channel);
                            console.log("foundChannel: " + foundChannel.id);
                            delete json[channel];
                            json.allowed[foundChannel.id] = "foundChannel";
                        }
                    }
                    if(!json.allowed.hasOwnProperty(msg.channel.id)) {
                        msg.reply("That command is not allowed in this channel.");
                        return null;
                    }
                } else if(Object.keys(json.denied).length > 0) {
                    for (channel in json.denied) {
                        if (isNaN(parseInt(channel))) {
                            console.log("Not a channel ID, getting ID!");
                            let foundChannel = msg.guild.channels.find(val => val.name === channel);
                            console.log("foundChannel: " + foundChannel.id);
                            delete json[channel];
                            json.denied[foundChannel.id] = "foundChannel";
                        }
                    }
                    if(json.denied.hasOwnProperty(msg.channel.id)) {
                        msg.reply("That command is not allowed in this channel.");
                        return null;
                    }
                }
            }
            console.log("cooldown");
            let oldDateObj = new Date();
            let newDateObj = new Date(oldDateObj.getTime() + row.cooldown*1000);
            db.get(`SELECT * FROM cooldowns WHERE guildId =? AND object =?`,[msg.guild.id, command]).then(row2 => {
                if (!row2) {
                    console.log("continue");
                } else {
                    let json = {};
                    if (row2.json != null) {
                        json = JSON.parse(row2.json.toString());
                    }
                    if (!json[msg.author.id]) {
                        json[msg.author.id] = newDateObj;
                    } else {
                        if (getTimeRemaining(json[msg.author.id]).seconds > 0) {
                            msg.channel.sendMessage(msg.author + " you can't do that for " + getTimeRemaining(json[msg.author.id]).hours + " hours, " + getTimeRemaining(json[msg.author.id]).minutes + " minutes, and " + getTimeRemaining(json[msg.author.id]).seconds + " seconds.");
                            return;
                        } else {
                            json[msg.author.id] = newDateObj;
                        }
                    }
                    db.run(`UPDATE cooldowns SET json =? WHERE guildId =? AND object =?`,[JSON.stringify(json,null,"\t"),msg.guild.id, command]);
                }
                //TODO Move up above alias?
                if (row.sends != null) {
                    msg.channel.sendMessage(row.sends);
                    return null;
                }
                let toCogs = new Array(2)
                toCogs[0] = command;
                toCogs[1] = returnMsg;
                console.log("toCogs[]: " + toCogs[0]  + ", " + toCogs[1]);
                for (var cog in cogs.loaded) {
                    console.log("sending to: " + cog);
                    cogs.loaded[cog].onMsg(toCogs[0],toCogs[1]);
                }

            }).catch((err) => {
                console.log(err);
            });
        }).catch((err) => {
            console.log(err);
        });
    }).catch((err) => {
        console.log(err);
    });
}

discordBot.on("message", msg => {
    let prefix = "!";
    if (msg.channel.type === 'dm') return;

    let inGuild = msg.guild.id;
    if(msg.author.id != discordBot.user.id) {
        /********* CleverBot *********/
        //PrincessBot - Cleverbot
        if ((msg.content.startsWith("<@") || msg.content.startsWith("<@!")) && msg.isMentioned(discordBot.user.id)) {
            let message = msg.content.split(" ").slice(1).join(" ");
            cleverBot.setNick("princessbot")
            cleverBot.create(function(err, session) {
                // session is your session name, it will either be as you set it previously, or cleverbot.io will generate one for you
                // Woo, you initialized cleverbot.io. Insert further code here
                cleverBot.ask(message, function(err, response) {
                    if (err === true) {
                        console.log("error", "Response was null" + response);
                        msg.channel.sendMessage("`Error: " + err + "`");
                    } else {
                        msg.channel.sendMessage("`" + response + "`");
                    }
                });
            });
        }
        /********* /CleverBot *********/
        if (msg.content.startsWith(prefix + "cog")) {
            if(!msg.member.hasPermission("ADMINISTRATOR")){msg.channel.sendMessage("You lack the `ADMINISTRATOR` permission!");return;}
            let args = msg.content.split(" ").slice(1);
            if (!args[0]) {
                msg.channel.sendMessage("`!cog <enable|disable|list>`");
            }
            if (args[0] === "import") {
                if (!args[1] || !args[1].endsWith(".js")) {
                    msg.channel.sendMessage("`!cog import <cog.js>`");
                    return;
                }
                cogs.import(args[1],msg);
            } else if (args[0] === "unimport") {
                if (!args[1] || !args[1].endsWith(".js")) {
                    msg.channel.sendMessage("`!cog unimport <cog.js>`");
                    return;
                }
                cogs.unimport(args[1],msg);
            } else if (args[0] === "enable") {
                if (!args[1] || !args[1].endsWith(".js")) {
                    msg.channel.sendMessage("`!cog enable <cog.js>`");
                    return;
                }
                cogs.enable(args[1],msg);
            } else if (args[0] === "disable") {
                if (!args[1] || !args[1].endsWith(".js")) {
                    msg.channel.sendMessage("`!cog disable <cog.js>`");
                    return;
                }
                cogs.disable(args[1],msg);
            } else if (args[0] === "list") {
                cogs.list(args[1],msg);
            }
        }
        //Commands & Permissions
        if (!msg.content.startsWith(prefix) || msg.author.id === discordBot.user.id){return;}
        cmdCheck(msg);
    }

});
