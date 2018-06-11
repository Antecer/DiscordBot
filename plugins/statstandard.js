const Discord = require("discord.js");
const OsuAPI = require("../osuapi/queryinfo.js");

module.exports.run = async (bot, message, args) => {
    let info = new Discord.RichEmbed()
        .setColor("#FF8000")
        .setTitle("Query running, please wait..");
    let msg = await message.channel.send(info);

    let statinfo = '';
    let mode = "0";
    if(/^\d+$/.test(args))
    {
        statinfo = await OsuAPI.get_user(args, mode, "id");
    }
    else
    {
        statinfo = await OsuAPI.get_user(args.join(" ").replace(/\"/g, ""), mode, "string");
    }

    if(statinfo.color == 0xFF0000)
    {
        msg.edit(statinfo);
    }
    else
    {
        message.channel.send(statinfo);
        msg.delete();
    }
}

module.exports.help = {
    name: "statstandard",
    alias: [
        "s"
    ]
}