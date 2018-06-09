using Newtonsoft.Json.Linq;
using SixLabors.Fonts;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Processing.Drawing;
using SixLabors.ImageSharp.Processing.Overlays;
using SixLabors.ImageSharp.Processing.Text;
using SixLabors.ImageSharp.Processing.Transforms;
using SixLabors.Primitives;
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace OsuInfoBot.Modules
{
    class OsuQuery
    {
        /// <summary>
        /// 获取osu!皮肤
        /// </summary>
        /// <returns>返回皮肤的Hashtable表</returns>
        public static Hashtable GetSkin()
        {
            string SkinPath = @"Skins\";
            string Default = @"default";
            Hashtable Skin = new Hashtable();
            List<FileInfo> DefaultSkin = new List<FileInfo>((new DirectoryInfo(SkinPath + Default)).GetFiles());
            DefaultSkin.ForEach(file => { Skin[file.Name.ToLower()] = file.FullName; });
            List<DirectoryInfo> Skins = new List<DirectoryInfo>((new DirectoryInfo(SkinPath)).GetDirectories());
            if (Skins.Count > 1)
            {
                Skins.RemoveAll(x => x.Name == Default);
                List<FileInfo> SelectSkin = new List<FileInfo>(Skins[(new Random()).Next(Skins.Count)].GetFiles());
                SelectSkin.ForEach(file => { Skin[file.Name.ToLower()] = file.FullName; });
            }

            return Skin;
        }

        /// <summary>
        /// 获取osu!最近的游戏成绩
        /// </summary>
        /// <param name="userID">玩家名</param>
        /// <param name="mode">游戏模式</param>
        /// <param name="perfect">结果(0=last,1=perfect,2=top)</param>
        /// <returns></returns>
        public static async Task<string> GetUserRecentImg(string userID, int mode, int perfect = 0)
        {
            // 获取玩家基本信息
            string UserInfos = await OsuAPI.GetUser(userID.Trim('"'), mode);
            if (UserInfos == "[]" || UserInfos == "" || UserInfos == null)
            {
                Console.WriteLine($"用户名 <{userID.Trim('"')}> 不存在!");
                return $"[Error]Username <{userID.Trim('"')}> does not exist!";
            }
            else if (UserInfos == "[NetworkError]")
            {
                return "[Error]Data search failed!";
            }
            JObject UserINF = (JObject)JArray.Parse(UserInfos)[0];

            // 获取玩家近期游戏信息
            string UserRecents = await OsuAPI.GetUserRecent(UserINF["username"].ToString(), mode, "string");
            if (UserRecents == "[]" || UserInfos == "" || UserInfos == null)
            {
                Console.WriteLine($"<{userID.Trim('"')}> 在24小时内没有游戏记录!");
                return $"[Error]<{userID.Trim('"')}> didn't play osu! in 24 hours.";
            }
            else if (UserInfos == "[NetworkError]")
            {
                return "[Error]Data search failed!";
            }
            JArray RecentInfo = JArray.Parse(UserRecents);
            JObject RecINF = null;
            switch (perfect)
            {
                case 1:
                    foreach (var info in RecentInfo)
                    {
                        if (info["perfect"].ToString() == "1")
                        {
                            RecINF = (JObject)info;
                            break;
                        }
                    }
                    if (RecINF == null)
                    {
                        Console.WriteLine("该用户最近没有FC记录!");
                        return "[Error]This user didn't full combo any beatmap in 24 hours.";
                    }
                    break;
                case 2:
                    List<decimal> rlist = new List<decimal>();
                    foreach (var info in RecentInfo)
                    {
                        if (info["rank"].ToString() != "F") rlist.Add(decimal.Parse((string)info["score"]));
                    }
                    if (rlist.Count == 0)
                    {
                        foreach (var info in RecentInfo)
                        {
                            rlist.Add(decimal.Parse((string)info["score"]));
                        }
                    }
                    foreach (var info in RecentInfo)
                    {
                        if (decimal.Parse((string)info["score"]) == rlist.Max())
                        {
                            RecINF = (JObject)info;
                            break;
                        }
                    }
                    break;
                default:
                    RecINF = (JObject)RecentInfo[0];
                    break;
            }
            // 加载渲染字体
            var Aller_Light = new FontCollection().Install($"{Directory.GetCurrentDirectory()}\\Fonts\\Aller_Lt.TTF");
            var Aller = new FontCollection().Install($"{Directory.GetCurrentDirectory()}\\Fonts\\Aller_Rg.TTF");
            var MS_YaHei = new FontCollection().Install($"{Directory.GetCurrentDirectory()}\\Fonts\\MicrosoftYaHeiUI.ttf");
            // 创建画布
            using (Image<Rgba32> image = new Image<Rgba32>(1366, 768))
            {
                // 获取皮肤 Hashtable
                Hashtable Skin = await Task.Run(() => GetSkin());
                // 获取beatmap背景图
                var beatmapBG = Image.Load((string)Skin["beatmapbg.jpg"]);
                var beatmapStream = await OsuAPI.GetBeatmapBG(RecINF["beatmap_id"].ToString());
                if (beatmapStream != null) beatmapBG = Image.Load(beatmapStream);
                beatmapBG.Mutate(x => x.Resize(1366, 768, true));
                // 获取beatmap信息
                string mapInfos = await OsuAPI.GetBeatmaps(0, RecINF["beatmap_id"].ToString());
                if (mapInfos == "[]") return "";
                if (mapInfos == "[]" || mapInfos == "" || mapInfos == null || mapInfos == "[NetworkError]")
                {
                    Console.WriteLine("获取地图信息失败!");
                    return "[Error]Beatmap Data search failed!";
                }
                JObject MapINF = (JObject)JArray.Parse(mapInfos)[0];

                // 设置画布背景色
                image.Mutate(x => x.BackgroundColor(new Rgba32(0F, 0F, 0F, 0.4F)));
                // 叠加画布装饰图
                var ranking_panel = Image.Load((string)Skin["ranking-panel.png"]);
                image.Mutate(x => x.DrawImage(ranking_panel, PixelBlenderMode.Normal, 1F, new Point(0, 100)));

                // 构造标题栏容器
                var titleBar = new Image<Rgba32>(1366, 96);
                titleBar.Mutate(x => x.BackgroundColor(new Rgba32(0F, 0F, 0F, 0.8F)));
                // 设置标题文字
                var title = $"{MapINF["artist"]} - {MapINF["title"]} [{MapINF["version"]}]";
                titleBar.Mutate(x => x.DrawText(title, new Font(Aller_Light, (float)30.3), Rgba32.White, new PointF(5, 5)));
                // 设置作者文字
                var author = $"Beatmap by {MapINF["creator"]}";
                titleBar.Mutate(x => x.DrawText(author, new Font(Aller, 22), Rgba32.White, new PointF(5, 36)));
                // 设置游戏时间
                var playtime = $"Played by {UserINF["username"]} on {RecINF["date"].ToString().Replace('-', '/')}.";
                titleBar.Mutate(x => x.DrawText(playtime, new Font(MS_YaHei, 22), Rgba32.White, new PointF(5, 59)));
                // 将标题栏叠加到画布
                image.Mutate(x => x.DrawImage(titleBar, PixelBlenderMode.Normal, 1F, new Point(0, 0)));
                // 回收标题栏容器
                titleBar.Dispose();

                // 绘制Back图标[左下角]
                var menu_back = Image.Load((string)Skin["menu-back.png"]);
                image.Mutate(x => x.DrawImage(menu_back, PixelBlenderMode.Normal, 1F, new Point(0, image.Height - menu_back.Height)));
                // 绘制Ranking图表框[左下居中]
                var ranking_graph = Image.Load((string)Skin["ranking-graph.png"]);
                image.Mutate(x => x.DrawImage(ranking_graph, PixelBlenderMode.Normal, 1F, new Point(275, image.Height - 160)));
                // 绘制Ranking标题图[右上角]
                var ranking_title = Image.Load((string)Skin["ranking-title.png"]);
                image.Mutate(x => x.DrawImage(ranking_title, PixelBlenderMode.Normal, 1F, new Point(image.Width - ranking_title.Width - 33, 0)));

                // 绘制Score
                var scoreVal = $"{Int32.Parse((string)RecINF["score"]):D8}";
                for (int i = 0; i < scoreVal.Length; ++i)
                {
                    var scoreIMG = Image.Load((string)Skin[$"score-{scoreVal[i]}.png"]);
                    scoreIMG.Mutate(x => x.Resize(51, 65, true));
                    image.Mutate(x => x.DrawImage(scoreIMG, PixelBlenderMode.Normal, 1F, new Point(133 + 55 * i, 118)));
                }
                // 绘制Combo
                var hit300 = Image.Load((string)Skin["hit300.png"]);
                hit300.Mutate(x => x.Resize(64, 64));
                image.Mutate(x => x.DrawImage(hit300, PixelBlenderMode.Normal, 1F, new Point(32, 224)));
                var hit100 = Image.Load((string)Skin["hit100.png"]);
                hit100.Mutate(x => x.Resize(64, 64));
                image.Mutate(x => x.DrawImage(hit100, PixelBlenderMode.Normal, 1F, new Point(32, 320)));
                var hit50 = Image.Load((string)Skin["hit50.png"]);
                hit50.Mutate(x => x.Resize(64, 64));
                image.Mutate(x => x.DrawImage(hit50, PixelBlenderMode.Normal, 1F, new Point(32, 416)));
                var hit300k = Image.Load((string)Skin["hit300g.png"]);
                hit300k.Mutate(x => x.Resize(64, 64));
                image.Mutate(x => x.DrawImage(hit300k, PixelBlenderMode.Normal, 1F, new Point(352, 224)));
                var hit100k = Image.Load((string)Skin["hit100k.png"]);
                hit100k.Mutate(x => x.Resize(64, 64));
                image.Mutate(x => x.DrawImage(hit100k, PixelBlenderMode.Normal, 1F, new Point(352, 320)));
                var hit0 = Image.Load((string)Skin["hit0.png"]);
                hit0.Mutate(x => x.Resize(64, 64));
                image.Mutate(x => x.DrawImage(hit0, PixelBlenderMode.Normal, 1F, new Point(352, 416)));
                var count300 = RecINF["count300"].ToString() + "x";
                for (int i = 0; i < count300.Length; ++i)
                {
                    var comboIMG = Image.Load((string)Skin[$"score-{count300[i]}.png"]);
                    comboIMG.Mutate(x => x.Resize(45, 57, true));
                    image.Mutate(x => x.DrawImage(comboIMG, PixelBlenderMode.Normal, 1F, new Point(128 + 45 * i, 230)));
                }
                var count100 = RecINF["count100"].ToString() + "x";
                for (int i = 0; i < count100.Length; ++i)
                {
                    var comboIMG = Image.Load((string)Skin[$"score-{count100[i]}.png"]);
                    comboIMG.Mutate(x => x.Resize(45, 57, true));
                    image.Mutate(x => x.DrawImage(comboIMG, PixelBlenderMode.Normal, 1F, new Point(128 + 45 * i, 326)));
                }
                var count50 = RecINF["count50"].ToString() + "x";
                for (int i = 0; i < count50.Length; ++i)
                {
                    var comboIMG = Image.Load((string)Skin[$"score-{count50[i]}.png"]);
                    comboIMG.Mutate(x => x.Resize(45, 57, true));
                    image.Mutate(x => x.DrawImage(comboIMG, PixelBlenderMode.Normal, 1F, new Point(128 + 45 * i, 422)));
                }
                var countgeki = RecINF["countgeki"].ToString() + "x";
                for (int i = 0; i < countgeki.Length; ++i)
                {
                    var comboIMG = Image.Load((string)Skin[$"score-{countgeki[i]}.png"]);
                    comboIMG.Mutate(x => x.Resize(45, 57, true));
                    image.Mutate(x => x.DrawImage(comboIMG, PixelBlenderMode.Normal, 1F, new Point(448 + 45 * i, 230)));
                }
                var countkatu = RecINF["countkatu"].ToString() + "x";
                for (int i = 0; i < countkatu.Length; ++i)
                {
                    var comboIMG = Image.Load((string)Skin[$"score-{countkatu[i]}.png"]);
                    comboIMG.Mutate(x => x.Resize(45, 57, true));
                    image.Mutate(x => x.DrawImage(comboIMG, PixelBlenderMode.Normal, 1F, new Point(448 + 45 * i, 326)));
                }
                var countmiss = RecINF["countmiss"].ToString() + "x";
                for (int i = 0; i < countmiss.Length; ++i)
                {
                    var comboIMG = Image.Load((string)Skin[$"score-{countmiss[i]}.png"]);
                    comboIMG.Mutate(x => x.Resize(45, 57, true));
                    image.Mutate(x => x.DrawImage(comboIMG, PixelBlenderMode.Normal, 1F, new Point(448 + 45 * i, 422)));
                }
                var maxcombo = RecINF["maxcombo"].ToString() + "x";
                for (int i = 0; i < maxcombo.Length; ++i)
                {
                    var comboIMG = Image.Load((string)Skin[$"score-{maxcombo[i]}.png"]);
                    comboIMG.Mutate(x => x.Resize(45, 57, true));
                    image.Mutate(x => x.DrawImage(comboIMG, PixelBlenderMode.Normal, 1F, new Point(24 + 45 * i, 528)));
                }
                // 计算并绘制ACC
                var accValue = (6 * float.Parse(RecINF["count300"].ToString()) + 2 * float.Parse(RecINF["count100"].ToString()) + float.Parse(RecINF["count50"].ToString()))
                                / (6 * (float.Parse(RecINF["count300"].ToString()) + float.Parse(RecINF["count100"].ToString()) + float.Parse(RecINF["count50"].ToString()) + float.Parse(RecINF["countmiss"].ToString())));
                var accuracy = string.Format("{0:P}", accValue);
                int accImgWidth = 310;
                for (int i = 0; i < accuracy.Length; ++i)
                {
                    string AccImgPath = accuracy[i].ToString();
                    if (AccImgPath == ".") AccImgPath = "dot";
                    if (AccImgPath == "%") AccImgPath = "percent";
                    var comboIMG = Image.Load((string)Skin[$"score-{AccImgPath}.png"]);
                    comboIMG.Mutate(x => x.Resize((int)(comboIMG.Width * 1.125), (int)(comboIMG.Height * 1.125)));
                    image.Mutate(x => x.DrawImage(comboIMG, PixelBlenderMode.Normal, 1F, new Point(accImgWidth, 528)));
                    accImgWidth += comboIMG.Width;
                }
                // 绘制PerfectPlay图标
                if (RecINF["perfect"].ToString() == "1")
                {
                    var ranking_perfect = Image.Load((string)Skin["ranking-perfect.png"]);
                    image.Mutate(x => x.DrawImage(ranking_perfect, PixelBlenderMode.Normal, 1F, new Point(266, 638)));
                }

                // 绘制Rank评价
                var rank = RecINF["rank"].ToString().ToLower();
                var rankIMG = Image.Load((string)Skin[$"ranking-{rank}.png"]);
                image.Mutate(x => x.DrawImage(rankIMG, PixelBlenderMode.Normal, 1F, new Point(image.Width - rankIMG.Width - 7, 109)));
                // 绘制Mods图标
                var enabled_mods = Int32.Parse(RecINF["enabled_mods"].ToString());
                var modPoint = new Point(1262, 376);
                foreach (Int32 mod in Enum.GetValues(typeof(OsuAPI.Mods)))
                {
                    if ((enabled_mods & mod) != 0)
                    {
                        string modName = Enum.GetName(typeof(OsuAPI.Mods), mod).ToLower();
                        if (modName == "keyMod".ToLower() || modName == "FreeModAllowed".ToLower()) continue;
                        string modimage = (string)Skin[$"selection-mod-{modName}.png"];
                        if (modimage == null) continue;
                        var modIMG = Image.Load(modimage);
                        image.Mutate(x => x.DrawImage(modIMG, PixelBlenderMode.Normal, 1F, modPoint));
                        modPoint.X = modPoint.X - 32;
                    }
                }

                // 绘制Replay图标
                var replayIMG = Image.Load((string)Skin["pause-replay.png"]);
                image.Mutate(x => x.DrawImage(replayIMG, PixelBlenderMode.Normal, 1F, new Point(image.Width - rankIMG.Width, 518)));

                // 绘制Online-Users图标
                var onlineUsersIMG = Image.Load((string)Skin["online-users.png"]);
                image.Mutate(x => x.DrawImage(onlineUsersIMG, PixelBlenderMode.Normal, 1F, new Point(image.Width - onlineUsersIMG.Width - 99, image.Height - onlineUsersIMG.Height)));
                // 绘制Show-Chat图标
                var showChatIMG = Image.Load((string)Skin["show-chat.png"]);
                image.Mutate(x => x.DrawImage(showChatIMG, PixelBlenderMode.Normal, 1F, new Point(image.Width - showChatIMG.Width - 3, image.Height - showChatIMG.Height)));
                // 绘制latency延迟图标
                var latencyIMG = Image.Load((string)Skin["latency.png"]);
                image.Mutate(x => x.DrawImage(latencyIMG, PixelBlenderMode.Normal, 1F, new Point(image.Width - latencyIMG.Width - 4, image.Height - latencyIMG.Height - 25)));
                // 绘制fps帧率图标
                var fpsIMG = Image.Load((string)Skin["fps.png"]);
                image.Mutate(x => x.DrawImage(fpsIMG, PixelBlenderMode.Normal, 1F, new Point(image.Width - fpsIMG.Width - 4, image.Height - fpsIMG.Height - 49)));

                // 将画布叠加到背景图前面
                beatmapBG.Mutate(x => x.DrawImage(image, PixelBlenderMode.Normal, 1F, new Point(0, 0)));
                beatmapBG.Save("RecentSnapshot.jpg");    // 保存合成的图片
            }

            return "RecentSnapshot.jpg";
        }
    }
}
