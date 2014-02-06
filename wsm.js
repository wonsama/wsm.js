////////////////////////////////////////////////////////////////////
//
//	출처 : http://epeli.github.io/underscore.string/
//	@since 2014.01.23
//	@author wonsama

/*
	사용
	
	chars	한 단어로 자르기
	chop	글자수 대로 자르기
	count	문자열에 특정 단어 포함 횟수 계산
	endsWith	문자열이 특정 단어로 끝나는지 여부
	escapeHTML	특수문자 교체
	include	단어 포함여부 확인
	insert	특정 위치에 문자열 삽입
	isBlank	공백 여부 확인
	join	문자열 합치기
	lpad	왼쪽 PAD
	lrpad	양쪽 PAD
	ltrim	왼쪽만 공백제거
	numberFormat	숫자 컴마처리
	pad	지정 길이 만큼 특정 단어로 채워 넣는다
	rpad	오른쪽 PAD
	rtrim	오른쪽만 공백제거
	splice	특정 위치의 단어를 교체한다
	sprintf	c의 문자열 포멧팅과 유사
	startsWith	문자열이 특정 단어로 시작하는지 여부
	stripTags	태그를 제거한 문자열을 반환한다
	toBoolean	문자열을 boolean 형태로 변환해 준다.
	trim	공백제거, 특정단어 양쪽끝 제거기능 포함
	truncate	지정한 길이로 말줄임처리
	unescapeHTML	교체된 특수문자를 돌려 놓음
*/

/*
	미사용
	
	camelize, capitalize, classify, clean, dasherize
	, humanize, levenshtein, lines, prune, quote
	, repeat, reverse, slugify, strLeft, strLeftBack
	, strRight, strRightBack, succ, surround, swapCase
	, titleize, toSentence, toSentenceSerial, underscored, unquote
	, words, toNumber
*/

/**
* 언더스코어 스트링 : 문자열 유틸리티
* @since 2014.01.24
**/
!function(root){
	
	// sprintf() for JavaScript 0.7-beta1
	// http://www.diveintojavascript.com/projects/javascript-sprintf
	//
	// Copyright (c) Alexandru Marasteanu <alexaholic [at) gmail (dot] com>
	// All rights reserved.
	var sprintf = (function() {
		function get_type(variable) {
		  return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
		}

		var str_repeat = strRepeat;

		var str_format = function() {
		  if (!str_format.cache.hasOwnProperty(arguments[0])) {
			str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
		  }
		  return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
		};

		str_format.format = function(parse_tree, argv) {
		  var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
		  for (i = 0; i < tree_length; i++) {
			node_type = get_type(parse_tree[i]);
			if (node_type === 'string') {
			  output.push(parse_tree[i]);
			}
			else if (node_type === 'array') {
			  match = parse_tree[i]; // convenience purposes only
			  if (match[2]) { // keyword argument
				arg = argv[cursor];
				for (k = 0; k < match[2].length; k++) {
				  if (!arg.hasOwnProperty(match[2][k])) {
					throw new Error(sprintf('[_.sprintf] property "%s" does not exist', match[2][k]));
				  }
				  arg = arg[match[2][k]];
				}
			  } else if (match[1]) { // positional argument (explicit)
				arg = argv[match[1]];
			  }
			  else { // positional argument (implicit)
				arg = argv[cursor++];
			  }

			  if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
				throw new Error(sprintf('[_.sprintf] expecting number but found %s', get_type(arg)));
			  }
			  switch (match[8]) {
				case 'b': arg = arg.toString(2); break;
				case 'c': arg = String.fromCharCode(arg); break;
				case 'd': arg = parseInt(arg, 10); break;
				case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
				case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;
				case 'o': arg = arg.toString(8); break;
				case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
				case 'u': arg = Math.abs(arg); break;
				case 'x': arg = arg.toString(16); break;
				case 'X': arg = arg.toString(16).toUpperCase(); break;
			  }
			  arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);
			  pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
			  pad_length = match[6] - String(arg).length;
			  pad = match[6] ? str_repeat(pad_character, pad_length) : '';
			  output.push(match[5] ? arg + pad : pad + arg);
			}
		  }
		  return output.join('');
		};

		str_format.cache = {};

		str_format.parse = function(fmt) {
		  var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
		  while (_fmt) {
			if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
			  parse_tree.push(match[0]);
			}
			else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
			  parse_tree.push('%');
			}
			else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
			  if (match[2]) {
				arg_names |= 1;
				var field_list = [], replacement_field = match[2], field_match = [];
				if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
				  field_list.push(field_match[1]);
				  while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
					if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
					  field_list.push(field_match[1]);
					}
					else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
					  field_list.push(field_match[1]);
					}
					else {
					  throw new Error('[_.sprintf] huh?');
					}
				  }
				}
				else {
				  throw new Error('[_.sprintf] huh?');
				}
				match[2] = field_list;
			  }
			  else {
				arg_names |= 2;
			  }
			  if (arg_names === 3) {
				throw new Error('[_.sprintf] mixing positional and named placeholders is not (yet) supported');
			  }
			  parse_tree.push(match);
			}
			else {
			  throw new Error('[_.sprintf] huh?');
			}
			_fmt = _fmt.substring(match[0].length);
		  }
		  return parse_tree;
		};

		return str_format;
	  })();


	//트림 관련 HELPER
	var nativeTrim = String.prototype.trim;
	var nativeTrimRight = String.prototype.trimRight;
	var nativeTrimLeft = String.prototype.trimLeft;

	/**
	* 기본 공백문자
	* @param characters ( OPTION - \\s 스페이스 )
	* @return 기본 공백문자를 설정한다
	**/
	var defaultToWhiteSpace = function(characters) {
		if (characters == null)
		  return '\\s';
		else if (characters.source)
		  return characters.source;
		else
		  return '[' + __ws.escapeRegExp(characters) + ']';
	  };

	/**
	* 문자열을 반복하여 반환한다
	* @param str 입력 문자열 
	* @param qty 반복 횟수
	* @return 변경된 문자열
	**/
	var strRepeat = function(str, qty){
		if (qty < 1) return '';
		var result = '';
		while (qty > 0) {
		  if (qty & 1) result += str;
		  qty >>= 1, str += str;
		}
		return result;
  	};

	  // Helper for toBoolean
	  function boolMatch(s, matchers) {
		var i, matcher, down = s.toLowerCase();
		matchers = [].concat(matchers);
		for (i = 0; i < matchers.length; i += 1) {
		  matcher = matchers[i];
		  if (!matcher) continue;
		  if (matcher.test && matcher.test(s)) return true;
		  if (matcher.toLowerCase() === down) return true;
		}
	  }

	/**
	* 변경할 단어 목록
	**/ 
	var escapeChars = {
		lt: '<',
		gt: '>',
		quot: '"',
		amp: '&',
		apos: "'"
	  };

	/**
	* 역변경할 단어 목록
	**/
	  var reversedEscapeChars = {};
	  for(var key in escapeChars) reversedEscapeChars[escapeChars[key]] = key;
	  reversedEscapeChars["'"] = '#39';

	/** 
	* 배열의 slice 메소드
	**/
	var slice = [].slice;

	//메소드 : 문자열 관련
	var __ws = {
		
		/*버전*/
		VERSION : "1.0",

		/**
		* 문자열을 한글자씩 나눠 배열에 넣어 반환한다
		* @param str 입력 문자열
		* @return 나뉘어진 문자배열
		**/
		chars: function(str) {
		  if (str == null) return [];
		  return String(str).split('');
		},

		/**
		* 문자열을 자를길이 단위로 잘라준다.
		* @param str 입력 문자열
		* @param step 자를길이
		* @return 나뉘어진 문자배열
		**/
		chop: function(str, step){
		  if (str == null) return [];
		  str = String(str);
		  step = ~~step;
		  return step > 0 ? str.match(new RegExp('.{1,' + step + '}', 'g')) : [str];
		},

		/**
		* 문자열에 특정 단어가 출현하는 횟수를 반환한다
		* @param str 입력 문자열
		* @param substr 찾으려는 문자열
		* @return 출현 횟수
		**/
		count: function(str, substr){
		  if (str == null || substr == null) return 0;

		  str = String(str);
		  substr = String(substr);

		  var count = 0,
			pos = 0,
			length = substr.length;

		  while (true) {
			pos = str.indexOf(substr, pos);
			if (pos === -1) break;
			count++;
			pos += length;
		  }

		  return count;
		},

		/**
		* 문자열이 입력 문자열로 끝나는지 여부 판단
		* @param str 입력 문자열
		* @param ends 종료 문자열
		* @return 종료 여부
		**/
		endsWith: function(str, ends){
		  if (ends === '') return true;
		  if (str == null || ends == null) return false;
		  str = String(str); ends = String(ends);
		  return str.length >= ends.length && str.slice(str.length - ends.length) === ends;
		},

		/**
		* HTML 특수문자 교체
		* @param str 입력 문자열
		* @return 변경 된 문자열
		**/
		escapeHTML: function(str) {
		  if (str == null) return '';
		  return String(str).replace(/[&<>"']/g, function(m){ return '&' + reversedEscapeChars[m] + ';'; });
		},

		/**
		* 특수문자를 \를 붙여 출력 ( ! -> \! )
		* @param str 입력 문자열
		* @return 변경 된 문자열
		**/
		escapeRegExp: function(str){
		  if (str == null) return '';
		  return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
		},

		/**
		* 특정 문자열을 포함하는지 여부
		* @param str 입력 문자열
		* @param needle 찾을 문자
		* @return 포함여부
		**/
		include: function(str, needle){
		  if (needle === '') return true;
		  if (str == null) return false;
		  return String(str).indexOf(needle) !== -1;
		},
		
		/**
		* 특정 위치에 문자열 삽입
		* @param str 입력 문자열
		* @param i 삽입 인덱스
		* @param substr 삽입할 문자열
		* @return 변경된 문자열
		**/
		insert: function(str, i, substr){
		  return __ws.splice(str, i, 0, substr);
		},

		/**
		* 공백 여부
		* @param str 입력 문자열
		* @return 공백 여부
		**/
		isBlank: function(str){
		  if (str == null) str = '';
		  return (/^\s*$/).test(str);
		},
		
		/**
		* 특정 위치의 단어를 교체한다
		* @param str 입력 문자열
		* @param i 시작 인덱스
		* @param howmany  종료 인덱스
		* @param substr 교체할 문자열
		* @return 변경된 문자열
		**/
		splice: function(str, i, howmany, substr){
		  var arr = __ws.chars(str);
		  arr.splice(~~i, ~~howmany, substr);
		  return arr.join('');
		},
		
		/**
		* 문자열을 합친다
		* @param separator 연결할 단어
		* @param args ... 연결할 단어 ( n개가 들어 갈 수 있다)
		* @return 변경된 문자열
		**/
		join: function() {
		  var args = slice.call(arguments),
			separator = args.shift();

		  if (separator == null) separator = '';

		  return args.join(separator);
		},

		/**
		* 패딩 처리
		* @param str 입력 문자열
		* @param length 길이
		* @param padStr 패딩처리할 문자열 (OPTION : DEFAULT ' ')
		* @param type 패딩 타입  (OPTION : DEFAULT - left, [left, right, both] )
		* @return 변경 문자열
		**/
		pad: function(str, length, padStr, type) {
		  str = str == null ? '' : String(str);
		  length = ~~length;

		  var padlen  = 0;

		  if (!padStr)
			padStr = ' ';
		  else if (padStr.length > 1)
			padStr = padStr.charAt(0);

		  switch(type) {
			case 'right':
			  padlen = length - str.length;
			  return str + strRepeat(padStr, padlen);
			case 'both':
			  padlen = length - str.length;
			  return strRepeat(padStr, Math.ceil(padlen/2)) + str
					  + strRepeat(padStr, Math.floor(padlen/2));
			default: // 'left'
			  padlen = length - str.length;
			  return strRepeat(padStr, padlen) + str;
			}
		},

		/**
		* 왼쪽 패딩
		* @param str 입력 문자열
		* @param length 길이
		* @param padStr 패딩처리할 문자열 (OPTION : DEFAULT - ' ' )
		* @return 변경 문자열
		**/
		lpad: function(str, length, padStr) {
		  return __ws.pad(str, length, padStr);
		},
		
		/**
		* 오른쪽 패딩
		* @param str 입력 문자열
		* @param length 길이
		* @param padStr 패딩처리할 문자열 (OPTION : DEFAULT - ' ' )
		* @return 변경 문자열
		**/
		rpad: function(str, length, padStr) {
		  return __ws.pad(str, length, padStr, 'right');
		},

		/**
		* 양쪽 패딩
		* @param str 입력 문자열
		* @param length 길이
		* @param padStr 패딩처리할 문자열 (OPTION : DEFAULT - ' ' )
		* @return 변경 문자열
		**/
		lrpad: function(str, length, padStr) {
		  return __ws.pad(str, length, padStr, 'both');
		},

		/**
		* 숫자에 , 를 넣어 출력해 준다. (소숫점 이하는 반올림)
		* @param number 입력 숫자
		* @param dec 소숫점 이하 자릿수  (OPTION : DEFAULT - 0 )
		* @param dsep 소숫점을 표현하는 방법  (OPTION : DEFAULT - . )
		* @param tsep 컴마를 표현하는 방법  (OPTION : DEFAULT - , )
		* @return 변경 문자열
		**/
		numberFormat : function(number, dec, dsep, tsep) {
		  if (isNaN(number) || number == null) return '';

		  number = Number(number);
		  number = number.toFixed(~~dec);
		  tsep = typeof tsep == 'string' ? tsep : ',';

		  var parts = number.split('.'), fnums = parts[0],
			decimals = parts[1] ? (dsep || '.') + parts[1] : '';

		  return fnums.replace(/(\d)(?=(?:\d{3})+$)/g, '$1' + tsep) + decimals;
		},

		/** 
		* c의 sprintf와 유사 %s, %d를 사용하면 됨
		* @param parse_tree 변환하려는 문자열
		* @param argv 변환하려는 문자열 개수만큼의 변수 
		* @return 변경된 문자열
		*/
		sprintf: sprintf,

		/**
		* 문자열이 입력 문자열로 시작하는지 여부 판단
		* @param str 입력 문자열
		* @param starts 시작 문자열
		* @return 시작 여부
		**/
		startsWith: function(str, starts){
		  if (starts === '') return true;
		  if (str == null || starts == null) return false;
		  str = String(str); starts = String(starts);
		  return str.length >= starts.length && str.slice(0, starts.length) === starts;
		},

		/**
		* 태그를 제거한 문자열을 반환한다
		* @param str 입력 문자열
		* @return 변경된 문자열
		**/
		stripTags: function(str){
		  if (str == null) return '';
		  return String(str).replace(/<\/?[^>]+>/g, '');
		},

		/**
		* 입력한 값이 참 거짓인지 여부 
		* @param str 입력 문자열
		* @param trueValues 비교할 참 값 ( OPTION )
		* @param falseValues 비교할 거짓 값 ( OPTION )
		* @return 참거짓 여부 
		**/
		toBoolean: function(str, trueValues, falseValues) {
		  if (typeof str === "number") str = "" + str;
		  if (typeof str !== "string") return !!str;
		  str = __ws.trim(str);
		  if (boolMatch(str, trueValues || ["true", "1"])) return true;
		  if (boolMatch(str, falseValues || ["false", "0"])) return false;
		},

		/**
		* 공백을 제거한다
		* @param str 입력 문자열
		* @param characters 추가적으로 제거할 단어 ( OPTION ) / ex 123 으로 한 경우 1,2,3 각각이 제거 단어에 포함됨.
		* @return 변경된 문자열
		**/
		trim: function(str, characters){
		  if (str == null) return '';
		  if (!characters && nativeTrim) return nativeTrim.call(str);
		  characters = defaultToWhiteSpace(characters);
		  return String(str).replace(new RegExp('\^' + characters + '+|' + characters + '+$', 'g'), '');
		},

		/**
		* 말줄임 처리
		* @param str 입력 문자열
		* @param length 말줄임 길이
		* @param truncateStr 말줄임을 표현할 단어 (OPTION : DEFAULT - ... )
		* @return 변경된 문자열
		**/
		truncate: function(str, length, truncateStr){
		  if (str == null) return '';
		  str = String(str); truncateStr = truncateStr || '...';
		  length = ~~length;
		  return str.length > length ? str.slice(0, length) + truncateStr : str;
		},

		/**
		* HTML 특수문자형태를 일반으로 변환
		* @param str 입력문자열
		* @return 변경된 문자열
		**/
		unescapeHTML: function(str) {
			if (str == null) return '';
			return String(str).replace(/\&([^;]+);/g, function(entity, entityCode){
				var match;

				if (entityCode in escapeChars) {
				  return escapeChars[entityCode];
				} else if (match = entityCode.match(/^#x([\da-fA-F]+)$/)) {
				  return String.fromCharCode(parseInt(match[1], 16));
				} else if (match = entityCode.match(/^#(\d+)$/)) {
				  return String.fromCharCode(~~match[1]);
				} else {
				  return entity;
				}
			});
		},
	};
	
	//WSM 라이브러리를 생성한 이후 각각의 메소드에 연결한다.
	root.wsm = root.wsm || {};
	root.wsm._ = __ws;
}(this);

/**
* 페이징 관련
* @since 2014.01.24
* @author wonsama
**/
!function(root){

	var __wpager = {
		/*버전*/
		VERSION : "1.0",
		
		/*기본설정*/
		DEF_SET : {
			page_now : 0, page_start : 0, page_end : 0, page_per_view : 10, page_total : 0, total_count : 0, 
			form_name : "myForm", target_div_id : "pager",
			color_sel : "red", color_count : "orange", color_pager : "green",
			cursor_start : "◀", cursor_prev : "◁", cursor_next : "▷", cursor_end : "▶",
		},

		/**
		* 페이저를 추가한다
		* @param settings 설정 정보 ( DFF_SET 참조 )
		**/
		add : function( settings ){
			//설정에서 값이 없으면 기본값을 상속받도록 한다.
			settings = $.extend({},  this.DEF_SET , settings || {} );

			//페이징 처리 - 시작
			var page_now = Number( settings.page_now ),  page_start = Number( settings.page_start ), page_end = Number( settings.page_end ), page_per_view = Number( settings.page_per_view ), page_total = Number( settings.page_total ), total_count = Number( settings.total_count );
			var cursor_start = settings.cursor_start, cursor_prev = settings.cursor_prev, cursor_next = settings.cursor_next, cursor_end = settings.cursor_end;
			var color_sel = settings.color_sel, color_count = settings.color_count; color_pager = settings.color_pager;
			var form_name = settings.form_name, target_div_id = settings.target_div_id;
			var page_prev = total_count == 0?1:Math.max( page_now - page_per_view, 1), page_next = total_count == 0?1:Math.min( page_now + page_per_view, page_total );
			
			//페이저를 화면에 그려준다
			var msg_res = "조회결과 : <span style='color:"+color_count+";'>"+total_count+"</span> 건";
			var msg = [];
			msg.push("[ ");
			msg.push("<span class='btn_page' page_now='1' style='color:"+color_pager+";' title='첫 페이지로 이동'>"+cursor_start+"</span>");
			msg.push("<span class='btn_page' page_now='"+page_prev+"' style='color:"+color_pager+";' title='"+page_prev+"페이지로 이동'>"+cursor_prev+"</span>");
			for( var i=page_start; i<=page_end; i++){
				if( i == page_now ){
					msg.push( "<span class='btn_page' page_now='"+i+"' style='color:"+color_sel+";'>"+i+"</span>" );	
				}else{
					msg.push( "<span class='btn_page' page_now='"+i+"' title='"+i+" 페이지로 이동'>"+i+"</span>" );
				}
			}
			msg.push("<span class='btn_page' page_now='"+page_next+"' style='color:"+color_pager+";' title='"+page_next+"페이지로 이동'>"+cursor_next+"</span>");
			msg.push("<span class='btn_page' page_now='"+page_total+"' style='color:"+color_pager+";' title='마지막 페이지로 이동'>"+cursor_end+"</span>");
			msg.push(" ] ");
			$("#"+target_div_id).html(msg.join("")+msg_res);
			$("#"+form_name).append("<input type='hidden' id='page_now', name='page_now' value='"+page_now+"'>");

			//페이징 버튼을 누르면 SUBMIT을 수행한다
			$(".btn_page").css("cursor", "pointer").css("padding-right", "10px").click(function()
			{
				if( $(this).attr("page_now") != page_now && total_count!=0 )
				{
					$("#page_now").val( $(this).attr("page_now") );
					$("#"+form_name).submit();	
				}
			});
			//페이징 처리 - 종료		
		},
	};

	//WSM 라이브러리를 생성한 이후 각각의 메소드에 연결한다.
	root.wsm = root.wsm || {};
	root.wsm.pager = __wpager;

}(this);

/**
* 스타일 관련
* @since 2014.01.24
* @author wonsama
**/
!function(root){

	var __wstyle = {

		/*버전*/
		VERSION : "1.0",
		
		/*기본설정*/
		DEF_SET_2_COLOR_TABLE : {
			tableClzName : "tb_list", oddClzName : "odd", evenClzName : "even", selClzName : "sel",
		}, 

		/**
		* 2가지 색상 테이블 스타일을 설정한다.
		* @param settings 설정정보
		**/
		apply2ColorTable : function( settings ){

			//설정에서 값이 없으면 기본값을 상속받도록 한다.
			settings = $.extend({},  this.DEF_SET_2_COLOR_TABLE , settings || {} );

			var tableClzName = settings.tableClzName, oddClzName = settings.oddClzName, evenClzName = settings.evenClzName, selClzName = settings.selClzName;

			$("."+tableClzName+" tbody tr:"+oddClzName).addClass( oddClzName );
			$("."+tableClzName+" tbody tr:"+evenClzName).addClass( evenClzName );
			 
			$("."+tableClzName+" tbody tr:"+oddClzName).on("mouseover",function()
			{
				$(this).removeClass( oddClzName );
				$(this).addClass( selClzName );
			});
			$("."+tableClzName+" tbody tr:"+evenClzName).on("mouseover",function()
			{
				$(this).removeClass( evenClzName );
				$(this).addClass( selClzName );
			});
			$("."+tableClzName+" tbody tr:"+oddClzName).on("mouseout",function()
			{
			   $(this).removeClass( selClzName );
			   $(this).addClass( oddClzName );
			});
			$("."+tableClzName+" tbody tr:"+evenClzName).on("mouseout",function()
			{
				$(this).removeClass( selClzName );
				$(this).addClass( evenClzName );
			});
		},
	};


	//WSM 라이브러리를 생성한 이후 각각의 메소드에 연결한다.
	root.wsm = root.wsm || {};
	root.wsm.style = __wstyle;
}(this);

/**
* 그래프 관련
* @since 2014.01.24
* @author wonsama
**/
!function(root){
	var __wgraph = {
		
		/* 버전 */
		VERSION : "1.0",

		/* 그래프 기본 설정 */
		DEF_SET : { 
			items:null, 
			info:{ id : "_def_id", title : "_def_title",  width: 500 }, 
			target_div_id : "graph", 
		},
		DEF_ITEM : { 
			txt : "", 
			txt_show : false, 
			value : 0, 
			text_color : "#000000", 
			back_color : null, 
			show : true, 
		},
		DEF_COLORS : [
			"#fea7ba",  "#fca7fe", "#d0a7fe", "#a6aeff", "#a7e1fe", "#a7fee3", "#a7feab", "#d7fea7", "#feeba7", "#ffb1a6"
		],

		/**
		* 바형 그래프를 그려준다.
		* @param settings  설정 정보 ( DEF_SET, DEF_INFO 참조 )
		* @since 2014.01.24
		**/
		drawBar : function ( settings ){
			//설정에서 값이 없으면 기본값을 상속받도록 한다.
			settings = $.extend({},  this.DEF_SET , settings || {} );

			//값
			var id = settings.info.id;
			var width = wsm.common.toNumber(settings.info.width);
			var items = settings.items;
			
			//작성 : 화면을 그려준다
			var tmpHtml = [];
			tmpHtml.push("<table id=\""+id+"\" cellspacing=\"0\" width=\""+width+"\">");
			tmpHtml.push("<colgroup>");

			var total = 0, v = [];
			for(var idx in items){
				//설정 : 항목 초기값 설정
				items[idx] = $.extend({},  this.DEF_ITEM , items[idx] || {} );
				if( items[idx].back_color == null ){
					items[idx].back_color = this.DEF_COLORS[idx%10];
				}
				total += v[idx] = wsm.common.toNumber(items[idx].value);
			}
			for(var idx in items){
				var w = Math.floor( ( v[idx]  / total) * width );
				tmpHtml.push("<col width=\""+w+"\">");		//반복
			}
			tmpHtml.push("</colgroup>");
			tmpHtml.push("<tbody><tr>");
			for(var idx in items){
				var bcolor = items[idx].back_color;
				var txt = items[idx].txt_show?items[idx].txt:"&nbsp;";
				tmpHtml.push("<td title=\""+txt+"\" style=\"background-color:"+bcolor+";\">");		//반복
				tmpHtml.push("<div style=\"margin=0;padding:0;overflow:hidden;white-space: nowrap;\">"+txt+"</div>");
				tmpHtml.push("</td>");
			}
			tmpHtml.push("</tr></tbody></table>");
			$("#"+settings.target_div_id ).html( tmpHtml.join("") );
			
			//설정 : 스타일을 설정한다
			$("#"+id+" td").css("border",0);
			$("#"+id).css("table-layout","fixed");
		}

	};

	//WSM 라이브러리를 생성한 이후 각각의 메소드에 연결한다.
	root.wsm = root.wsm || {};
	root.wsm.graph = __wgraph;
}(this);

/**
* 그래프 관련
* @since 2014.01.24
* @author wonsama
**/
!function(root){
	
	var __wajax = {
		/* 버전 */
		VERSION : "1.0",

		/* 기본 문자열 지정 */
		DEF_MSG_ERROR : "error",
		DEF_MSG_SUCCESS : "success",
		DEF_MSG_FAIL : "fail",

		/* AJAX 기본 설정 값 */
		DEF_SET : {
			url : null,					//전송 주소 (MUST)
			callback : null,					//콜백 
			param : null,					//전송 데이터  (OPTION) / {a:3, b:2 ... } json 타입으로 설정
			data : null,
			type : "POST",
			responseType : "json",
		},

		/**
		* JSON 방식으로 로드한다.
		* ( LOCAL TEST 시 CROSS_DOMAIN 오류가 발생함에 유의, 서버에 JS를 올린 상태에서 테스트 수행 )
		* @param settings 설정정보 ( DEF_SET 참조 )
		* @since 2014.01.27
		**/
		load : function ( settings ){
			
			//설정에서 값이 없으면 기본값을 상속받도록 한다.
  			settings = $.extend({},  this.DEF_SET_COMBO , settings || {} );

  			var type = settings.type, url = settings.url, data = settings.data, responseType = settings.responseType, callback = settings.callback ;

			$.ajax({
				type : type,
				url  : url,
				data : data,
				responseType : responseType,

				success : function( inData ){
					if( $.trim(inData) == "null" )
					{
						alert( "네트워크 오류가 발생했습니다. 잠시 후 이용 바랍니다." );
					}

					if( callback != null && wsm.common.getType( callback )=="function" ){
						callback( inData );
					}
				},

				error : function( inData, type,  msg ){
					//alert( inData );
					alert( wsm._.sprintf("%s : %s", type, msg)  );
				},
			});
		},

		/**
		* JSONP방식으로 로드한다 / 크로스 도메인에 무관하게 동작함. / LOCAL에서 테스트 할 때 좋음.
		* @param settings 설정정보 ( DEF_SET 참조 )
		* @links http://stackoverflow.com/questions/10323625/how-to-support-jsonp-with-spring-mvc-and-multiple-response-types
		* @since 2014.01.24

		[ SERVER EXAMPLE ]
		@RequestMapping(value = "/common/user/lists.jsonp")
		@ResponseBody
		public void lists( @RequestParam("callback") String callback, UserVo inSearch, HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
			//로깅 : 호출
			logger.debug("called");
			
			req.setCharacterEncoding("UTF-8");
			res.setCharacterEncoding("UTF-8");
			
			logger.debug(inSearch.toString());
			
			List<UserVo> list = userService.selDefList();
			
			ObjectMapper mapper = new ObjectMapper();
			PrintWriter out = res.getWriter();
			out.print( callback + "(" +mapper.writeValueAsString(list)+")" );
			out.close();
		}

		**/
		loadJSONP : function ( settings ){
			//설정에서 값이 없으면 기본값을 상속받도록 한다.
			settings = $.extend({},  this.DEF_SET , settings || {} );

			var url = settings.url, param = settings.param, callback = settings.callback;

			if( url == null ){
				throw new Error("url 값을 설정 부탁드립니다.");	//URL은 필수 설정임
			}

			//조작 : 꼬리말을 설정한다 
			var SUBFIX_CALLBACK = "?callback=?";
			if( !wsm._.include(url, SUBFIX_CALLBACK) ){
				url += SUBFIX_CALLBACK;
			}
			if( param != null ){
				url += wsm.common.toSerialize( param );
			}

			//호출 
			$.getJSON( url, function(data){
				if( callback != null && wsm.common.getType( callback )=="function" ){
					callback( data );
				}
			});
		},
	};

	//WSM 라이브러리를 생성한 이후 각각의 메소드에 연결한다.
	root.wsm = root.wsm || {};
	root.wsm.ajax = __wajax;
}(this);

/**
* 폼 내부에 들어가는 유틸 류
* @since 2014.01.24
* @author wonsama
**/
!function(root){

	var __wform = {
		
		/* 버전 */
		VERSION : "1.0",

		/* 테이블 병합 기본설정  */
		DEF_SET_MERGE : { 
			tid : "tb_merge",		//병합할 테이블의 아이디
			td_cnt : 3,		//병합할 TD개수, 앞에서 부터 병합을 수행한다. 가운데부터 시작 안됨.
		},

		mergeTable : function( settings )
		{
			//설정에서 값이 없으면 기본값을 상속받도록 한다.
  			settings = $.extend({},  this.DEF_SET_MERGE , settings || {} );

  			var tid = settings.tid, td_cnt = settings.td_cnt;

  			//CHECK : 조회 결과가 2라인 이상일 경우 병합을 수행한다
			if($("#"+tid+"  tr").length<=1)
			{
				console.log("return");
				return;
			}

			//ROWSPAN 및 제거 필드 설정
			for(var i=0;i<td_cnt;i++)
			{
				var $td_prev = null;
				var text_prev = null;
				var rowCnt = 1;
				$("#"+tid+" tr").each(function(idx, item)
				{
					var $td_now = $(this).find(":eq("+i+")");
					var text_now = $td_now.html();

					if(text_prev==text_now){
						rowCnt++;
						$td_prev.attr("rowspan", rowCnt);
						$td_now.addClass("td_remove");
					}else{
						$td_prev=null;
					}

					if($td_prev == null){
						$td_prev = $td_now;
						rowCnt = 1;
					}
					text_prev = text_now;
				});
			}

			//동일한 TD제거 처리
			$(".td_remove").each(function(){
				$(this).remove();
			});
		},

		
		/* 체크 기본설정  */
		DEF_SET_CHECK : { 
			toggle_id : "btn_toggle",	/* 전체선택 버튼 ID */
			check_clz : "chk_inp",		/* CHECKBOX  CLASS */
		},

		/**
		* 전체 선택 버튼 토글 처리
		* @param settings 설정정보
		* @since 2014.01.27
		**/
		applyChkToggle : function ( settings ){
			
			//설정에서 값이 없으면 기본값을 상속받도록 한다.
  			settings = $.extend({},  this.DEF_SET_CHECK , settings || {} );

  			var toggle_id = settings.toggle_id, check_clz = settings.check_clz;

			$("#" + toggle_id).click(function(){
				var cnt_select = 0;
				var cnt_total  = 0;
				$(".chk_inp").each(function(){
					if($(this).prop("checked")){
						cnt_select++;
					}
					cnt_total++;
				});

				if( cnt_select != cnt_total ){
					$("."+check_clz).prop("checked", true);	
				}else{
					$("."+check_clz).prop("checked", false);
				}	
			});
			$("#" + toggle_id).css("cursor", "pointer");
		},

		/* 콤보 기본설정  */
		DEF_SET_COMBO : { 
			data : [],		//데이터 목록
			tid : "target_id",	//콤보를 만들곳의 ID
			mid : "cd_no",		//생성되는 콤보의 ID와 NAME
			value_field : "cd_no",	//키값에 해당하는 필드명
			text_field : "cd_nm",	//값에 해당하는 필드명
			defaults : null,		//기본 추가항목 : [{key:'aaa', value:'bbb'}, ...] 형태로 넣어준다. 
			callback : null,		//콜백
		},

		/**
		* 화면에 데이터를 가지고 콤보박스를 만들어 준다.
		* @param settings 설정 정보 ( DEF_SET_COMBO 참조 )
		* @since 2014.01.24
		**/
		comboAdd : function ( settings ){
			//설정에서 값이 없으면 기본값을 상속받도록 한다.
  			settings = $.extend({},  this.DEF_SET_COMBO , settings || {} );

  			var tmpHtml = [];  			
  			var tid = settings.tid, mid = settings.mid, text_field = settings.text_field, value_field = settings.value_field, defaults = settings.defaults, data = settings.data, callback = settings.callback;
			
			//기본값을 넣어준다
			tmpHtml.push("<select id='"+mid+"' name='"+mid+"' >");
			if(defaults!=null)
			{
				for(var idx in defaults)
				{
					tmpHtml.push("<option value='"+defaults[idx]["value"]+"'>");
					tmpHtml.push(defaults[idx]["text"]);
					tmpHtml.push("</option>");
				}
			}

  			 //실제 데이터를 넣어준다.
			for(var idx in data)
			{
				tmpHtml.push("<option value='"+data[idx][value_field]+"'>");
				tmpHtml.push(data[idx][text_field]);
				tmpHtml.push("</option>");
			}
			tmpHtml.push("</select>");

			//화면에 넣어준다.
			$("#"+tid).html(tmpHtml.join(""));
    
			//콜백이 존재하는 경우 콜백 함수를 수행한다.
			if( callback != null && wsm.common.getType( callback )=="function" ){
				callback.call();
			}
		},

		/**
		* 값 기준으로 선택한다 
		* @param inID 대상 ID
		* @param inText 찾으려는 값 
		* @since 2014.01.24
		**/		
		comboSelByValue : function( inID, inValue ){
			$('#'+inID+'  option[value="' + inValue + '"]').prop( "selected", true );
		},

		/**
		* 텍스트 기준으로 선택한다 
		* @param inID 대상 ID
		* @param inText 찾으려는 문자열
		* @since 2014.01.24
		**/
		comboSelByText : function( inID, inText ){
			$("#"+inID+" option").each(function() {	
				if($(this).text() == inText){
					$(this).prop('selected', true);
				}
			});
		},

		/**
		* 선택된 COMBO의 텍스트 값을 반환한다
		* @param inID 대상 ID
		* @return 선택 텍스트
		* @since 2014.01.24
		**/
		comboGetSelText : function ( inID ){
			return $('#'+inID+' option:selected').text();
		},

		/* 팝업 관련 기본 값 */
		DEF_SET_POPUP : {
			url : null,		/* 연결 주소 */
			width : 800,		/* 팝업 넓이 */
			height : 600,		/* 팝업 높이 */
			target : "_blank",	/* 대상 타켓 */
			resizable : "no",	/* 리사이즈 여부 IE에서만 동작, YES로 하면 최대창 크기로 띄어 준다.*/
			callback : null,		/* 콜백 */
		},

		/**
		* 팝업을 중앙에 보여준다.
		* @param settings 설정정보
		* @since 2014.01.24
		**/
		openPopup:function( settings )
		{
			//설정에서 값이 없으면 기본값을 상속받도록 한다.
  			settings = $.extend({},  this.DEF_SET_POPUP , settings || {} );

  			var url = settings.url, width = settings.width, height = settings.height, target = settings.target, resizable = settings.resizable, callback = settings.callback;

  			//점검 : url 
			if( url == null ){
				throw new Error("url 값을 설정 부탁드립니다.");	//URL은 필수 설정임
			}


  			//설정 : 좌표
			var left = (screen.width/2) - (width/2);
			var top = (screen.height/2) - (height/2);

			console.log( screen.width, left, top);

			if(left + width > screen.availWidth)
			{
				left = 0;
			}
			if(top + height > screen.availHeight)
			{
				top = 0;
			}
		
			//표시 : 팝업 
			var style;
			if( resizable=="yes")
			{
				style = "width="+screen.width+",height="+screen.availHeight+",top=0, left=0, scrollbars=yes ,toolbar=no,status=no,location=no,menubar=no,directories=no,titlebar=no,resizable="+resizable;
				var popup = window.open( url , target, style );
				popup.resizeTo(screen.availWidth, screen.availHeight);
				popup.focus();
			}
			else
			{
				style = "width="+width+",height="+height+",top="+top+",left="+left+",scrollbars=yes ,toolbar=no,status=no,location=no,menubar=no,directories=no,titlebar=no,resizable="+resizable;
				window.open( url , target, style ).focus();
			}

			//콜백
			if( callback!=null && wsm.common.getType(callback)=="function" ){
				callback.call();
			}
		},


		/* 로딩 관련 기본 값 */
		VAL_LOADING_ID : null,	/* 로딩 바 아이디 */
		DEF_SET_LOADING : {
			msg : "잠시만 기다려 주세요",			/* 메시지 */
			image : "/resurces/images/loading.gif",	/* 로딩바 이미지 */
			form_name : "myForm", 			/* 폼 이름 */
			tid : "loading_bar",				/* 로딩바 DIV ID (OPTION) */
			posy:200,	/* 이미지 위치 (OPTION)  */
		},

		/**
		* 로딩바를 보여준다.
		* @param settings 설정정보 ( DEF_SET_LOADING 참조 )
		* @since 2014.01.24
		**/
		loadingShow : function( settings ){
			if( !this.VAL_LOADING_ID ){

				//설정에서 값이 없으면 기본값을 상속받도록 한다.
  				settings = $.extend({},  this.DEF_SET_LOADING , settings || {} );

  				var msg = settings.msg, image = settings.image, tid = settings.tid, posy = settings.posy, form_name = settings.form_name;
	        
				var res = [];
				res.push("<div id='"+tid+"' style='top:0; left:0; width:100%; height:100%; position:absolute; z-index:0;'>");
				res.push("<div style='position:absolute; text-align:center; width:100%; height:100%; top:"+posy+"px;'><img src='"+image+"' style='display:block; margin: 0 auto;' ><br/>"+msg+"</div>");
				res.push("</div>");

			        
				$("#"+form_name).append( res.join("") );

				this.VAL_LOADING_ID = tid;
			}
			$("#"+this.VAL_LOADING_ID).show();
		},

		/**
		* 로딩바를 감춰준다.
		* @since 2014.01.24
		**/
		loadingHide : function(){
			if( this.VAL_LOADING_ID ){
				$("#"+this.VAL_LOADING_ID).hide();
			}
		},
		
	};

	//WSM 라이브러리를 생성한 이후 각각의 메소드에 연결한다.
	root.wsm = root.wsm || {};
	root.wsm.form = __wform;
}(this);

/**
* 유효성 검증 
	
	settings 에서 기본적으로 사용 되는 것
	
	m : message 메시지
	t : type 타입
	v : value 값
	r : regular expression 정규식
	s : source 출처
	t : target 목표
	u : use 사용여부
	p : pattern 패턴
	i : 초기화 여부

	bg : background color 배경색상 
	cb : callback 콜백함수

* @since 2014.01.27
* @author wonsama
**/
!function(root){


	/**
		유효성 검증은 3가지가 존재한다.
		
		=> apply : 적용만 하는 것
		=> test : 테스트만 하는 것
		=> apply + test : 적용 및 테스트를 수행
	**/

	var __wvalid = {

		/* 버전 */
		VERSION : "1.0",

		/**
		* 유효성 관련 기능을  적용한다.
		* @param settings 설정정보 ( __wvalidApply 의 각각의 메소드 참조 )
		* @since 2014.01.27
		**/
		apply : function( settings ){

			// settings에 등록 된 항수를 수행
			$.each( settings, function( inID, inFunctions )
			{
				//ID가 존재하는 것만 수행
				if( $("#"+inID).length==1 )
				{	
					//각각의 등록된 함수 수행 
					$.each( inFunctions, function( inFunc, inValue ) 
					{
						// __wvalidApply 에 등록된 함수만 수행한다.
						var type = wsm.common.getType( __wvalidApply[ inFunc ] );
						if( type == "function")
						{
							__wvalidApply[ inFunc ].call( this, inID, inValue );
						}
					});
				}
			} );
		},

		/**
		* 유효성 검증을 수행한다
		* @param settings 설정정보 ( __wvalidTest 의 각각의 메소드 참조 )
		* @return 성공여부
		* @since 2014.01.27
		**/
		test : function( settings ){

			var isSuccess = true;

			// settings에 등록 된 항수를 수행
			$.each( settings, function( inID, inFunctions )
			{
				//ID가 존재하는 것만 수행
				if( $("#"+inID).length==1 )
				{					
					//각각의 등록된 함수 수행 , 1개라도 실패하면 검증을 중지한다(알람 중복 출력 방지)
					$.each( inFunctions, function( inFunc, inValue ) 
					{
						// __wvalidTest 에 등록된 함수만 수행한다.
						var type = wsm.common.getType( __wvalidTest[ inFunc ] );
						if(  isSuccess && type == "function" )
						{
							isSuccess = __wvalidTest[ inFunc ].call( this, inID, inValue );
						}
					});
				}
			} );

			return isSuccess;
		},
	};

	var __wvalidApply = {

		/**
		* 최대값을 설정한다
		* @param inID 대상ID
		* @param settings 설정 정보 ( _DEF 참조 )
		* @since 2014.01.27
		**/
		max : function( inID, settings ){
			var _DEF = {
				v : 0,	/*값*/
			};
			//설정에서 값이 없으면 기본값을 상속받도록 한다.
  			settings = $.extend({},  _DEF , settings || {} );
  			var v = settings.v;

			$("#"+inID).attr("maxlength", v);
		},

		/**
		* 입력 가능한 것을 제한한다. ( _TYPE 을 참조하여 type을 설정 )
		* @param inID 대상 ID
		* @param settings 설정 정보 ( _DEF 참조 )
		* @since 2014.01.27
		**/
		only : function( inID, settings ){
			var _TYPE = {
				eng : /[^a-zA-Z]/gi,	/* 영문만 입력 */
				num : /[^0-9]/gi,	/* 숫자만 입력 */
				numh : /[^0-9-]/gi,	/* 숫자 및 하이픈만 입력 */
				both : /[^0-9a-zA-Z]/gi,	/* 영문자 및 숫자 */
			};
			var _DEF = {
				t : "num",	/* _TYPE에 정의 된 것중 하나를 선택하도록 한다 */
				r : null,	/* 기타 정규식 */
			};
			//설정에서 값이 없으면 기본값을 상속받도록 한다.
  			settings = $.extend({},  _DEF , settings || {} );

  			var t = _TYPE[settings.t];	// _TYPE에 정의된 값을 사용한다
			$("#"+inID).bind('keyup', function(e)
			{
				var r = settings.r==null?t:settings.r;
				$("#"+inID).val( $("#"+inID).val().replace( r,"") );	//정규식에 해당하는 것을 공백 처리한다.
			});
		},

		/**
		* 출처값(s)이 목표값(t) 보다 작은 경우 클릭 이벤트를 제거한다 
		* [주의] 클릭 이벤트 등록 이후에 수행한다.
		* @param inID 대상 ID
		* @param settings 설정 정보 ( _DEF 참조 )
		* @since 2014.01.28
		**/
		auth : function( inID, settings ){
			
			var _DEF = {
				m : "권한이 불충분 합니다.",	/* 오류 메시지 */
				s : 0,	/* 출처 값 */
				t : 0,	/* 목표 값 */
				ERR : -99999,	/* 오류 값 */
			};
			//설정에서 값이 없으면 기본값을 상속받도록 한다.
  			settings = $.extend({},  _DEF , settings || {} );
			var m = settings.m, s = settings.s, t = settings.t, ERR = settings.ERR;
			s = wsm.common.toNumber(s, ERR );
			t = wsm.common.toNumber(t, ERR );

			var el = $("#"+inID)[0];	//DOM element에 접근 .get(0) eq [0] 
			var data = $.hasData(el) && $._data(el);	//해당 개체 정보에 접근

			//오류점검 
			if( s==ERR || t==ERR ){
				throw new Error( "[auth] : 설정 파라미터(s,t)를 확인 바랍니다. 숫자만 입력 가능 합니다." );
			}

			//출처값(s)이 목표값(t) 보다 작고, 클릭 이벤트가 존재하면
			if( s<t && data && data.events && data.events.click)
			{
				//기 등록된 click 이벤트 제거
				$.each(data.events.click, function( idx, handler )
				{
					$("#"+inID).unbind('click', handler);
				});
				//경고 메시지 출력 이벤트 등록
				$("#"+inID).bind('click', function()
				{
					alert( m );
				});
			}
		},

		/**
		* INPUT에 컴마를 자동으로 넣고 빼준다.
		* @param inID 대상 ID
		* @param settings 설정 정보 ( _DEF 참조 )
		* @since 2014.01.28
		**/
		comma : function( inID, settings ){

			var _DEF = {
				i : true,	/* 기본 사용여부  */
			};
			//설정에서 값이 없으면 기본값을 상속받도록 한다.
  			settings = $.extend({},  _DEF , settings || {} );
			var i = settings.i;
			var $target = $("#"+inID);

			//기본 : 등록
			if( i ) {
				$target.val( wsm._.numberFormat( $target.val() ) );	
			}
			

			//컴마 : 제거
			$target.focusin(function(){
				$target.val( $target.val().replace(/,/gi,"") );
			});

			//컴마 : 등록
			$target.focusout(function(){
				$target.val( wsm._.numberFormat( $target.val() ) );
			});			
		},

		/**
		* 수정 가능여부 설정 / 복사는 가능하도록 처리 됨이 특징
		* [참조] 마우스로 잘라내기 하는 경우는 제거됨에 유의
		* @param inID 대상 ID
		* @param settings 설정 정보 ( _DEF 참조 )
		* @since 2014.01.28
		**/
		editable : function( inID, settings ){
			var _DEF = {
				bg : "#d2d9dd",	/* 배경색 : 회색 */
				u : false,		/* 수정여부 :  불가 */
			};
			//설정에서 값이 없으면 기본값을 상속받도록 한다.
  			settings = $.extend({},  _DEF , settings || {} );
			var u = settings.u, bg = settings.bg;

			//속성 : 입력 불가 
			if( !u ){
				$("#"+inID).bind('keydown', function(e)
				{
					e.preventDefault();
				});
				$("#"+inID).css("background-color", bg);
			}
		},

		/**
		* 엔터를 누르면 콜백 함수를 수행한다.
		* @param inID 대상 ID
		* @param settings 설정 정보 ( _DEF 참조 )
		* @since 2014.01.28
		**/
		enter : function( inID, settings ){
			var _DEF = {
				cb : null,	/* 콜백함수 */
			};
			//설정에서 값이 없으면 기본값을 상속받도록 한다.
  			settings = $.extend({},  _DEF , settings || {} );
			var cb = settings.cb;

			//유효성 검사 / 함수형만 수행한다
			if( wsm.common.getType(cb)!="function" ){
				return;
			}
			
			//키를 누를때 감지하여 처리
			$("#"+inID).bind('keydown', function(e)
			{
				if( e.keyCode == 13 ) //ENTER
				{
					//REF] FUNCTION LENGTH : arguments.length
					//콜백 함수를 수행한다.
					cb.call();
				}
			});			
		},

		/**
		* 패턴에 맞춰 입력을 제한한다 ( toDash 참조 )
		* @param inID 대상 ID
		* @param settings 설정 정보 ( _DEF 참조 )
		* @since 2014.01.28		
		**/		
		 dash : function( inID, settings ){
			
			var _DEF = {
				p : "",	/* 대쉬 패턴  */
				i : true,	/* 초기화 적용 여부 */
			};
			//설정에서 값이 없으면 기본값을 상속받도록 한다.
  			settings = $.extend({},  _DEF , settings || {} );
  			var i = settings.i, p = settings.p;

			var toDash = wsm.common.toDash;
			var $target = $("#"+inID);

			//한글 입력 불가모드 전환(IE전용)
			$target.css("ime-mode","disabled");

			//초기화
			if( i ){
				$target.val( $target.val().replace(/[^0-9\\-]/gi,"") );	//숫자,대쉬 이외의 값 제거
				$target.val( toDash( $target.val(), p )  );
			}
			
			//입력시 대쉬 처리
			$target.bind('keyup', function(e)
			{
				if( e.keyCode == 8 && $target.val().length<=p.length){
					//backspace : 8
				}else{
					$target.val( $target.val().replace(/[^0-9\\-]/gi,"") );	//숫자,대쉬 이외의 값 제거
					$target.val( toDash( $target.val(), p )  );	
				}
			});
		},

		/**
		* 날짜 형태의 패턴으로 입력하도록 한다
		* @param inID 대상 ID
		* @param settings 설정 정보 ( _DEF 참조 )
		* @since 2014.01.28		
		**/	
		date : function( inID, settings ){
			
			var _DEF = {
				p : "####-##-##",	/* 대쉬 패턴  : 기본값을 변경하여 설정 */
				eid : null,	/*종료일자 대상 ID*/
			};
			//설정에서 값이 없으면 기본값을 상속받도록 한다.
  			settings = $.extend({},  _DEF , settings || {} );

  			__wvalidApply.dash( inID, settings );  			
  			if( settings.eid !=null ){
  				__wvalidApply.dash( settings.eid, settings );	
  			}
  			
		},

	};

	var __wvalidTest = {

		/**
		* 최소 입력 수치 여부를 확인한다
		* @param inID 대상 ID
		* @param settings 설정 정보 ( _DEF 참조 )
		* @since 2014.01.27
		**/
		min : function( inID, settings ){
			
			var _DEF = {
				v : 0,	/*값*/
				m : "최소 %d자를 입력해야 됩니다.",		/*오류 메시지*/
			};
			//설정에서 값이 없으면 기본값을 상속받도록 한다.
  			settings = $.extend({},  _DEF , settings || {} );
  			var v = settings.v, m = settings.m, $target = $("#"+inID);

			if( $.trim( $target.val() ).length<v ){
				alert(  wsm._.sprintf( m, v) );
				$target.focus();
				return false;
			}
			return true;
		},

		/**
		* 입력 항목이 공백인지 여부를 검사한다
		* @param inID 대상 ID
		* @param settings 설정 정보 ( _DEF 참조 )
		* @since 2014.01.27
		**/
		isNotEmpty : function( inID, settings ){
			var _DEF = {
				v : 0,	/*값*/
				m : "내용을 입력바랍니다.",	/*오류 메시지*/
			};
			//설정에서 값이 없으면 기본값을 상속받도록 한다.
  			settings = $.extend({},  _DEF , settings || {} );
  			var v = settings.v, m = settings.m, $target = $("#"+inID);

			if( $.trim( $target.val() ).length == 0 ){
				alert( m );
				$target.focus();
				return false;
			}
			return true;
		},

		/**
		* 입력 길이가 일치하는지 여부를 검사한다
		* @param inID 대상 ID
		* @param settings 설정 정보 ( _DEF 참조 )
		* @since 2014.01.27
		**/
		fit : function( inID, settings ){
			var _DEF = {
				v : 0,	/*값*/
				m : "%d 글자로 입력 바랍니다 / 입력 : %d 글자",	/*오류 메시지*/
			};
			//설정에서 값이 없으면 기본값을 상속받도록 한다.
  			settings = $.extend({},  _DEF , settings || {} );
  			var v = settings.v, m = settings.m, $target = $("#"+inID);
  			var len = $.trim( $target.val() ).length;
  			if( len != v ){
  				alert(  wsm._.sprintf( m, v, len) );
				$target.focus();
				return false;
  			}
  			return true;
		},

		/**
		* 올바른 날짜 형식을 입력했는지 여부를 점검
		* @param inID 대상 ID
		* @param settings 설정 정보 ( _DEF 참조 )
		* @since 2014.01.28
		**/
		date : function( inID, settings ){

			var _DEF = {
				m : "yyyy-mm-dd 형태로 입력 바랍니다.",	/*오류 메시지 : 형식 */
				mv : "유효한 날짜가 아닙니다.",	/*오류 메시지 : 유효한 날짜 */
				me : "시작일은 종료일 보다 클 수 없습니다.",	/*오류 메시지 : 종료일자 */
				eid : null,	/*종료일자 대상 ID*/
				u : true,		/*유효성검증 사용여부*/
			};
			//설정에서 값이 없으면 기본값을 상속받도록 한다.
  			settings = $.extend({},  _DEF , settings || {} );

			//시작일 
			var start = __wvalidTest._date( inID, settings );

			//종료일이 존재하면 종료일 검증 수행
			if( start && settings.eid !=null ){
				//종료일
				var end = __wvalidTest._date( settings.eid, settings );

				//날짜 차이 확인 : 종료일이 시작일 보다 클 수 없음 / 사용할 경우에만 검증 수행
				if( settings.u ){
					if( end ){
						//검증 수행
						var s = wsm.common.getDays( $("#"+inID ).val().replace(/-/gi,"") );
						var e = wsm.common.getDays( $("#"+settings.eid ).val().replace(/-/gi,"") );
						if( s>e){
							//종료일이 시작일보다 큰 경우
							alert( settings.me );
							$("#"+inID ).focus();
							return false;
						}						
						return true;
					}else{
						//종료일 오류
						return false;
					}
				}else{
					//검증 스킵
					return true;
				}
				
			}

			//시작일만 존재하는 경우
			return start;
		},

		_date  : function( inID, settings ){
			
  			var m = settings.m, mv = settings.mv, me = settings.me, eid = settings.eid, $target = $("#"+inID), v = $.trim($target.val());

  			//사용하지 않는 경우는 검증을 수행하지 않는다.
  			if( !settings.u ){
  				return true;
  			}

			//날짜 형식 점검
			if( v.search(/\d{4}\-\d{2}\-\d{2}/) == -1 )
			{
				alert( m );
				$target.focus();
				return false;
			}

			//날짜유효성 점검
			var yyyymmdd = v.substring(0,4) + v.substring(5,7) + v.substring(8,10);
			if( !wsm.common.isDate(yyyymmdd) )
			{
				alert( mv );
				$target.focus();
				return false;
			}

			return true;
		},
	};

	//WSM 라이브러리를 생성한 이후 각각의 메소드에 연결한다.
	root.wsm = root.wsm || {};
	root.wsm.valid = __wvalid;	
}(this);

/**
* 기타 공통
* @since 2014.01.24
* @author wonsama
**/
!function(root){

	var __wcommon = {

		/* 버전 */
		VERSION : "1.0",

		/* getByteLen 기본값 */
		DEF_BYTE_LEN : 2,

		/**
		* 입력 문자열의 길이를 반환한다.
		* escape하여 특수문자(한글포함)의 길이를 치환하여 계산한다
		* @param  inStr 입력 문자열
		* @param inDef 특수문자(한글)의 기본길이(미지정 시 DEF_BYTE_LEN)
		* @since 2014.02.06
		**/
		getByteLen : function ( inStr, inDef ){
			var _EXT_LEN = inDef==null?this.DEF_BYTE_LEN:inDef; //UTF-8은 3을 DB에서 차지함 / 각각의 DB에 따라 다름

			var res = 0;

			//check null
			if(inStr==null){
				return res;
			}

			for(var i=0; i<inStr.length; i++)
			{
				var c = inStr.charAt(i);
				if(escape(c).length>4)	//특수문자(한글)는 escape 시 4를 초과
				{
					res+=_EXT_LEN;
				}
				else
				{
					res++;
				}
			}

			return res;
		},

		/**
		* KEY, VALUE 형태로 구성된 OBJECT를 URL PRAMETER에 맞춰 직렬화 해준다.
		* @param 파라미터 정보
		* @return 변형된 문자열
		* @since 2014.01.24
		**/
		toSerialize : function ( param ){
			var res = [];
			$.each( param, function( el, val ){
				res.push( "&" + el + "=" + val );
			} );
			return res.join("");
		},

		/**
		* 해당 오브젝트의 타입을 얻어온다
		* @param obj 입력 오브젝트
		* @return 타입 ( 소문자 : function, string, number, object, array )
		* @since 2014.01.24
		**/
		getType : function ( obj ) {
		  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
		},

		/* toNumbwe 기본값 */
		DEF_TO_NUMBER : 0,

		/**
		* 컴마 제거 이후 문자열을 숫자로 변환
		* @param inStr 입력 문자열
		* @param inDef 오류 시 기본값 ( OPTION - DEFAULT : 0 )
		* @return 변경된 숫자
		* @since 2014.01.24
		**/
		toNumber : function( inStr, inDef  ){
			
			if( inStr == null ){
				throw new Error( "입력 문자열이 존재하지 않습니다." );
			}
			inStr+="";	//숫자도 처리하기 위해 문자로 변환

			inDef = isNaN(inDef)?this.DEF_TO_NUMBER:inDef;
			inStr = inStr.replace(/,/gi,"");

			if(  !isNaN( inStr ) ){
				return Number( inStr );	
			}
			return inDef;
		},

		/**
		* 포멧 형태로 변환 해 준다.
		* 포멧은 #(숫자)과 -(구분)만 사용 가능
		* @param inSource 입력 문자열
		* @param inFormat 포멧
		* @return 포멧에 맞춰진 형태
		*/
		toDash : function( inSource, inFormat )
		{
			var tmpRes = [];
			var pos = 0;

			//대쉬 제거
			inSource = inSource.replace(/-/gi,"");

			var MAX_REPEAT = Math.min( inSource.length, inFormat.replace(/-/gi,"").length );

			//분석 후 패턴에 맞춰 출력 수행
			for(var i=0; i<inFormat.length ; i++)
			{
				if( pos > MAX_REPEAT )
				{
					break;
				}
				if( inFormat.charAt(i) == '#' )
				{
					tmpRes.push( inSource.charAt(pos) );
					pos++;
				}
				else if( inFormat.charAt(i) == '-' )
				{
					tmpRes.push( '-' );
				}
			}
			return tmpRes.join("");
		},

		/**
		* 유효한 날짜인지 알려준다
		* @param yyyymmdd 형태의 날짜
		* @return 유효성 여부
		* @since 2014.01.28
		**/
		isDate : function( yyyymmdd )
		{
			//숫자 구성여부 판단
			if( isNaN(yyyymmdd) ){
				//throw new Error( wsm._.sprintf("입력된 날짜(%s)의 형식을 확인바랍니다.", yyyymmdd) );
				return false;
			}

			var yyyy = Number( yyyymmdd.substr(0,4) );
			var mm = Number( yyyymmdd.substr(4,2) );
			var dd = Number( yyyymmdd.substr(6,2) );

			if( mm <1 || mm > 12 )
			{
				return false;
			}
			if( dd < 1 || dd > 31 )
			{
				return false;
			}
			if( (mm== 4 || mm== 6 || mm== 9 || mm== 11  ) && dd == 31 )
			{
				return false;
			}
			if( mm==2 )
			{
				var isLeap = ( yyyy % 4 == 0 && (yyyy % 100 != 0 || yyyy % 400 == 0) );
				if( dd > 29 || ( dd == 29 && !isLeap ) )
				{
					return false;
				}
			}
			return true;
		},

		/**
		* 해당 일자에 해당하는 DAY 일수를 얻어온다.(연산처리용)
		* @param yyyymmdd 날짜
		* @return 해당 일자
		* @since 2014.01.28
		*/
		getDays : function( yyyymmdd )
		{
			if( yyyymmdd!=null && yyyymmdd.search(/\d{8}/) == -1 )
			{
				return 0;
			}
			var ONE_DAY = 1000 * 60 * 60 *24;

			var yyyy = Number( yyyymmdd.substr(0,4) );
			var mm = Number( yyyymmdd.substr(4,2) );
			var dd = Number( yyyymmdd.substr(6,2) );

			var d = new Date();
			d.setFullYear(yyyy,mm-1,dd);

			return d.getTime() / ONE_DAY;
		},
	};

	//WSM 라이브러리를 생성한 이후 각각의 메소드에 연결한다.
	root.wsm = root.wsm || {};
	root.wsm.common = __wcommon;
}(this);