const Discord = require("discord.js");
const discordBot = new Discord.Client({
    disableEveryone: true,
    messageCacheMaxSize: 1000,
    messageCacheLifetime: 300,
    messageSweepInterval: 60
});

//Princess
discordBot.login("MjY5MzI0OTk3NjkxMDQ3OTM2.C4HFPw.jHXClYZhSgBhZGoPegWtzw548_w");
//BOT
//discordBot.login("Mjg0MTE5MTY3NjA5ODY0MTky.C4_ACQ.VJEd70TVo2oa34O2J-PEvLdRl-M");

const Cogs = require("./cogs/index.js");
const cogs = new Cogs();

var clever_bot = require("cleverbot.io"),
cleverBot = new clever_bot("HpazOSZiRHuxnZpv", "ntsnNHMlZxkYmrAP1e20wXOAI3nOV2xv");

//BOT STATUS
var bot;
var botUsername;

///r/CR
//let serverid = "178281233233608705";
//harmiox
//let serverid = "273773402572062721";


//Role Id's
let botRoleId = "179663287800168448";
let blueRoleId = "266470344737554433";
let subRedditModRoleId = "179663467546935296";
let discordModRoleId = "179663615182241792";
let modsRoleId = "184030211304718338"
let heistMeisterRoleId = "265656411218903042";
let goldRoleId = '195947843268116481';
let goldAccessRoleId = '196525148201943040';
let magicalRoleId = '271236480842727424';
let supermagicalRoleId = '271298003623608320';
let shopKeeperRoleId = '273945100726435841';

//Valentines Day
let pinkRoleId = '280620317796335619';
let redRoleId = '280868772318019584';

//Channel Id's
let channelId_Shop = '264224928373538828'; //#shop
let channelId_botControl = '186237273426231296'; //bot-control
let channelId_opRoom = '184055334334234624'; //#operator-room
let channelId_lotto = '272856015882682369'; //#lotto
let channelId_announcements = '179662937986826240'; //#announcements

//Shop/Lotto/Bet Purchases
var purchaseInProgress = false;

//Global Functions
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function cleanup(amount, channel) {
    channel.sendMessage("!clear " + amount);
}


/****************** SHOP ***********************/
function createYesAlias(amount, msg) {
    purchaseInProgress = true;
    let channel = msg.guild.channels.get(channelId_botControl);
    let command = ("!alias add yes bank transfer " + botUsername + " " + amount); //269324997691047936
    channel.sendMessage(command);
};

function deleteAlias(msg) {
    let channel = msg.guild.channels.get(channelId_botControl);
    let deleteCommand = ("!alias del yes");
    channel.sendMessage(deleteCommand);
    purchaseInProgress = false;
    setTimeout(function() {
        cleanup(4, channel);
    }, 7500)
};

function paymentError(msg) {
    msg.channel.sendMessage(msg.author + " it appears credits were not received.");
    purchaseInProgress = false;
}

function noResponse(msg) {
    msg.channel.sendMessage(msg.author + " you took too long to respond.");
    purchaseInProgress = false;
}

function wasPurchased(msg, product) {
    let user = msg.member;
    let jsonContent = JSON.parse(cogs.readFile("./shop.json"));
    if (jsonContent.purchases[product][user.id]) {
        return true;
    } else {
        return false;
    }
}

function shopReceipt(user) {
    let jsonContent = JSON.parse(cogs.readFile("./shop.json"));
    var returnString = "**Purchases For: " + user + "**\n";
    returnString += "```HTTP\n"
    returnString += "Custom Commands: " + jsonContent.purchases["customcommand"][user.id] + "\n";
    returnString += "Gold Name: " + jsonContent.purchases["goldname"][user.id] + "\n";
    returnString += "Gold Access: " + jsonContent.purchases["goldaccess"][user.id] + "\n";
    returnString += "Gold Flair Level: " + jsonContent.purchases["goldflair"][user.id] + "\n";
    returnString += "Magical Role: " + jsonContent.purchases["magicalrole"][user.id] + "\n";
    returnString += "SuperMagical Role: " + jsonContent.purchases["supermagicalrole"][user.id] + "\n";
    returnString += "Pink Name: " + jsonContent.purchases["pinkname"][user.id] + "\n";
    returnString += "Red Name: " + jsonContent.purchases["redname"][user.id] + "\n";
    returnString += "```"
    return returnString;
}

function dmShopKeepers(msg, product, jsonContent) {
    let shopKeeperRole = msg.guild.roles.get(shopKeeperRoleId);
    for (let item of shopKeeperRole.members.values()) {
        if (product === "customcommand") {
            item.sendMessage(msg.author + " has bought a custom command.");
        } else if (product === "goldflair") {
            item.sendMessage(msg.author + " has bought a level **" + jsonContent.purchases[product][msg.member.id] + "** `gold flair`.");
        }
    }
}

function shopLog(msg, product) {
    let channel_shopLog = msg.guild.channels.get('264975060245282817');
    channel_shopLog.sendMessage("", {
        embed: {
            color: 4420776,
            description: (msg.author + " purchased `" + product + "`"),
            timestamp: new Date(),
        }
    });
}

function processPurchase(msg, product, jsonContent) {
    if (product === "customcommand") {
        if (jsonContent.purchases[product].hasOwnProperty(msg.member.id)) {
            jsonContent.purchases[product][msg.member.id] += 1;
        } else {
            jsonContent.purchases[product][msg.member.id] = 1;
        }
        shopLog(msg, product);
        dmShopKeepers(msg, product, jsonContent);
        msg.channel.sendMessage(msg.author + " thank you for your purchase! Let me DM a ShopKeeper to add your custom command.");
    } else if (product === "goldname") {
        if (jsonContent.purchases[product].hasOwnProperty(msg.member.id)) {
            msg.channel.sendMessage("!pay " + msg.author + " " + jsonContent.products[product] + " `REDUND: You already have a gold name!`");
        } else {
            jsonContent.purchases[product][msg.member.id] = 1;
            shopLog(msg, product);
            msg.member.addRole(goldRoleId);
            msg.channel.sendMessage(msg.author + " thank you for your purchase! Your now have a gold name!");
        }

    } else if (product === "goldaccess") {
        if (jsonContent.purchases[product].hasOwnProperty(msg.member.id)) {
            msg.channel.sendMessage("!pay " + msg.author + " " + jsonContent.products[product] + " `REDUND: You've already purchased access to gold-lounge!`");
        } else {
            jsonContent.purchases[product][msg.member.id] = 1;
            msg.member.addRole(goldAccessRoleId);
            shopLog(msg, product);
            let goldLounge = msg.guild.channels.get('196525069181124608');
            msg.channel.sendMessage(msg.author + " thank you for your purchase! You've been granted access to " + goldLounge);
        }
    } else if (product === "goldflair") {
        if (jsonContent.purchases[product].hasOwnProperty(msg.member.id)) {
            if (jsonContent.purchases[product][msg.member.id] < 3) {
                jsonContent.purchases[product][msg.member.id] += 1;
                dmShopKeepers(msg, product, jsonContent);
                msg.channel.sendMessage(msg.author + " thank you for your purchase! Let me DM a ShopKeeper to add your level **" + jsonContent.purchases[product][msg.member.id] + "** gold flair.");
            } else {
                msg.channel.sendMessage("!pay " + msg.author + " " + jsonContent.products[product] + " `REDUND: You may not purchase anything higher than a level 3 gold flair!`");
            }
        } else {
            jsonContent.purchases[product][msg.member.id] = 1;
            shopLog(msg, product);
            dmShopKeepers(msg, product, jsonContent);
            msg.channel.sendMessage(msg.author + " thank you for your purchase! Let me DM a ShopKeeper to add your level **" + jsonContent.purchases[product][msg.member.id] + "** gold flair.");
        }
    } else if (product === "magicalrole") {
        if (jsonContent.purchases[product].hasOwnProperty(msg.member.id)) {
            msg.channel.sendMessage("!pay " + msg.author + " " + jsonContent.products[product] + " `REDUND: You've already purchased the Magical role!`");
        } else {
            jsonContent.purchases[product][msg.member.id] = 1;
            shopLog(msg, product);
            msg.member.addRole(magicalRoleId);
            msg.channel.sendMessage(msg.author + " thank you for your purchase! Your're now with the other Magical roles!!");
        }

    } else if (product === "supermagicalrole") {
        if (jsonContent.purchases[product].hasOwnProperty(msg.member.id)) {
            msg.channel.sendMessage("!pay " + msg.author + " " + jsonContent.products[product] + " `REDUND: You've already purchased Super Magical role!`");
            return;
        }
        if (jsonContent.purchases["magicalrole"].hasOwnProperty(msg.member.id)) {
            jsonContent.purchases[product][msg.member.id] = 1;
            msg.channel.sendMessage(msg.author + " thank you for your purchase! Your're now with the other Super Magical roles!");
            msg.member.addRole(magicalRoleId);
        } else {
            msg.channel.sendMessage("!pay " + msg.author + " " + jsonContent.products[product] + " `REDUND: You must first purchase the Magical Role!`");
        }
    } else if (product === "pinkname") {
        if (jsonContent.purchases[product].hasOwnProperty(msg.member.id)) {
            msg.channel.sendMessage("!pay " + msg.author + " " + jsonContent.products[product] + " `REDUND: You already have a pink name!`");
        } else {
            jsonContent.purchases[product][msg.member.id] = 1;
            shopLog(msg, product);
            msg.member.addRole(pinkRoleId);
            msg.channel.sendMessage(msg.author + " thank you for your purchase! Your now have a pink name!");
        }

    } else if (product === "redname") {
        if (jsonContent.purchases[product].hasOwnProperty(msg.member.id)) {
            msg.channel.sendMessage("!pay " + msg.author + " " + jsonContent.products[product] + " `REDUND: You already have a red name!`");
        } else {
            jsonContent.purchases[product][msg.member.id] = 1;
            shopLog(msg, product);
            msg.member.addRole(redRoleId);
            msg.channel.sendMessage(msg.author + " thank you for your purchase! Your now have a red name!");
        }
    }
    cogs.writeFile("./shop.json", JSON.stringify(jsonContent, null, "\t"));
    purchaseInProgress = false;
}

function shopPurchase(msg, product) {
    let user = msg.member;
    let jsonContent = JSON.parse(cogs.readFile("./shop.json"));
    if (jsonContent.products[product]) {
        let price = jsonContent.products[product];
        if (product === "goldflair") {
            if (jsonContent.purchases["goldflair"].hasOwnProperty(msg.member.id)) {
                price = price + (10000000 * jsonContent.purchases["goldflair"][msg.member.id]);
            }
        }
        if (wasPurchased(msg, product)) {
            msg.channel.sendMessage(msg.author + " you've already purchased this item. Are you sure you'd like to purchase `" + product + "` for **" + numberWithCommas(price) + "** credits?\nSay `!yes` to confirm your purchase.");
        } else {
            msg.channel.sendMessage(msg.author + " are you sure you'd like to purchase `" + product + "` for **" + numberWithCommas(price) + "** credits?\nSay `!yes` to confirm your purchase.");
        }
        createYesAlias(price, msg);
        const filter1 = m => (m.content.endsWith("!yes") && (m.author.id === msg.author.id));
        msg.channel.awaitMessages(filter1, {
                max: 1,
                time: 5000,
                errors: ['time']
            })
            .then(function() {
                deleteAlias(msg);
                const filter2 = m => (m.content.endsWith(price + " credits have been transferred to " + botUsername + "'s account.") && m.author.id === '194525847565238272');
                msg.channel.awaitMessages(filter2, {
                        max: 1,
                        time: 15000,
                        errors: ['time']
                    })
                    .then(function() {
                        processPurchase(msg, product, jsonContent);
                    })
                    .catch(function() {
                        paymentError(msg);
                    });
            })
            .catch(function() {
                deleteAlias(msg);
                noResponse(msg);
            });
    } else {
        msg.channel.sendMessage(msg.author + " that product is not for sale. For a list of items to buy, use `!buy items`");
    }
}
/****************** /SHOP **********************/

/****************** BLACKLIST ***********************/
function isBlackListed(user) {
    let filePath = "./blacklist.json";
    var contents = cogs.readFile(filePath);
    var jsonContent = JSON.parse(contents);
    if (jsonContent["users"].hasOwnProperty(user.id)) {
        return true;
    } else {
        return false;
    }
}

function removeBlackList(msg) {
    let user = msg.mentions.users.first();
    let filePath = "./blacklist.json";
    var contents = cogs.readFile(filePath);
    var jsonContent = JSON.parse(contents);
    delete jsonContent["users"][user.id];
    var fs = require('fs');
    fs.writeFile(filePath, JSON.stringify(jsonContent, null, "\t"), function(err) {
        if (err) {
            msg.channel.sendMessage("'Something went wrong when writing to file.'");
            return console.log("Something went wrong when writing to file.");
        } else {
            msg.channel.sendMessage("`" + user.username + " was removed from the blacklist.`");
        }
    });
}

function addBlackList(msg) {
    let user = msg.mentions.users.first();
    let filePath = "./blacklist.json";
    var contents = cogs.readFile(filePath);
    var jsonContent = JSON.parse(contents);
    jsonContent["users"][user.id] = user;
    cogs.writeFile(filePath, JSON.stringify(jsonContent, null, "\t"));
}
/****************** /BLACKLIST ***********************/
/****************** HEIST ASSISTANT FUNCTIONS ***********************/
function parseWinnings(msg) {
    let filePath = "./heists.json";
    var contents = cogs.readFile(filePath);
    var jsonContent = JSON.parse(contents);
    let winnersArray = msg.content.split("\n");
    let crewSize = jsonContent.heists[currentHeist()].crew.length;
    let winners = new Map();
    var totalStolen = 0;
    for (i = 0; i < winnersArray.length; i += 1) {
        if ((!winnersArray[i].match(/split/i)) && (!winnersArray[i].match(/-------/i)) && (!winnersArray[i].match(/```Python/i)) && (!winnersArray[i].match(/Criminals/i))) {
            console.log("LINE: " + winnersArray[i]);
            let tempString = winnersArray[i].replace("```", "").replace(/\s+/g, ' ').trim();
            let parsedWinner = tempString.split(" ");
            totalStolen += parseInt(parsedWinner[1]);
            winners.set(parsedWinner[0], parsedWinner[1]);
        }
    }
    let losersCount = (crewSize - winners.size);
    let payup = Math.floor((totalStolen * 0.75) / winners.size);
    let totalDue = ((totalStolen * 0.75) * (winners.size));
    let payout = Math.floor(((totalStolen * 0.75)) / losersCount);
    for (i = 0; i < crewSize; i += 1) {
        let crewMember = jsonContent.heists[currentHeist()].crew[i];
        if (winners.has(crewMember.username)) {
            console.log("<@!" + crewMember.id + "> Please use the command `!hpay " + payup + "` to split your share with the losers.");
            msg.channel.sendMessage("<@!" + crewMember.id + "> Please use the command `!hpay " + payup + " " + jsonContent.current + "` to split your share with the losers.");
            jsonContent.heists[currentHeist()].winners.push(crewMember);
        } else {
            jsonContent.heists[currentHeist()].losers.push(crewMember);
        }
    }
    jsonContent.active = 0;
    jsonContent.heists[currentHeist()].successful = 1;
    jsonContent.heists[currentHeist()].payment = payup;
    jsonContent.heists[currentHeist()].due = totalDue;
    jsonContent.current += 1;
    if (jsonContent.current === 10) {
        clearHeists(msg);
    }
    cogs.writeFile(filePath, JSON.stringify(jsonContent, null, "\t"));
    msg.channel.sendMessage("Each winner will pay **" + payup + "** credits to be split between the losers.");
    msg.channel.sendMessage("Each loser will receive **" + payout + "** credits.");

}

function refundPayment(msg) {
    let parsedMsg = msg.content.split(" ");
    let payment = parsedMsg[1];
    msg.channel.sendMessage("!pay <@!" + msg.author.id + "> " + payment + " REFUND");
}

function heistPayment(msg) {
    let parsedMsg = msg.content.split(" ");
    let payment = parseInt(parsedMsg[1]);
    var heistId = parseInt(parsedMsg[2]);
    let filePath = "./heists.json";
    var contents = cogs.readFile(filePath);
    var jsonContent = JSON.parse(contents);
    jsonContent.heists[heistId].paid += payment;
    let losersArray = jsonContent.heists[heistId].losers;
    let split = Math.floor(payment / losersArray.length);
    msg.channel.sendMessage("A payment of " + payment + " credits has been received. Splitting with crew.");
    for (i = 0; i < losersArray.length; i += 1) {
        let crewMember = losersArray[i];
        msg.channel.sendMessage("!pay <@!" + crewMember.id + "> " + split);
        //msg.channel.sendMessage("pay " + crewMember.username + " " + split);
    }
    cogs.writeFile(filePath, JSON.stringify(jsonContent, null, "\t"));
}

function currentHeist() {
    let filePath = "./heists.json";
    var contents = cogs.readFile(filePath);
    var jsonContent = JSON.parse(contents);
    return (jsonContent.current);
}

function heistStatus() {
    let filePath = "./heists.json";
    var contents = cogs.readFile(filePath);
    var jsonContent = JSON.parse(contents);
    return (jsonContent.active);
}

function heistPaymentCheck(id, amount) {
    let filePath = "./heists.json";
    var contents = cogs.readFile(filePath);
    var jsonContent = JSON.parse(contents);
    if (id < jsonContent.heists.length) {
        if (jsonContent.heists[id].payment === amount) {
            return -1;
        } else {
            return jsonContent.heists[id].payment;
        }
    } else {
        return 0;
    }
}

function heistExists(id) {
    let filePath = "./heists.json";
    var contents = cogs.readFile(filePath);
    var jsonContent = JSON.parse(contents);
    if (id < jsonContent.heists.length) {
        return true;
    } else {
        return false;
    }
}

function wasHeistPaid(id) {
    let filePath = "./heists.json";
    var contents = cogs.readFile(filePath);
    var jsonContent = JSON.parse(contents);
    if (id < jsonContent.heists.length) {
        if (jsonContent.heists[id].paid === jsonContent.heists[id].due) {
            return 1;
        } else {
            return 0;
        }
    } else {
        return 0;
    }
}

function wasHeistSuccessful(id) {
    let filePath = "./heists.json";
    var contents = cogs.readFile(filePath);
    var jsonContent = JSON.parse(contents);
    if (id < jsonContent.heists.length) {
        return (jsonContent.heists[id].successful);
    } else {
        return (0);
    }
}

function cancelHeist(channel) {
    let filePath = "./heists.json";
    var contents = cogs.readFile(filePath);
    var jsonContent = JSON.parse(contents);
    let heistId = jsonContent.current;
    jsonContent.active = 0;
    jsonContent.current += 1;
    cogs.writeFile(filePath, JSON.stringify(jsonContent, null, "\t"));
    channel.sendMessage("Heist **" + heistId + "** ended, too bad!");
}

function newHeist(msg) {
    let username = msg.content.replace("A heist is being planned by ", "").replace("The heist begin in 30 seconds. Type !heist play to join their crew.", "").replace("\n", "");
    let user = msg.client.users.find(u => u.username === username);
    let filePath = "./heists.json";
    var contents = cogs.readFile(filePath);
    var jsonContent = JSON.parse(contents);
    jsonContent.active = 1;
    let heistId = jsonContent.current;
    jsonContent['heists'].push({
        "id": heistId,
        "successful": 0,
        "paid": 0,
        "due": 0,
        "payment": 0,
        "crew": [user],
        "winners": [],
        "losers": []
    });
    cogs.writeFile(filePath, JSON.stringify(jsonContent, null, "\t"));
    msg.channel.sendMessage("The ID for this heist is **" + heistId + "**. Use `!crew " + heistId + "` for the list of crew members for this heist");
}

function addCrew(msg) {
    let username = msg.content.split("\n").slice(0, 1)[0].replace(" has joined the crew.", "");
    let user = msg.client.users.find(u => u.username === username);
    let filePath = "./heists.json";
    var contents = cogs.readFile(filePath);
    var jsonContent = JSON.parse(contents);
    jsonContent.heists[jsonContent.current]['crew'].push(user);
    cogs.writeFile(filePath, JSON.stringify(jsonContent, null, "\t"));
}

function getCrew(id) {
    let filePath = "./heists.json";
    var contents = cogs.readFile(filePath);
    var jsonContent = JSON.parse(contents);
    let crewArray = jsonContent.heists[id]['crew'];
    let crew = "**Crew for heist " + id + ":**\n";
    for (i = 0; i < crewArray.length; i += 1) {
        if (i === (crewArray.length - 1)) {
            crew += crewArray[i].username;
            break;
        }
        crew += crewArray[i].username + ", ";
    }
    return crew;
}

function getHeist(id) {
    let filePath = "./heists.json";
    var contents = cogs.readFile(filePath);
    var jsonContent = JSON.parse(contents);
    return (jsonContent.heists[id]);
}

function clearHeists(msg) {
    let filePath = "./heists.json";
    var contents = cogs.readFile(filePath);
    var jsonContent = JSON.parse(contents);
    jsonContent.current = 0;
    jsonContent["heists"] = [];
    var fs = require('fs');
    fs.writeFile(filePath, JSON.stringify(jsonContent, null, "\t"), function(err) {
        if (err) {
            return console.log("Something went wrong when writing to file.");
        }
    });
    msg.channel.sendMessage("`heists.json has been cleared of logged heists.`");
}
/****************** /HEIST ASSISTANT FUNCTIONS ***********************/
discordBot.on('ready', () => {
    botUsername = discordBot.user.username;

    //Start Cogs
    for (var cog in cogs.loaded) {
        if (cogs.loaded.hasOwnProperty(cog)) {
            cogs.loaded[cog].onReady(cogs);
        }
    }

    bot = true;
    console.log('[PrincessBot] Activated!');

});

discordBot.on("message", msg => {
    let prefix = "!";
    if (msg.guild) {


        if(msg.author.id != discordBot.user.id) {
            //Check permission
            if (msg.content.startsWith("!!") && (msg.author.id != '194525847565238272')) {
                if(!msg.member.hasPermission("ADMINISTRATOR")){msg.channel.sendMessage("You don't have the `ADMINISTRATOR` permission.");return;}
                cogs.loaded["permissions"].editCommand(msg)
            }
            if(msg.content.startsWith(prefix)) {
                let toCogs = cogs.loaded["permissions"].check(msg);
                if (toCogs != null) {
                        //Send to Cogs
                        for (var cog in cogs.loaded) {
                            if (cogs.loaded.hasOwnProperty(cog)) {
                                cogs.loaded[cog].onMsg(toCogs);
                            }
                        }

                }
            }
        }
        //Toggles Bot to be on or off.
        if (msg.content.startsWith(prefix + "bot") && msg.author.id != '194525847565238272') {
            let args = msg.content.split(" ").slice(1);
            if (!args[0]) {
                if (msg.member.roles.has(subRedditModRoleId) || msg.member.roles.has(discordModRoleId)) {
                    if (bot == false) {
                        bot = true;
                        msg.channel.sendMessage("", {
                            embed: {
                                color: 16711680,
                                description: ("Bot has been toggle to **on**."),
                            }
                        });
                        //msg.channel.sendMessage("Bot has been toggle to **on**.");
                    } else {
                        bot = false;
                        msg.channel.sendMessage("", {
                            embed: {
                                color: 16711680,
                                description: ("Bot has been toggle to **off**."),
                            }
                        });
                        //msg.channel.sendMessage("Bot has been toggle to **off**.");
                    }
                } else {
                    msg.channel.sendMessage("You do not have permission to use that command!");
                }
            } else {
                if (args[0] === "info") {
                    msg.channel.sendMessage("", {
                        embed: {
                            color: 16711680,
                            description: ("**Harmiox is my creator!**"),
                        }
                    });
                }
            }
        }

        //Manages Cogs
        if (msg.content.startsWith(prefix + "cog")) {
            if (msg.author.id === '228781414986809344') {
                let args = msg.content.split(" ").slice(1);
                if (!args[0]) {
                    msg.channel.sendMessage("Incorrect usage.");
                }
                if (args[0] === "import") {
                    if (!args[1]) {
                        return;
                    }
                    let file = args.slice(1).join(" ");
                    console.log(file);
                    let cogsJson = JSON.parse(cogs.readFile("./cogs.json"));
                    cogsJson.cogs[file] = true;
                    cogs.writeFile("./cogs.json", JSON.stringify(cogsJson, null, "\t"));
                    console.log("JSON: " + ("./cogs/" + file.replace(".js","") + ".json"));
                    cogs.loaded["permissions"].loadPerms(JSON.parse(cogs.readFile("./cogs/" + file.replace(".js","") + ".json")));
                    msg.channel.sendMessage(file + " was successfully imported.");
                }
            } else {
                msg.channel.sendMessage("You lack permissions to use this.");
            }
        }

        //Adds/Removes user to blacklist
        if (msg.content.startsWith(prefix + "blacklist")) {
            if (msg.member.roles.has(heistMeisterRoleId) || msg.member.roles.has(subRedditModRoleId) || msg.member.roles.has(discordModRoleId)) {
                let args = msg.content.split(" ").slice(1);

                if (args.length >= 1) {
                    if (msg.mentions.users.size > 0) {
                        if (args[0] === "add") {
                            addBlackList(msg);
                        } else if (args[0] === "remove") {
                            removeBlackList(msg);
                        } else if (args[0] === "check") {
                            let user = msg.mentions.users.first();
                            if (isBlackListed(user) === true) {
                                msg.channel.sendMessage("`" + user.username + " is on the blacklist.`");
                            } else if (isBlackListed(user) === false) {
                                msg.channel.sendMessage("`" + user.username + " is not on the blacklist.`");
                            } else {
                                msg.channel.sendMessage("`Error`");
                            }
                        }

                    } else {
                        msg.channel.sendMessage(msg.author + " `!blacklist {add;remove;check} @user`");
                    }
                } else {
                    msg.channel.sendMessage(msg.author + " `!blacklist {add;remove;check} @user`");
                }
            } else {
                msg.channel.sendMessage("You do not have permission to use that command!");
            }
        }

        //Bot must be toggled on to do anything!
        if (bot == true) {
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

            /*** COLOR SWITCHES ***/
            var cSwitches = {
                "0":"Zero"
            }
            if (msg.content.startsWith(prefix + "switch") && cSwitches.has(msg.author.id)) {

            }


            /*** COLOR SWITCHES ***/
            /********* HEIST ASSISTANT  *********/
            if (msg.author.id == '194525847565238272') {
                if (msg.content.startsWith("You tried to rally a crew, but no one wanted to follow you. The heist has been cancelled.")) {
                    console.log("Not enough crew, heist cancelled.");
                    cancelHeist(msg.channel);
                }
                if (msg.content.startsWith("No one made it out safe. The good guys win.")) {
                    cancelHeist(msg.channel);
                }
                if (msg.content.startsWith("The credits stolen from the vault was split among the winners")) {
                    parseWinnings(msg);
                }
                if (msg.content.match(/has joined the crew/i)) {
                    addCrew(msg);
                }
                if (msg.content.startsWith("A heist is being planned by ")) {
                    newHeist(msg);
                }
            }
            if (msg.content.startsWith(prefix + "crew")) {
                let args = msg.content.split(" ").slice(1);
                if (parseInt(args[0]) > -1) {
                    if (heistExists(parseInt(args[0]))) {
                        msg.channel.sendMessage(getCrew(args[0]));
                    } else {
                        msg.channel.sendMessage("Please give a valid heist ID.\n`!crew <heist_id>`");
                    }
                } else {
                    msg.channel.sendMessage("Please give a valid heist ID.\n`!crew <heist_id>`");
                }
            }
            //Clears the heists.json
            if (msg.content.startsWith(prefix + "hclear")) {
                if (msg.member.roles.has(heistMeisterRoleId) || msg.member.roles.has(subRedditModRoleId) || msg.member.roles.has(discordModRoleId)) {
                    clearHeists(msg);
                } else {
                    msg.channel.sendMessage("You don't have permission to use that command.");
                }
            }
            if (msg.content.startsWith(prefix + "kek")) {
                msg.member.setNickname("kek");
                msg.channel.sendMessage(msg.author + " you've been renamed to `kek`.");
            }
            if (msg.content.startsWith(prefix + "buy")) {
                let args = msg.content.split(" ");
                let product = args[1];
                if (args.length > 1) {
                    if (args[1] === "items") {
                        var message = "```Markdown\n";
                        message += "Shop Items\n";
                        message += "==========\n";
                        message += "<item> is what is inside the [] brackets.\n\n";
                        message += "Custom Command [customcommand](5m)\n";
                        message += "> Want BarbarianBot to post a photo or say something whenever you say !command? Than buy a custom command!\n";
                        message += "Gold Name [goldname](5m)\n";
                        message += "> Makes your name gold.\n";
                        message += "Gold Access [goldaccess](6m)\n";
                        message += "> Gives you access to a super secret prestige channel.\n";
                        message += "Gold Flair [goldflair](10m,20m,30m)\n";
                        message += "> Level 1 - 10m\n";
                        message += "> Level 2 - 20m\n";
                        message += "> Level 3 - 30m\n";
                        message += "> You must buy them in order.\n";
                        message += "Magical Role [magicalrole](10m)\n";
                        message += "> Magical role, and you're seperated in the userlist!\n";
                        message += "Super Magical Role [supermagicalrole](20m)\n";
                        message += "> You have to buy the Magical role first.\n";
                        message += "> Super Magical role, and you're higher up on the user list!\n";
                        message += "> More awesome features may be added for this role in the future!\n";
                        message += "```";
                        msg.member.sendMessage(message);
                        msg.channel.sendMessage(msg.author + " I've sent you the list of shop items via DM.");
                    } else {
                        if (msg.channel === msg.guild.channels.get(channelId_Shop)) {
                            if (purchaseInProgress === false) {
                                shopPurchase(msg, product);
                            } else {
                                msg.channel.sendMessage(msg.author + " Someone is currently purchasing something. Please try again shortly.");
                            }
                        } else {
                            msg.channel.sendMessage(msg.author + " Please use `!buy` in " + msg.guild.channels.get(channelId_Shop));
                        }
                    }
                } else {
                    msg.channel.sendMessage(msg.author + " to buy something use `!buy <item>`.\nFor the list of items to buy use the command `!buy items`.");
                }
            }
            if (msg.content.startsWith(prefix + "purchases")) {
                if (msg.mentions.users.size > 0) {
                    msg.member.sendMessage(shopReceipt(msg.mentions.users.first()));
                } else {
                    msg.channel.sendMessage("`!purchases @user`");
                }

            }
            if (msg.content.startsWith(prefix + "shop")) {
                var message = "```Markdown\n"
                message += "Shop Commands\n";
                message += "=============\n";
                message += "!buy <item>\n";
                message += "> Use this command to buy something.\n";
                message += "!buy items\n";
                message += "> Use this is see the current items that you can buy.\n";
                message += "!purchases <@user>\n";
                message += "> PrincessBot will DM you the shop purchases of @user.\n";
                message += "!refund\n";
                message += "> So you want a refund?\n";
                message += "```";
                msg.member.sendMessage(message);
                msg.channel.sendMessage(msg.author + " I've sent you the list of shop commands via DM.");
            }
            //Clears the heists.json
            if (msg.content.startsWith(prefix + "hpay")) {
                let args = msg.content.split(" ").slice(1);
                let amount = parseInt(args[0]);
                let id = parseInt(args[1]);
                //0 = amount
                //1 = heist
                if (amount > 0) {
                    if (id > -1) {
                        if (heistExists(id)) {
                            if ((wasHeistSuccessful(id) === 1) && (wasHeistPaid(id) === 0)) {
                                if (heistPaymentCheck(id, amount) === -1) {
                                    const filter = m => (m.content.endsWith("credits have been transferred to " + botUsername + "'s account.") && m.author.id === '194525847565238272');
                                    msg.channel.awaitMessages(filter, {
                                            max: 1,
                                            time: 5000,
                                            errors: ['time']
                                        })
                                        .then(function() {
                                            heistPayment(msg);
                                        })
                                        .catch(function() {
                                            paymentError(msg);
                                        });
                                } else {
                                    msg.channel.sendMessage("That is not the correct payment for that heist.");
                                    const filter = m => (m.content.endsWith("credits have been transferred to " + botUsername + "'s account.") && m.author.id === '194525847565238272');
                                    msg.channel.awaitMessages(filter, {
                                            max: 1,
                                            time: 5000,
                                            errors: ['time']
                                        })
                                        .then(function() {
                                            refundPayment(msg);
                                        });
                                }
                            } else {
                                msg.channel.sendMessage("Heist " + args[1] + " was either not successful or winnings have already been split to the crew");
                                const filter = m => (m.content.endsWith("credits have been transferred to " + botUsername + "'s account.") && m.author.id === '194525847565238272');
                                msg.channel.awaitMessages(filter, {
                                        max: 1,
                                        time: 5000,
                                        errors: ['time']
                                    })
                                    .then(function() {
                                        refundPayment(msg);
                                    });
                            }
                        } else {
                            msg.channel.sendMessage("That heist does not exist.");
                            const filter = m => (m.content.endsWith("credits have been transferred to " + botUsername + "'s account.") && m.author.id === '194525847565238272');
                            msg.channel.awaitMessages(filter, {
                                    max: 1,
                                    time: 5000,
                                    errors: ['time']
                                })
                                .then(function() {
                                    refundPayment(msg);
                                });
                        }
                    } else {
                        msg.channel.sendMessage("<@!" + msg.author.id + "> Please give a valid heist ID. *(If credits were transferred you'll receive an automatic refund in a few seconds)*\n`!hpay <credits> <heist_id>`");
                        const filter = m => (m.content.endsWith("credits have been transferred to " + botUsername + "'s account.") && m.author.id === '194525847565238272');
                        msg.channel.awaitMessages(filter, {
                                max: 1,
                                time: 5000,
                                errors: ['time']
                            })
                            .then(function() {
                                refundPayment(msg);
                            });
                    }
                } else {
                    msg.channel.sendMessage("Please give more than 0 credits.\n`!hpay <credits> <heist_id>`");
                }
            }
            /********* /HEIST ASSISTANT  *********/
        }

    }
});
