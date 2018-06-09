using System;
using System.IO;
using System.Net;
using System.Threading.Tasks;

namespace OsuInfoBot.Modules
{
    public class OsuAPI
    {
        private const string apiKey = "66c7d763525ff6c9f8c4b2a4417c69535e92d8d2";

        // 获取网址字符串数据
        public static async Task<string> GetUrl(string url)
        {
            string resultString = "[]";
            try
            {
                using (var client = new WebClient())
                {
                    resultString = await client.DownloadStringTaskAsync(url);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine($"GetUrl Failed:{e.Message}");
                resultString = "[NetworkError]";
            }
            return resultString;
        }
        // 获取网址流数据
        public static async Task<Stream> GetStream(string url)
        {
            Stream resultStream = null;
            try
            {
                using (var client = new WebClient())
                {
                    resultStream = await client.OpenReadTaskAsync(url);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine($"GetStream Failed:{e.Message}");
            }
            return resultStream;
        }
        // 获取用户数据
        public static async Task<string> GetUser(string userID, int mode, string type = "")
        {
            if (type != "") type = "&type=" + type;
            string url = $"https://osu.ppy.sh/api/get_user?k={apiKey}&m={mode}&u={userID}{type}";
            return await GetUrl(url);
        }
        // 获取用户游戏回放
        public static async Task<string> GetUserRecent(string userID, int mode, string type="")
        {
            if (type != "") type = "&type=" + type;
            string url = $"https://osu.ppy.sh/api/get_user_recent?k={apiKey}&m={mode}&u={userID}{type}";
            return await GetUrl(url);
        }
        // 获取Beatmaps
        public static async Task<string> GetBeatmaps(int mode, string BeatmapID)
        {
            //string mapID = (BeatmapID == "" ? "" : $"&b={BeatmapID}") + (SetID == "" ? "" : $"&s={SetID}");
            string url = $"https://osu.ppy.sh/api/get_beatmaps?k={apiKey}&m={mode}&b={BeatmapID}";
            return await GetUrl(url);
        }
        // 获取Beatmap得分排行榜
        public static async Task<string> GetScores(int mode, string BeatmapID)
        {
            string url = $"https://osu.ppy.sh/api/get_scores?k={apiKey}&m={mode}&b={BeatmapID}";
            return await GetUrl(url);
        }
        // 获取Beatmap背景图
        public static async Task<Stream> GetBeatmapBG(string BeatmapID)
        {
            string url = $"http://bloodcat.com/osu/i/{BeatmapID}";
            return await GetStream(url);
        }

        public enum Mods
        {
            None = 0,
            NoFail = 1,
            Easy = 2,
            NoVideo = 4,        // 不再使用，但可以在b/78239上的Mesita这样的老游戏中找到
            Hidden = 8,
            HardRock = 16,
            SuddenDeath = 32,
            DoubleTime = 64,
            Relax = 128,
            HalfTime = 256,
            Nightcore = 512,    // 只能与DoubleTime一起设置。 即：NC仅给出576
            Flashlight = 1024,
            Autoplay = 2048,
            SpunOut = 4096,
            Relax2 = 8192,      // Autopilot?
            Perfect = 16384,    // 只与SuddenDeath一起设置。 即：PF只给出16416
            Key4 = 32768,
            Key5 = 65536,
            Key6 = 131072,
            Key7 = 262144,
            Key8 = 524288,
            keyMod = Key4 | Key5 | Key6 | Key7 | Key8,
            FadeIn = 1048576,
            Random = 2097152,
            LastMod = 4194304,
            FreeModAllowed = NoFail | Easy | Hidden | HardRock | SuddenDeath | Flashlight | FadeIn | Relax | Relax2 | SpunOut | keyMod,
            Key9 = 16777216,
            Key10 = 33554432,
            Key1 = 67108864,
            Key3 = 134217728,
            Key2 = 268435456
        }
    }
}
