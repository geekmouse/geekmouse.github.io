$(document).ready(function(){
	GameScene.init();
	//for normal
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
		// if(g_gameMgr.isIE){
		// 	this.initBg();
		// 	return;
		// }
		this.gameUI = new GameHUD();
		g_gameMgr.requestIpRegion();
		
		//有存档
		if(g_gameMgr.jsonSaveData[g_config.saveData.key_modeOriginal] != undefined ){

			this.initBg();
			this.initMapBySaveData();
			this.onControl();
			var l_rnOptions=g_tools.random(0,10);
			if(l_rnOptions<=3){
				this.showViewTargetAfterTut();
			}
			else{
				this.showGamePause(g_config.statePause.spStart);
			}
			//
		}
		//第一次玩
		else{
			this.initBg(true);
			this.initRandomMap(true);

			this.onControl();
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
		var width = $(window).width(); 
	    var height = $(window).height();
	    var l_zoomH=height/960;
	    var l_zoomW=width/640;
	    var l_zoomThis=l_zoomH<l_zoomW?l_zoomH:l_zoomW;
	    var l_strScale="scale("+l_zoomThis+")";
	      $("body").css({
	      	"zoom":l_zoomThis
	      	,"-moz-transform":l_strScale
	      	,"-ms-transform": l_strScale
	      	,"-o-transform":l_strScale
	      	,"-webkit-transform:":l_strScale
	  	});


		if(!this.bIsMobile){
			//FB iFrame
		    var l_wFB=$("#fb_share_button").children().first().width()/l_zoomThis+10;
		    var l_hFB=$("#fb_share_button").children().first().height()/l_zoomThis+10;
		    var l_centerFactor=270;
		    $("#fb_share_button").children().first().children().first().css({
		    	"width":l_wFB
		    	,"height":l_hFB
		    	//,"left":l_centerFactor/l_zoomThis
		   	});
		   	// //TW iFrame
		   	var l_wTW=110/l_zoomThis+10;
		    var l_hTW=30/l_zoomThis+10;
		    $("#twitter_share_button").css({
		    	"width":l_wTW
		    	,"height":l_hTW
		    	,"left":l_centerFactor/l_zoomThis
		   	});
			//$('body').append("<div id='fb-root'></div>");
		}
		if(true/*!g_gameMgr.bIsMobile*/){
			
		    
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
				var l_pnt=g_gameMgr.getPositionByGrid(cc.p(j,i));
				var gcss={"left":l_pnt.x,"top":l_pnt.y};
				//light grid is needn't
				if((i+j)%2 !=0){
					$("#grid_layer").append("<div class='grid' id=bg_"+i+""+j+"></div>");
					
					var l_strColor =((i+j)%2 == 0)?"#BDDEF0":"#99D2F0";
					$("#bg_"+i+""+j).css(gcss).css({
						"background-color":l_strColor
						,"z-index":g_config.zorder.GameBG
					});
				}
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
	},

	initMask:function(){
		this._toggleMask(false);
		$("#bg_mask").remove();
		$("#grid_layer").append("<div class='grid' id='bg_mask'></div>");
		$("#bg_mask").css({
			"left":g_config.gridMargin
			,"top":g_config.gridTop
			,"width":g_config.gridCount_x*g_config.gridOuterSize+1
			,"height":g_config.gridCount_y*g_config.gridOuterSize+1
			,"background-color":"#003085"
			,"opacity":"0.8"
			,"filter":"alpha(opacity=80)"
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
	if(GameScene.gamePause == null && this.tutStep<0){
			GameScene.loseControl();

			console.log("initGamePause");
			GameScene.gamePause = new ViewPause(iState);
		}
	},

	//隐藏GamePause
	hideGamePause:function(){
		if(GameScene.gamePause != null){
			GameScene.gamePause.disappear();
			GameScene.gamePause = null;
			GameScene.onControl();
		}
	},

	showStepTut:function(){
		GameScene.loseControl();
		$("#game_scene").append("<div id='st_ask_bg' class='view_bk st_ask_bg'></div>");
		var l_tip=g_gameMgr.isZh()?"确定要离开并进入教程吗？这会失去当前进度":"Are you sure you want to QUIT for the tutorial? You’ll lose your current progress";
		$("#st_ask_bg").append("<div id='st_ask_words' class='view_text st_ask_words'>"+l_tip+" </div>")
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

	showViewTargetAfterTut:function(){
		this.loseControl();
		var l_viewTargetAfter=new ViewTargetAfterTut();
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
				this.addBrick(l_thisBrick.c,cc.p(l_thisBrick.x,l_thisBrick.y),0, true);
			};
			this.showStepTutTip(g_gameMgr.st_steps[0]);
		}
		else{
			this.addBricksByNum(g_config.brickNum_init);
		}
		this.updateUI();
		g_gameMgr.unSyncCount++;
		//每次开局请求一次
		g_gameMgr.requestVisitCount(g_gameMgr.unSyncCount);
		g_gameMgr.saveData();
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
		g_gameMgr.requestVisitCount(g_gameMgr.unSyncCount);
	},

	//每回合
	addBricksEveryRound:function(){
		//默认p_bWithTut:false
		var s=this.tutStep;
		if(s<0){
			GameScene.loseControl();
			GameScene.addBricksByNum(1,1);
			GameScene.addBricksByNum(1,1);

			setTimeout(function(){
				GameScene.onControl();
			}, g_config.delayControl);
			//
			//l_gameScene.addBricksByNum(g_config.brickNum_everyRound);
		}
		else{
			var l_gen1=g_gameMgr.st_gen[s*2];
			var l_gen2=g_gameMgr.st_gen[s*2+1];

			this.addBrick(l_gen1.c,cc.p(l_gen1.x,l_gen1.y), 0,true);
			this.addBrick(l_gen2.c,cc.p(l_gen2.x,l_gen2.y),0, true);
		}
	},
	// 随机增加一定数目的Brick
	 addBricksByNum:function(p_iCount,p_delayFactor, p_bWithTut){
	 	p_delayFactor=p_delayFactor?p_delayFactor:0;
		p_bWithTut=p_bWithTut?p_bWithTut:false;
		var l_iBrickNum = 0;
		
		while(l_iBrickNum < p_iCount){
			var l_iGridX = 0;
			var l_iGridY = 0;
			var l_gridPoint;
			do{
				l_iGridX= g_tools.random(0,g_config.gridCount_x);
				l_iGridY= g_tools.random(0,g_config.gridCount_y);
			}while(g_gameMgr.arrayGrid[l_iGridY][l_iGridX].gameBrick);

			var l_iNum = g_gameMgr.getRandomNumber();			
			var l_gameBrick = this.addBrick(l_iNum, cc.p(l_iGridX, l_iGridY),p_delayFactor);
			
			l_iBrickNum ++;
		}
	},

	// 增加一个Brick进入场景
	addBrick:function(p_iNum, p_gridPoint, p_delayFactor,p_bWithTut){
		p_delayFactor=p_delayFactor?p_delayFactor:0;
		p_bWithTut=p_bWithTut?p_bWithTut:false;

		var l_strIDBrick = "brick_"+p_gridPoint.y+""+p_gridPoint.x;
		var l_iBrickIndex = g_gameMgr.arrayGrid[p_gridPoint.y][p_gridPoint.x].brickIndex + 1;
		l_strIDBrick = l_strIDBrick + "_" + l_iBrickIndex;
		var l_gameBrick = new GameBrick(p_iNum, l_strIDBrick, p_bWithTut);
		var l_pnt=g_gameMgr.getPositionByGrid(p_gridPoint);
		l_gameBrick.leftOriginal = l_pnt.x + 5;
		l_gameBrick.topOriginal = l_pnt.y + 5;
		l_gameBrick.show(p_delayFactor);
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
					this._toggleMask(false);
				}
			}
			
		}
		
		//存档
		g_gameMgr.saveData();
	},
	_processClickGrid:function(p_gridPoint){
		var l_targetNum = g_gameMgr.clickGrid(p_gridPoint);
		var l_iScoreThisRound = 0;
		//console.log("--<"+p_gridPoint.x+","+p_gridPoint.y+"> --> "+l_targetNum);
		//消除了Crossing
		if(l_targetNum >= g_config.numMultiX){
			this.removeConnectPoint(p_gridPoint);
			
			l_iScoreThisRound = (l_targetNum - g_config.numMultiX)/10;
			
			//增加round
			g_gameMgr.addRound();
			g_gameMgr.addCurrentScore(l_iScoreThisRound);

			//console.log("score:"+ g_gameMgr.currentScore);
		}
		//正常消除普通数字
		else if(l_targetNum >= g_config.numStart && l_targetNum <= g_config.numX){
			this.removeConnectPoint(p_gridPoint);
			this.addBrick(l_targetNum, p_gridPoint, 0,this.tutStep>=0);
			this.addBricksEveryRound();
			g_gameMgr.addRound();
		}
		else{//Forbid
			this.showForbid(p_gridPoint);
		}
		
		this.updateUI(l_iScoreThisRound, p_gridPoint);
		
		//得分动画


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
				"filter":"alpha(opacity=20)"
			})
		.animate(
			{
				"opacity":1,
				"filter":"alpha(opacity=100)"
			},
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
			
		var zh=g_gameMgr.isZh();
		var l_text=zh?p_tutStep.z:p_tutStep.t;
		$("#st_text").remove();
		var l_tut=zh?"教程":"TUTORIAL";
		$("#game_scene").append("<div id='st_text' class='view_bk view_text st_text'><span style='color:#397fa4;'><p>"+l_tut+"</p></span><p class='tut_text'>"+l_text+"</p></div>");
		
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
			$("#grid_layer_tut").remove();
			$("#brick_layer_tut").remove();

			var l_gameScene = this;
			l_gameScene.loseControl();
			$("#bg_mask").animate({
					"opacity": 0,
					"filter":"alpha(opacity=20)"
				},
				2000, 
				//then we do
				function() {
				l_gameScene.onControl();
				$("#bg_mask").remove();
				l_gameScene.showViewTargetAfterTut();
			});
		}
	},

	_toggleMaskBrick:function(p_Posi,pOn){
		$("#bg_"+p_Posi.y+""+p_Posi.x+"_tut").css({
			"display":pOn?"none":"inline"
		});

	},
	
	//更新UI
	updateUI:function(p_iScoreThisRound, p_gridPoint){
		if(p_iScoreThisRound == undefined){
			p_iScoreThisRound = 0;
		}
		if(p_gridPoint == undefined){
			p_gridPoint = cc.p(0,0);
		}
		if(this.gameUI){
			this.gameUI.updateRound();
			this.gameUI.updateScore();

			if(p_iScoreThisRound > 0){
				this.gameUI.showScoreAnimate(p_iScoreThisRound, p_gridPoint);
			}
		}
	}
}


//GameLayer
 function GameHUD(){
	//游戏场景引用
 	this.isTouchEnabled=true;
 	this.numForGetScore = 0;
	//初始化底下的按钮
	this.init = function(){
		var l_gameUI = this;
		$("#game_scene").append("<div id='game_ui' class='game_ui'>");
		var zh=g_gameMgr.isZh();
		var t1=zh?"纪录":"BEST";
		var t2=zh?"回合":"MOVES";
		var t3=zh?"致谢":"ACKNOWLEDGEMENT";
		$("#game_ui")
		.append("<div id='title' class='title'>X-MATCH</div>")
		.append("\
			<div>\
				<img src='res/x.png', width = 36, height = 36 />\
				<font id='current_score' class='score'>\
				0\
				</font>\
			</div>\
			")
		.append("<div id='max_score' class='stat'>"+t1+"</div>")
		.append("<div id='moves' class='stat'>"+t2+"</div>")
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

		
		if(false/*!g_gameMgr.bIsMobile*/){
			$("#game_ui")
			.append("<div id= 'ack' class='ack'><hr><u>"+t3+"</u></div>")
			.append("<div id= 'contact' class='contact'> <a target='_blank' href='http://geekmouse.net/press/sheet.php?p=X-Match'>2015 GeekMouse</a></div>");
			
			$("#ack").click(function(event){
				if(l_gameUI.isTouchEnabled){
					
				}
			});
		}


	}

	this.showDownloadButton = function(){
		var l_download_left = 2;
		var l_download_top = 15;
		var l_download_interval = 140;
		//mobile app download

		var l_strAndroidLink;
		var l_strAndroidImage;
		if(g_gameMgr.bIsMainland){
			l_strAndroidImage = "./res/download_android_cn.png";
			l_strAndroidLink = "http://geekmouse.github.io/xmatch/product/Matchxorigin.apk";
		}else{
			l_strAndroidImage = "./res/download_android.png";
			l_strAndroidLink = "https://play.google.com/store/apps/details?id=com.geekmouse.matchxorigin";
		}

		//http://geekmouse.github.io/xmatch/start.html
		$("#game_ui").
			append("\
				<div id='download_ios_div'>\
					<a target='_blank' href='https://itunes.apple.com/bt/app/x-match/id944881907?mt=8'>\
						<img id='download_ios' class='download_btn' alt=‘Download on App Store’ src='./res/download_ios.png' />\
					</a>\
				</div>\
				").
			append("\
				<div id='download_android_div'>\
	                <a target='_blank' href='" + l_strAndroidLink + "'>\
	                	<img id='download_android' class='download_btn' alt=‘Android app on Google Play’ src='" + l_strAndroidImage + "'/>\
	                </a>\
	            </div>\
	            ");
		$("#download_ios_div").css({
				'position':'absolute',
				top:l_download_top,
				left:(l_download_left+0*l_download_interval)
			});
		$("#download_android_div").css({
				'position':'absolute',
				top:l_download_top,
				left:(l_download_left+1*l_download_interval)
			});

		if(g_gameMgr.bIsMobile){
			if(g_gameMgr.bIsAndroid){
				$("#download_ios_div").css({
					'display':'none'
					});
				$("#download_android_div").css({
					left:(l_download_left+0*l_download_interval)
					});
			}else{
				$("#download_android_div").css({
					'display':'none'
					});
			}
		}
		//desktop app download
		else{
			//nothing
		}
	}
	
	//更新回合
	this.updateRound = function(){
		console.log("GameUI updateRound"+g_gameMgr.round);
		var w=g_gameMgr.isZh()?"回合: ":"MOVES: ";
		var l_strRound = w+g_gameMgr.round.toString();
		$("#moves").text(l_strRound);
	}
	
	//更新分数
	this.updateScore = function(){
		console.log("GameUI updateScore"+g_gameMgr.currentScore);
		var l_strScore = g_gameMgr.currentScore.toString();
		$("#current_score").text(l_strScore);
		var w=g_gameMgr.isZh()?"纪录: ":"BEST: ";
		l_strScore = w+g_gameMgr.maxScore.toString();
		$("#max_score").text(l_strScore);
	}
	this.init();

	//showScoreAnimate
	this.showScoreAnimate = function(p_iScoreThisRound, p_gridPoint){
		var l_iMidOffset = 0;
		var l_iHeightOffset = 120;
		var l_fDuration = 1200;//ms
		var l_position = g_gameMgr.getPositionByGrid(p_gridPoint);
		$("#game_scene").append("<div id='get_score"+this.numForGetScore+"' class='get_score'>+"+p_iScoreThisRound+"</div>");
		$("#get_score"+this.numForGetScore).css({
			position: 'absolute',
			top: l_position.y,
			left:l_position.x + l_iMidOffset,
			"z-index":g_config.zorder.GameTip
		});

		$("#get_score"+this.numForGetScore).animate({
				position: 'absolute',
				top: l_position.y - l_iHeightOffset,
				left: l_position.x + l_iMidOffset,
				"opacity":0,
				"filter":"alpha(opacity=0)"
			}, l_fDuration
			,function(){
				this.remove();
			}
		);
		this.numForGetScore++;



	}

}


