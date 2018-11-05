// ==UserScript==
// @name        Youtube Restore Flash Player
// @description This script replaces the default HTML5 YouTube player with the OSMF Strobe Media Playback player.  For videos that don't have a .MP4 stream available, the script will attempt loading a basic .webm stream. 
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js
// @namespace   https://github.com/TraceHeritage/YoutubeRestoreFlash/
// @include     https://www.youtube.com/watch/*
// @version     1.0.0
// ==/UserScript==

//********************************************************************
//Required code to get Greasemonkey's ajax (GM_xmlhttpRequest) working
//********************************************************************
function GM_XHR() {
    this.type = null;
    this.url = null;
    this.async = null;
    this.username = null;
    this.password = null;
    this.status = null;
    this.headers = {};
    this.readyState = null;

    this.abort = function() {
        this.readyState = 0;
    };

    this.getAllResponseHeaders = function(name) {
      if (this.readyState!=4) return "";
      return this.responseHeaders;
    };

    this.getResponseHeader = function(name) {
      var regexp = new RegExp('^'+name+': (.*)$','im');
      var match = regexp.exec(this.responseHeaders);
      if (match) { return match[1]; }
      return '';
    };

    this.open = function(type, url, async, username, password) {
        this.type = type ? type : null;
        this.url = url ? url : null;
        this.async = async ? async : null;
        this.username = username ? username : null;
        this.password = password ? password : null;
        this.readyState = 1;
    };
    
    this.setRequestHeader = function(name, value) {
        this.headers[name] = value;
    };

    this.send = function(data) {
        this.data = data;
        var that = this;
        // http://wiki.greasespot.net/GM_xmlhttpRequest
        GM_xmlhttpRequest({
            method: this.type,
            url: this.url,
            headers: this.headers,
            data: this.data,
            onload: function(rsp) {
                // Populate wrapper object with returned data
                // including the Greasemonkey specific "responseHeaders"
                for (var k in rsp) {
                    that[k] = rsp[k];
                }
                // now we call onreadystatechange
                that.onreadystatechange();
            },
            onerror: function(rsp) {
                for (var k in rsp) {
                    that[k] = rsp[k];
                }
            }
        });
    };
};

$.ajaxSetup({
    xhr: function(){return new GM_XHR;}
});




window.addEventListener('load', function() {
		//************************
		//Get info on current page
		//************************
		var yt_id = window.location.href.split("?v=")[1];
		var yt_url = "http://www.youtube.com/get_video_info?video_id=" + yt_id + "&el=detailpage&ps=default&eurl=&gl=US&hl=en";
		var yt_webm_url = "";
		var yt_mp4_url = "";
		
		var player = document.getElementById("player");
		player.style.display = "none";
		
		
	   	GM_xmlhttpRequest({
			url: yt_url,
			method: "GET",
			onload: function (responseObject){        
			//******************************
			//Load direct video feed locally
			//******************************			
			  var data = responseObject.responseText;
			  var decoded = decodeURIComponent(data);
			  var split1 = data.split("&");
			  var split2 = [];
			  var split3 = [];
			  var split4 = [];
			  var split5 = [];
			  var split_url = "";
			  var signature = false;
			  
			  for (i = 0; i < split1.length; i++) { 
				split2 = split1[i].split("=");
				
				for (j = 0; j < split2.length; j++) {
					if (split2[j].indexOf("url_encoded_fmt_stream_map") >= 0) {
						split_url = decodeURIComponent(split2[j+1]);
						split3 = split_url.split(",");
						
						for (k = 0; k < split3.length; k++) {
							split4 = split3[k].split("&");
							
							for (l = 0; l < split4.length; l++) {
								split5 = split4[l].split("=");
								
								if (split5[0].indexOf("sp") >= 0) {
									signature = true;
								}
								
								if ((split5[1].indexOf("http") >= 0)) {
									for (m = 0; m < split4.length; m++) {
										//************************************************
										//Store medium quality MP4/webm feeds if available
										//************************************************	
										if (split4[m].indexOf("medium") >= 0) {
											if (split5[1].indexOf("mp4") >= 0) {
												yt_mp4_url = decodeURIComponent(split5[1]);
											} else if (split5[1].indexOf("webm") >= 0) {
												yt_webm_url = decodeURIComponent(split5[1]);
											}
											
										}
									}
								}
							}
						}
					}
				}
			  }

			  
			  
			//*************************************************************
			//Load MP4/webm feeds using external API if stream is protected
			//*************************************************************	  
			if (signature) {
				var url = "https://maple-ytdl.herokuapp.com/api?id=" + yt_id;
				yt_mp4_url = "";
				yt_webm_url = "";

				GM_xmlhttpRequest({
					url: url,
					method: "GET",
					dataType: "text",
					cache: true,
					onload: function (responseObject){   
						var data = JSON.parse(responseObject.responseText);
						
						for (i = 0; i < data['stream'].length; i++) {
							if ((data['stream'][i]['quality'] === "medium") && (data['stream'][i]['type'].indexOf("mp4") >= 0)) {
								yt_mp4_url = data['stream'][i]['url'];
							} else if ((data['stream'][i]['quality'] === "medium") && (data['stream'][i]['type'].indexOf("webm") >= 0)) {
								yt_webm_url = data['stream'][i]['url'];
							}
						}
						
						//********************
						//Load video onto page
						//********************	  
						var player_holder = document.getElementById("placeholder-player");
						if (yt_mp4_url != "") {
							player_holder.innerHTML = '<iframe class="player-width player-height" type="text/html" src="http://www.sprintguvenlik.com/swfs/StrobeMediaPlayback.swf?allowFullScreen=true&autoPlay=true&src=' + encodeURIComponent(yt_mp4_url) + '"></iframe>';
						} else {
							player_holder.innerHTML = '<video class="player-width player-height" controls autoplay><source src="' + yt_webm_url + '" type="video/webm"></video>';
						}
					},
					onerror: function () {
					alert("error");
					}
				});
			} else {
				//**********************************************
				//Load video onto page for locally sourced video
				//**********************************************	
				var player_holder = document.getElementById("placeholder-player");
				if (yt_mp4_url != "") {
					player_holder.innerHTML = '<iframe class="player-width player-height" type="application/x-shockwave-flash" frameborder="2" allowfullscreen="true" webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen src="http://www.sprintguvenlik.com/swfs/StrobeMediaPlayback.swf?allowFullScreen=true&autoPlay=true&src=' + encodeURIComponent(yt_mp4_url) + '"></iframe>';
				} else {
					player_holder.innerHTML = '<video class="player-width player-height" controls autoplay><source src="' + yt_webm_url + '" type="video/webm"></video>';
				}
			}

			},
			onerror: function () {
			alert("error");
			}
        });
}, false);

