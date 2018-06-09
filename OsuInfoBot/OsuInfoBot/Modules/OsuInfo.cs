using Discord;
using Discord.Commands;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OsuInfoBot.Modules
{
    public class OsuInfo : ModuleBase<SocketCommandContext>
    {
        [Command("stat")]
        public async Task UserSelf()
        {
            await ReplyAsync("undefined!");
        }
        
        [Command("help")]
        public async Task HelpInfo()
        {
            List<string> cmdInfo = new List<string>
            {
                "!s  <user> : Show osu!Standard info",
                "!t  <user> : Show osu!Taiko info",
                "!c  <user> : Show osu!Catch info",
                "!m  <user> : Show osu!Mania info",
                "!r  <user> : Show last Play Recent in 24 hours",
                "!pr <user> : Show last PerfectPlay in 24 hours",
                "!tr <user> : Show best Play Recent in 24 hours"
            };

            EmbedBuilder msgBuilder = new EmbedBuilder();
            msgBuilder.WithTitle("Command Info:")
                .WithDescription(string.Join("\r\n",cmdInfo))
                .WithColor(Color.Orange);

            await Context.Channel.SendMessageAsync("", false, msgBuilder.Build());
        }

        [Command("StatStandard")]
        [Alias("s", "std", "stat")]
        public async Task GetStandard([Remainder]string osuID)
        {
            await PrintUser(osuID.Trim('"'), 0);
        }
        [Command("StatTaiko")]
        [Alias("t", "takio")]
        public async Task GetTaiko([Remainder]string osuID)
        {
            await PrintUser(osuID.Trim('"'), 1);
        }
        [Command("StatCatch")]
        [Alias("c", "ctb", "catch")]
        public async Task GetCatch([Remainder]string osuID)
        {
            await PrintUser(osuID.Trim('"'), 2);
        }
        [Command("StatMania")]
        [Alias("m", "mania")]
        public async Task GetMania([Remainder]string osuID)
        {
            await PrintUser(osuID.Trim('"'), 3);
        }

        private async Task PrintUser(string userName, int mode = 0)
        {
            EmbedBuilder msgBuilder = new EmbedBuilder();

            string StdJson = await OsuAPI.GetUser(userName.Trim('"'), mode);
            string ModeVal = "";
            switch (mode)
            {
                default:
                case 0: ModeVal = "osu!standard"; break;
                case 1: ModeVal = "osu!taiko"; break;
                case 2: ModeVal = "osu!catch"; break;
                case 3: ModeVal = "osu!mania"; break;
            }

            if (StdJson == "[]")
            {
                msgBuilder.WithDescription($"{Context.User.Mention} Undefined This User!")
                    .WithColor(Color.Red);
                await ReplyAsync("", false, msgBuilder.Build());
            }
            else
            {
                JObject StdInfo = (JObject)JArray.Parse(StdJson)[0];
                string Rank = StdInfo["pp_rank"].ToString() == "" ? "null" : $"#_{StdInfo["pp_rank"]}_";
                string Acc = StdInfo["accuracy"].ToString() == "" ? "null" : $"_{string.Format("{0:P}", float.Parse(StdInfo["accuracy"].ToString()) / 100)}_";
                string Level = StdInfo["level"].ToString() == "" ? "null" : $"_{StdInfo["level"].ToString().Split(".")[0]} ({string.Format("{0:P}", float.Parse(StdInfo["accuracy"].ToString()) % 1)})_";
                msgBuilder.WithAuthor($"{StdInfo["username"]}", $"http://a.ppy.sh/{StdInfo["user_id"]}?.jpg", $"http://osu.ppy.sh/users/{StdInfo["user_id"]}")
                    .WithTitle(ModeVal)
                    .WithDescription($"**Rank**: {Rank}\r\n**Accuracy**: {Acc}\r\n**Level**: {Level}")
                    .WithColor(Color.Blue);
                await ReplyAsync("", false, msgBuilder.Build());
            }
        }
    }
}
