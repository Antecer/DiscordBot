const https = require('https');
const fs = require("fs");
const sharp = require('sharp');

const osuskins = process.cwd() + '/osuapi/skins/';
const osubgapi = 'https://bloodcat.com/osu/i/';
const osumods = require(process.cwd() + `/osuapi/mods.json`);
var modnames = [];
for(let k in osumods){ modnames.push(k); }

const recpath = process.cwd() + '/osuapi/recimg/recent.jpg';
const Aller_Light_Path = process.cwd() + '/osuapi/fonts/Aller_Std_Lt.ttf';
const Aller_Regular_Path = process.cwd() + '/fonts/Aller_Std_Rg.ttf';
const MicrosoftYaHeiUI_Path = process.cwd() + '/fonts/MicrosoftYaHeiUI.ttf';
const testcfgs = require(`./debugdata.json`);


module.exports.run = async () => {};
module.exports.help = {
    name: "Test Task"
}

// 配置测试参数
const apikey = testcfgs['apikey'];
const userid = 'Kongdyy';
const mode = '0';
const type = 'string';
const event_days = '1';
const perfect = 2;
// 载入skin皮肤文件
var skins = {}, skin = {};
fs.readdirSync(osuskins).filter(f => f.indexOf('.') < 0).forEach(skin =>{
    skins[skin] = {};
    let skinfiles = fs.readdirSync(`${osuskins}${skin}`);
    skinfiles.forEach(file => {
        skins[skin][file.split('.')[0].toLowerCase()] = `${osuskins}${skin}/${file}`;
    });
});
// 加载默认主题皮肤
for(let key in skins['default']){
    skin[key] = skins['default'][key];
}
// 随机选取主题皮肤
let index = Math.floor(Math.random()*Object.keys(skins).length);
for(let key in skins){
    if(--index < 0){
        for(k in skins[key]){
            skin[k] = skins[key][k];
        }
        console.debug(`[Test Task] skin '${key}' is selected!`);
        break;
    }
}

// 获取玩家信息
let get_user_func = new Promise((resolve, reject) => {
    if (type === "string") resolve(`[{"username":"${userid}"}]`);
    let url = `https://osu.ppy.sh/api/get_user?&k=${apikey}&u=${userid}&m=${mode}&type=${type}&event_days=${"1"}`;
    https.get(url, res => {
        let data = '';
        res.on("data", chunk => {
            data += chunk;
        });
        res.on("end", () => {
            if (data === "[]") { reject(`[Error]Username <${userid}> does not exist!`) }
            resolve(data);
        });
        res.on("error", err => {
            reject(`[Error] get_user_res: ${err}`);
        });
    }).on('error', function (err) {
        reject(`[Error] get_user_req: ${err}`);
    });
});
// 获取玩家历史
let get_user_recent_func = new Promise((resolve, reject) => {
    let url = `https://osu.ppy.sh/api/get_user_recent?&k=${apikey}&u=${userid}&m=${mode}&type=${type}&limit=${"50"}`;
    https.get(url, res => {
        let data = '';
        res.on("data", chunk => {
            data += chunk;
        });
        res.on("end", () => {
            if (data === "[]") { reject(`[Error]<${userid}> didn't play osu! in 24 hours.`) }
            resolve(data);
        });
        res.on("error", err => {
            reject(`[Error] get_recent_res: ${err}`);
        });
    }).on('error', function (err) {
        reject(`[Error] get_recent_req: ${err}`);
    });
});

Promise.all([get_user_func, get_user_recent_func]).then(result => {
    let username = JSON.parse(result[0])[0]['username'];
    console.debug(`[Test Task] username: ${username} Get!`);
    let recents = JSON.parse(result[1]);
    console.debug(`[Test Task] recents: Get!`);
    let recent;
    switch(perfect){
        case 1:
            for(let i=0, len = recents.length; i<len; i++){
                let rec = recents[i];
                if(rec['perfect'] === '1'){
                    recent = rec;
                    break;
                }
                if((i + 1) === len){
                    return `Error: This user didn't full combo any beatmap in 24 hours.`;
                }
            }
            break;
        case 2:
            recents.sort((a, b) => {// 降序排序
                return (a['score'] - b['score'] ? -1 : 1 );
            });
            for(let i=0, len = recents.length; i<len; i++){
                let rec = recents[i];
                if(rec['rank'] !== 'F'){
                    recent = rec;
                    break;
                }
                if((i + 1) === len){
                    recent = recents[0];
                }
            }
            break;
        default:
            recent = recents[0];
    }
    // 获取用户名string
    let transfer_username = new Promise((resolve, reject) => {
        resolve(username);
    });
    // 获取用户历史记录json
    let transfer_recent = new Promise((resolve, reject) => {
        resolve(recent);
    });
    // 获取beatmap信息
    let get_beatmaps_func = new Promise((resolve, reject) => {
        let url = `https://osu.ppy.sh/api/get_beatmaps?&k=${apikey}&m=${mode}&b=${recent['beatmap_id']}`;
        https.get(url, res => {
            let data = '';
            res.on("data", chunk => {
                data += chunk;
            });
            res.on("end", () => {
                console.debug(`[Test Task] beatmap: ${data}`);
                if (data === "[]") { reject(`Error: Beatmap query failed!`) }
                resolve(data);
            });
            res.on("error", err => {
                reject(err);
                console.log(`[Error] get_beatmaps_res: ${err}`);
            });
        }).on('error', function (err) {
            reject(err);
            console.log(`[Error] get_beatmaps_req: ${err}`);
        });
    });
    // 获取beatmap背景图
    let get_beatmapimg_func = new Promise((resolve, reject) => {
        https.get(osubgapi + recent['beatmap_id'], res => {
            let beatimg = [];
            res.on("data", chunk => {
                beatimg.push(chunk);
            });
            res.on("end", () => {
                sharp(Buffer.concat(beatimg))
                    .toFormat('jpeg')
                    .toBuffer()
                    .then(value => {
                        resolve(Buffer.concat(beatimg));
                        console.log(`[sharpInfo] success!`);
                    })
                    .catch(err => {
                        resolve(err);
                        console.log(`[sharpFail] ${err}`);
                    });
            });
            res.on("error", err => {
                resolve(err);
                console.log(`[Error] get_beatmapimg_res: ${err}`);
            });
        }).on('error', function (err) {
            resolve(err);
            console.log(`[Error] get_beatmapimg_req: ${err}`);
        });
    });

    // 传递参数到下一个环节
    return Promise
        .all([
            transfer_username,
            transfer_recent,
            get_beatmaps_func,
            get_beatmapimg_func
        ]).catch(err => {
            console.debug(`[Test Task] ${err}`)
            return err
        });
}).then(results => {
    if(results.toString().indexOf('Error') > -1){
        console.debug(`[Test Task] results: ${results}`);
        return results;
    }
    let username = results[0];
    console.debug(`[Test Task] username: ${username}`);
    let recent = results[1];
    console.debug(`[Test Task] recent: ${recent}`);
    let beatmap = JSON.parse(results[2])[0];
    console.debug(`[Test Task] beatmap: ${beatmap}`);
    let backimg = results[3];
    //console.debug(`[Test Task] backimg: ${backimg.toFormat()}`);

    const titlebar = new Buffer.from(
        `<svg width="1366" height="768">
            <rect x="0" y="0" width="1366" height="768" fill="#000" fill-opacity="0.4"/>
            <rect x="0" y="0" width="1366" height="96" fill="#000" fill-opacity="0.8"/>
            <text style="font-size: 30px; line-height:100%;" x="5" y="22" fill="#FFF">
                Test Coding...
            </text>
        </svg>`
    );

    let recentimg = backimg.toString().startsWith('[sharpErr]') ? sharp(skin['defaultbg']) : sharp(backimg);
    return recentimg.resize(1366, 768).toBuffer()
        .then(buff => {  // 叠加标题栏
            return sharp(buff).overlayWith(titlebar, {gravity: sharp.gravity.northwest}).toBuffer();
        }).then(buff => {// 叠加ranking-panel结算背景图
            return new Promise((resolve, reject) => {
                sharp(skin['ranking-panel']).toBuffer((err, data, info) => {
                    if(info.height <= 668){
                        sharp(buff).overlayWith(data, {left: 0, top: 100}).toBuffer()
                            .then(buf => { resolve(buf); });
                    }else{
                        sharp(data).resize(info.width, 668).crop(sharp.gravity.north).toBuffer()
                            .then(buf =>{
                                sharp(buff).overlayWith(buf, {left: 0, top: 100}).toBuffer()
                                    .then(b => { resolve(b); });
                            });
                    }                    
                });
            });
        }).then(buff => {// 绘制Back图标[左下角]
            return sharp(buff).overlayWith(skin['menu-back'], {gravity: sharp.gravity.southwest}).toBuffer();
        }).then(buff => {// 绘制Ranking图表框[左下居中]
            return sharp(skin['ranking-graph']).resize(342, 160).crop(sharp.gravity.north).toBuffer()
                .then(buf =>{ return sharp(buff).overlayWith(buf, {left: 275, top: 768}).toBuffer(); });
        }).then(buff => {// 绘制Ranking标题图[右上角]
            return sharp(buff).overlayWith(skin['ranking-title'], {left: 1366 - 404, top: 0}).toBuffer();
        }).then(buff => {// 绘制Score
            let scoreval = '00000000'.slice(recent['score'].length) + recent['score'];
            return new Promise((resolve, reject) => {
                (function sive(buf, i){
                    if(i === scoreval.length){
                        resolve(buf);
                    }else{
                        sharp(buf)
                            .overlayWith(skin[`score-${scoreval.charAt(i)}`], {left: 133 + 55 * i, top: 118})
                            .toBuffer()
                            .then(b =>{ sive(b, i+1); });
                    }
                })(buff, 0);
            });
        }).then(buff => {// 绘制Combo 300
            return sharp(skin['hit300']).resize(64, 64).toBuffer()
                .then(buf => { return sharp(buff).overlayWith(buf, {left: 32, top: 244}).toBuffer(); });
        }).then(buff => {// 绘制Combo 100
            return sharp(skin['hit100']).resize(64, 64).toBuffer()
                .then(buf => { return sharp(buff).overlayWith(buf, {left: 32, top: 320}).toBuffer(); });
        }).then(buff => {// 绘制Combo 50
            return sharp(skin['hit50']).resize(64, 64).toBuffer()
                .then(buf => { return sharp(buff).overlayWith(buf, {left: 32, top: 416}).toBuffer(); });
        }).then(buff => {// 绘制Combo 300激
            return sharp(skin['hit300g']).resize(64, 64).toBuffer()
                .then(buf => { return sharp(buff).overlayWith(buf, {left: 352, top: 224}).toBuffer(); });
        }).then(buff => {// 绘制Combo 100可
            return sharp(skin['hit100k']).resize(64, 64).toBuffer()
                .then(buf => { return sharp(buff).overlayWith(buf, {left: 352, top: 320}).toBuffer(); });
        }).then(buff => {// 绘制Combo X
            return sharp(skin['hit0']).resize(64, 64).toBuffer()
                .then(buf => { return sharp(buff).overlayWith(buf, {left: 352, top: 416}).toBuffer(); });
        }).then(buff => {// 绘制count300
            let scoreval = recent['count300'] + 'x';
            return new Promise((resolve, reject) => {
                (function sive(buf, i){
                    if(i === scoreval.length){
                        resolve(buf);
                    }else{
                        sharp(skin[`score-${scoreval.charAt(i)}`]).resize(45, 57).toBuffer()
                            .then(scorestr => {
                                sharp(buf).overlayWith(scorestr, {left: 128 + 45 * i, top: 230}).toBuffer()
                                    .then(b =>{ sive(b, i+1); });
                            })
                    }
                })(buff, 0);
            });
        }).then(buff => {// 绘制count100
            let scoreval = recent['count100'] + 'x';
            return new Promise((resolve, reject) => {
                (function sive(buf, i){
                    if(i === scoreval.length){
                        resolve(buf);
                    }else{
                        sharp(skin[`score-${scoreval.charAt(i)}`]).resize(45, 57).toBuffer()
                            .then(scorestr => {
                                sharp(buf).overlayWith(scorestr, {left: 128 + 45 * i, top: 326}).toBuffer()
                                    .then(b =>{ sive(b, i+1); });
                            })
                    }
                })(buff, 0);
            });
        }).then(buff => {// 绘制count50
            let scoreval = recent['count50'] + 'x';
            return new Promise((resolve, reject) => {
                (function sive(buf, i){
                    if(i === scoreval.length){
                        resolve(buf);
                    }else{
                        sharp(skin[`score-${scoreval.charAt(i)}`]).resize(45, 57).toBuffer()
                            .then(scorestr => {
                                sharp(buf).overlayWith(scorestr, {left: 128 + 45 * i, top: 422}).toBuffer()
                                    .then(b =>{ sive(b, i+1); });
                            })
                    }
                })(buff, 0);
            });
        }).then(buff => {// 绘制countgeki
            let scoreval = recent['countgeki'] + 'x';
            return new Promise((resolve, reject) => {
                (function sive(buf, i){
                    if(i === scoreval.length){
                        resolve(buf);
                    }else{
                        sharp(skin[`score-${scoreval.charAt(i)}`]).resize(45, 57).toBuffer()
                            .then(scorestr => {
                                sharp(buf).overlayWith(scorestr, {left: 448 + 45 * i, top: 230}).toBuffer()
                                    .then(b =>{ sive(b, i+1); });
                            })
                    }
                })(buff, 0);
            });
        }).then(buff => {// 绘制countkatu
            let scoreval = recent['countkatu'] + 'x';
            return new Promise((resolve, reject) => {
                (function sive(buf, i){
                    if(i === scoreval.length){
                        resolve(buf);
                    }else{
                        sharp(skin[`score-${scoreval.charAt(i)}`]).resize(45, 57).toBuffer()
                            .then(scorestr => {
                                sharp(buf).overlayWith(scorestr, {left: 448 + 45 * i, top: 326}).toBuffer()
                                    .then(b =>{ sive(b, i+1); });
                            })
                    }
                })(buff, 0);
            });
        }).then(buff => {// 绘制countmiss
            let scoreval = recent['countmiss'] + 'x';
            return new Promise((resolve, reject) => {
                (function sive(buf, i){
                    if(i === scoreval.length){
                        resolve(buf);
                    }else{
                        sharp(skin[`score-${scoreval.charAt(i)}`]).resize(45, 57).toBuffer()
                            .then(scorestr => {
                                sharp(buf).overlayWith(scorestr, {left: 448 + 45 * i, top: 422}).toBuffer()
                                    .then(b =>{ sive(b, i+1); });
                            })
                    }
                })(buff, 0);
            });
        }).then(buff => {// 绘制maxcombo
            let scoreval = recent['maxcombo'] + 'x';
            return new Promise((resolve, reject) => {
                (function sive(buf, i){
                    if(i === scoreval.length){
                        resolve(buf);
                    }else{
                        sharp(skin[`score-${scoreval.charAt(i)}`]).resize(45, 57).toBuffer()
                            .then(scorestr => {
                                sharp(buf).overlayWith(scorestr, {left: 24 + 45 * i, top: 528}).toBuffer()
                                    .then(b =>{ sive(b, i+1); });
                            })
                    }
                })(buff, 0);
            });
        }).then(buff => {// 绘制accuracy
            let accval = (6*parseFloat(recent['count300']) + 2*parseFloat(recent['count100']) + parseFloat(recent['count50']))
                        /(6*(parseFloat(recent['count300'])+parseFloat(recent['count100'])+parseFloat(recent['count50'])+parseFloat(recent['countmiss'])));
            let accuracy = Number(accval*100).toFixed(2) + '%';
            return new Promise((resolve, reject) => {
                (function sive(buf, i, iwidth){
                    if(i === accuracy.length){
                        resolve(buf);
                    }else{
                        let accChar = accuracy.charAt(i);
                        if (accChar == ".") accChar = "dot";
                        if (accChar == "%") accChar = "percent";
                        sharp(skin[`score-${accChar}`]).resize(null, 57).toBuffer((err, scorestr, info)=>{
                            sharp(buf).overlayWith(scorestr, {left: iwidth, top: 528}).toBuffer()
                                    .then(b =>{ sive(b, i+1, iwidth + info.width); });
                        });
                    }
                })(buff, 0, 310);
            });
        }).then(buff => {// 绘制PerfectPlay图标
            if(recent['perfect'] == 1){
                return sharp(buff).overlayWith(skin['ranking-perfect'], {left: 266, top: 638}).toBuffer();
            }else{
                return buff;
            }
        }).then(buff => {// 绘制Rank评价
            return new Promise((resolve, reject) => {
                sharp(skin[`ranking-${recent['rank'].toLowerCase()}`]).toBuffer((err, rankimg, info)=>{
                    sharp(buff).overlayWith(rankimg, {left: (1366 - 7 - info.width), top: 109}).toBuffer()
                        .then(buf => {
                            resolve(buf);
                        });
                });
            });
        }).then(buff => {// 绘制Mods图标
            let enabled_mods = recent['enabled_mods'];
            return new Promise((resolve, reject) => {
                (function sive(buf, i, iwidth){
                    if(i === modnames.length){
                        resolve(buf);
                    }else{
                        if((enabled_mods & osumods[modnames[i]]) > 0){
                            let modimg = skin[`selection-mod-${modnames[i].toLowerCase()}`];
                            sharp(buf).overlayWith(modimg, {left: iwidth, top: 376}).toBuffer()
                                .then(b =>{ sive(b, i+1, iwidth-32); });
                        }else{
                            sive(buf, i+1, iwidth);
                        }
                    }
                })(buff, 0, 1262);
            });
        }).then(buff => {// 绘制Replay图标
            return new Promise((resolve, reject) => {
                sharp(skin['pause-replay']).toBuffer((err, data, info) => {
                    sharp(buff).overlayWith(data, {left: (1366 - info.width), top: 518}).toBuffer()
                        .then(buf => {
                            resolve(buf);
                        });
                });
            });
        }).then(buff => {// 绘制Online-Users图标
            return new Promise((resolve, reject) => {
                sharp(skin["online-users"]).toBuffer((err, data, info) => {
                    sharp(buff).overlayWith(data, {left: (1366 - 99 - info.width), top: 768-info.height}).toBuffer()
                        .then(buf => { resolve(buf); });
                });
            });
        }).then(buff => {// 绘制Show-Chat图标
            return new Promise((resolve, reject) => {
                sharp(skin["show-chat"]).toBuffer((err, data, info) => {
                    sharp(buff).overlayWith(data, {left: (1366 - 3 - info.width), top: 768-info.height}).toBuffer()
                        .then(buf => { resolve(buf); });
                });
            });
        }).then(buff => { // 绘制latency延迟图标
            return new Promise((resolve, reject) => {
                sharp(skin["latency"]).toBuffer((err, data, info) => {
                    sharp(buff).overlayWith(data, {left: (1366 - 4 - info.width), top: (768 - 25 -info.height)}).toBuffer()
                        .then(buf => { resolve(buf); });
                });
            });
        }).then(buff => { // 绘制fps帧率图标
            return new Promise((resolve, reject) => {
                sharp(skin["fps"]).toBuffer((err, data, info) => {
                    sharp(buff).overlayWith(data, {left: (1366 - 4 - info.width), top: (768 - 49 -info.height)}).toBuffer()
                        .then(buf => { resolve(buf); });
                });
            });
        }).then(buff => {
            sharp(buff)
                .toFile(recpath)
                .then(buf => {
                    console.log(`[sharpInfo] save to "${buf.format}" success!`);
                })
                .catch(err => {
                    console.log(`[sharpFail] ${err}`);
                });
        });
}).catch(err => {
    console.debug(`[Test Task] PromiseAll_ ${err}`);
});