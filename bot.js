const Discord = require(`discord.js`);
const fs = require("fs");
var botcfgs = require(`./botcfgs.json`);

const bot = new Discord.Client({disableEveryone: true});
bot.configs = new Discord.Collection();
bot.commands = new Discord.Collection();
bot.plugins = new Discord.Collection();

var loadconfigs = new Promise((resolve, reject)=>{  // 载入配置
    fs.exists("./debugdata.json", exists => {
        if(exists) botcfgs = require(`./debugdata.json`);
        for(let key in botcfgs){
            if(process.env[key]) botcfgs[key] = process.env[key];
            bot.configs.set(key, botcfgs[key]);
            console.log(`CFG: ${key} = ${bot.configs.get(key)}`);
        }
        resolve(true);
    });
});
var loadcommands = new Promise((resolve, reject)=>{ // 载入命令
    fs.readdir("./commands/", (err, files) => {
        if(err) reject(err);

        let jsfiles = files.filter(f => f.split(".").pop() === "js");
        if(jsfiles.length <= 0){
            console.log("No command load!");
            resolve(false);
        }else{
            console.log(`Loading ${jsfiles.length} commands!`);
            jsfiles.forEach((f, i) => {
                let props = require(`./commands/${f}`);
                console.log(`${i + 1}: ${f} loaded!`);
                let command = props.help.name;
                if(command) bot.commands.set(command, props);
                let alias = props.help.alias;
                if(alias instanceof Array){
                    alias.forEach(function(x){
                        bot.commands.set(x, props);
                    });
                } 
            });
            console.log(bot.commands);                      // 打印命令列表到日志
            resolve(true);
        }
    });
});
var loadplugins = new Promise((resolve, reject)=>{  // 载入插件
    fs.readdir("./plugins/", (err, files) => {
        if(err) reject(err);

        let jsfiles = files.filter(f => f.split(".").pop() === "js");
        if(jsfiles.length <= 0){
            console.log("No plugin load!");
            resolve(false);
        }else{
            console.log(`Loading ${jsfiles.length} plugins!`);
            jsfiles.forEach((f, i) => {
                let props = require(`./plugins/${f}`);
                console.log(`${i + 1}: ${f} loaded!`);
                let plugin = props.help.name;
                if(plugin) bot.plugins.set(plugin, props);
                let alias = props.help.alias;
                if(alias instanceof Array){
                    alias.forEach(function(x){
                        bot.plugins.set(x, props);
                    });
                } 
            });
            console.log(bot.plugins);                       // 打印插件列表到日志
            resolve(true);
        }
    });
});
Promise.all([loadconfigs, loadcommands, loadplugins])
.then(results =>{// 机器人事件
    // 机器人就绪事件
    bot.on("ready", async ()=>{
        console.log(`${bot.user.username} is ready!`);  // 打印机器人就绪信息
        try {
            let link = await bot.generateInvite(["ADMINISTRATOR"]);
            console.log(`ClickToJoinBot: ${link}`);
        } catch (e) {
            console.log(e.stack);
        }
    });
    // 定义命令前缀
    const prefix = bot.configs.get("prefix");
    // 机器人收到消息事件
    bot.on("message", async message => {
        if(message.author.bot) return;              // 消息发送者是机器人时不响应
        if(message.channel.type === "dm") return;   // 消息来自私聊时不响应(禁止私聊命令)

        let messageArray = message.content.split(" ");
        let command= messageArray[0];
        let args = messageArray.slice(1);

        // 机器人状态响应总开关(特殊允许!ping响应，以测试机器人是否开始工作)
        if((botcfgs.switch == "false") && (!command.startsWith("!ping"))) return;
        if(command.startsWith(prefix)){
            // 执行匹配的命令
            let cmd = bot.commands.get(command.slice(prefix.length));
            if(cmd) cmd.run(bot, message, args);
        }else{
            // 遍历并运行所有插件
            for(let plugin of bot.plugins.values()) plugin.run(bot, message);
        }
    });
    // 新成员加入服务器事件
    bot.on("guildMemberAdd", async member => {
        const channel = member.guild.channels.find(c => c.name === "amusingkeypad");
        if(channel)
        {
            channel.send(`Welcome to the server, ${member}`);
        }
    });
    // 登陆机器人
    bot.login(bot.configs.get("token"));
})
.catch(error => {   // 错误处理
    console.error(`[Error] ${error.message}`);
});