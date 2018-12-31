/*
 * APlaya.js
 * By Monkey Raptor (monkeyraptor.johanpaul.net)
 * Mar 1, 2014 (Updated Aug 19, 2015) - MIT License
 */

var APlaya = (function (d) {
    "use strict";
    var q = function (a) {
            return d.querySelector(a);
        },
        elms = "<div class='APlaya light-color'>" +
            "<button id='APlaya-play' class='APlaya-play btn-light-color' title='play'>&#9658;</button>" +
            "<button id='APlaya-pause' class='APlaya-pause btn-light-color' title='pause'>P</button>" +
            "<button id='APlaya-rewind' class='APlaya-rewind btn-light-color' title='rewind'>R</button>" +
            "<input id='APlaya-time' class='APlaya-time' size='8' type='text' readonly>" +
            "<div class='APlaya-seekbar-wrap'>" +
                "<input id='APlaya-seekbar' class='APlaya-seekbar' value='0' min='0' type='range' step='any'>" +
                "<div id='APlaya-progress' class='APlaya-progress'></div>" +
            "</div>" +
            "<div class='APlaya-vol-wrap'>" +
                "<input id='APlaya-vol' class='APlaya-vol' value='100' min='0' type='range' step='any' title='100%'>" +
            "</div>" +
            "</div>",
        aPlayaUI = q("#APlaya-UI"),
        fall = function (a, b) {
            a.innerHTML = "Not supported...";
            a.style.cssText = "text-align:center;border-radius:0;background-color:red;color:white;box-shadow:none;font-weight:bold;font-size:20px;";
            a.style.opacity = 1;
            b.style.display = "block";
            return;
        },
        test = function () {
            var sound,
                mp3 = "audio/mp3",
                ogg = "audio/ogg",
                c_mp3,
                c_ogg,
                result = 0;
            if (d.createElement("audio")) {
                sound = d.createElement("audio");
                c_mp3 = sound.canPlayType(mp3);
                c_ogg = sound.canPlayType(ogg);
                result = [c_mp3, c_ogg];
            }
            return result;
        },
        capture = function () {
            var ui = aPlayaUI,
                audio = q("#APlaya-audio"),
                play = q("#APlaya-play"),
                pause = q("#APlaya-pause"),
                rewind = q("#APlaya-rewind"),
                seekbar = q("#APlaya-seekbar"),
                progress = q("#APlaya-progress"),
                vol = q("#APlaya-vol"),
                text = q("#APlaya-time"),
                notif = q("#notif"),
                uA;

            // Notifier monitor.
            if (test()[0] !== "" && test()[1] !== "") {
                notif.innerHTML = "<div title='compatible' style='color:darkgreen;background:greenyellow;border-radius:6px;padding:5px 10px;display:inline-block;margin:auto'>OK for MP3 and/or OGG format</div>";
            } else if (test()[0] === "" && test()[1] !== "") {
                notif.innerHTML = "<div title='um..' style='color:blue;background:lightblue;border-radius:6px;padding:5px 10px;display:inline-block;margin:auto'>Your bowsr cannot play MP3 format, but can play OGG</div>";
            } else if (test()[0] !== "" && test()[1] === "") {
                notif.innerHTML = "<div title='hm..' style='color:darkgreen;background:lightgreen;border-radius:6px;padding:5px 10px;display:inline-block;margin:auto'>Your bowsr can play MP3 format, but cannot play OGG</div>";
            } else {
                fall(ui, notif);
            }

            // Initial states.
            notif.style.display = "block";
            ui.style.opacity = 1;
            text.value = "ready";
            play.disabled = 0;
            pause.disabled = 1;
            rewind.disabled = 1;
            seekbar.disabled = 1;
            vol.disabled = 1;
            audio.volume = 1;
            seekbar.value = 0;
            seekbar.min = 0;

            // Functions
            function e(g) { // Time formatter
                if (g < 10) {
                    g = "0" + g;
                } else {
                    if (isNaN(g)) {
                        g = 0;
                    }
                }
                return g;
            }

            function updateVol() { // Changed volume value handler
                audio.volume = (vol.value / 100);
                audio.volume = audio.volume.toFixed(1);
                vol.setAttribute("title", (audio.volume * 100) + "%");
            }

            function seekAudio() { // Time range seek handler
                seekbar.min = 0;
                if (!isNaN(audio.duration) && audio.buffered.length === 1) {
                    audio.currentTime = Math.floor(seekbar.value);
                    seekbar.max = Math.floor(audio.duration);
                } else {
                    seekbar.value = 0;
                    seekbar.max = 0;
                }
            }

            function update() { // Events update handler
                var ct, second, minute, hour, p;
                seekbar.min = 0;
                if (!isNaN(audio.duration) && audio.buffered.length === 1) {
                    seekbar.max = Math.floor(audio.duration);
                    ct = Math.floor(audio.currentTime);
                    hour = Math.floor(ct / 3600);
                    minute = Math.floor((ct % 3600) / 60);
                    second = Math.floor(ct - (minute * 60) - (hour * 3600));
                    p = (audio.buffered.end(audio.buffered.length - 1) / audio.duration * 100);
                    p = p.toFixed(0);
                } else {
                    seekbar.max = 0;
                    ct = 0;
                    second = 0;
                    minute = 0;
                    hour = 0;
                    p = 0;
                }
                seekbar.value = ct;
                text.value = e(hour) + ":" + e(minute) + ":" + e(second);
                progress.style.width = p + "px";
            }

            // Event listeners.
            play.onclick = function () {
                audio.play();
                play.disabled = 1;
                seekbar.disabled = 0;
                vol.disabled = 0;
                pause.disabled = 0;
                rewind.disabled = 0;
            };

            pause.onclick = function () {
                audio.pause();
                seekbar.disabled = 1;
                vol.disabled = 1;
                pause.disabled = 1;
                play.disabled = 0;
            };

            rewind.onclick = function () {
                audio.pause();
                seekbar.disabled = 1;
                vol.disabled = 1;
                rewind.disabled = 1;
                pause.disabled = 1;
                play.disabled = 0;
                audio.currentTime = 0;
            };

            // Volume
            vol.addEventListener("change", updateVol, 0);

            // Time seek bar
            seekbar.addEventListener("change", seekAudio, 0);

            // HTML5 audio events
            audio.addEventListener("timeupdate", update, 0);
            audio.addEventListener("canplaythrough", function () {
                text.value = "fetched";
            }, 0);
            audio.addEventListener("pause", function () {
                text.value = "paused";
            }, 0);
            audio.addEventListener("ended", function () {
                text.value = "ended";
                pause.disabled = 1;
                play.disabled = 1;
            }, 0);
            audio.addEventListener("loadstart", function () {
                text.value = "ready";
            }, 0);
            audio.addEventListener("waiting", function () {
                text.value = "waiting";
            }, 0);
            audio.addEventListener("canplay", function () {
                text.value = "playing";
            }, 0);
            audio.addEventListener("error", function (e) {
                text.value = e.type;
            }, 0);

            // For other than Firefox browser
            uA = !(/firefox/i.test(navigator.userAgent));
            if (uA) {
                q(".APlaya-progress").style.marginTop = "-17px";
                q(".APlaya-seekbar-wrap").style.top = "-2px";
                q(".APlaya-vol-wrap").style.top = "-2px";
            }
        },
        build = function () {
            var base = "https://github.com/ankanayyevee/apiaya/blob/master/",
                filesMP3 = ["Via vallen - Bisane mung nyawang - Om sera [OFFICIAL].mp3"],
                filesOGG = [""],
                sound = d.createElement("audio"),
                wr = q("#wrapper"),
                spot = q("#APlaya-UI"),
                notif = q("#notif");
            if (sound) {
                aPlayaUI.innerHTML = elms;
                sound.id = "APlaya-audio";
                sound.setAttribute("preload", "none");
                wr.insertBefore(sound, spot);
                if (test()[0] !== "") {
                    sound.src = base + filesMP3[0];
                } else if (test()[0] === "" && test()[1] !== "") {
                    sound.src = base + filesOGG[0];
                }
                spot.style.opacity = 1;
            } else {
                fall(spot, notif);
            }
        };

    // Invocation
    build(); // Build audio element.
    if (q("#APlaya-audio")) {
        capture(); // Run event listeners.
    }
}(document));