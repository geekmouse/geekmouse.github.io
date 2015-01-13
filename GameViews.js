//Game Views
 function ViewPause(iState){
 	//游戏场景引用
 	this.gameScene = null;
 	this.state=iState;

	this.initOptions = function(){
		var l_gamePause = this;
		//Create game_pause
		//中心方块
		$("#game_scene").append("<div id='pause_back' class='view_bk pause_back'></div>");
		//统计
		$("#pause_back").css({"z-index" : g_config.zorder.GamePause}).append("<p id='game_pause_state' class='view_text'></p>");
		var l_visToday=g_gameMgr.convertToReadable(g_gameMgr.globalVisitorToday);
		var l_visHistory=g_gameMgr.convertToReadable(g_gameMgr.globalVisitorAll);
		$("#game_pause_state").append("<p>This is the <span style='color:red;'>#"+l_visToday+"</span> global attempt today,</p><p>and the <span style='color:red;'>#"+l_visHistory+"</span> global attempt in history.</p><hr>");

		//Continue button
		$("#pause_back").append("<div id='bt_ps_cont' class='view_bt'>CONTINUE</div>");
		$("#bt_ps_cont").css({"left":g_config.pauseBtLeft0,"top": g_config.pauseBtTop0}).click(function(event) {
			l_gamePause.gameScene.hideGamePause();
		});

		//Restart button
		$("#pause_back").append("<div id='bt_ps_rest' class='view_bt'>RESTART</div>");
		$("#bt_ps_rest").css({"left":g_config.pauseBtLeft1,"top":g_config.pauseBtTop0}).click(function(event) {
			l_gamePause.gameScene.initRandomMap(false);
			l_gamePause.gameScene.hideGamePause();	
			l_gamePause.gameScene.showViewTarget();
		});

		//Tutorial button
		$("#pause_back").append("<div id='bt_ps_tut' class='view_bt'>TUTORIAL</div>");
		$("#bt_ps_tut").css({"left":g_config.pauseBtLeft0,"top":g_config.pauseBtTop1}).click(function(event) {
			l_gamePause.gameScene.hideGamePause();	
			l_gamePause.gameScene.showGameTutorial();
		});

		//Share button
		$("#pause_back").append("<div id='bt_ps_share' class='view_bt'>TWEET IT</div>");
		$("#bt_ps_share").css({"left":g_config.pauseBtLeft1,"top":g_config.pauseBtTop1}).click(function(event) {
			cc.log("pause clickButton share");
			var l_maxScore=g_gameMgr.maxScore;
			var l_url="http://geekmouse.net/games/x-match";
			var l_account=" @geek_mouse ";
			var l_shareString="http://twitter.com/home?status="+l_maxScore+" Xs!That's my record in Code Original.Can you beat me in"+l_account+l_url;
			window.open(l_shareString);
		});

		switch(iState){
			case g_config.statePause.spManual:{
				
				break;
			}
			case g_config.statePause.spEnd:{
				$("#pause_back").append("<div id='title_ps' class='view_title tut_title' >GAME OVER</div>");
				break;
			}
			case g_config.statePause.spEndNew:{
				$("#pause_back").append("<div id='title_ps' class='view_title tut_title' >NEW RECORD</div>");
				break;
			}
		}
	}


	//出现动画
	this.appear = function(){
		//$("#game_pause").slideToggle(400);
	}

	//消失动画
	this.disappear = function(){
		$("#pause_back").remove();
		//$("#game_pause").slideToggle(400);
	}

	this.initOptions();
}

function ViewPaypal(){
	this.gameScene = null;
	this.initPaypal=function(){
		var l_viewPaypal = this;
		$("#game_scene").append("<div id='paypal_back' class='paypal_back view_bk'></div>");
		$("#paypal_back").css({"z-index" : g_config.zorder.GamePause}).append("<div id='paypal_words' class='view_text paypal_words'><p>We're working on:</p><p><span>1. iOS/Android version</br>2. Another 9 X-Match play modes</br> ('Mutant Mode' is ready for iOS now)</p></span><p>  </p><p>Be one of us to accelerate it happen!!</div>");

		$("#paypal_back").append("<div id='paypal_ps' class='paypal_list'></div>");
		$("#paypal_ps").load("paypal.txt");

		$("#paypal_back").append("<div id='bt_paypal' class='view_bt paypal_bt'>DONATE</div>");
		$("#bt_paypal").click(function(event){
			$("#paypal_form").submit();
		});

		$("#paypal_back").append("<div id='bt_cancel' class='paypal_bt_cancel'>CANCEL</div>");
		$("#bt_cancel").click(function(event){
			l_viewPaypal.gameScene.onControl();
			$("#paypal_back").remove();
		});


	}
	this.initPaypal();
}

//GameLayer
 function ViewTutorial(){
 	//游戏场景引用
 	this.gameScene = null;
 	this.imgIndex = 0;
 	this.isTouchEnabled=false;

	this.initTutorial = function(){
		var l_gameTutorial = this;
		l_gameTutorial.isTouchEnabled=false;
		//Create game_pause
		$("div#game_scene").append("<div id='game_tutorial'></div>");
		$("#game_tutorial").css({
			"z-index" : g_config.zorder.GameTut,
			});

		$("#game_tutorial").append("<img id='game_tut_img' class='view_bk pause_back' src='res/Step1.png'></img>");
		$("#game_tut_img").css({"z-index":1000,"cursor":"pointer"});
		//$("#game_tutorial").append("<div id='game_tut_img' class='tut_back'></div>");
		$("#game_tutorial").append("<div id='game_tut_loading' class='tut_load' >LOADING... </div>");

		$("#game_tutorial").click(function(event) {
			if (l_gameTutorial.isTouchEnabled) {
				l_gameTutorial.imgIndex++;
				if(l_gameTutorial.imgIndex == 1){
					l_gameTutorial.isTouchEnabled=false;
					$("#game_tut_img").attr("src","res/Step2.png");
					$("#game_tutorial").append("<div id='game_tut_loading' class='tut_load'>LOADING... </div>");

				}else{
					if(l_gameTutorial.gameScene != null){
						l_gameTutorial.gameScene.hideGameTutorial();
					}
				}
			};
			
		});
		$("#game_tut_img").load(function(){
			$("#game_tut_loading").remove();
			l_gameTutorial.isTouchEnabled=true;
		});		

		$("#game_tutorial").append("<div id='game_tutorial_title' class='tut_title' >TUTORIAL</div>");

	}

	//出现动画
	this.appear = function(){
		//$("#game_tutorial").slideToggle(400);
	}

	//消失动画
	this.disappear = function(){
		$("#game_tutorial").remove();
		//$("#game_tutorial").slideToggle(400).remove();
	}

	this.initTutorial();
}

function ViewTarget(){
	this.gameScene=null;
	this.init=function(){
		var l_viewSt=this;
		$("#game_scene").append("<div id='view_target' class='view_bk view_target'></div>");
		$("#view_target").append("<div class='vt_cys' >Can you beat <span style='color:red;'>68.47%</span> global players by score</div>");
		$("#view_target").append("<div class='vt_100' >100</div>");
		$("#view_target").append("<div id='vt_bt' class='view_bt vt_bt'>Let's GO!!</div>");
		$("#view_target").append("<div class='vt_ixm' >in X-MATCH?</div>");
		$("#vt_bt").click(function(event){
			$("#view_target").remove();
			l_viewSt.gameScene.onControl();
		});
	}
	this.init();
}
