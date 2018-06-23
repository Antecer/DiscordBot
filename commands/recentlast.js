const Discord = require("discord.js");
const OsuImg = require(process.cwd() + '/osuapi/queryrecent.js');

module.exports.run = async (bot, message, args) => {
    let info = new Discord.RichEmbed()
        .setColor(0xFF8000)
        .setTitle("Query running, please wait..");
    var msg = await message.channel.send(info);
    let apikey = bot.configs.get("apikey");
    let osuer = args.join(" ");
    let mode = "0";
    let type = "string";
    if(/^\d+$/.test(osuer)){
        type = "id";
    }else{
        osuer = osuer.replace(/\"/g, "");
    }
    var recImg = OsuImg.get_recent(apikey, osuer, mode, type, 0);
    recImg.then(img => {
        if(!img) img = 'Error: Query Failed!';
        if(img.toString().indexOf('Error') > -1){
            info.setColor(0xFF0000).setTitle(img);
            msg.edit(info).then(m => {
                setTimeout(() => {
                    m.delete();
                }, 5000);
            });
            return;
        }
        message.channel.send({
            files: [{
              attachment: img,
              name: 'recent.jpg'
            }]
        }).then(() =>{
            msg.delete();
        });
    }).catch(err=>{
        info.setColor(0x800000).setTitle(err);
        msg.edit(info).then(m => {
            setTimeout(() => {
                m.delete();
            }, 5000);
        });
    });
}

module.exports.help = {
    name: "r"
}