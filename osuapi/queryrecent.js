const https = require('https');
const fs = require("fs");
const sharp = require('sharp');

const osuskins = process.cwd() + '/osuapi/skins/';
const osubgapi = 'https://bloodcat.com/osu/i/';
const osumods = require(process.cwd() + `/osuapi/mods.json`);
var modnames = [];
for(let k in osumods){ modnames.push(k); }

const Aller_Light_Path = process.cwd() + '/osuapi/fonts/Aller_Std_Lt.ttf';
const Aller_Regular_Path = process.cwd() + '/fonts/Aller_Std_Rg.ttf';
const MicrosoftYaHeiUI_Path = process.cwd() + '/fonts/MicrosoftYaHeiUI.ttf';

// 载入skin皮肤文件
var skins = {}, skin = {};
fs.readdirSync(osuskins).filter(f => fs.lstatSync(`${osuskins}${f}`).isDirectory()).forEach(skin =>{
    skins[skin] = {};
    let skinfiles = fs.readdirSync(`${osuskins}${skin}`);
    skinfiles.forEach(file => {
        if(/png|jpg|jpeg/.test(file.split('.')[1].toLowerCase())){
            skins[skin][file.split('.')[0].toLowerCase()] = `${osuskins}${skin}/${file}`;
        }
    });
});
// 加载默认主题皮肤
for(let key in skins['default']){
    skin[key] = skins['default'][key];
}

// 主任务
async function get_recent(apikey, userid, mode, type, perfect=0){
    // 随机选取主题皮肤
    let index = Math.floor(Math.random()*Object.keys(skins).length);
    for(let key in skins){
        if(--index < 0){
            for(k in skins[key]){
                skin[k] = skins[key][k];
            }
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
                if (data === "[]") { reject(`Error: Username <${userid}> does not exist!`) }
                resolve(data);
            });
            res.on("error", err => {
                reject(err);
            });
        }).on('error', function (err) {
            reject(err);
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
                if (data === "[]") { reject(`Error: <${userid}> didn't play osu! in 24 hours.`) }
                resolve(data);
            });
            res.on("error", err => {
                reject(err);
            });
        }).on('error', function (err) {
            reject(err);
        });
    });

    return Promise.all([get_user_func, get_user_recent_func]).then(result => {
        let username = JSON.parse(result[0])[0]['username'];
        let recents = JSON.parse(result[1]);
        let recent;
        switch(perfect){
            case 1:
                for(let i=0, len = recents.length; i<len; i++){
                    let rec = recents[i];
                    if(rec['perfect'] == '1'){
                        recent = rec;
                        break;
                    }
                    if((i + 1) === len){
                        return `Error: This user didn't full combo any beatmap in 24 hours.`;
                    }
                }
                break;
            case 2:
                let scorelist = [];
                for(let rec of recents){
                    if(rec['rank'] != 'F') scorelist.push(parseInt(rec['score']));
                }
                if(scorelist.length == 0){
                    for(let rec of recents) scorelist.push(parseInt(rec['score']));
                }
                let scoremax = Math.max.apply(null, scorelist);
                for(let rec of recents){
                    if(parseInt(rec['score']) == scoremax){
                        recent = rec;
                        break;
                    } 
                }
                break;
            default:
                recent = recents[0];
                break;
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
                    if (data === "[]") { reject(`Error: Beatmap query failed!`) }
                    resolve(data);
                });
                res.on("error", err => {
                    reject(err);
                });
            }).on('error', function (err) {
                reject(err);
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
                    sharp(Buffer.concat(beatimg)).toBuffer((err, data, info) => {
                        if(err) resolve(err);
                        else resolve(data);
                    });
                });
                res.on("error", err => {
                    resolve(err);
                });
            }).on('error', function (err) {
                resolve(err);
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
                return err
            });
    })
    .then(result => {// 合成recent快照
        if(result.toString().indexOf('Error') > -1){
            return result;
        }
        let username = result[0];
        let recent = result[1];
        let beatmap = JSON.parse(result[2])[0];
        let backimg = result[3];
    
        // 载入beatmap背景图
        let recentimg = backimg.toString().startsWith('[sharpErr]') ? sharp(skin['defaultbg']) : sharp(backimg);
    
    // 设置画布尺寸
    let canvasW = 1366;
    let canvasH = 768;
    let zoomval = canvasH/600;
    // 创建原始尺寸绘图容器
    const frame = new Buffer.from(`<svg width="800" height="600"></svg>`); 
    // 设置画布遮罩
    const mask = new Buffer.from( 
        `<svg width="${canvasW}" height="${canvasH}">
            <rect x="0" y="0" width="${canvasW}" height="${canvasH}" fill="#000" fill-opacity="0.4"/>
            <rect x="0" y="0" width="${canvasW}" height="${75*zoomval}" fill="#000" fill-opacity="0.8"/>
        </svg>`
    );
    // 设置标题文字
    const title = new Buffer.from(
        `<svg width="800" height="600">
            <text class="h1" x="3" y="${1+17}" font-family="Aller Light" font-size="16.92" fill="#FFF">
                ${beatmap["artist"]} - ${beatmap["title"]} [${beatmap["version"]}]
            </text>
            <text class="h2" x="3" y="${26+12}" font-family="Aller Light" font-size="12.3" fill="#FFF">
                Beatmap by ${beatmap["creator"]}
            </text>
            <text class="h3" x="3" y="${45+13}" font-family="Microsoft YaHei UI" font-size="12.9" fill="#FFF">
                Played by ${username} on ${recent["date"].toString() .replace(/-/g, '/')}.
            </text>
        </svg>`
    );

    // 绘制画布背景
    let canvas = new Promise((resolve, reject) => {
        sharp(mask).toBuffer()
        .then(buff => {// 添加背景图片
            return recentimg.resize(canvasW, canvasH).toBuffer()
            .then(buf => {
                return sharp(buf).overlayWith(buff).toBuffer();
            });
        })
        .then(buff => {// 叠加 ranking-panel 图片
            return sharp(skin['ranking-panel']).toBuffer({ resolveWithObject: true })
            .then(res => {
                let imgW = Math.round(res.info.width*zoomval*0.78);
                let imgH = Math.round(res.info.height*zoomval*0.78);
                let cutW = imgW > canvasW ? canvasW : imgW;
                let cutH = imgH > (canvasH - Math.round(80*zoomval)) ? (canvasH - Math.round(80*zoomval)) : imgH;
                return sharp(res.data).resize(imgW, imgH).extract({left:0, top:0, width:cutW, height:cutH}).toBuffer()
                .then(buf => {
                    return sharp(buff).overlayWith(buf, {top: Math.round(80*zoomval), left: 0}).toBuffer();
                });
            });
        })
        .then(buff => {// 叠加 menu-back 图片
            return sharp(skin['menu-back']).toBuffer({ resolveWithObject: true })
            .then(res => {
                let imgW = Math.round(res.info.width*zoomval*0.8);
                let imgH = Math.round(res.info.height*zoomval*0.8);
                return sharp(res.data).resize(imgW, imgH).toBuffer()
                .then(buf => {
                    return sharp(buff).overlayWith(buf, {gravity: sharp.gravity.southwest}).toBuffer();
                });
            });
        })
        .then(buff => {// 叠加 ranking-graph 图片
            return sharp(skin['ranking-graph']).toBuffer({ resolveWithObject: true })
            .then(res => {
                let imgW = Math.round(res.info.width*zoomval*0.78);
                let imgH = Math.round(res.info.height*zoomval*0.78);
                let maxH = imgH > Math.round(125*zoomval) ? Math.round(125*zoomval) : imgH;
                return sharp(res.data).resize(imgW, imgH)
                .extract({left:0, top:0, width: imgW, height: maxH }).toBuffer()
                .then(buf => {
                    return sharp(buff).overlayWith(buf, {
                        left: Math.round(200*zoomval),
                        top: Math.round(475*zoomval)
                    }).toBuffer();
                });
            });
        })
        .then(buff => {// 叠加 hit[300,100,50,300g,100k,0] 图片
            return new Promise((resolve1, reject1) => { resolve1(buff); })
            .then(buf => {// 叠加 hit300 图片
                    return sharp(skin['hit300']).toBuffer({ resolveWithObject: true }).then(res => {
                        let imgW = Math.round(res.info.width*zoomval*0.4);
                        let imgH = Math.round(res.info.height*zoomval*0.4);
                        let imgX = Math.round(50*zoomval-imgW/2<0 ? 0 : 50*zoomval-imgW/2);// sharp不允许覆盖的图片超出画布
                        let imgY = Math.round(200*zoomval-imgH/2);
                        return sharp(res.data).resize(imgW, imgH).toBuffer().then(b => {
                            return sharp(buf).overlayWith(b, {left:imgX, top:imgY}).toBuffer();
                        });
                    });
            })
            .then(buf => {// 叠加 hit100 图片
                    return sharp(skin['hit100']).toBuffer({ resolveWithObject: true }).then(res => {
                        let imgW = Math.round(res.info.width*zoomval*0.4);
                        let imgH = Math.round(res.info.height*zoomval*0.4);
                        let imgX = Math.round(50*zoomval-imgW/2<0 ? 0 : 50*zoomval-imgW/2);
                        let imgY = Math.round(275*zoomval-imgH/2);
                        return sharp(res.data).resize(imgW, imgH).toBuffer().then(b => {
                            return sharp(buf).overlayWith(b, {left:imgX, top:imgY}).toBuffer();
                        });
                    });
            })
            .then(buf => {// 叠加 hit50 图片
                    return sharp(skin['hit50']).toBuffer({ resolveWithObject: true }).then(res => {
                        let imgW = Math.round(res.info.width*zoomval*0.4);
                        let imgH = Math.round(res.info.height*zoomval*0.4);
                        let imgX = Math.round(50*zoomval-imgW/2<0 ? 0 : 50*zoomval-imgW/2);
                        let imgY = Math.round(350*zoomval-imgH/2);
                        return sharp(res.data).resize(imgW, imgH).toBuffer().then(b => {
                            return sharp(buf).overlayWith(b, {left:imgX, top:imgY}).toBuffer();
                        });
                    });
            })
            .then(buf => {// 叠加 hit300g 图片
                    return sharp(skin['hit300g']).toBuffer({ resolveWithObject: true }).then(res => {
                        let imgW = Math.round(res.info.width*zoomval*0.4);
                        let imgH = Math.round(res.info.height*zoomval*0.4);
                        let imgX = Math.round(300*zoomval-imgW/2<0 ? 0 : 300*zoomval-imgW/2);
                        let imgY = Math.round(200*zoomval-imgH/2);
                        return sharp(res.data).resize(imgW, imgH).toBuffer().then(b => {
                            return sharp(buf).overlayWith(b, {left:imgX, top:imgY}).toBuffer();
                        });
                    });
            })
            .then(buf => {// 叠加 hit100k 图片
                    return sharp(skin['hit100k']).toBuffer({ resolveWithObject: true }).then(res => {
                        let imgW = Math.round(res.info.width*zoomval*0.4);
                        let imgH = Math.round(res.info.height*zoomval*0.4);
                        let imgX = Math.round(300*zoomval-imgW/2<0 ? 0 : 300*zoomval-imgW/2);
                        let imgY = Math.round(275*zoomval-imgH/2);
                        return sharp(res.data).resize(imgW, imgH).toBuffer().then(b => {
                            return sharp(buf).overlayWith(b, {left:imgX, top:imgY}).toBuffer();
                        });
                    });
            })
            .then(buf => {// 叠加 hit0 图片
                    return sharp(skin['hit0']).toBuffer({ resolveWithObject: true }).then(res => {
                        let imgW = Math.round(res.info.width*zoomval*0.4);
                        let imgH = Math.round(res.info.height*zoomval*0.4);
                        let imgX = Math.round(300*zoomval-imgW/2<0 ? 0 : 300*zoomval-imgW/2);
                        let imgY = Math.round(350*zoomval-imgH/2);
                        return sharp(res.data).resize(imgW, imgH).toBuffer().then(b => {
                            return sharp(buf).overlayWith(b, {left:imgX, top:imgY}).toBuffer();
                        });
                    });
            });
        })
        .then(buff => {// 叠加 ranking-maxcombo 图片
            return sharp(skin['ranking-maxcombo']).toBuffer({ resolveWithObject: true }).then(res => {
                let imgW = Math.round(res.info.width*zoomval*0.78);
                let imgH = Math.round(res.info.height*zoomval*0.78);
                let imgX = Math.round(6*zoomval);
                let imgY = Math.round(375*zoomval);
                return sharp(res.data).resize(imgW, imgH).toBuffer().then(buf => {
                    return sharp(buff).overlayWith(buf, {left:imgX, top:imgY}).toBuffer();
                });
            });
        })
        .then(buff => {// 叠加 ranking-accuracy 图片
            return sharp(skin['ranking-accuracy']).toBuffer({ resolveWithObject: true }).then(res => {
                let imgW = Math.round(res.info.width*zoomval*0.78);
                let imgH = Math.round(res.info.height*zoomval*0.78);
                let imgX = Math.round(228*zoomval);
                let imgY = Math.round(375*zoomval);
                return sharp(res.data).resize(imgW, imgH).toBuffer().then(buf => {
                    return sharp(buff).overlayWith(buf, {left:imgX, top:imgY}).toBuffer();
                });
            });
        })
        .then(buff => {
            resolve(buff);
        });
    });

    // 绘制结算界面左边部分
    let frameLeft = new Promise((resolve, reject) => {
        sharp(frame).toBuffer()
        .then(buff => {// 叠加 ranking-perfect
            if(Number(recent['perfect']) !== 1) return buff;
            return sharp(skin['ranking-perfect']).toBuffer({ resolveWithObject: true })
            .then(res => {
                let imgW = Math.round(res.info.width*0.78); let imgH = Math.round(res.info.height*0.78);
                return sharp(res.data).resize(imgW, imgH).toBuffer()
                .then(buf => {
                    return sharp(buff).overlayWith(buf, {
                        left:Math.round(325-imgW/2), 
                        top:Math.round(537-imgH/2)
                    }).toBuffer();
                })
            });
        })
        .then(buff => {// 叠加 score
            let scoreval = recent['score'];
            if(scoreval.length < 8) scoreval = '00000000'.slice(scoreval.length) + scoreval;
            return new Promise((resolve1, reject1) => {
                sharp(skin[`score-0`]).toBuffer((err, data, info) => {
                    const scoreW = info.width;
                    const scoreH = info.height;
                    const spacing = 3;
                    const scorebar = new Buffer.from(
                        `<svg width="${scoreval.length*(scoreW+spacing)-spacing}" height="${scoreH}"></svg>`
                    );
                    (function sive(buf, i){
                        if(i === scoreval.length){
                            sharp(buff).overlayWith(buf, {
                                left: Math.round(274-((scoreval.length*(scoreW+spacing)-spacing)/2)), 
                                top: Math.round(117-(scoreH/2))
                            }).toBuffer().then(b => {
                                resolve1(b);
                            });
                        }else{
                            let scorechar = skin[`score-${scoreval.charAt(i)}`];
                            sharp(buf)
                                .overlayWith(scorechar, {left: i*(scoreW+spacing), top: 0})
                                .toBuffer()
                                .then(b =>{ sive(b, i+1); });
                        }
                    })(scorebar, 0);
                });
            });
        })
        .then(buff => {// 叠加 count
            return sharp(skin['score-0']).toBuffer({ resolveWithObject: true })
            .then(res => {
                let comboW = Math.round(res.info.width*0.9); let comboH = Math.round(res.info.height*0.9);
                return new Promise((resolve1, reject1) => { resolve1(buff); })
                .then(buf => {// 叠加 count300
                        let countval = recent['count300'] + 'x';
                        return (function sive(bf, i){
                            if(i === countval.length){
                                return bf;
                            }else{
                                let countchar = skin[`score-${countval.charAt(i)}`];
                                return sharp(bf).overlayWith(countchar, {
                                    left:100+i*comboW, 
                                    top:Math.round(200-comboH/2)
                                }).toBuffer().then(b =>{ return sive(b, i+1); });
                            }
                        })(buf, 0);
                })
                .then(buf => {// 叠加 count100
                        let countval = recent['count100'] + 'x';
                        return (function sive(bf, i){
                            if(i === countval.length){
                                return bf;
                            }else{
                                let countchar = skin[`score-${countval.charAt(i)}`];
                                return sharp(bf).overlayWith(countchar, {
                                    left:100+i*comboW, 
                                    top:Math.round(275-comboH/2)
                                }).toBuffer().then(b =>{ return sive(b, i+1); });
                            }
                        })(buf, 0);
                })
                .then(buf => {// 叠加 count50
                        let countval = recent['count50'] + 'x';
                        return (function sive(bf, i){
                            if(i === countval.length){
                                return bf;
                            }else{
                                let countchar = skin[`score-${countval.charAt(i)}`];
                                return sharp(bf).overlayWith(countchar, {
                                    left:100+i*comboW, 
                                    top:Math.round(350-comboH/2)
                                }).toBuffer().then(b =>{ return sive(b, i+1); });
                            }
                        })(buf, 0);
                })
                .then(buf => {// 叠加 count300g (countgeki)
                        let countval = recent['countgeki'] + 'x';
                        return (function sive(bf, i){
                            if(i === countval.length){
                                return bf;
                            }else{
                                let countchar = skin[`score-${countval.charAt(i)}`];
                                return sharp(bf).overlayWith(countchar, {
                                    left:350+i*comboW, 
                                    top:Math.round(200-comboH/2)
                                }).toBuffer().then(b =>{ return sive(b, i+1); });
                            }
                        })(buf, 0);
                })
                .then(buf => {// 叠加 count100k (countkatu)
                        let countval = recent['countkatu'] + 'x';
                        return (function sive(bf, i){
                            if(i === countval.length){
                                return bf;
                            }else{
                                let countchar = skin[`score-${countval.charAt(i)}`];
                                return sharp(bf).overlayWith(countchar, {
                                    left:350+i*comboW, 
                                    top:Math.round(275-comboH/2)
                                }).toBuffer().then(b =>{ return sive(b, i+1); });
                            }
                        })(buf, 0);
                })
                .then(buf => {// 叠加 count0 (countmiss)
                        let countval = recent['countmiss'] + 'x';
                        return (function sive(bf, i){
                            if(i === countval.length){
                                return bf;
                            }else{
                                let countchar = skin[`score-${countval.charAt(i)}`];
                                return sharp(bf).overlayWith(countchar, {
                                    left:350+i*comboW, 
                                    top:Math.round(350-comboH/2)
                                }).toBuffer().then(b =>{ return sive(b, i+1); });
                            }
                        })(buf, 0);
                })
            });
        })
        .then(buff => {// 叠加 MaxCombo
            let dataStr = recent['maxcombo'] + 'x';
            return (function sive(bf, i, strX){
                if(i === dataStr.length){
                    return bf;
                }else{
                    let charStr = dataStr.charAt(i);
                    return sharp(skin[`score-${charStr}`]).toBuffer({ resolveWithObject: true }).then(res => {
                        let charW = Math.round(res.info.width*0.9); let charH = Math.round(res.info.height*0.9);
                        return sharp(bf).overlayWith(res.data, {left:strX, top:412}).toBuffer()
                        .then(b =>{ return sive(b, i+1, strX + charW); });
                    });
                }
            })(buff, 0, 18);
        })
        .then(buff => {// 叠加 Accuracy
            let accuracy = (6*parseFloat(recent['count300']) + 2*parseFloat(recent['count100']) + parseFloat(recent['count50']))
                        /(6*(parseFloat(recent['count300'])+parseFloat(recent['count100'])+parseFloat(recent['count50'])+parseFloat(recent['countmiss'])));
            let dataStr = Number(accuracy*100).toFixed(2) + '%';
            return (function sive(bf, i, strX){
                if(i === dataStr.length){
                    return bf;
                }else{
                    let charStr = dataStr.charAt(i);
                    if (charStr == ".") charStr = "dot";
                    if (charStr == "%") charStr = "percent";
                    return sharp(skin[`score-${charStr}`]).toBuffer({ resolveWithObject: true }).then(res => {
                        let charW = Math.round(res.info.width*0.9); let charH = Math.round(res.info.height*0.9);
                        return sharp(bf).overlayWith(res.data, {left:strX, top:412}).toBuffer()
                        .then(b =>{ return sive(b, i+1, strX + charW); });
                    });
                }
            })(buff, 0, 242);
        })
        .then(buff => {// 缩放到合适尺寸输出
            sharp(buff).resize(null, canvasH).toBuffer()
            .then(buf => { resolve(buf); });
        });
    });

    //return new Promise((resolve, reject) => {
    // 绘制结算界面右边部分
    let frameRight = new Promise((resolve, reject) => {
        sharp(frame).toBuffer()
        .then(buff => {// 叠加 ranking-title
            return sharp(skin['ranking-title']).toBuffer({ resolveWithObject: true })
            .then(res => {
                let imgW = Math.round(res.info.width*0.78);
                let imgH = Math.round(res.info.height*0.78);
                let imgX = Math.round(800 - 25 - imgW);
                return sharp(res.data).resize(imgW, imgH).toBuffer()
                .then(buf => {
                    return sharp(buff).overlayWith(buf, {left: imgX, top: 0 }).toBuffer();
                });
            });
        })
        .then(buff => {// 叠加 ranking 评价
            return sharp(skin[`ranking-${recent['rank'].toLowerCase()}`]).toBuffer({ resolveWithObject: true })
            .then(res => {
                let imgW = Math.round(res.info.width*0.78);
                let imgH = Math.round(res.info.height*0.78);
                let imgX = Math.round(800 - 150 - imgW/2);
                let imgY = Math.round(250 - imgH/2);
                return sharp(res.data).resize(imgW, imgH).toBuffer()
                .then(buf => {
                    return sharp(buff).overlayWith(buf, {left: imgX, top: imgY}).toBuffer();
                });
            });
        })
        .then(buff => {// 叠加 Mods 图标
            let enabled_mods = recent['enabled_mods'];
            return (function sive(bf, i, strX){
                if(i === modnames.length){
                    return bf;
                }else{
                    if((enabled_mods & osumods[modnames[i]]) > 0){
                        return sharp(skin[`selection-mod-${modnames[i].toLowerCase()}`])
                        .toBuffer({ resolveWithObject: true})
                        .then(res => {
                            let imgW = Math.round(res.info.width*0.78);
                            let imgH = Math.round(res.info.height*0.78);
                            let imgX = Math.round(strX - imgW/2);
                            let imgY = Math.round(325 - imgH/2);
                            return sharp(bf).overlayWith(res.data, {left: imgX, top: imgY}).toBuffer()
                            .then(b =>{ return sive(b, i+1, strX - imgW/2); });
                        });
                    }else{
                        return sive(bf, i+1, strX);
                    }
                }
            })(buff, 0, (800-50));
        })
        .then(buff => {// 叠加 pause-replay
            return sharp(skin[`pause-replay`]).toBuffer({ resolveWithObject: true })
            .then(res => {
                let imgW = Math.round(res.info.width*0.78);
                let imgH = Math.round(res.info.height*0.78);
                let imgX = Math.round(800 - imgW);
                let imgY = Math.round(450 - imgH/2);
                return sharp(res.data).resize(imgW, imgH).toBuffer()
                .then(buf => {
                    return sharp(buff).overlayWith(buf, {left: imgX, top: imgY}).toBuffer();
                });
            });
        })
        .then(buff => {// 缩放到合适尺寸输出
            sharp(buff).resize(null, canvasH).toBuffer()
            .then(buf => { resolve(buf); });
        });
    });

    // 绘制标题栏部分
    let frameTitle = new Promise((resolve, reject) => {
        sharp(title).png().toBuffer()
        .then(buff => {// 缩放到合适尺寸输出
            sharp(buff).resize(null, canvasH).toBuffer()
            .then(buf => { resolve(buf); });
        });
    });
    
    // 组合recent结算快照
    return Promise
        .all([canvas, frameLeft, frameRight, frameTitle])
        .then(results => {
            return sharp(results[0]).toBuffer()
            .then(buff => {// 合成左边积分区域
                return sharp(buff).overlayWith(results[1], {gravity: sharp.gravity.west}).toBuffer();
            })
            .then(buff => {// 合成右边评价区域
                return sharp(buff).overlayWith(results[2], {gravity: sharp.gravity.east}).toBuffer();
            })
            .then(buff => {// 合成顶部标题区域
                return sharp(buff).overlayWith(results[3], {gravity: sharp.gravity.west}).toBuffer();
            })
        })
        .catch(err => {
            return err
        });
    })
    .catch(err => {// 捕获错误
        return err;
    });
};

module.exports = {
    get_recent
}