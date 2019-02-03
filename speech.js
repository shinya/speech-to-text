(function(){

//キーボードの番号
var KEY ={
	ONE: 49,
	ZERO: 48
};

var recognition;
var two_line = /\n\n/g;
var one_line = /\n/g;
var first_char = /\S/;
var ignore_onend;

var isSpeech = false;
var start_timestamp = new Date().getTime();

var buf = '';

function addParagraph(str){
	$('#conversation-log').append(
		$('<div>')
			.addClass('alert alert-dark')
			.text(str)
	);
}

function initRecognition(){
	recognition = new webkitSpeechRecognition();
	recognition.continuous = true;
	recognition.interimResults = true;

	// 結果取得時
	recognition.onresult = function(event) {
		var interim_transcript = '';

		for (var i = event.resultIndex; i < event.results.length; ++i) {
			if (event.results[i].isFinal) {
				final_transcript += event.results[i][0].transcript;
			} else {
				interim_transcript += event.results[i][0].transcript;
			}
		}
    final_transcript = capitalize(final_transcript);
//  final_span.innerHTML = linebreak(final_transcript);
//  interim_span.innerHTML = linebreak(interim_transcript);
	console.log('final: ' + linebreak(final_transcript));
	if(linebreak(interim_transcript).trim() === '' && buf !== ''){
		addParagraph(buf);
	}
	buf = linebreak(interim_transcript).trim();
	console.log('interim: ' + buf);

	$('#query').val(linebreak(interim_transcript));
	$('#final').val(linebreak(final_transcript));

  };


  // エラー時のハンドリング
  recognition.onerror = function(event) {
	    if (event.error == 'no-speech') {
//	      start_img.src = 'mic.gif';
	      console.log('info_no_speech');
	      ignore_onend = true;
	    }
	    if (event.error == 'audio-capture') {
//	      start_img.src = 'mic.gif';
	    	console.log('info_no_microphone');
	      ignore_onend = true;
	    }
	    if (event.error == 'not-allowed') {
	      if (event.timeStamp - start_timestamp < 100) {
	    	  console.log('info_blocked');
	      } else {
	    	  console.log('info_denied');
	      }
	      ignore_onend = true;
	    }
	};


	// 処理終了時
	recognition.onend = function() {
		recognizing = false;
		info('終了');
		if (ignore_onend) {
			return;
		}
/*
	    start_img.src = 'mic.gif';
	    if (!final_transcript) {
	      showInfo('info_start');
	      return;
	    }
	    showInfo('');
	    if (window.getSelection) {
	      window.getSelection().removeAllRanges();
	      var range = document.createRange();
	      range.selectNode(document.getElementById('final_span'));
	      window.getSelection().addRange(range);
	    }
	    if (create_email) {
	      create_email = false;
	      createEmail();
	    }
*/
	};

}

/**
 * 音声解析処理スタート
 */
function start(){
	console.log('speech start');
	isSpeech = true;
	final_transcript = '';
	$('#query').val('');
	recognition.lang = 'ja-JP';
	recognition.start();
}

/**
 * 音声解析処理ストップ
 */
function end(){
	console.log('speech stop');
	isSpeech = false;
	recognition.stop();

}

function linebreak(s) {
	  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

function capitalize(s) {
	  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}



/**
 * 発話スタートとストップのボタン処理
 *
 */
function buttonDown(){
	$(document).keydown(function(e){
		// 1を押した時に発話開始
		if(e.which == KEY.ONE){
			if(!isSpeech){
				$('#status').addClass('btn-danger').text('発話中');
				start();
			}else{
				$('#status').removeClass('btn-danger').text('待機中');
				end();
			}
		}
		// 0を押した時に発話終了
		else if(e.which == KEY.ZERO){
			$('#status').removeClass('btn-danger').text('待機中');
			end();
		}
	});
}

/**
 * お知らせ表示
 */
function info(msg){
	var existMsg = $('#information').text();

	if(existMsg === ''){
		$('#information').text(msg);
	}else{
		$('#information').text(existMsg + '\n' + msg);

	}
}


/**
 * メイン処理
 */
	console.log("ready:");
	//メイン処理スタート
	$(document).ready(function(){


		// 音声認識を使ったときは自動で検索を行うようにする
		$('#query').bind("webkitspeechchange", function(e){
			$('#salesform').submit();
		});


		// ブラウザが音声認識に対応しているか確認
		if (('webkitSpeechRecognition' in window)) {
			info('対応しています');
			// 対応している場合
			initRecognition();
			buttonDown();
		}else{
			info('このブラウザは音声認識に対応していません');
			// 検索欄にフォーカスさせる
			$('#query').focus();
		}

		$('.switch').click(function(){
			$('.result-log').toggle();
		});

		// 非表示項目を消す
		$('.none').hide();
	});

})();
