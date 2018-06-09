using Discord;
using Discord.Commands;
using Discord.WebSocket;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Reflection;
using System.Threading.Tasks;

namespace OsuInfoBot
{
    class Program
    {
        static void Main(string[] args) => new Program().BotAsync().GetAwaiter().GetResult();

        private DiscordSocketClient BotClient;
        private CommandService BotCommands;
        private IServiceProvider services;

        public async Task BotAsync()
        {
            BotClient = new DiscordSocketClient();
            BotCommands = new CommandService();
            services = new ServiceCollection()
                .AddSingleton(BotClient)
                .AddSingleton(BotCommands)
                .BuildServiceProvider();

            string botToken = "NDUxNjIyMzk5ODY0MjA5NDE4.DfEd4A.E_lZQ1okMLRqRf3NUD0caSmVfTs";

            BotClient.Log += Log;
            BotClient.UserJoined += UserJoined;
            // 将命令处理逻辑集中到一个分离的方法
            await RegisterCommandsAsync();
            // 登录和连接.
            await BotClient.LoginAsync(TokenType.Bot, botToken);
            await BotClient.StartAsync();
            // 无限期等待任务直到程序关闭
            await Task.Delay(-1);
        }

        // 输出DiscordBot日志信息
        private Task Log(LogMessage msg)
        {
            var cc = Console.ForegroundColor;
            switch (msg.Severity)
            {
                case LogSeverity.Critical:
                case LogSeverity.Error:
                    Console.ForegroundColor = ConsoleColor.Red;
                    break;
                case LogSeverity.Warning:
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    break;
                case LogSeverity.Info:
                    Console.ForegroundColor = ConsoleColor.White;
                    break;
                case LogSeverity.Verbose:
                case LogSeverity.Debug:
                    Console.ForegroundColor = ConsoleColor.DarkGray;
                    break;
            }
            Console.WriteLine($"{DateTime.Now,-19} [{msg.Severity,8}] {msg.Source}: {msg.Message}");
            Console.ForegroundColor = cc;

            return Task.CompletedTask;
        }

        // 新用户加入聊天室提示
        private async Task UserJoined(SocketGuildUser user)
        {
            var channel = user.Guild.DefaultChannel;
            EmbedBuilder welcome = new EmbedBuilder();
            welcome.WithTitle($"Welcome, {user.Mention}")
                .WithDescription("Please set your nickname to osu! name.")
                .WithColor(Color.Purple);
            await channel.SendMessageAsync("", false, welcome.Build());
        }
        
        // 注册命令处理程序
        public async Task RegisterCommandsAsync()
        {
            // 将MessageReceived事件连接到我们的命令处理程序
            BotClient.MessageReceived += HandleCommandAsync;
            // 发现该程序集中的所有命令并加载它们
            await BotCommands.AddModulesAsync(Assembly.GetEntryAssembly());
        }

        // 异步命令处理
        private async Task HandleCommandAsync(SocketMessage arg)
        {
            // 如果是系统消息，则不处理该命令
            var message = arg as SocketUserMessage;
            // 消息内容为空或消息发送者是机器人，则不处理该命令
            if (message is null || message.Author.IsBot) return;
            // 创建一个数字来跟踪前缀结束和命令开始的位置
            int argPos = 0;
            // 确定消息是否是一个命令，基于它是否以“!”开头或提及Bot名称
            if (message.HasStringPrefix("!", ref argPos) || message.HasMentionPrefix(BotClient.CurrentUser, ref argPos))
            {
                // 创建命令上下文
                var context = new SocketCommandContext(BotClient, message);
                // 执行该命令（结果不表示返回值，而是表示命令是否成功执行的对象）
                var result = await BotCommands.ExecuteAsync(context, argPos, services);
                // 如果命令执行失败，将错误信息输出到控制台
                if (!result.IsSuccess) Console.WriteLine(result.ErrorReason);
            }
        }
    }
}
