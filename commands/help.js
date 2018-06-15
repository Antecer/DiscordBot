const Discord = require("discord.js");
const cmdlist =
`\`\`\`MarkDown
#OsuInfoBot Commands
[00]: !help <Print bot commands>
[01]: !ping <Print bot's network status>
[02]: !userinfo[ @user] <Print user's info>
[03]: !serverinfo <Print server info>
[04]: !s[ "name"|id] <Print osu!std rank>
[05]: !t[ "name"|id] <Print osu!taiko rank>
[06]: !c[ "name"|id] <Print osu!catch rank>
[07]: !m[ "name"|id] <Print osu!mania rank>
[08]: !r[ "name"|id] <osu!std recent last>
[09]: !tr[ "name"|id] <osu!std recent top>
[10]: !pr[ "name"|id] <osu!std recent perfect>
\`\`\``;

module.exports.run = async (bot, message, args) => {
    message.channel.send(cmdlist)
        .then(msg => {
            setTimeout(() => {
                msg.delete();
            }, 30000);
        });
}

module.exports.help = {
    name: "help",
    alias: [
        "?"
    ]
}