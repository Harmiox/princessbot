let cogs = {}

//Global Functions
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getEconomyJson() {
    fs = require('fs');
    let economyJson = JSON.parse(fs.readFileSync("./cogs/economy.json").toString());
    return economyJson;
}

function userRarity(user) {
    //TODO
}

function chestLevel(amount) {
    let economyJson = getEconomyJson();
    let chestLevel = "`Error`"
    for (var chest in economyJson.chests) {
        if (economyJson.chests.hasOwnProperty(chest)) {
            if (amount >= (economyJson.gemDollarValue * economyJson.chests[chest])) {
                chestLevel = chest;
                continue;
            } else {
                break;
            }
        }
    }
    return chestLevel;
}
var tradeInProgress = false;
var cooldowns = new Map();

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
var economy = function() {
    var self = this;
    self.returnJson = getEconomyJson();
    self.onReady = function(cogsFile) { 
        cogs = cogsFile;
        cogs.loaded["permissions"].loadPerms(getEconomyJson());
        console.log("economy.js loaded");
    }
    self.onMsg = function(msg) {
        let prefix = "!";
        if (msg.content.startsWith(prefix + "chest")) {
            let economyJson = getEconomyJson();
            let args = msg.content.split(" ");
            if (args.length == 1) {
                if (!economyJson.vaults[msg.author.id]) {
                    msg.channel.sendMessage(msg.author + " you don't own a chest, use `!chest open` to open a chest!");
                    return;
                }
                msg.channel.sendMessage(msg.author + " your " + chestLevel(economyJson.vaults[msg.author.id].amount) + " currently holds **" + numberWithCommas(economyJson.vaults[msg.author.id].amount) + "** gems.");
            }
            if (args.length >= 2) {
                if (args[1] === "open") {
                    if (economyJson.vaults[msg.author.id]) {
                        msg.channel.sendMessage(msg.author + " you already own a chest!");
                        return;
                    }
                    economyJson.vaults[msg.author.id] = {
                        "amount": 0
                    };
                    cogs.writeFile("./cogs/economy.json", JSON.stringify(economyJson, null, "\t"));
                    msg.channel.sendMessage(msg.author + " you've successfully opened up a chest!");
                } else if (args[1] === "transfer") {
                    if (args.length === 4) {
                        if (!args[2].startsWith("<@")) {
                            msg.channel.sendMessage(msg.author + " Example: `!chest transfer @user 10000`");
                            return;
                        }
                        let toSend = msg.mentions.users.first();
                        if (!toSend) {
                            msg.channel.sendMessage(msg.author + " Example: `!chest transfer @user 10000`");
                            return;
                        }
                        if (!economyJson.vaults[msg.author.id]) {
                            msg.channel.sendMessage(msg.author + " you don't own a chest, use `!chest open` to open a chest!");
                            return;
                        }
                        if (!economyJson.vaults[toSend.id]) {
                            msg.channel.sendMessage(msg.author + " that user does not own a chest!");
                            return;
                        }
                        if (parseInt(args[3]) > economyJson.vaults[msg.author.id].amount) {
                            msg.channel.sendMessage(msg.author + " you don't have that amount of gems in your chest!");
                            return;
                        }
                        if (parseInt(args[3]) <= 0) {
                            msg.channel.sendMessage(msg.author + " you must transfer at least **1** gem.");
                            return;
                        }
                        economyJson.vaults[msg.author.id].amount -= parseInt(args[3]);
                        economyJson.vaults[toSend.id].amount += parseInt(args[3]);
                        cogs.writeFile("./cogs/economy.json", JSON.stringify(economyJson, null, "\t"));
                        msg.channel.sendMessage(msg.author + " the transfer of **" + parseInt(args[3]) + "** gems to " + toSend.username + " was successful");
                    } else {
                        msg.channel.sendMessage("Invalid Use `!chest transfer @user <amount>`");
                    }
                } else if (args[1].startsWith("<@") || args[1].startsWith("<@!")) {
                    let toSend = msg.mentions.users.first();
                    if (!toSend) {
                        msg.channel.sendMessage(msg.author + " Example: `!chest @user`");
                        return;
                    }
                    if (!economyJson.vaults[toSend.id]) {
                        msg.channel.sendMessage(msg.author + " that user does not own a chest!");
                        return;
                    }
                    msg.channel.sendMessage(toSend.username + "'s " + chestLevel(economyJson.vaults[toSend.id].amount) + " currently holds **" + numberWithCommas(economyJson.vaults[toSend.id].amount) + "** gems.");
                } else if (args[1] === "set") {
                    //TODO - Role Permissions
                    if (args.length === 4) {
                        if (!args[2].startsWith("<@")) {
                            msg.channel.sendMessage(msg.author + " **User Not Given**, Ex: `!chest set @user 10000`");
                            return;
                        }
                        let toSend = msg.mentions.users.first();
                        if (!toSend) {
                            msg.channel.sendMessage(msg.author + " **Invalid User**, Ex: `!chest set @user 10000`");
                            return;
                        }
                        if (!economyJson.vaults[toSend.id]) {
                            msg.channel.sendMessage(msg.author + " that user does not own a chest!");
                            return;
                        }
                        if (parseInt(args[3]) <= -1) {
                            msg.channel.sendMessage(msg.author + " you must set the chest to at least **0** gems.");
                            return;
                        }
                        economyJson.vaults[toSend.id].amount = parseInt(args[3]);
                        cogs.writeFile("./cogs/economy.json", JSON.stringify(economyJson, null, "\t"));
                        msg.channel.sendMessage(toSend.username + "'s " + chestLevel(economyJson.vaults[toSend.id].amount) + " has been set to **" + parseInt(args[3]) + "** gems.");
                    } else {
                        msg.channel.sendMessage("Invalid Use `!chest set @user <amount>`");
                    }
                } else if (args[1] === "add") {
                    //TODO - Role Permissions
                    if (args.length === 4) {
                        if (!args[2].startsWith("<@")) {
                            msg.channel.sendMessage(msg.author + " Example: `!chest set @user 10000`");
                            return;
                        }
                        let toSend = msg.mentions.users.first();
                        if (!toSend) {
                            msg.channel.sendMessage(msg.author + " Example: `!chest set @user 10000`");
                            return;
                        }
                        if (!economyJson.vaults[toSend.id]) {
                            msg.channel.sendMessage(msg.author + " that user does not own a chest!");
                            return;
                        }
                        if (parseInt(args[3]) <= -1) {
                            msg.channel.sendMessage(msg.author + " you must set the chest to at least **0** gems.");
                            return;
                        }
                        economyJson.vaults[toSend.id].amount += parseInt(args[3]);
                        cogs.writeFile("./cogs/economy.json", JSON.stringify(economyJson, null, "\t"));
                        msg.channel.sendMessage("**" + parseInt(args[3]) + "** gems have been added to " + toSend.username + "'s " + chestLevel(economyJson.vaults[toSend.id].amount));
                    } else {
                        msg.channel.sendMessage("Invalid Use `!chest set <@user> <amount>`");
                    }
                } else if (args[1] === "delete") {
                    //TODO - Role Permissions
                    if (args.length === 3) {
                        if (!args[2].startsWith("<@")) {
                            msg.channel.sendMessage(msg.author + " Example: `!chest delete @user`");
                            return;
                        }
                        let toSend = msg.mentions.users.first();
                        if (!toSend) {
                            msg.channel.sendMessage(msg.author + " Example: `!chest delete @user`");
                            return;
                        }
                        if (!economyJson.vaults[toSend.id]) {
                            msg.channel.sendMessage(msg.author + " that user does not own a chest!");
                            return;
                        }
                        msg.channel.sendMessage(msg.author + " are you sure you'd like to delete **" + toSend.username + "'s** chest? Say `yes` to continue.");
                        const filter = m => (m.content.match("yes") && m.author.id === msg.author.id);
                        msg.channel.awaitMessages(filter, {
                                max: 1,
                                time: 5000,
                                errors: ['time']
                            })
                            .then(function() {
                                delete economyJson.vaults[toSend.id];
                                cogs.writeFile("./cogs/economy.json", JSON.stringify(economyJson, null, "\t"));
                                msg.channel.sendMessage("**" + toSend.username + "'s** chest has been deleted. **R.I.P.**");
                            })
                            .catch(function() {
                                msg.channel.sendMessage(msg.author + " you took too long to respond.");
                            });

                    } else {
                        msg.channel.sendMessage("Invalid Use, Ex: `!chest delete <@user>`");
                    }
                } else if (args[1] === "help") {
                    //TODO - Help
                } else {
                    msg.channel.sendMessage("Invalid Use");
                }
            }
        }
        /*if (msg.content.startsWith(prefix + "gems")) {
            if (tradeInProgress === true) {
                msg.channel.sendMessage(msg.author + " someone is currently buying gems.");
                return;
            }
            let economyJson = getEconomyJson();
            let args = msg.content.split(" ");
            if (args.length < 2) {
                msg.channel.sendMessage("**Buy Gems:** `!gems <amountOfGems>`");
                return;
            }
            if (!economyJson.vaults[msg.author.id]) {
                msg.channel.sendMessage(msg.author + " you don't own a chest, use `!chest open` to open a chest!");
                return;
            }
            if (parseInt(args[1]) <= 0) {
                msg.channel.sendMessage("**Invalid Use** `<amountOfGems>` must be a value greater than 0.");
                return;
            }
            tradeInProgress = true;
            let gems = parseInt(args[1]);
            let credits = parseInt(gems * economyJson.gemCreditsValue);
            msg.channel.sendMessage(msg.author + " are you sure you'd like to trade **" + credits + "** credits for **" + gems + "** gems? If so, use `!pay @PrincessBot#9383 " + credits + "` trade your credits for gems.");
            const filter = m => (m.content.endsWith(credits + " credits have been transferred to " + msg.client.user.username + "'s account.") && m.author.id === '194525847565238272');
            msg.channel.awaitMessages(filter, {
                    max: 1,
                    time: 15000,
                    errors: ['time']
                })
                .then(function() {
                    economyJson.vaults[msg.author.id].amount += gems;
                    cogs.writeFile("./cogs/economy.json", JSON.stringify(economyJson, null, "\t"));
                    msg.channel.sendMessage(msg.author + " **" + gems + "** gems have been added to your " + chestLevel(economyJson.vaults[msg.author.id].amount) + ".");
                    tradeInProgress = false;
                })
                .catch(function() {
                    msg.channel.sendMessage(msg.author + " you took too long.");
                    tradeInProgress = false;
                });
        }
        if (msg.content.startsWith(prefix + "pay")) {
            const filter = m => (m.content.endsWith(" credits have been transferred to " + msg.client.user.username + "'s account.") && m.author.id === '194525847565238272');
            msg.channel.awaitMessages(filter, {
                    max: 1,
                    time: 15000,
                    errors: ['time']
                })
                .then(function() {
                    if (tradeInProgress === true) {
                        return;
                    }
                    let amount = msg.content.split(" ").slice(2)[0];
                    msg.channel.sendMessage("!pay " + msg.author + " " + amount + " `REFUND`");
                });
        }*/
        if (msg.content.startsWith(prefix + "freechest")) {
            let economyJson = getEconomyJson();
            economyJson.vaults[msg.author.id].amount += 2;
            cogs.writeFile("./cogs/economy.json", JSON.stringify(economyJson, null, "\t"));
            msg.channel.sendMessage(msg.author + " **" + 2 + "** gems have been added to your " + chestLevel(economyJson.vaults[msg.author.id].amount) + ".");
            
            /*let economyJson = getEconomyJson();
            if (!economyJson.vaults[msg.author.id]) {
                msg.channel.sendMessage(msg.author + " you don't own a chest, use `!chest open` to open a chest!");
                return;
            }
            let oldDateObj = new Date();
            var newDateObj = new Date(oldDateObj.getTime() + 240 * 60000);
            if (!cooldowns[msg.author.id]) {
                //console.log("new");
                cooldowns[msg.author.id] = newDateObj;
            }
            if (getTimeRemaining(cooldowns[msg.author.id]).seconds <= 0) {
                if (!economyJson.vaults[msg.author.id]) {
                    msg.channel.sendMessage(msg.author + " you don't own a chest, use `!chest open` to open a chest!");
                    return;
                }
                cooldowns[msg.author.id] = newDateObj;
                economyJson.vaults[msg.author.id].amount += 2;
                cogs.writeFile("./cogs/economy.json", JSON.stringify(economyJson, null, "\t"));
                msg.channel.sendMessage(msg.author + " **" + 2 + "** gems have been added to your " + chestLevel(economyJson.vaults[msg.author.id].amount) + ".");
            } else {
                msg.channel.sendMessage(msg.author + " you can't do that for " + getTimeRemaining(cooldowns[msg.author.id]).hours + " hours, " + getTimeRemaining(cooldowns[msg.author.id]).minutes + " minutes, and " + getTimeRemaining(cooldowns[msg.author.id]).seconds + " seconds.");
            
            }*/
        }
    };
};

module.exports = economy;