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
        }
        console.log(`CONFIGS: ${JSON.stringify(botcfgs)}`);
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
            let loadlist = {};
            jsfiles.forEach((f, i) => {
                loadlist[`${i + 1}`] = `${f}`;

                let props = require(`./commands/${f}`);
                let command = props.help.name;
                if(command) bot.commands.set(command, props);
                let alias = props.help.alias;
                if(alias instanceof Array){
                    alias.forEach(function(x){
                        bot.commands.set(x, props);
                    });
                } 
            });
            console.log(`_CommandFiles:` + JSON.stringify(loadlist));                       // 输出已加载文件列表
            console.log(`_Commands:` + JSON.stringify(Array.from(bot.commands.keys())));    // 打印命令列表到日志
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
            let loadlist = {};
            jsfiles.forEach((f, i) => {
                loadlist[`${i + 1}`] = `${f}`;

                let props = require(`./plugins/${f}`);
                let plugin = props.help.name;
                if(plugin) bot.plugins.set(plugin, props);
                let alias = props.help.alias;
                if(alias instanceof Array){
                    alias.forEach(function(x){
                        bot.plugins.set(x, props);
                    });
                } 
            });
            console.log(`_PluginFiles:` + JSON.stringify(loadlist));                    // 输出已加载文件列表
            console.log(`_Plugins:` + JSON.stringify(Array.from(bot.plugins.keys())));  // 打印插件列表到日志
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
        
        if(bot.configs.get('route') == 'Test Server'){  // 测试代码块,仅允许测试服运行
            let test = require(`./test_image.js`);
            console.debug(`[${test.help.name}] is running...`);
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

        // 机器人命令响应总开关(特殊允许!ping响应，以测试机器人是否开始工作)
        if((botcfgs.switch == "false") && (!command.startsWith("!ping"))) return;
        // 执行前缀匹配的命令
        if(command.startsWith(prefix)){
            let cmd = bot.commands.get(command.slice(prefix.length));
            if(cmd) cmd.run(bot, message, args);
        }
        // 遍历并运行所有插件
        for(let plugin of Array.from(bot.plugins.keys())){
            if(bot.configs.get("plugins")[plugin] == "false") continue;
            bot.plugins.get(plugin).run(bot, message);
        }
    });
    // 新成员加入服务器事件
    bot.on("guildMemberAdd", async member => {
        const channel = member.guild.channels.find(c => c.name === "general");
        if(channel)
        {
            channel.send(
                `Welcome to the server, ${member}`
                +`\nPlease set _nickname_ to **[country|language] osu!name**.`
                +`\nInput _!help_ to get my command list.`
            );
        }
    });
    // 错误输出
    bot.on('error',error =>{
        console.error(`[BotError] ${error}`);
    });
    // 登陆机器人
    bot.login(bot.configs.get("token"));
})
.catch(error => {   // 错误处理
    console.error(`[Error] ${error.message}`);
});