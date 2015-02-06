var g_config = {

	empty:-1
	,numStart:0
	,numX:10
	,numMultiX:100 //rt value when match: 120：2Xs 130:3Xs 140:4Xs

	,directCount:4
	//Grid size
	,gridCount_x:7
	,gridCount_y:7
	
	//初始块数
	,brickNum_init:8
	,brickNum_everyRound:2
	
	,gridMargin:5
	,gridInnerSize:80
	,gridOuterSize:90
	,gridTop:150

	//暂停目录按钮坐标
	,pauseBtLeft0:90
	,pauseBtLeft1:280
	,pauseBtTop0:220
	,pauseBtTop1:300

	//pos for step-tutorials
	,stBtShowLeft:250
	,stBtCancelLeft:70

	,numStepTuts:6

	,statePause:{
		spManual:0
		,spEnd:1
		,spEndNew:2
		,spStart:3
	}
	
	//zorder
	,zorder:{
		GameBG:10
		,GameBottom:20
		,GameObject:25
		,GameBrickShadow:27
		,GameMask:28
		,GameTutBg:30
		,GameTutObject:32
		,GameTip:40
		,GameTouch:45
		,GameUI:50
		,GamePause:60
		,GameTut:1000
	}
	,saveData:{
		key_root:"save_data"
		,key_modeOriginal:"modeOriginal"
		,key_currentScore:"currentScore"
		,key_maxScore:"maxScore"
		,key_round:"round"
		,key_status:"status"
		,key_isNewRecord:"newRecord"
		,key_globalVisit:"globalVisit"
		,key_todayVisit:"todayVisit"
		,key_unSyncCount:"un_sync_count"
		,key_shareCountFB:"shareCount_fb"
		,key_shareCountTW:"shareCount_tw"
		
	}
	
	//TitleView回调参数
	,callBackPara:{
		empty:0							//无参数,继续游戏
		,restartGame:1		//开始游戏
	}
	,colorStrongText:"#0192e0"
	,delayControl:0
	,delayFactor:[0,0,500]
};

var g_tools = {
	member:0,
	random:function(p_iStart, p_iEnd){
		return p_iStart + Math.floor( Math.random()*(p_iEnd - p_iStart) );
	},
	isHitRandom:function(p_iPercent){
		return this.random(0, 100)<p_iPercent;
	},
	randomFloat:function(p_fStart, p_fEnd){
		return p_fStart +  Math.random()*(p_fEnd - p_fStart);
	}

};

var cc = {
	p:function(x,y){
	if (x==undefined)return {x: 0, y: 0};
    if (y==undefined)return {x: x.x, y: x.y};
    return {x:x, y:y};
	},

	color:function(r,g,b){
		if(r==undefined||g==undefined||b==undefined){
		}else{
			var l_strR = r.toString(16);
			if(l_strR.length < 2){
				l_strR = "0"+l_strR;
			}
			var l_strG = g.toString(16);
			if(l_strG.length < 2){
				l_strG = "0"+l_strG;
			}
			var l_strB = b.toString(16);
			if(l_strB.length < 2){
				l_strB = "0"+l_strB;
			}
			return "#"+l_strR+l_strG+l_strB;
		}
	}
};

var g_gameMgr = {
	// 描画数组
	arrayGrid:null,
	// 统计数组
	arrayNumCount:null,
	arrayConnectPoint:null,
	
	// 存档数据
	jsonSaveData:null,
	
	//String数据
	jsonString:null,
	
	_lang:null,

	// 当前分数
	currentScore:0,
	
	// 最高分数
	maxScore:0,
	
	// 回合数
	round:0,
	//本局是否破纪录
	bNewRecord:false,

	//全球总共来访者次数
	globalVisitorAll:0,
	//今日来访者次数
	globalVisitorToday:0,
	//未同步的局数
	unSyncCount:0,

	//分享次数
	shareCount_fb:0,
	shareCount_tw:0,

	//isMobile
	bIsMobile:false,
	bIsIos:false,
	bIsAndroid:false,

	//isIE
	isIE:false,
	//IEVersion 6~12
	ieVersion:7,
	
	brickColors:[	
		"#ff0000",
		"#e5780d",
		"#2bbcd7",
		"#d9b425",
		"#cf55bf",
		"#83356f",
		"#a0bd2e",
		"#2b8b0e",
		"#9b4f0b",
		"#4f647d",
		"#ffffff"
	],

	st_bricks:[
		{x:0,y:3,c:1},
		{x:2,y:1,c:1},
		{x:2,y:5,c:1},
		{x:3,y:0,c:2},
		{x:3,y:4,c:2},
		{x:4,y:4,c:1},
		{x:5,y:3,c:1},
		{x:1,y:0,c:2},
		{x:4,y:1,c:10}
	],		
	st_steps:[//Step tutorial
		{x:1,y:3,
		t:"Click an empty grid between same tiles to merge them with the sum.</br>2 other tiles are generated after each move.",
		z:"在相等方块之间的空格处点击以合并他们生成他们的和</br>每步之后都会新增两个随机方块。"},//1
		{x:3,y:3,
		t:"A 3-tiles move follows the same rule.</br>(eg. 2+2+2=6)",
		z:"3个方块遵循同样的规律。比如：2+2+2=6"},//2
		{x:1,y:4,
		t:"A 4-tiles move with double-double numbers or 4 same numbers are both very nice.</br>(eg. 2+2+1+1=6)",
		z:"4个方块，无论是两两相等或者4块都相等都是极好的。比如:2+2+1+1=6"},//3
		{x:3,y:4,
		t:"If the sum is equal or greater than 10, they're merged into an 'x'.</br>(eg. 6+6=12, it's greater than 10 and turns to x)",
		z:"假如和大于等于10，他们将合并成一个'x'。比如6+6的情况"},//4
		{x:3,y:1,
		t:"Perform an 'X-Match' to score!</br>'X-Match' won't generate the sum-up tile or new random tiles.",
		z:"完成一个X-Match来得分！每次X-Match都不会触发新增的方块"}//5
	],

	st_tut_Mask:[
		{l:0,t:3,r:5,b:3},
		{l:1,t:0,r:3,b:4},
		{l:0,t:0,r:4,b:6},
		{l:1,t:3,r:3,b:4},
		{l:3,t:1,r:4,b:4}
	],
	st_gen:[
		{x:1,y:6,c:1},{x:6,y:4,c:1},//1
		{x:0,y:4,c:2},{x:5,y:0,c:6},//2
		{x:0,y:6,c:2},{x:5,y:5,c:1},//3
		{x:0,y:0,c:2},{x:0,y:4,c:1}//4
	],

	// 初始化
	init:function(){
		this.initBrowser();

		console.log("GameMgr init begin");
		this.arrayGrid = new Array();
		this.arrayNumCount = new Array();
		this.arrayConnectPoint = new Array();
		console.log("loadData");
		this.loadData();
		this.initMapData();
		this.clearGame();
		console.log("GameMgr init end");

		

		//var l_this=this.st_bricks[0];
		//console.log("test brick:"+l_this.x);
	},

	//Init By Browser
	initBrowser:function(){
		this._lang=(window.navigator.systemLanguage?window.navigator.systemLanguage:window.navigator.language).toLowerCase();
		if (this._lang==null) {
			this._lang="en";
		};
		var l_strLowerAgent=navigator.userAgent.toLowerCase();
		console.log(l_strLowerAgent);
		//IE
		this.isIE = l_strLowerAgent.match(/msie/i)!=null;
		if(this.isIE){
			var l_iVersionIndex = l_strLowerAgent.indexOf("msie") + 5;
			var l_strVersion = l_strLowerAgent.substr(l_iVersionIndex,1);
			this.ieVersion = parseInt(l_strVersion);

			//import json2.js for IE7 (not works))
			if(this.ieVersion == 7 || this.ieVersion == 6){
				//document.write("<script src='./jQuery_lib/json2.js'><\/script>");
				$.getScript('./jQuery_lib/json2.js', function(){});
				console.log("import json2.js for ie7 ie6");
			}
		}


		this.bIsMobile=l_strLowerAgent.match(/(ipad)|(iphone)|(ipod)|(android)/i)!=null;
		if(!this.bIsMobile){
			$.getScript('./social.js', function() {
				console.log("load social.js done");
			});
			$('body').append("<div id='fb-root'></div>");
		}else{
			if(l_strLowerAgent.match(/(android)/i)!=null){
				this.bIsAndroid = true;
			}else{
				this.bIsIos = true;
			}
		}

		//Shared Button with image
		if(true/*!this.bIsMobile*/){
			this.showShareButtons();
		}
	},

	//show share buttons in desktop brower
	showShareButtons:function(){
		//stLight.options({publisher: "261e4fcf-468e-41cc-884d-3c06d5b8ca28", doNotHash: false, doNotCopy: false, hashAddressBar: false});

		$("#game_scene").append("<div id='share_buttons_div' class='share_buttons_div'> </div>");
		$("#share_buttons_div").css({"z-index":g_config.zorder.GameUI}).
		append("\
			<div class='like-block-only-button'>\
				<img id='s_facebook' class='like-button share s_facebook' src='./res/share/facebook_32.png' />\
			</div>\
			").
		append("\
			<div class='like-block-only-button'>\
                <img id='s_twitter' class='like-button share s_twitter' src='./res/share/twitter_32.png'/>\
            </div>\
            ").
		append("\
			<div class='like-block-only-button'>\
                <img id='s_reddit' class='like-button share s_reddit' src='./res/share/reddit_32.png' />\
            </div>\
            ").
		append("\
			<div class='like-block-only-button'>\
                <img id='s_plus' class='like-button share s_plus' src='./res/share/googleplus_32.png'/>\
            </div>\
            ").
		append("\
			<div class='like-block-only-button'>\
                <img id='s_digg' class='like-button share s_digg' src='res/share/digg_32.png'/>\
            </div>\
            ");


		$.getScript("jQuery_lib/SocialShare.min.js", function(){
			console.log("load SocialShare.js done");
			g_gameMgr.shareSocialLink("#s_facebook");
			g_gameMgr.shareSocialLink("#s_twitter");
			g_gameMgr.shareSocialLink("#s_reddit");
			g_gameMgr.shareSocialLink("#s_plus");
			g_gameMgr.shareSocialLink("#s_digg");
		});
		
	},

	shareSocialLink:function(p_strElemID){
		$(p_strElemID).ShareLink({
			title: 'JUST CAN\'T STOP!!',
			text: 'I got '+g_gameMgr.maxScore+' in #X_Match. Can you beat my record?',
			image: 'http://geekmouse.github.io/xmatch/res/iTunesArtwork256.jpg',
			//url: 'http://geekmouse.github.io/xmatch/',
			url: 'http://geekmouse.github.io/xmatch/start.html',
			class_prefix:'s_',
			width:640,
			height:480
		});
	},

	shareSocialCount:function(p_strElemID){
		$(p_strElemID).ShareCounter({
            url: 'http://geekmouse.github.io/xmatch/start.html'
        });
	},
	
	readString:function(key){
		if(_lang.substr(0,2)=="zh"){
			return g_string;
		}
	},

	isZh:function(){
		return this._lang.substr(0,2)=="zh";
	},

	// 初始二维数组
	initMapData:function(){

		console.log("GameMgr init map");
		for (var i = 0; i < g_config.gridCount_x; i++) {
			this.arrayGrid[i] = new Array();
			for (var j=0; j<g_config.gridCount_y; j++){
				this.arrayGrid[i][j] = new GameGrid();
			}
		}
	},
	
	/*
	 * 根据gridPoint得到 位置
	 */
	getPositionByGrid:function(p_gridPoint){
		return cc.p(
				(g_config.gridMargin + p_gridPoint.x * g_config.gridOuterSize),
				(g_config.gridTop + p_gridPoint.y * g_config.gridOuterSize)
		);
	},

	/*
	 * 根据位置得到Brick
	 */
	getBrick:function(p_gridPoint){
		if(this.arrayGrid[p_gridPoint.y][p_gridPoint.x].gameBrick != null){
			return this.arrayGrid[p_gridPoint.y][p_gridPoint.x].gameBrick;
		}else{
			return null;
		}
	},
	/*
	 * 增加一个Brick数据 成功 return true 失败 return false
	 */
	addBrick:function(p_gameBrick, p_gridPoint){
		if(this.arrayGrid[p_gridPoint.y][p_gridPoint.x].gameBrick == null){
			this.arrayGrid[p_gridPoint.y][p_gridPoint.x].addGameBrick(p_gameBrick);
			return true;
		}else{
			console.log("error here GameMgr_addBrick");
			return false;
		}
	},

	/*
	 * 增加一个Brick数据
	 * 
	 * return value: true 增加成功 false 增加失败
	 */
	removeBrick:function(p_gridPoint){
		if(this.arrayGrid[p_gridPoint.y][p_gridPoint.x].gameBrick != null){
			this.arrayGrid[p_gridPoint.y][p_gridPoint.x].removeGameBrick();
			return true;
		}else{
			console.log("error here GameMgr_removeBrick");
			return false;
		}
	},

	/*
	 * 点击格子处理
	 * 
	 * return value: -1 : 不能点击 0~9: 点击完得数 10: 得到一个X 20: 消除两个X
	 */
	clickGrid:function(p_gridPoint){
		this.clearNumCountArray();
		this.clearConnectPointArray();
		// 不为空的话直接返回 -1
		if(! this.isGridEmpty(p_gridPoint)){
			return g_config.empty;
		}else{
			this.calculateByGrid(p_gridPoint);
	
			// 能点击
			if(this.canGridClicked(p_gridPoint)){
				var l_targetNum = this.calculateTargetNum();
				return l_targetNum;
			}
			// 不能点击
			else{
				return g_config.empty;
			}
		}
	},

	// 清理统计数组
	clearNumCountArray:function(){
		for (var i = 0; i <= g_config.numX; i++) {
			this.arrayNumCount[i] = 0;
		}
	},
	// 清理连接点数组
	clearConnectPointArray:function(){
		// this.arrayConnectPoint = new Array();
		for(var i=0; i<g_config.directCount; i++){
			this.arrayConnectPoint[i] = null;
		}
	},

	// 判断格子为空
	isGridEmpty:function(p_gridPoint){
		return (this.arrayGrid[p_gridPoint.y][p_gridPoint.x].gameBrick == null);
	},

	// 判断能不能点击，它不能独立工作，前面要加calculateByGrid
	canGridClicked:function(p_gridPoint){
		var l_result = false;
		// 如果这一点上有数，不能点击
		if(! this.isGridEmpty(p_gridPoint)){
			return l_result;
		}
		var l_strTemp = "";
		for (var i = 0; i <= g_config.numX; i++) {
			l_strTemp += this.arrayNumCount[i]+",";
			// 多个一样的
			if(this.arrayNumCount[i] > 1){
				l_result = true;
				break;
			}
		}
		return l_result;
	},

	// 点击之后的目标值
	calculateTargetNum:function(){
		var l_targetNum = 0;
		for (var i = 0; i <= g_config.numX; i++) {
			var l_iNum = i;
			// 多个一样的
			if(this.arrayNumCount[i] > 1){
				l_targetNum += this.arrayNumCount[i]*l_iNum;
				// 消除了Crossing
				if(l_iNum == g_config.numX){
					// 120, 130, 140分别对应 2X, 3X, 4X
					l_targetNum = g_config.numMultiX + (g_config.numX * this.arrayNumCount[i]);
					return l_targetNum;
				}

			}
		}
		if(l_targetNum > g_config.numX){
			l_targetNum = g_config.numX;
		}
		return l_targetNum;
	},

	// 统计这一点四周的数字
	calculateByGrid:function(p_gridPoint){
		var l_iConnectPointIndex = 0;

		// toward left
		for (var i = p_gridPoint.x-1; i >=0; i--) {
			if(this.arrayGrid[p_gridPoint.y][i].gameBrick != null){
				var l_iNum = this.arrayGrid[p_gridPoint.y][i].gameBrick.number;
				this.arrayNumCount[l_iNum]++;
				// 记录位置
				this.arrayConnectPoint[l_iConnectPointIndex++] = cc.p(i, p_gridPoint.y);
				break;
			}
		};
		// toward right
		for (var i = p_gridPoint.x+1; i < g_config.gridCount_x; i++) {
			if(this.arrayGrid[p_gridPoint.y][i].gameBrick != null){
				var l_iNum = this.arrayGrid[p_gridPoint.y][i].gameBrick.number;
				this.arrayNumCount[l_iNum]++;
				// 记录位置
				this.arrayConnectPoint[l_iConnectPointIndex++] = cc.p(i, p_gridPoint.y);
				break;
			}
		};
		// toward up
		for (var i = p_gridPoint.y-1; i >=0; i--) {
			if(this.arrayGrid[i][p_gridPoint.x].gameBrick != null){
				var l_iNum = this.arrayGrid[i][p_gridPoint.x].gameBrick.number;
				this.arrayNumCount[l_iNum]++;
				// 记录位置
				this.arrayConnectPoint[l_iConnectPointIndex++] = cc.p(p_gridPoint.x, i);
				break;
			}
		};
		// toward down
		for (var i = p_gridPoint.y+1; i < g_config.gridCount_y; i++) {
			if(this.arrayGrid[i][p_gridPoint.x].gameBrick != null){
				var l_iNum = this.arrayGrid[i][p_gridPoint.x].gameBrick.number;
				this.arrayNumCount[l_iNum]++;
				// 记录位置
				this.arrayConnectPoint[l_iConnectPointIndex++] = cc.p(p_gridPoint.x, i);
				break;
			}
		};

		// 输出connectPoint
		var l_strTemp = "";
		for(var i=0; i<g_config.directCount; i++){
			var l_gridPoint = this.arrayConnectPoint[i];
			if(l_gridPoint != null){
				var l_iNum = this.getBrick(l_gridPoint).number;
				l_strTemp += (l_gridPoint.x+"-"+l_gridPoint.y+":"+l_iNum+"; ");
			}
		}
		//console.log("connectPoint before: "+l_strTemp);

                // 排除单一的点位置
		for(var i=0; i<g_config.directCount; i++){
			var l_pointA = this.arrayConnectPoint[i];
			// A点不为空
			if(l_pointA != null){
				var l_numA = this.getBrick(l_pointA).number;
				var l_bRemove = true;
				for(var j=0; j<g_config.directCount; j++){
					var l_pointB = this.arrayConnectPoint[j];
					// B点不一样,且不为空
					if(i != j && l_pointB != null){
						var l_numB = this.getBrick(l_pointB).number;
						if(l_numA == l_numB){
							l_bRemove = false;
							break;
						}
					}
				}
				if(l_bRemove){
					this.arrayConnectPoint[i] = null;
				}
			}
		}

		// 输出connectPoint
		var l_strTemp = "";
		for(var i=0; i<g_config.directCount; i++){
			var l_gridPoint = this.arrayConnectPoint[i];
			if(l_gridPoint != null){
				l_strTemp += (l_gridPoint.x+","+l_gridPoint.y+"; ");
			}
		}
		//console.log("connectPoint after: "+l_strTemp);
	},
	
	// 判断游戏结束
	checkGameOver:function(){
		
		
		// var l_bResult = true;
		for(var i=0; i<g_config.gridCount_y; i++){
			for(var j=0; j<g_config.gridCount_x; j++){
				var l_gridPoint = cc.p(i, j);
				//对每个点都要算一遍
				this.clearNumCountArray();
				this.clearConnectPointArray();
				this.calculateByGrid(l_gridPoint);
				if(this.canGridClicked(l_gridPoint)){
					return false;
				}
			}
		}
		return true;
	},
	
	
	// 一局前清理
	clearGame:function(){
		console.log("GameMgr clearGame...");
		// 移除所有Brick
		for(var i=0; i<g_config.gridCount_y; i++){
			for(var j=0; j<g_config.gridCount_x; j++){
				var l_gridPoint = cc.p(j, i);
				
				if(this.getBrick(l_gridPoint) != null){
					//TODO
					this.getBrick(l_gridPoint).removeMyself();
					this.arrayGrid[i][j].removeGameBrick();
				}
			}
		}
		
		// 初始化分数
		this.currentScore = 0;
		// this.maxScore = 0;
		this.round = 0;
		this.bNewRecord=false;
	},

	//根据当前分数,得到2的概率
	//{20,[0,10,90]};{30,[0,20,80]};{50,[0,50,50]}
	getRandomNumber:function(){
		var l_gameControl_basic = [
		[20, [0,10.0,90.0]]
		,[30,[0,20.0,80.0]]
		,[50,[0,50.0,50.0]]
		];

		//区间
		var l_iScore = g_gameMgr.currentScore;
		var l_iAreaIndex = 0;

		for(; l_iAreaIndex<l_gameControl_basic.length; l_iAreaIndex++){
			if(l_iScore < l_gameControl_basic[l_iAreaIndex][0]){
				break;
			}
		}

		//比例数组
		var l_arrayPercent = [];

		if(l_iAreaIndex == 0){
			l_arrayPercent = l_gameControl_basic[l_iAreaIndex][1];
		}else if(l_iAreaIndex == l_gameControl_basic.length){
			l_arrayPercent = l_gameControl_basic[l_iAreaIndex - 1][1];
		}//线性
		else{
			var l_iBottom = l_iAreaIndex - 1;
			var l_iTop = l_iAreaIndex;
			for(var i=g_config.numStart; i<=g_config.numX; i++){
				var l_fFactor = (l_iScore - l_gameControl_basic[l_iBottom][0])/(l_gameControl_basic[l_iTop][0] - l_gameControl_basic[l_iBottom][0]);
				var l_fPercent = l_gameControl_basic[l_iBottom][1][i] + l_fFactor*(l_gameControl_basic[l_iTop][1][i] - l_gameControl_basic[l_iBottom][1][i]);
				l_arrayPercent.push(l_fPercent);
			}
		}

		var l_fRandom = g_tools.randomFloat(0.0,100.0);
		for (var i = 0; i < l_arrayPercent.length; i++) {
			if(l_fRandom < l_arrayPercent[i]){
				return i;
			}
			l_fRandom -= l_arrayPercent[i];
		};
		console.log("error here getRandomNumber");
		return 1;
	},
	
	// 增加回合数
	addRound:function(){
		this.round ++;
	},
	
	// 增加分数
	addCurrentScore:function(p_iScore){
		this.currentScore += p_iScore;
		
		// 超过最大值的话，更新最大值
		if(this.currentScore > this.maxScore){
			this.bNewRecord=true;
			this.maxScore = this.currentScore;
		}
	},
	
	/*
	 * 向服务器请求全局访问次数和今日访问次数
	 * 
	 * 前端需求:
	 * 1.POST请求
	 * 2.内容为json格式，(未上传的局数)
	 * 
	 * 后端返回:
	 * json格式
	 */
	requestVisitCount:function(p_iCount){
		var l_gameMgr = this;
		var l_requestJsonData = {};
		l_requestJsonData["count"] = p_iCount;
		console.log("requestData:"+p_iCount);
		var l_strJsonData = JSON.stringify(l_requestJsonData);


		var l_gameMgr = this;
		var l_httpRequest=$.ajax({
			url:"http://www.geekmouse.net/Server_mx_product/web_gameInterface.php",
			type:"post",
			data:l_strJsonData,
			async:true,
			success:function(p_data){
				console.log("receiveData:"+p_data);
				var l_strResponse = p_data;
				var l_jsonObj = JSON.parse(l_strResponse);
				l_gameMgr.globalVisitorAll = l_jsonObj["global"];
				l_gameMgr.globalVisitorToday = l_jsonObj["today"];
				l_gameMgr.unSyncCount = 0;
				l_gameMgr.saveData();
			}
			});
		
	},

	//当前局读取档
	loadSaveDataOfThisGame:function(){
		console.log("GameMgr loadSaveDataOfThisGame");
		var l_jsonData = this.jsonSaveData[g_config.saveData.key_modeOriginal];
		if(l_jsonData == undefined){
			console.log("GameMgr loadSaveDataOfThisGame error ");
		}
		if(l_jsonData[g_config.saveData.key_round] != undefined){
			this.round = l_jsonData[g_config.saveData.key_round];
		}
		if(l_jsonData[g_config.saveData.key_currentScore] != undefined){
			this.currentScore = l_jsonData[g_config.saveData.key_currentScore];	
		}
		if(l_jsonData[g_config.saveData.key_maxScore] != undefined){
			this.maxScore = l_jsonData[g_config.saveData.key_maxScore];	
		}
		
		this.bNewRecord = (l_jsonData[g_config.saveData.key_isNewRecord] == 1);

		if(l_jsonData[g_config.saveData.key_globalVisit] != undefined){
			this.globalVisitorAll = l_jsonData[g_config.saveData.key_globalVisit];
		}
		if(l_jsonData[g_config.saveData.key_todayVisit] != undefined){
			this.globalVisitorToday = l_jsonData[g_config.saveData.key_todayVisit];
		}
		if(l_jsonData[g_config.saveData.key_unSyncCount] != undefined){
			this.unSyncCount = l_jsonData[g_config.saveData.key_unSyncCount];
		}
		if(l_jsonData[g_config.saveData.key_shareCountFB] != undefined){
			this.shareCount_fb = l_jsonData[g_config.saveData.key_shareCountFB];
		}
		if(l_jsonData[g_config.saveData.key_shareCountTW] != undefined){
			this.shareCount_tw = l_jsonData[g_config.saveData.key_shareCountTW];
		}
	},
	
	//得到存档下当前局面某个格子里的数
	getSaveLoadNumByGrid:function(p_gridPoint){
		var l_jsonData = this.jsonSaveData[g_config.saveData.key_modeOriginal];
		return l_jsonData[g_config.saveData.key_status][p_gridPoint.y][p_gridPoint.x];
	},
	
	// 读档
	loadData:function(){
		console.log("GameMgr loadData");
		if(window.localStorage){
			var l_strJsonData = window.localStorage.getItem(g_config.saveData.key_root);
			if(l_strJsonData == undefined || l_strJsonData == ""){
				console.log("first run no saveData exist");
				this.jsonSaveData = {};
			}else{
				console.log("load data:"+l_strJsonData);
				this.jsonSaveData = JSON.parse(l_strJsonData);
				console.log("load Data success");
			}
		}else{
			console.log("not support localStorage");
		}
	},
	
	parseJson:function(p_key, p_value){
		return p_value;
	},

	// 存档
	saveData:function(){
		if(this.jsonSaveData == null){
			this.jsonSaveData = {};
		}
		if(this.jsonSaveData[g_config.saveData.key_modeOriginal] == undefined){
			this.jsonSaveData[g_config.saveData.key_modeOriginal] = {};
		}
		var l_jsonData = this.jsonSaveData[g_config.saveData.key_modeOriginal];
		
		// 赋值
		l_jsonData[g_config.saveData.key_maxScore] = this.maxScore;
		l_jsonData[g_config.saveData.key_round] = this.round;
		l_jsonData[g_config.saveData.key_currentScore] = this.currentScore;
		//visit count
		if(this.globalVisitorAll > 0 && this.globalVisitorToday > 0){
			l_jsonData[g_config.saveData.key_globalVisit] = this.globalVisitorAll;
			l_jsonData[g_config.saveData.key_todayVisit] = this.globalVisitorToday;
		}

		//un sync count
		l_jsonData[g_config.saveData.key_unSyncCount] = this.unSyncCount;

		//shareCount
		l_jsonData[g_config.saveData.key_shareCountFB] = this.shareCount_fb;
		l_jsonData[g_config.saveData.key_shareCountTW] = this.shareCount_tw;

		//new record
		if(this.bNewRecord){
			l_jsonData[g_config.saveData.key_isNewRecord] = 1;
		}else{
			l_jsonData[g_config.saveData.key_isNewRecord] = 0;
		}
		l_jsonData[g_config.saveData.key_status] = new Array();
		for(var i=0;i<g_config.gridCount_y;i++){
			// 第一次存档
			if((l_jsonData[g_config.saveData.key_status][i] == undefined) || (l_jsonData[g_config.saveData.key_status][i].length == 0)){
				l_jsonData[g_config.saveData.key_status][i] = new Array();
			}
			for(var j=0;j<g_config.gridCount_x;j++){
				var l_iNumber = g_config.empty;
				if(this.arrayGrid[i][j].gameBrick != null){
					l_iNumber = this.arrayGrid[i][j].gameBrick.number;
				}
				l_jsonData[g_config.saveData.key_status][i][j] = l_iNumber;
			}
		}

		// Json.parse
		var l_strJsonData = JSON.stringify(this.jsonSaveData);
		//console.log("savedata: " + l_strJsonData);
		
		window.localStorage.setItem(g_config.saveData.key_root, l_strJsonData);
	},
	
	//转换为易读数字 "14250" -> "14,250"
	convertToReadable :function(n){
		var b=parseInt(n).toString(); 
		var len=b.length; 
		if(len<=3){return b;} 
		var r=len%3; 
		return r>0?b.slice(0,r)+","+b.slice(r,len).match(/\d{3}/g).join(","):b.slice(r,len).match(/\d{3}/g).join(","); 
	}

};

/** Game Brick*/
//这一处的第几个Brick, 解决移除时，同时移除两个的问题
function GameGrid (){
	this.brickIndex = 0;
	this.gameBrick = null;

	//判断是否为空
	this.empty = function(){
		return (this.gameBrick == null)
	}

	//移除GameBrick
	this.removeGameBrick = function(){
		if(this.gameBrick != null){
			this.gameBrick = null;
		}else{
			console.log("error Here GameGrid removeGameBrick");
		}
	}

	//设置GameBrick
	this.addGameBrick = function(p_gameBrick){
		if(this.gameBrick == null){
			this.brickIndex++;
			this.gameBrick = p_gameBrick;
		}else{
			console.log("error Here GameGrid setGameBrick");
		}
	}
};

function GameBrick (p_iNumber, p_strID, p_bWithTut){
	this.withTut=p_bWithTut?p_bWithTut:false;

	this.leftOriginal = 0;
	this.topOriginal = 0;
	
	this.number = p_iNumber;
	this.brick_id = p_strID;
	
	
	this.show = function(p_delayFactor){
		var l_strColor = g_gameMgr.brickColors[this.number];
		if (p_delayFactor!=0 && !this.withTut) {
			$("#brick_layer").append("<div class='brick_shadow' id='shadow_"+this.brick_id+"'></div>");
			$("#shadow_"+this.brick_id).css({
				"left":this.leftOriginal+20
				,"top":this.topOriginal+20
				,"z-index":g_config.zorder.GameBrickShadow
				,opacity:0.5
				,filter:"alpha(opacity=50)"
			});
		}
		

		$("#brick_layer").append("<div class='brick_back' id='"+this.brick_id+"'></div>");
		$("#"+this.brick_id).css({
			"left":this.leftOriginal
			,"top":this.topOriginal
			,"z-index":g_config.zorder.GameObject
			,"background-color": l_strColor
			,opacity: 0.0
			,filter:"alpha(opacity=0)"
		});

		if(this.number == g_config.numX){
			$("#"+this.brick_id).append("<img class='brick_x' src='res/x.png'></img>");
		}
		else{
			//Number
			$("#"+this.brick_id).text(this.number);
		}

		if(this.withTut){
			$("#brick_layer_tut").append("<div class='brick_back' id='"+this.brick_id+"_tut'></div>");
			$("#"+this.brick_id+"_tut").css({
				"left":this.leftOriginal
				,"top":this.topOriginal
				,"display":"none"
				,"z-index":g_config.zorder.GameTutObject
				,"background-color": l_strColor
				,opacity: 0.0
				,filter:"alpha(opacity=0)"
			});

			if(this.number == g_config.numX){
				$("#"+this.brick_id+"_tut").append("<img class='brick_x' src='res/x.png'></img>");
			}
			else{
				//Number
				$("#"+this.brick_id+"_tut").text(this.number);
			}
		}
		var l_brick=this;
		setTimeout(function(){
			l_brick.showAppearAction();
		}, g_config.delayFactor[p_delayFactor]);


	}

	
	//出现动画
	this.showAppearAction = function(){
		var l_brick = this;
		

		$("#"+this.brick_id)
		.delay(150)
		.animate({
				// width: 80,
				// height: 80,
				opacity:1,
				filter:"alpha(opacity=100)"
			},
			200,function(){
				$("#shadow_"+l_brick.brick_id).remove();
			}
			);

		if(this.withTut){
			$("#"+this.brick_id+"_tut")
			.delay(150)
			.animate({
					// width: 80,
					// height: 80,
					opacity:1,
					filter:"alpha(opacity=100)"
				},
				200
				);
		}
	}
	
	this.showDisAppearAction = function(p_targetPosition){
		var l_brick = this;
		$("#"+this.brick_id).animate({
			left: p_targetPosition.x, 
			top: p_targetPosition.y, 
			filter:"alpha(opacity=10)",
			opacity:0.1},
			200, function(){
			l_brick.removeMyself();
		});

		if(this.withTut){
			$("#"+this.brick_id+"_tut").animate({
				left: p_targetPosition.x, 
				top: p_targetPosition.y, 
				filter:"alpha(opacity=10)",
				opacity:0.1},
				200, function(){
				l_brick.removeMyself();
			});
		}
	}
	
	this.removeMyself = function(p_object){
		$("#"+this.brick_id).remove();
		if(this.withTut){
			$("#"+this.brick_id+"_tut").remove();
		}
	}

	this.showTut = function(){
		$("#"+this.brick_id+"_tut").css({
				"display":"inline"
			});
	}
	this.hideTut = function(){
		$("#"+this.brick_id+"_tut").css({
				"display":"none"
			});
	}
	return this;	
};