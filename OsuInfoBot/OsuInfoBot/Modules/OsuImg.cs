using Discord;
using Discord.Commands;
using System;
using System.Collections;
using System.Threading.Tasks;

namespace OsuInfoBot.Modules
{
    public class OsuImg : ModuleBase<SocketCommandContext>
    {
        [Command("Recent", RunMode = RunMode.Async)]        // 添加 RunMode = RunMode.Async 使命令以异步方式运行
        [Alias("r","rec")]                                  // 命令别称
        [Summary("输出玩家最近的一次游戏记录")]             // 命令介绍
        public async Task GetRecent([Remainder]string osuID)
        {
            EmbedBuilder msgBuilder = new EmbedBuilder();
            msgBuilder.WithTitle("Query running, please wait..").WithColor(Color.Orange);
            var msg = await ReplyAsync("", false, msgBuilder.Build());

            string img = await OsuQuery.GetUserRecentImg(osuID, 0);
            if (img.StartsWith("[Error]"))
            {
                msgBuilder.WithTitle(img).WithColor(Color.Red);
                await msg.ModifyAsync(x => x.Embed = msgBuilder.Build());
            }
            else
            {
                await Context.Channel.SendFileAsync(img);
                msgBuilder.WithTitle("Query completed successfully!").WithColor(Color.Green);
                await msg.ModifyAsync(x => x.Embed = msgBuilder.Build());
            }
        }

        [Command("PerfectRecent", RunMode = RunMode.Async)]
        [Alias("pr", "prec")]
        [Summary("输出玩家最近的一次全连击游戏记录")]
        public async Task GetPerfectRecent([Remainder]string osuID)
        {
            EmbedBuilder msgBuilder = new EmbedBuilder();
            msgBuilder.WithTitle("Query running, please wait..").WithColor(Color.Orange);
            var msg = await ReplyAsync("", false, msgBuilder.Build());

            string img = await OsuQuery.GetUserRecentImg(osuID, 0, 1);
            if (img.StartsWith("[Error]"))
            {
                msgBuilder.WithTitle(img).WithColor(Color.Red);
                await msg.ModifyAsync(x => x.Embed = msgBuilder.Build());
            }
            else
            {
                await Context.Channel.SendFileAsync(img);
                msgBuilder.WithTitle("Query completed successfully!").WithColor(Color.Green);
                await msg.ModifyAsync(x => x.Embed = msgBuilder.Build());
            }
        }

        [Command("TopRecent", RunMode = RunMode.Async)]
        [Alias("tr", "trec")]
        [Summary("输出玩家24小时内最佳游戏记录")]
        public async Task GetTopRecent([Remainder]string osuID)
        {
            EmbedBuilder msgBuilder = new EmbedBuilder();
            msgBuilder.WithTitle("Query running, please wait..").WithColor(Color.Orange);
            var msg = await ReplyAsync("", false, msgBuilder.Build());

            string img = await OsuQuery.GetUserRecentImg(osuID, 0, 2);
            if (img.StartsWith("[Error]"))
            {
                msgBuilder.WithTitle(img).WithColor(Color.Red);
                await msg.ModifyAsync(x => x.Embed = msgBuilder.Build());
            }
            else
            {
                await Context.Channel.SendFileAsync(img);
                msgBuilder.WithTitle("Query completed successfully!").WithColor(Color.Green);
                await msg.ModifyAsync(x => x.Embed = msgBuilder.Build());
            }
        }

        [Command("SkinList")]
        [Summary("测试命令，用于调试功能")]
        public async Task PrintSkins()
        {
            Hashtable Skin = await Task.Run(() => OsuQuery.GetSkin());
            string[] skinFiles = new string[Skin.Count];
            Skin.Keys.CopyTo(skinFiles, 0);
            Console.WriteLine(string.Join("\r\n", skinFiles));
        }
    }
}
