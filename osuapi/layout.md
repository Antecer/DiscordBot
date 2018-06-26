# osu!结算界面布局参数推算(以分辨率800*600为参考值)

放大比例：zoomval = 1   // zoomval = 分辨率.height/600

分辨率800*600布局表：
标题栏.height = 75

Score坐标(缩放比例为zoomval, 以字符串中间点水平垂直居中对齐,字间距spacing)
score-center-X = 274
score-center-Y = 117
spacing = 3*zoomval

Hit图标位置(缩放比例为zoomval*0.4)
hit300-x-center = 50, hit300-y-center = 200;	hit300k-x-center = 300, hit300k-y-center = 200; 
hit100-x-center = 50, hit100-y-center = 275;	hit300k-x-center = 300, hit300k-y-center = 275; 
 hit50-x-center = 50,  hit50-y-center = 350;	hit300k-x-center = 300, hit300k-y-center = 350; 

Combo位置(缩放比例为zoomval*0.9, 以字符串首字母x左对齐y居中对齐,字间距0)
300-x-left = 100, 300-y-center = 200;	300k-x-left = 350, 300k-y-center = 200;
100-x-left = 100, 100-y-center = 275;	100k-x-left = 350, 100k-y-center = 275;
 50-x-left = 100,  50-y-center = 350;	miss-x-left = 350, miss-y-center = 350;

ranking-maxcombo图片位置(缩放比例为zoomval*0.78, 以图片左上角对齐)
ranking-maxcombo-left = 6,      ranking-maxcombo-top = 375;

MaxCombo位置(缩放比例为zoomval*0.9, 以字符串首字母x左对齐y顶端对齐,字间距0)
combo-x-left = 18,  combo-y-top = 412;

ranking-accuracy图片位置(缩放比例为zoomval*0.78, 以图片左上角对齐)
ranking-accuracy-left = 228,    ranking-accuracy-top = 375;

Accuracy位置(缩放比例为zoomval*0.9, 以字符串首字母x左对齐y顶端对齐,字间距0)
combo-x-left = 242,  combo-y-top = 412;

Menu-back图标位置(缩放比例为zoomval*0.8, 以图片左下角对齐)
back-left = 0,    back-bottom = 0;

ranking-panel位置(缩放比例为zoomval*0.78, 以图片左上角对齐)
ranking-panel-left = 0,   ranking-panel-top = 80;

ranking-graph位置(缩放比例为zoomval*0.78, 以图片左上角对齐)
ranking-graph-left = 200, ranking-graph-top = 475;

ranking-perfect位置(缩放比例为zoomval*0.78, 以图片中心对齐)
ranking-perfect-left = 325,     ranking-perfect-top = 537

Ranking-title图标位置(缩放比例为zoomval*0.78, 以图片右上角对齐)
rankingtitle-right = 25,    rankingtitle-top = 0;

Ranking图标位置(缩放比例为zoomval*0.78, 以图片中心对齐)
ranking-center-right = 150,     ranking-center-top = 250;

selection-mod图标位置(缩放比例为zoomval*0.78, 以图片中心对齐, 以图片中心堆叠:间距=图片宽度/2)
mod-right = 50,      mod-center-top = 325;

Replay图标位置(缩放比例为zoomval*0.78, 以图片x右对齐y居中对齐)
replay-right = 0,     replay-center-top = 450;