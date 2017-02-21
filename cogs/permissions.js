let cogs = {};
var fs = require('fs');
function getPermissionsJson() {
    return JSON.parse(fs.readFileSync("./cogs/permissions.json").toString());
}
function cmdCheck(msg) {
    let permsJson = getPermissionsJson();
    let member = msg.member;
    let channel = msg.channel;
    //Find Command
    let command = "";
    for (var cmd in permsJson.commands) {
        if (msg.content.match(cmd)) {
            if (command.split(" ").length <= cmd.split(" ").length) {
                command = cmd;
            }
        }
    }
    if(!permsJson.commands[command]) {return false;}
    //Permissions
    if(permsJson.commands[command].users_denied[msg.author.id]) {
        msg.channel.sendMessage(msg.author + " you're banned from that command!");
        return false;
    }
    if(Object.keys(permsJson.commands[command].roles_allowed).length > 0) {
        for (var role in permsJson.commands[command].roles_allowed) {
            if (member.roles.has(role)) {
                return true;
            }
        }
        msg.channel.sendMessage(msg.author + " you don't have permissions to use that command!");
        return false;
    }
    if(permsJson.commands[command].channels_denied[msg.channel.id]){
        msg.channel.sendMessage(msg.author + " that command is not allowed here!");
        return false;
    }
    if (permsJson.cooldowns[command]) {
        //Cooldowns
        let oldDateObj = new Date();
        let newDateObj = new Date(oldDateObj.getTime() + permsJson.commands[command].cooldown*1000)
        if (!permsJson.cooldowns[command][msg.author.id]) {
            permsJson.cooldowns[command][msg.author.id] = newDateObj;
        } else {
            if (getTimeRemaining(permsJson.cooldowns[command][msg.author.id]).seconds > 0) {
                msg.channel.sendMessage(msg.author + " you can't do that for " + getTimeRemaining(permsJson.cooldowns[command][msg.author.id]).hours + " hours, " + getTimeRemaining(permsJson.cooldowns[command][msg.author.id]).minutes + " minutes, and " + getTimeRemaining(permsJson.cooldowns[command][msg.author.id]).seconds + " seconds.");
                return false;
            } else {
                permsJson.cooldowns[command][msg.author.id] = newDateObj;
            }
        }
        fs.writeFileSync("./cogs/permissions.json",JSON.stringify(permsJson,null,"\t"));
    }
    return true;
}
function editCooldown(msg,command,permsJson) {
    msg.channel.sendMessage(msg.author + " please give a cooldown in seconds. (60sec = 1min)");
    const filter = m => (m.author.id === msg.author.id);
    msg.channel.awaitMessages(filter, {
        max: 1,
        time: 21000,
        errors: ['time']
    })
    .then(function(colleted) {
        let seconds = parseInt(colleted.first().content);
        if (isNaN(seconds)) {seconds = 0;}
        if (seconds<0) {seconds = 0;}
        permsJson.commands[command].cooldown = seconds;
        if (seconds === 0) {
            if (!permsJson.cooldowns[command]){return;}
            delete permsJson.cooldowns[command]
        } else {
            permsJson.cooldowns[command] = {};
        }
        fs.writeFileSync("./cogs/permissions.json",JSON.stringify(permsJson,null,"\t"));
        msg.channel.sendMessage(msg.author + " the cooldown for `!" + command + "` has been set to **" + seconds + "** seconds.");
    })
    .catch(function() {
        msg.channel.sendMessage(msg.author + " you took too long to respond.");
    });
}
function editRoles(msg,command,permsJson) {
    msg.channel.sendMessage(msg.author + " in one message, seperated by spaces, give the roles you'd like ot allowaccesss to `" + command + "`\n**If any roles are set, than anyone without those roles will not be able to use this command.**");
    const filter = m => (m.author.id === msg.author.id);
    msg.channel.awaitMessages(filter, {
        max: 1,
        time: 21000,
        errors: ['time']
    })
    .then(function(colleted) {
        let m = colleted.first();
        let rolesArray = m.content.split(" ");  
        let message = "";
        for (var i=0; i<rolesArray.length; i+=1) {
            if (m.guild.roles.find(r => r.name === rolesArray[i])) {
                let role = m.guild.roles.find(r => r.name === rolesArray[i]);
                if (!permsJson.commands[command].roles_allowed[role.id]) {
                    permsJson.commands[command].roles_allowed[role.id] = role.name;
                    message += ("\nallowed: " + role.name);
                } else {
                    delete permsJson.commands[command].roles_allowed[role.id];
                    message += ("\nremoved: " + role.name);
                }
            } else {
                message += ("\nnot_found: `" + rolesArray[i] + "`");
            }
        }
        fs.writeFileSync("./cogs/permissions.json",JSON.stringify(permsJson,null,"\t"));
        msg.channel.sendMessage("`!" + command + "`" + message);
    })
    .catch(function() {
        msg.channel.sendMessage(msg.author + " you took too long to respond.");
    });
}
function editUsers(msg,command,permsJson) {
    msg.channel.sendMessage(msg.author + " in one message, mention the users you'd like to deny/allow access to `" + command + "`");
    const filter = m => (m.author.id === msg.author.id);
    msg.channel.awaitMessages(filter, {
        max: 1,
        time: 21000,
        errors: ['time']
    })
    .then(function(colleted) {
        let m = colleted.first();
        let message = ""
        m.mentions.users.forEach(user => {
            if (!permsJson.commands[command].users_denied[user.id]) {
                permsJson.commands[command].users_denied[user.id] = user.username;
                message += ("\ndenied: " + user.username);
            } else {
                delete permsJson.commands[command].users_denied[user.id];
                message += ("\nallowed: " + user.username);
            }
            
        });
        fs.writeFileSync("./cogs/permissions.json",JSON.stringify(permsJson,null,"\t"));
        msg.channel.sendMessage("`!" + command + "`" + message);
    })
    .catch(function() {
        msg.channel.sendMessage(msg.author + " you took too long to respond.");
    });
}
function editChannels(msg,command,permsJson) {
    msg.channel.sendMessage(msg.author + " in one message, mention the users you'd like to deny/allow access to `" + command + "`");
    const filter = m => (m.author.id === msg.author.id);
    msg.channel.awaitMessages(filter, {
        max: 1,
        time: 21000,
        errors: ['time']
    })
    .then(function(colleted) {
        let m = colleted.first();
        let message = "";
        m.mentions.channels.forEach(channel => {
            if (!permsJson.commands[command].channels_denied[channel.id]) {
                permsJson.commands[command].channels_denied[channel.id] = channel.name;
                message += ("\ndenied: " + channel.name);
            } else {
                delete permsJson.commands[command].channels_denied[channel.id];
                message += ("\nallowed: " + channel.name);
            }             
        });
        fs.writeFileSync("./cogs/permissions.json",JSON.stringify(permsJson,null,"\t"));
        msg.channel.sendMessage("`!" + command + "`" + message);
    })
    .catch(function() {
        msg.channel.sendMessage(msg.author + " you took too long to respond.");
    });
}
function editCommand(msg) {
    let permsJson = getPermissionsJson();
    for (var command in permsJson.commands) {
        if (command === msg.content.replace("*","")) {
            let cmd = command;
            msg.channel.sendMessage(msg.author + " Say which attribute you'd like to edit.\n`cooldown` `roles_allowed` `users_denied` `channels_denied`");
            const filter = m => (m.author.id === msg.author.id);
            msg.channel.awaitMessages(filter, {
                max: 1,
                time: 15000,
                errors: ['time']
            })
            .then(function(colleted) {
                let m = colleted.first();
                if (m.content === "cooldown") {
                    editCooldown(m,cmd,permsJson);
                } else if (m.content === "roles_allowed") {
                    editRoles(m,cmd,permsJson);
                } else if (m.content === "users_denied") {
                    editUsers(m,cmd,permsJson);
                } else if (m.content === "channels_denied") {
                    editChannels(m,cmd,permsJson);
                } else {
                    msg.channel.sendMessage(msg.author + " you specified an invalid property.");
                }
            })
            .catch(function() {
                msg.channel.sendMessage(msg.author + " you took too long to respond.");
            });
        }
    }
}
function cooldownOver() {
    return false;
}
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
var permissions = function() {
    var self = this;
    self.returnJson = getPermissionsJson();
    self.onReady = function(cogsFile){ 
        cogs = cogsFile;
        console.log("permissions.js loaded");
    }
    self.editCommand = function(msg) {
        let prefix = "!";
        if (msg.content.startsWith("*")) {
            editCommand(msg);
        }
    }
    self.onMsg = function(msg) {
        let prefix = "!";
    }
    self.loadPerms = function(json) {
        let permsJson = getPermissionsJson();
        for (var command in json.commands) {
            if (!permsJson.commands[command]) {
                permsJson.commands[command] = json.commands[command];
            }
        }
        fs.writeFileSync("./cogs/permissions.json",JSON.stringify(permsJson,null,"\t"));
    }
    self.reloadPerms = function(json) {
        let permsJson = getPermissionsJson();
        for (var command in json.commands) {
            permsJson.commands[command] = json.commands[command];
        }
        fs.writeFileSync("./cogs/permissions.json",JSON.stringify(permsJson,null,"\t"));
    }
    self.check = function(msg) {
        return cmdCheck(msg);
    }
    self.loadChannels = function(msg) {
    }
}

module.exports = permissions;