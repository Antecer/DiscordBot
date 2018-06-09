using Discord;
using Discord.Commands;
using System.Diagnostics;
using System.Threading.Tasks;

namespace OsuInfoBot.Modules
{
    public class Ping : ModuleBase<SocketCommandContext>
    {
        [Command("ping")]
        public async Task PingAsync()
        {
            Color color = Color.DarkGrey;
            int ping = Context.Client.Latency;
            if (ping < 20) color = Color.Blue;
            else if (ping < 100) color = Color.Green;
            else if (100 <= ping && ping < 500) color = Color.Orange;
            else if (500 <= ping && ping < 2000) color = Color.Red;

            EmbedBuilder msgBuilder = new EmbedBuilder();
            msgBuilder.WithDescription(
                $"{Context.User.Mention}\r\n" +
                $"**Bot Latency**: _{ping}ms_\r\n" +
                $"**Response**: _..._")
                .WithColor(color);

            var sw = Stopwatch.StartNew();
            var msg = await ReplyAsync("", false, msgBuilder.Build());
            sw.Stop();

            var relt = sw.Elapsed.TotalMilliseconds;
            if (relt < 20) color = Color.Blue;
            else if (relt < 100) color = Color.Green;
            else if (100 <= relt && relt < 500) color = Color.Orange;
            else if (500 <= relt && relt < 2000) color = Color.Red;
            msgBuilder.WithDescription(
                $"{Context.User.Mention}\r\n" +
                $"**Bot Latency**: _{ping}ms_\r\n" +
                $"**Response**: _{string.Format("{0:#.#}", relt)}ms_")
                .WithColor(color);

            await msg.ModifyAsync(x => x.Embed = msgBuilder.Build());
        }
    }
}
