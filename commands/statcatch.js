const Discord = require("discord.js");
const OsuAPI = require(process.cwd() + '/osuapi/queryinfo.js');

module.exports.run = async (bot, message, args) => {
    let info = new Discord.RichEmbed()
        .setColor("#FF8000")
        .setTitle("Query running, please wait..");
    let msg = await message.channel.send(info);

    let apikey = bot.configs.get("apikey");
    let osuer = args.join(" ");
    let mode = "2";
    let type = "string";
    if(/^\d+$/.test(osuer)){
        type = "id";
    }else{
        osuer = osuer.replace(/\"/g, "");
    }
    
    let statinfo = await OsuAPI.get_user(apikey, osuer, mode, type);
    if(statinfo.color == 0xFF0000){
        msg.edit(statinfo);
    }else{
        message.channel.send(statinfo);
        msg.delete();
    }
}

module.exports.help = {
    name: "statcatch",
    alias: [
        "c"
    ]
}