const db = require('sqlite');
db.open('./cogs/databases.db');
console.log("index.js loaded");
<<<<<<< HEAD
const loadedCogs = {};
const unloadedCogs = {};

=======

var loadedCogs = {};
var unloadedCogs = {};
>>>>>>> origin/master
function loadCogs() {
    //require()
    require('fs').readdirSync(__dirname + '/').forEach(function(file) {
      if (file.match(/\.js$/) !== null && file !== 'index.js') {
        var name = file.replace('.js', '');
        unloadedCogs[name] = require('./' + file);
      }
    });
    //instances
    db.all(`SELECT * FROM cogs`).then(rows => {
        for (let row in rows) {
            let name = rows[row].cog.toString().replace('.js', '');
            if (!unloadedCogs[name]) {
                return;
            }
            loadedCogs[name] = new unloadedCogs[name]();
            //Load db into instance
            loadedCogs[name].load(db);
        }
<<<<<<< HEAD
    }).catch(() => {
        db.run('CREATE TABLE IF NOT EXISTS cogs (cog TEXT)').then(() => {
            db.run('INSERT INTO cogs (cog) VALUES (?)', ["permissions.js"]);
=======
    }).catch((err) => {
        console.log(err);
        db.run('CREATE TABLE IF NOT EXISTS cogs (cog TEXT)').then(() => {
            db.run('INSERT INTO cogs (cog) VALUES (?)', ["permissions.js"]);
            console.log("table created");
>>>>>>> origin/master
            db.get(`SELECT * FROM cogs`).then(rows => {
                for (var row in rows) {
                    let name = rows[row].cog.toString().replace('.js', '');
                    if (!unloadedCogs[name]) {
                        return;
                    }
                    loadedCogs[name] = new unloadedCogs[name]();
                    loadedCogs[name].load(db);
                }
            });
        });
    });
}
function addGuild(guild) {
    db.get(`SELECT * FROM settings WHERE guildId ='${guild.id}' AND cog ='${"cogs"}'`).then(row => {
        if (!row) {
            db.run('INSERT INTO settings (guildId, cog, json) VALUES (?, ?, ?)', [guild.id, "cogs", getDefaultSettings()]);
            console.log("guild added");
        } else {
            console.log("guild already exists");
        }
    });
}
function getDefaultSettings() {
    settings = {
        "permissions.js":true
    }
    return JSON.stringify(settings,null,"\t");
<<<<<<< HEAD
}
function loadPerms(cog,msg) {
    loadedCogs[cog.replace(".js","")].loadPerms(msg);
}
function reloadPerms(cog,msg) {
    loadedCogs[cog.replace(".js","")].reloadPerms(msg);
=======
>>>>>>> origin/master
}
//index.js
var cogs = function() {
    var self = this;
    self.unloaded = unloadedCogs;
    self.loaded = loadedCogs;
    self.load = function() {
        loadCogs();
    };
    self.add = function(guild) {
        addGuild(guild);
    }
    self.check = function(cog,guild) {
        db.get(`SELECT * FROM settings WHERE guildId ='${guild.id}' AND cog ='${"cogs"}'`).then(row => {
            if (!row) {
                db.run('INSERT INTO settings (guildId, cog, json) VALUES (?, ?, ?)', [guild.id, "cogs", getDefaultSettings()]);
                return false;
            } else {
                cogsJson = JSON.parse(row.json.toString());
                if (cogsJson.has(cog)) {
                    return true;
                }
                return false;
            }
        });
    }
    self.import = function(cog,msg) {
<<<<<<< HEAD
        if (!unloadedCogs[cog.replace(".js","")]) {
            msg.channel.sendMessage("Could not find `" + cog + "` in directory `./cogs/`.");
            return;
        }
        db.run('INSERT INTO cogs (cog) VALUES (?)', [cog]).then(() => {
            msg.channel.sendMessage("`" + cog + "` was imported!");
            loadCogs();
        });
    }
    self.unimport = function(cog,msg) {
        if (!unloadedCogs[cog.replace(".js","")]) {
            msg.channel.sendMessage("Could not find `" + cog + "` in directory `./cogs/`.");
            return;
        }
        db.run(`DELETE FROM cogs WHERE cog ='${cog}'`).then(() => {
            msg.channel.sendMessage("`" + cog + "` was removed from imported cogs.");
            loadCogs();
        });
    }
=======
        db.run('INSERT INTO cogs (cog) VALUES (?)', [cog]).then(() => {
            msg.channel.sendMessage(cog + " was imported!");
        });
    }
>>>>>>> origin/master
    self.enable = function(cog,msg) {
        db.get(`SELECT * FROM settings WHERE guildId ='${msg.guild.id}' AND cog ='${"cogs"}'`).then(row => {
            if (!row) {
                db.run('INSERT INTO settings (guildId, cog, json) VALUES (?, ?, ?)', [msg.guild.id, "cogs", getDefaultSettings()]);
                cogsJson = getDefaultSettings();
                cogsJson[cog] = true;
                db.run('INSERT INTO settings (guildId, cog, json) VALUES (?, ?, ?)', [msg.guild.id, "cogs", JSON.stringify(cogsJson,null,"\t")]);
<<<<<<< HEAD
                loadPerms(cog,msg);
            } else {
                cogsJson = JSON.parse(row.json.toString());
                cogsJson[cog] = true;
                db.run(`UPDATE settings SET json ='${JSON.stringify(cogsJson,null,"\t")}' WHERE guildId ='${msg.guild.id}' AND cog ='${"cogs"}'`);
                loadPerms(cog,msg);
=======
                msg.channel.sendMessage(cog + " has been enabled!");
            } else {
                cogsJson = JSON.parse(row.json.toString());
                cogsJson[cog] = true;
                db.run(`UPDATE settings SET json = ${JSON.stringify(cogsJson,null,"\t")} WHERE guildId = ${msg.guild.id} AND cog ='${"cogs"}'`);
                msg.channel.sendMessage(cog + " has been enabled!");
>>>>>>> origin/master
            }
        });
    }
    self.disable = function(cog,msg) {
        db.get(`SELECT * FROM settings WHERE guildId ='${msg.guild.id}' AND cog ='${"cogs"}'`).then(row => {
            if (!row) {
                db.run('INSERT INTO settings (guildId, cog, json) VALUES (?, ?, ?)', [msg.guild.id, "cogs", getDefaultSettings()]);
                msg.channel.sendMessage("No cogs installed, installed permissions.js.");
            } else {
                cogsJson = JSON.parse(row.json.toString());
                delete cogsJson[cog];
<<<<<<< HEAD
                db.run(`UPDATE settings SET json ='${JSON.stringify(cogsJson,null,"\t")}' WHERE guildId ='${msg.guild.id}' AND cog ='${"cogs"}'`);
=======
                db.run(`UPDATE settings SET json = ${JSON.stringify(cogsJson,null,"\t")} WHERE guildId = ${msg.guild.id} AND cog ='${"cogs"}'`);
>>>>>>> origin/master
                msg.channel.sendMessage(cog + " has been disabled.");
            }
        });
    }
<<<<<<< HEAD
    self.reload = function(cog,msg) {
        //TODO
    }
=======
>>>>>>> origin/master
};
module.exports = cogs;
