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
		$("#game_pause_state").css({"text-align":"center"}).append("<p>Global attempts: Today <span style='color:red;'>#"+l_visToday+"</span>, History: <span style='color:red;'>#"+l_visHistory+"</span></p><hr>");

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

		switch(iState){
			case g_config.statePause.spManual:{
				$("#pause_back").append("<div id='pause_text' class='view_ti2'></div>");
				var l_showOpt=0;
				if(g_gameMgr.maxScore<30){
					var l_rnOptions=g_tools.random(0,10);
					if(l_rnOptions<=5) l_showOpt=2;
					else if(l_rnOptions<=7) l_showOpt=1;
					else l_showOpt=0;
				}
				else{
					l_showOpt=g_tools.random(0,2);
				}
				this.showOpt(l_showOpt);
				break;
			}
			case g_config.statePause.spEnd:{
				$("#pause_back").append("<div id='title_ps' class='view_title tut_title' >GAME OVER</div>");
				$("#bt_ps_cont").text("WHY?");
				break;
			}
			case g_config.statePause.spEndNew:{
				$("#pause_back").append("<div id='title_ps' class='view_title tut_title' >NEW RECORD</div>");
				break;
			}
		}
	}

	this.showOpt=function(opt){
		switch(opt){
			case 0:{//Twitter
				$("#pause_text").text("Follow us on Twitter and don't miss our updates!!");
				$("#pause_back").append("<div id='follow_button'></div>");
				$("#follow_button").load("3rdParty.txt #twitter_follow_button");
				break;
			}
			case 1:{//FacebookShare
				$("#pause_text").text("Share X-Match with friends on Facebook!!");
				$("#pause_back").append("<div id='like_button' ></div>");
				$("#like_button").load("3rdParty.txt #fb_like_button");
				$("#like_button").addClass(g_gameMgr.bIsMobile?'fb_bt_mo':'fb_bt');						
				break;
			}
			case 2:{
				$("#pause_text").text("Mission Impossible?");
				$("#pause_back").append("<div class='view_text'>I got 120+ on Jan.13 2015 and recorded the whole process as a <a href='https://www.youtube.com/watch?v=xykJDWJ_yFQ'>VIDEO</a>. Maybe you can find some tips there. Cheer up!</div>");
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
		$("#paypal_back").css({"z-index" : g_config.zorder.GamePause}).append("<div id='paypal_words' class='view_text paypal_words'><p>We're working on:</p><p><span># Develop iOS/Android versions</br># Design 9 extra X-Match play modes (in which 'Mutant Mode' is ready for iOS now)</p></span><p>Donate us, be the contributor to make it happen!!</div>");

		$("#paypal_back").append("<div id='paypal_ps' class='paypal_list'></div>");
		$("#paypal_ps").load("3rdParty.txt #paypal_form");

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
		$("#view_target").append("<div class='view_text vt_cys' >Can you beat <span style='color:red;'>68.47%</span> global players by score</div>");
		$("#view_target").append("<div class='vt_100' >100</div>");
		$("#view_target").append("<div class='view_text vt_cys' >in X-MATCH (Standard Mode)?</div>");
		$("#view_target").append("<div id='vt_bt' class='view_bt vt_bt'>Let's GO!!</div>");
		$("#vt_bt").click(function(event){
			$("#view_target").remove();
			l_viewSt.gameScene.onControl();
		});
	}
	this.init();
}
