$(document).ready(function(){
  	
	$("p").text("Hello ... jQuery");
	GameScene.init();
	//for
    //FastClick.attach(document.body);
    //for mini
    var attachFastClick = Origami.fastclick;    
    attachFastClick(document.body);

});

var GameScene = {

	gameUI:null,
	gamePause:null,
	gameTutorial:null,
	isTouchEnabled:true,
	tutStep:-1,
	numForbids:0,
	tutArrowPosition:null,

	init:function(){
		g_gameMgr.init();
		this.gameUI = new GameHUD();

		//有存档
		if(g_gameMgr.jsonSaveData[g_config.saveData.key_modeOriginal] != undefined ){

			this.initBg();
			this.initMapBySaveData();
			this.showGamePause(g_config.statePause.spManual);
			
		}
		//第一次玩
		else{
			this.initBg(true);
			this.initRandomMap(true);
			console.log("GameScene showTitleView firstRun_withoutSD");
		}

		
	},

	//失去控制
	loseControl:function(){
		//绑定格子点击事件
		for (var i = 0; i < g_config.gridCount_y; i++) {
			for(var j = 0; j < g_config.gridCount_x; j++){
				//点击事件
				var l_strSuffix = "_click";
				$("#bg_"+i+""+j+l_strSuffix).unbind();
			}
		}	
		this.gameUI.isTouchEnabled=false;
		console.log('loss control');
	},

	//得到控制
	onControl:function(){
		//绑定格子点击事件
		for (var i = 0; i < g_config.gridCount_y; i++) {
			for(var j = 0; j < g_config.gridCount_x; j++){
				//点击事件
				var l_strSuffix = "_click";
				$("#bg_"+i+""+j+l_strSuffix).unbind().bind('click', function(event) {
					/* Act on the event */
					var l_strID = $(this).attr("id");
					var l_gridPoint = cc.p(0,0);
					l_gridPoint.y = parseInt(l_strID.substr(3,1));
					l_gridPoint.x = parseInt(l_strID.substr(4,1));
					console.log("click"+l_gridPoint.x+","+l_gridPoint.y);
					GameScene.processClickGrid(l_gridPoint);
				});
			}
		}
		this.gameUI.isTouchEnabled=true;
		console.log('on control');
	},

	syncSize:function(bFirstRun){
		
		if(true/*!g_gameMgr.bIsMobile*/){
			var width = $(window).width(); 
		    var height = $(window).height();
		    var l_zoomH=height/960;
		    var l_zoomW=width/640;
		    var l_zoomThis=l_zoomH<l_zoomW?l_zoomH:l_zoomW;
		      $("body").css({
		      	"zoom":l_zoomThis
		      	,"-moz-transform":"scale("+l_zoomThis+")"
		  });
			console.log("windowSize:("+width+","+height+")"); 
		}
	},
	//初始化HTML元素
	initBg:function(p_bWithTut){
		p_bWithTut=p_bWithTut?p_bWithTut:false;
		this.syncSize(true);
		$(window).resize(function(){GameScene.syncSize(false);});
		//背景
		$("#game_scene").append("<div id='grid_layer'></div>");
		$("#grid_layer").append("<div id='grid_mask_offset'></div>");
		var l_origPnt=g_gameMgr.getPositionByGrid(cc.p(0,0));
		$("#grid_mask_offset").css({
			"left":l_origPnt.x
			,"top":l_origPnt.y
			,"background-color":"#BDDEF0"
			,"width":630
			,"height":630
			,"position":"absolute"
		});

		for (var i = 0; i < g_config.gridCount_y; i++) {
			for(var j = 0; j < g_config.gridCount_x; j++){
				//bottombg
				$("#grid_layer").append("<div class='grid' id=bg_"+i+""+j+"></div>");
				var l_pnt=g_gameMgr.getPositionByGrid(cc.p(j,i));
				var gcss={"left":l_pnt.x,"top":l_pnt.y};
				var l_strColor =((i+j)%2 == 0)?"#BDDEF0":"#99D2F0";
				$("#bg_"+i+""+j).css(gcss).css({
					"background-color":l_strColor
					,"z-index":g_config.zorder.GameBG
				});
				//click div
				$("#grid_layer").append("<div class='grid' id='bg_"+i+""+j+"_click'></div>");
				$("#bg_"+i+""+j+"_click").css(gcss).css({
					"background-color":"#003085"
					,"opacity":"0"
					,"filter":"alpha(opacity=0)"
					,"z-index":g_config.zorder.GameTouch
				});
			}
		}
		$("#game_scene").append("<div id='brick_layer'></div>");
		if(p_bWithTut){
			this.initMask();
		}
		this.onControl();
	},

	initMask:function(){
		this._toggleMask(false);
		$("#bg_mask").remove();
		$("#grid_layer").append("<div class='grid' id='bg_mask'></div>");
		$("#bg_mask").css({
			"left":g_config.gridMargin
			,"top":g_config.gridTop
			,"width":g_config.gridCount_x*g_config.gridOuterSize
			,"height":g_config.gridCount_y*g_config.gridOuterSize
			,"background-color":"#003085"
			,"opacity":"0.8"
			,"filter":"alpha(opacity=0.8)"
			,"z-index":g_config.zorder.GameMask
		});

		$("#grid_layer_tut").remove();
		$("#game_scene").append("<div id='grid_layer_tut'></div>");
		for (var i = 0; i < g_config.gridCount_y; i++) {
			for(var j = 0; j < g_config.gridCount_x; j++){
				$("#grid_layer_tut").append("<div class='grid' id=bg_"+i+""+j+"_tut></div>");
				var l_pnt=g_gameMgr.getPositionByGrid(cc.p(j,i));
				var l_strColor =((i+j)%2 == 0)?"#BDDEF0":"#99D2F0";
				$("#bg_"+i+""+j+"_tut").css({
					"left":l_pnt.x
					,"top":l_pnt.y
					,"background-color":l_strColor
					,"z-index":g_config.zorder.GameTutBg
					,"display" : "none"
				});
			}
		}
		$("#brick_layer_tut").remove();
		$("#game_scene").append("<div id='brick_layer_tut'></div>");

	},

	//弹出暂停界面
	showGamePause:function(iState){
		//GamePause
		if(this.gamePause == null && this.tutStep<0){
			this.loseControl();

			console.log("initGamePause");
			this.gamePause = new ViewPause(iState);
		}
	},

	//隐藏GamePause
	hideGamePause:function(){
		if(this.gamePause != null){
			this.gamePause.disappear();
			this.gamePause = null;
			this.onControl();
		}
	},

	showStepTut:function(){
		this.loseControl();
		$("#game_scene").append("<div id='st_ask_bg' class='view_bk st_ask_bg'></div>");
		$("#st_ask_bg").append("<div id='st_ask_words' class='view_text st_ask_words'>Are you sure you want to QUIT for the tutorial? You’ll lose your current progress </div>")
		.append("<div id='st_bt_show' class='view_bt st_bt'>YES</div>")
		.append("<div id='st_bt_cancel' class='view_bt st_bt'>NO</div>")
		.css({"opacity":0.2})
		.animate({"opacity":1},200);

		$("#st_bt_show").css({"left":g_config.stBtShowLeft}).click(function(event) {
			GameScene.initMask();
			GameScene.initRandomMap(true);
			GameScene.onControl();
			$("#st_ask_bg").remove();
		});

		$("#st_bt_cancel").css({"left":g_config.stBtCancelLeft}).click(function(event) {
			GameScene.onControl();
			$("#st_ask_bg").remove();
		});
	},	

	showViewTarget:function(){
		this.loseControl();
		var l_viewTarget=new ViewTarget();
	},

	initRandomMap:function(bTut){
		console.log("initRandomMap WithoutSD");
		g_gameMgr.clearGame();
		if(bTut){
			this.tutStep=0;
			for (var i = 0; i<g_gameMgr.st_bricks.length; i++) {
				var l_thisBrick=g_gameMgr.st_bricks[i];
				this.addBrick(l_thisBrick.c,cc.p(l_thisBrick.x,l_thisBrick.y), true);
			};
			this.showStepTutTip(g_gameMgr.st_steps[0]);
		}
		else{
			this.addBricksByNum(g_config.brickNum_init);
		}
		this.updateUI();
		//每次开局请求一次
		g_gameMgr.requestVisitCount();
	},


	//根据存档加载地图
	initMapBySaveData:function(){
		g_gameMgr.loadSaveDataOfThisGame();
		for(var i=0; i<g_config.gridCount_y; i++){
			for(var j=0; j<g_config.gridCount_x; j++){
				var l_gridPoint = cc.p(j, i);
				var l_iNumber = g_gameMgr.getSaveLoadNumByGrid(l_gridPoint);
				if(l_iNumber >= 0){
					this.addBrick(l_iNumber, l_gridPoint);
				}
			}
		}
		this.updateUI();

		//加载上次存档请求一次
		g_gameMgr.requestVisitCount();
	},

	//每回合
	addBricksEveryRound:function(){
		//默认p_bWithTut:false
		var s=this.tutStep;
		if(s<0){
			this.addBricksByNum(g_config.brickNum_everyRound);
		}
		else{
			var l_gen1=g_gameMgr.st_gen[s*2];
			var l_gen2=g_gameMgr.st_gen[s*2+1];

			this.addBrick(l_gen1.c,cc.p(l_gen1.x,l_gen1.y), true);
			this.addBrick(l_gen2.c,cc.p(l_gen2.x,l_gen2.y), true);
		}
	},
	// 随机增加一定数目的Brick
	 addBricksByNum:function(p_iCount, p_bWithTut){
		p_bWithTut=p_bWithTut?p_bWithTut:false;
		var l_iBrickNum = 0;
		var l_arrayNum_basic = [1,2];
		while(l_iBrickNum < p_iCount){
			var l_iGridX = 0;
			var l_iGridY = 0;
			var l_gridPoint;
			do{
				l_iGridX= g_tools.random(0,g_config.gridCount_x);
				l_iGridY= g_tools.random(0,g_config.gridCount_y);
			}while(g_gameMgr.arrayGrid[l_iGridY][l_iGridX].gameBrick);

			var l_iIndex = g_tools.random(0, l_arrayNum_basic.length);
			var l_iNum = l_arrayNum_basic[l_iIndex];
			var l_gameBrick = this.addBrick(l_iNum, cc.p(l_iGridX, l_iGridY));
			
			l_iBrickNum ++;
		}
	},

	// 增加一个Brick进入场景
	addBrick:function(p_iNum, p_gridPoint, p_bWithTut){
		p_bWithTut=p_bWithTut?p_bWithTut:false;

		var l_strIDBrick = "brick_"+p_gridPoint.y+""+p_gridPoint.x;
		var l_iBrickIndex = g_gameMgr.arrayGrid[p_gridPoint.y][p_gridPoint.x].brickIndex + 1;
		l_strIDBrick = l_strIDBrick + "_" + l_iBrickIndex;
		var l_gameBrick = new GameBrick(p_iNum, l_strIDBrick, p_bWithTut);
		var l_pnt=g_gameMgr.getPositionByGrid(p_gridPoint);
		l_gameBrick.leftOriginal = l_pnt.x + 5;
		l_gameBrick.topOriginal = l_pnt.y + 5;
		l_gameBrick.show();
		g_gameMgr.addBrick(l_gameBrick, p_gridPoint);
		return l_strIDBrick;
	},


	/*
	 * 移除连接点的brick
	 * 
	 * p_gridPoint_clicked, 因为这个点为，而移除
	 */
	removeConnectPoint:function(p_gridPoint_clicked){
		for(var i=0; i<g_config.directCount; i++){
			var l_gridPoint = g_gameMgr.arrayConnectPoint[i];
			if(l_gridPoint){
				this.removeBrick(l_gridPoint, p_gridPoint_clicked);
			}
		}
	},

	/*
	 * 移除一个brick
	 * 
	 * p_gridPoint: 要移除的点
	 * p_gridPoint_clicked: 因为这里的点而移除
	 */
	removeBrick:function(p_gridPoint, p_gridPoint_clicked){
		var l_brick = g_gameMgr.getBrick(p_gridPoint);
		if(l_brick){
			var l_targetPoint = g_gameMgr.getPositionByGrid(p_gridPoint_clicked);
			l_brick.showDisAppearAction(l_targetPoint);
			g_gameMgr.removeBrick(p_gridPoint);
		}else{
			console.log("error here removeBrick");
		}
	},
	//处理点击格子
	processClickGrid:function(p_gridPoint){
		if(this.tutStep<0){//Not in tutorial
			this._processClickGrid(p_gridPoint);
		}
		else {
			var l_tutStep=g_gameMgr.st_steps[this.tutStep];
			var l_tutPnt=cc.p(l_tutStep.x,l_tutStep.y);
			if(p_gridPoint.x==l_tutPnt.x && p_gridPoint.y==l_tutPnt.y){//It's tutorial pnt
				this._processClickGrid(p_gridPoint);
				this.tutStep=(this.tutStep>=g_gameMgr.st_steps.length-1)?-1:this.tutStep+1;
				if (this.tutStep>=0) {
					var l_newStep=g_gameMgr.st_steps[this.tutStep];
					this.showStepTutTip(l_newStep);
				}
				else{
					$("#st_arrow").remove();
					$("#st_text").remove();
					this.showViewTarget();
					this._toggleMask(false);
				}
			}
			
		}
		
		//存档
		g_gameMgr.saveData();
	},
	_processClickGrid:function(p_gridPoint){
		var l_targetNum = g_gameMgr.clickGrid(p_gridPoint);
		console.log("--<"+p_gridPoint.x+","+p_gridPoint.y+"> --> "+l_targetNum);
		//消除了Crossing
		if(l_targetNum >= g_config.numMultiX){
			this.removeConnectPoint(p_gridPoint);
			
			var l_iScoreThisRound = (l_targetNum - g_config.numMultiX)/10;
			
			//增加round
			g_gameMgr.addRound();
			g_gameMgr.addCurrentScore(l_iScoreThisRound);
			console.log("score:"+ g_gameMgr.currentScore);
		}
		//正常消除普通数字
		else if(l_targetNum >= g_config.numStart && l_targetNum <= g_config.numX){
			this.removeConnectPoint(p_gridPoint);
			this.addBrick(l_targetNum, p_gridPoint, this.tutStep>=0);
			this.addBricksEveryRound();
			g_gameMgr.addRound();
		}
		else{//Forbid
			this.showForbid(p_gridPoint);
		}
		
		this.updateUI();
		
		//判断结束
		if(g_gameMgr.checkGameOver()){
			this.showGamePause(g_gameMgr.bNewRecord?g_config.statePause.spEndNew:g_config.statePause.spEnd);
		}
	},
	//不能点击动画
	showForbid:function(p_gridPoint){
		var l_position = g_gameMgr.getPositionByGrid(p_gridPoint);
		var l_thisId="forbid"+this.numForbids;
		$("#game_scene").append("<img id="+l_thisId+" class='click_tip' src='res/forbid.png'/>");
		$("#"+l_thisId).css({
				"left" : l_position.x,
				"top" : l_position.y,
				"opacity":0.2,
			})
		.animate(
			{"opacity":1,},
			200, function() {
				$(this).remove();
			}
		);
		this.numForbids=(this.numForbids+1)%10;
	},


	showStepTutTip:function(p_tutStep){
		var l_pntTip=cc.p(p_tutStep.x,p_tutStep.y);
		var l_position = g_gameMgr.getPositionByGrid(l_pntTip);
		this.tutArrowPosition = l_position;
		$("#st_arrow").remove();
		$("#game_scene").append("<img id='st_arrow' class='click_tip' src='res/mxArrow.png'/>");
		$("#st_arrow").css({
			"left" : l_position.x,
			"top" : l_position.y-40,
			"z-index":g_config.zorder.GameTip
		});
		this._tutTipLoop();
		//Put in Mask
		this._toggleMask(true);

		var l_thisMask=g_gameMgr.st_tut_Mask[this.tutStep];
		for (var i = l_thisMask.l; i <=l_thisMask.r;++i){
			//showTutbg
			this._toggleMaskBrick(cc.p(i,l_pntTip.y),false);

			//showTutBrick
			if(g_gameMgr.getBrick(cc.p(i,l_pntTip.y)) != null){
				g_gameMgr.arrayGrid[l_pntTip.y][i].gameBrick.showTut();
			}
		}

		for (var i = l_thisMask.t; i <=l_thisMask.b;++i){
			//showTutBg
			this._toggleMaskBrick(cc.p(l_pntTip.x,i),false);

			//showTutBrick
			if(g_gameMgr.getBrick(cc.p(l_pntTip.x,i)) != null){
				g_gameMgr.arrayGrid[i][l_pntTip.x].gameBrick.showTut();
			}
		}
			
		var l_text=p_tutStep.t;
		$("#st_text").remove();
		$("#game_scene").append("<div id='st_text' class='view_bk view_text st_text'><span style='color:#397fa4;'><p>Tutorial</p></span><p>"+l_text+"</p></div>");
		
	},

	_tutTipLoop:function(){
		var l_positionOrigin = GameScene.tutArrowPosition;
		var l_arrow=jQuery("#st_arrow")[0];
		if (l_arrow) {
			$("#st_arrow").animate({top:'+=10px'},300)
			.animate(
				{top:(l_positionOrigin.y-40)},
				300,GameScene._tutTipLoop);
		}
	},

	_toggleMask:function(pOn){
		if(pOn){
			for (var i = 0; i < g_config.gridCount_y; i++) {
				for(var j = 0; j < g_config.gridCount_x; j++){
					this._toggleMaskBrick(cc.p(j,i),pOn);
					if(g_gameMgr.getBrick(cc.p(j,i))){
						g_gameMgr.arrayGrid[i][j].gameBrick.hideTut();
					}
				}
			}
		}else{
			$("#bg_mask").remove();
			$("#grid_layer_tut").remove();
			$("#brick_layer_tut").remove();
		}
	},

	_toggleMaskBrick:function(p_Posi,pOn){
		$("#bg_"+p_Posi.y+""+p_Posi.x+"_tut").css({
			"display":pOn?"none":"inline",
		});

	},
	
	//更新UI
	updateUI:function(){
		if(this.gameUI){
			this.gameUI.updateRound();
			this.gameUI.updateScore();
		}
	},
}


//GameLayer
 function GameHUD(){
	//游戏场景引用
 	this.isTouchEnabled=true;
	//初始化底下的按钮
	this.init = function(){
		var l_gameUI = this;
		$("#game_scene").append("<div id='game_ui' class='game_ui'>");

		$("#game_ui")
		.append("<div id='title' class='title'>X-MATCH</div>")
		.append("<div id='current_score' class='score'>0</div>")
		.append("<div id='max_score' class='stat'>BEST</div>")
		.append("<div id='moves' class='stat'>MOVES</div>")
		.append("<div id='options_bg' class='button_option'></div>")
		.append("<div id='bt_tut' class='button_tut'>?</div>");
		

		$("#options_bg").append("<img id='options_img' src='res/mxGear.png'></img>").click(function(event){
			if(GameScene && l_gameUI.isTouchEnabled){
				GameScene.showGamePause(g_config.statePause.spManual);
			}
		});

		$("#bt_tut").click(function(event) {
			if( GameScene && l_gameUI.isTouchEnabled && GameScene.tutStep<0){
				GameScene.showStepTut();
			}
		});

		
		if(!g_gameMgr.bIsMobile){
			$("#game_ui").append("<div id= 'contact' class='contact'><hr>X-Match<br>Designed & presented by: <br>2015 GeekMouse<br><a target='_blank' href='http://geekmouse.net/press/'>Press Kit</a></div>");
		}

		var l_btY=800;
		var l_btXInt=100;
		var l_startX=230;

		$("#game_ui")
		.append("<img id='bt_fb' class='bt_sns' src='res/mxIconFB.png'></img>")
		.append("<img id='bt_tw' class='bt_sns' src='res/mxIconTwitter.png'></img>")
		.append("<img id='bt_pp' class='bt_sns' src='res/mxIconPaypal.png'></img>")
		.append("<a href='mailto:geek.mouse.game@gmail.com?subject=X-MATCH Feedback'><img id='bt_mail' class='bt_sns' src='res/mxIconMail.png'></img></a>");
		
		
		//FB
		$("#bt_fb").css({left: l_startX,top: l_btY}).click(function(event){
			if (l_gameUI.isTouchEnabled) {
				window.open("https://www.facebook.com/geekmouse.xmatch");
			}
		});
		//Twitter
		$("#bt_tw").css({left: l_btXInt+l_startX,top: l_btY}).click(function(event){
			if (l_gameUI.isTouchEnabled) {
				window.open("https://twitter.com/geek_mouse");
			}
		});
		//Paypal
		$("#bt_pp").css({left: l_btXInt*2+l_startX,top: l_btY}).click(function(event){
			if( l_gameUI.isTouchEnabled && GameScene.tutStep<0){
				GameScene.loseControl();
				var l_viewPaypal=new ViewPaypal();
			}
		});
		//Mail
		$("#bt_mail").css({
			left: l_btXInt*3+l_startX,
			top: l_btY,
		});
	}
	
	//更新回合
	this.updateRound = function(){
		console.log("GameUI updateRound"+g_gameMgr.round);
		var l_strRound = "MOVES: "+g_gameMgr.round.toString();
		$("#moves").text(l_strRound);
	}
	
	//更新分数
	this.updateScore = function(){
		console.log("GameUI updateScore"+g_gameMgr.currentScore);
		var l_strScore = g_gameMgr.currentScore.toString();
		$("#current_score").text(l_strScore);
		l_strScore = "BEST: "+g_gameMgr.maxScore.toString();
		$("#max_score").text(l_strScore);
	}
	this.init();
}


