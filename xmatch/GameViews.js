//Game Views
 function ViewPause(iState){
 	this.state=iState;

	this.initOptions = function(){
		var l_gamePause = this;
		//Create game_pause
		//中心方块
		$("#game_scene").append("<div id='pause_back' class='view_bk pause_back'></div>");
		//统计
		$("#pause_back").css({"z-index" : g_config.zorder.GamePause,opacity:0.2})
		.append("<p id='game_pause_state' class='view_text'></p>")
		.append("<div id='bt_ps_cont' class='view_bt'>CONTINUE</div>")
		.append("<div id='bt_ps_rest' class='view_bt'>RESTART</div>")
		.append("<div id='pause_text' class='view_ti2'></div>")
		.animate({"opacity":1},200);

		var l_visToday=g_gameMgr.convertToReadable(g_gameMgr.globalVisitorToday);
		var l_visHistory=g_gameMgr.convertToReadable(g_gameMgr.globalVisitorAll);
		$("#game_pause_state").css({"text-align":"center"}).append("<p>Global attempts: Today <span style='color:"+g_config.colorStrongText+";'>#"+l_visToday+"</span>; History: <span style='color:"+g_config.colorStrongText+";'>#"+l_visHistory+"</span></p><hr>");

		//Continue button
		$("#bt_ps_cont").css({"left":g_config.pauseBtLeft0,"top": g_config.pauseBtTop0}).click(function(event) {
			GameScene.hideGamePause();
		});

		//Restart button
		$("#bt_ps_rest").css({"left":g_config.pauseBtLeft1,"top":g_config.pauseBtTop0}).click(function(event) {
			GameScene.initRandomMap(false);
			GameScene.hideGamePause();	
			GameScene.showViewTarget();
		});

		switch(iState){
			case g_config.statePause.spManual:{
				var l_showOpt=0;
				if(g_gameMgr.maxScore<50){
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
				
				var l_rnOptions=g_tools.random(0,4);
				if(l_rnOptions==3){
					$("#pause_back").append("<div id='twitter_button'></div>");
					$("#twitter_button").load("3rdParty.txt #twitter_button");
				}
				else{
					this.showOpt(l_rnOptions);
				}
				$("#pause_text").text("GAME OVER!!");
				$("#bt_ps_cont").text("RECHECK");
				break;
			}
			case g_config.statePause.spEndNew:{

				$("#pause_text").text("Congras!! You made new record:" + g_gameMgr.maxScore);
				$("#pause_back").append("<div id='twitter_button'></div>");
				$("#twitter_button").load("3rdParty.txt #twitter_button");
				$("#bt_ps_cont").text("RECHECK");
				break;
			}
		}
	}

	this.showOpt=function(opt){
		switch(opt){
			case 0:{//Twitter
				$("#pause_text").text("Follow us on Twitter and don't miss any X-Match updates!!");
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
				$("#pause_back").append("<div class='view_text'>I recorded a <a target='_blank' href='https://www.youtube.com/watch?v=xykJDWJ_yFQ'>VIDEO</a> with the whole process of making score 120+. Maybe you can find some tips there. Cheer up!</div>");
				break;
			}
		}
	}
	//消失动画
	this.disappear = function(){
		$("#pause_back").remove();
	}
	this.initOptions();
}

function ViewTarget(){
	this.init=function(){
		var l_viewSt=this;
		$("#game_scene").append("<div id='view_target' class='view_bk view_target'></div>");
		$("#view_target").css({"opacity":0.2})
		.append("<div class='view_text vt_cys' >Sounds easy? Can you beat <strong style='color:"+g_config.colorStrongText+";font-weight:bold'>68.47%</strong> global players in X-MATCH (Standard Mode) by SCORE</div>")
		.append("<div class='vt_100' >100</div>")
		.append("<div id='vt_bt' class='view_bt vt_bt'>I'll make it!!</div>")
		.animate({"opacity":1},200);

		$("#vt_bt").click(function(event){
			$("#view_target").remove();
			GameScene.onControl();
		});
	}
	this.init();
}

function ViewPaypal(){
	this.initPaypal=function(){
		var l_viewPaypal = this;
		$("#game_scene").append("<div id='paypal_back' class='paypal_back view_bk'></div>");
		$("#paypal_back").css({"z-index" : g_config.zorder.GamePause})
		.append("<div id='paypal_words' class='view_text paypal_words'><p>GeekMouse is working on:</p><p><span style='color:#397fa4'># The iOS/Android versions</br># 9 extra X-Match play modes (in which 'Mutant Mode' is ready for iOS now)</p></span><p>Donate us, be the contributor to make it happen!!</div>")
		.append("<div id='paypal_ps' class='paypal_list'></div>")
		.append("<div id='bt_paypal' class='view_bt paypal_bt'>DONATE</div>")
		.append("<div id='bt_cancel' class='paypal_bt_cancel'>CANCEL</div>")
		.css({"opacity":0.2})
		.animate({"opacity":1},200);

		$("#paypal_ps").load("3rdParty.txt #paypal_form");

		$("#bt_paypal").click(function(event){
			$("#paypal_form").submit();
		});

		$("#bt_cancel").click(function(event){
			GameScene.onControl();
			$("#paypal_back").remove();
		});
	}
	this.initPaypal();
}
