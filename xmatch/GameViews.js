//Game Views
 function ViewPause(iState){
 	this.state=iState;
 	this.loopId=0;
	this.initOptions = function(){
		var l_gamePause = this;
		var zh=g_gameMgr.isZh();
		//Create game_pause
		//中心方块
		$("#game_scene").append("<div id='pause_back' class='view_bk pause_back'></div>");
		//统计
		var tCont=zh?"继续":"CONTINUE";
		var tRest=zh?"重新开始":"RESTART";
		$("#pause_back").css({"z-index" : g_config.zorder.GamePause,opacity:0.2})
		.append("<p id='game_pause_state' class='view_text'></p>")
		.append("<div id='bt_ps_rest' class='view_bt'>"+tRest+"</div>")
		.append("<div id='bt_ps_cont' class='view_bt'>"+tCont+"</div>")
		.append("<div id='pause_text' class='view_ti2'></div>")
		.animate({"opacity":1},200);

		var l_visToday=g_gameMgr.convertToReadable(g_gameMgr.globalVisitorToday);
		var l_visHistory=g_gameMgr.convertToReadable(g_gameMgr.globalVisitorAll);
		if(zh){
			$("#game_pause_state").css({"text-align":"center"}).append("<p>全球总局数: 今日 <span style='color:"+g_config.colorStrongText+";'>"+l_visToday+"局</span>; 历史: <span style='color:"+g_config.colorStrongText+";'>"+l_visHistory+"局</span></p><hr>");
		}
		else{
			$("#game_pause_state").css({"text-align":"center"}).append("<p>Global attempts: Today <span style='color:"+g_config.colorStrongText+";'>#"+l_visToday+"</span>; History: <span style='color:"+g_config.colorStrongText+";'>#"+l_visHistory+"</span></p><hr>");
		}
		
		//Restart button
		$("#bt_ps_rest").css({"left":g_config.pauseBtLeft1,"top":g_config.pauseBtTop0}).click(function(event) {
			GameScene.initRandomMap(false);
			GameScene.hideGamePause();	
			GameScene.showViewTarget();
		});

		//Continue button
		$("#bt_ps_cont").css({"left":g_config.pauseBtLeft0,"top": g_config.pauseBtTop0}).click(function(event) {
			GameScene.hideGamePause();
		});

		

		switch(iState){
			case g_config.statePause.spManual:{
				var l_showOpt=1;
				// if(g_gameMgr.maxScore<50){
				// 	var l_rnOptions=g_tools.random(0,10);
				// 	if(l_rnOptions<=5) l_showOpt=2;
				// 	else if(l_rnOptions<=7) l_showOpt=1;
				// 	else l_showOpt=0;
				// }
				// else{
				// 	l_showOpt=g_tools.random(0,2);
				// }
				this.showOpt(l_showOpt);
				break;
			}
			case g_config.statePause.spEnd:{
				this.showOpt(1);
				$("#pause_text").text(zh?"游戏结束!!":"GAME OVER!!");
				$("#bt_ps_cont").text(zh?"再看看":"RECHECK");
				break;
			}
			case g_config.statePause.spEndNew:{
				var l_textRec=zh?"恭喜！！你创造了新的纪录：":"Congrats!! You made new record:" + g_gameMgr.maxScore;
				 $("#pause_text").text(l_textRec);
				 this.showOpt(1);
				// $("#pause_back").append("<div id='twitter_button'></div>");
				// $("#twitter_button").load("3rdParty.txt #twitter_button");
				$("#bt_ps_cont").text(zh?"再看看":"RECHECK");
				break;
			}
		}

		//this.showOurWebSite();
	}

	this.showOurWebSite = function(){		
		var l_gamePause = this;
		var l_btY=310;
		var l_btXInt=100;
		var l_startX=60;

		$("#pause_back")
		.append("<img id='bt_fb' class='bt_sns' src='res/mxIconFB.png'></img>")
		.append("<img id='bt_tw' class='bt_sns' src='res/mxIconTwitter.png'></img>")
		.append("<img id='bt_pp' class='bt_sns' src='res/mxIconPaypal.png'></img>")
		.append("<a href='mailto:geek.mouse.game@gmail.com?subject=X-MATCH Feedback' style='text-decoration: none'><img id='bt_mail' class='bt_sns' src='res/mxIconMail.png'></img></a>");
		// $("#btn_email").css({
		// 	"text-decoration":"none"
		// });
		
		
		//FB
		$("#bt_fb").css({left: l_startX,top: l_btY}).click(function(event){
			//if (l_gameUI.isTouchEnabled) {
				window.open("https://www.facebook.com/geekmouse.xmatch");
			//}
		});
		//Twitter
		$("#bt_tw").css({left: l_btXInt+l_startX,top: l_btY}).click(function(event){
			//if (l_gameUI.isTouchEnabled) {
				window.open("https://twitter.com/geek_mouse");
			//}
		});
		//Paypal
		$("#bt_pp").css({left: l_btXInt*2+l_startX,top: l_btY}).click(function(event){
			//if( l_gameUI.isTouchEnabled && GameScene.tutStep<0){
				GameScene.loseControl();
				l_gamePause.disappear();
				var l_viewPaypal=new ViewPaypal();
			//}
		});
		//Mail
		$("#bt_mail").css({
			left: l_btXInt*3+l_startX,
			top: l_btY
		});
	}

	this.showOpt=function(opt){
		var zh=g_gameMgr.isZh();
		switch(opt){
			case 0:{//Twitter
				$("#pause_text").text(zh?"收听我们的微博，不要错过任何X-Match的更新!!":"Follow us on Twitter and don't miss any X-Match updates!!");
				$("#pause_back").append("<div id='follow_button'></div>");
				$("#follow_button").load("3rdParty.txt #twitter_follow_button");
				break;
			}
			case 1:{//FacebookShare
				$("#pause_text").text(zh?"分享X-Match":"Share X-Match!!");
				$("#pause_back").append("<div id='pause_share' class='pause_share_parent'></div>");
				if(true){
					$("#fb-root").remove();
					$.getScript('./social.js');
					$('body').append("<div id='fb-root'></div>");
					$("#pause_share").append("<div id='fb_button' class='pause_share'></div><div id='tw_button' class='pause_share'></div>");
					$("#fb_button").load("3rdParty.txt #fb_share_button");
					$("#fb_share_button").css({
						left:500
					});
					$("#tw_button").load("3rdParty.txt #twitter_share_button");
					$("#twitter_share_button").css({
						left:500
					});
					this.loopId=setInterval(function(){
						GameScene.syncSize(false);
					},1000);
				}
				//$("#like_button").addClass(g_gameMgr.bIsMobile?'fb_bt_mo':'fb_bt');						
				break;
			}
			case 2:{
				$("#pause_text").text(zh?"如何获得100以上高分?":"HOW TO Score 100+？");
				$("#pause_back").append(zh?
					"<div class='view_text'>Youtube上有一段 <a target='_blank' href='https://www.youtube.com/watch?v=xykJDWJ_yFQ'>120分秀</a>. 也许你能从那里得到一些启发. 加油!</div>":
					"<div class='view_text'>There is a <a target='_blank' href='https://www.youtube.com/watch?v=xykJDWJ_yFQ'>VIDEO</a> with the whole process of making score 120+. Maybe you can find some tips there. Cheer up!</div>");
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

function ViewTargetAfterTut(){
	this.init=function(){
		var l_viewSt=this;
		var zh=g_gameMgr.isZh();
		var t1=zh?"听起来很简单？要想打败全球":"Sounds simple? Can you beat";
		var t2=zh?"的玩家，你需要达到分数":"global players by SCORE";
		var t3=zh?"我会成功的":"I'll make it!!";
		$("#game_scene").append("<div id='view_target' class='view_bk view_target'></div>");
		$("#view_target").css({"opacity":0.2})
		.append("<div class='view_text vt_cys' >"+t1+" <strong style='color:"+g_config.colorStrongText+";font-weight:bold'>68.47%</strong> "+t2+"</div>")
		.append("<div class='vt_100' >100</div>")
		.append("<div id='vt_bt' class='view_bt vt_bt'>"+t3+"</div>")
		.animate({"opacity":1},200);

		$("#vt_bt").click(function(event){
			$("#view_target").remove();
			GameScene.onControl();
		});
	}
	this.init();
}

function ViewTarget(){
	var l_iMaxScore = g_gameMgr.maxScore;
	var l_iTargetScore = 0;
	var l_fTargetPercent = 0.00;
	var l_fFinalPercent = 99.99;
	var l_arrayTargetScore = [
	10,     20,     40,     60,     100,    150,    200,    300,    400,    500,    600,
	];
	var l_arrayTargetPercent = [
	7.1,    23.21,  48.15,  61.24,  77.31,  81.02,  86.66,  90.37,  93.54,  96.09,  98.13,
	];

	for (var i = 0; i < l_arrayTargetScore.length; i++) {
		if(l_arrayTargetScore[i] > l_iMaxScore){
			l_iTargetScore = l_arrayTargetScore[i];
			l_fTargetPercent = l_arrayTargetPercent[i];
			break;
		}
	}

	//beyond last target
	if(l_iTargetScore == 0){
		l_iTargetScore = (l_iMaxScore/100 + 1)*100;
		l_fTargetPercent = l_fFinalPercent;
	}

	this.init=function(){
		var l_viewSt=this;
		var zh=g_gameMgr.isZh();
		var t0=zh?"你的纪录:":"Your Best:";
		var t1=zh?"下一目标分数:":"Next milestone: Score";
		var t2=zh?"达到这个目标以击败 ":"to beat ";
		var t3=zh?"全球玩家.":"global players."
		var t4=zh?"我会成功的":"I'll make it!!";
		$("#game_scene").append("<div id='view_target' class='view_bk view_target'></div>");
		$("#view_target").css({"opacity":0.2})
		.append("<div class='view_text vt_cys1'>" + t0 + l_iMaxScore + "</div>")
		.append("<div class=''>"+t1+"</div>")
		.append("<div class='vt_100' >" + l_iTargetScore + "</div>")
		//.append("<strong style='color:"+g_config.colorStrongText+";font-weight:bold'>" + t2 + l_fTargetPercent + "% "+t3+"</strong>")
		.append("<div >"+t2+"<span style='color:"+g_config.colorStrongText+"; font-weight:bold'>"+l_fTargetPercent+"%</span>"+t3+"</div>")
		//.append("<strong style='color:" + g_config.colorStrongText +"; font-weight:bold'>"+l_fTargetPercent+"% </strong>")
		//.append("<div class=''>"+t3+"</div>")
		.append("<div id='vt_bt' class='view_bt vt_bt'>"+t4+"</div>")
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
