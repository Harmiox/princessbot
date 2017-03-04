/*let args = '<@&273789553784127488> <#282653334563717123> <@228781414986809344> Mod "Subreddit Mod" Harmiox#1234 "John#Cena#12445"'
args = args.match(/[^\s"]+|"([^"]*)"/g);
for (let arg in args) {
    args[arg] = args[arg].replace(/"|<@&|<!@|<@!|<@|<&|<#|>/g,"");
    if (isNaN(parseInt(args[arg]))) {
        //console.log("mention = false | " + args[arg]);
    } else {
        //console.log("mention = true  | " + args[arg]);
    }
}
//console.log("args: " + args);
let user = "John#Cena#1245";
let username = user.slice(0,user.length-5);
let disc = user.slice(user.length-4,user.length);
console.log(username)
console.log(disc)
*/
/*
let json = {
    "allowed": {
        "145215019288756224": "users"
    },
    "denied": {}
};
for (let role in json.allowed) {
    console.log(parseInt(role));
}


```Markdown
permissions.js
==============
!alias  | Shows the alias'd command for given alias.
> show  | Shows the full alias
> add   | Adds an alias.
> del   | Deletes an alias.
> edit  | Edits an alias.
!addcom | Adds a custom command.
!delcom | Removes a custom command.
!editcom| Edits a Custom Command
```

*/
let cmdMsg = "!editcom Harm princess's daddy"
console.log(cmdMsg.replace(/'/g,"\\'"));
//USER <-- first mention. USER <-- second mention. Last mention --> USER
