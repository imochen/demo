(function( root , factory ){

	if( typeof define === 'function' && define.amd ){
		//AMD
		define( factory );
	}else if(  typeof exports === 'object' ){
		//CommonJS Nodejs
		module.exports = factory();
	}else{
		// add to window
		root.catmenu = factory();
	}

})( window , function(){

	'use strict';

	var utils = {};

	/**
	 * [runScroll 滚动条动画]
	 * @param  {[object]} params [参数对象，参考下面示例]
	 *
	 * ==============================================
	 *
	 * runScroll({
	 * 		selector : '.wrap',
	 * 		scrollTop : 200,
	 * 		scrollLeft : 150,
	 * 		during : 300,
	 * 		callback : function(){} //执行完后的回调
	 * })
	 *
	 * ==============================================
	 * 
	 */
	utils.runScroll = function( params ){

		if( !params.selector ){
			throw "[runScroll] : have not found selector!";
		}

		var $selector = $( params.selector[0] ? params.selector[0] : params.selector );

		if( $selector.__scroll ){
			clearInterval( $selector.timer );
		}

		var	currentScrollLeft = $selector.scrollLeft(),
			currentScrollTop = $selector.scrollTop(),

			targetScrollLeft = typeof params.scrollLeft !== 'undefined' ? parseInt(params.scrollLeft) : currentScrollLeft,
			targetScrollTop = typeof params.scrollTop !== 'undefined' ? parseInt(params.scrollTop) : currentScrollTop,

			incrementLeft = targetScrollLeft - currentScrollLeft,
			incrementTop = targetScrollTop - currentScrollTop,

			//count = 0,

			average = parseInt( (params.during || 500)/10 ),

			timeStart = +new Date();

		$selector.timer = setInterval(function(){

			$selector.__scroll = true;

			var _tmp_t = parseInt((+new Date() - timeStart)/10);


			$selector.scrollLeft(incrementLeft/average*_tmp_t + currentScrollLeft) ;
			$selector.scrollTop(incrementTop/average*_tmp_t + currentScrollTop );

			if( _tmp_t >= average ){
				params.callback && params.callback();
				clearInterval( $selector.timer );
				$selector.__scroll = false;
			}


		},5);
	}



	/**
	 * [catmenu description]
	 * ==============================================
	 *
	 * catmenu({
	 * 		selector : '.wrap',
	 * 		data : [
	 * 			{
	 * 				name : '美妆',
	 * 				data : [
	 * 					{ name : value },
	 * 					{ name : value }
	 * 				]
	 * 			}
	 * 		]
	 * })
	 *
	 * ==============================================
	 */
	var catmenu = function( options){
		return new Catmenu( options );
	}

	var helper = {};

	helper.lisHtml = function( data ){
		var html = '<ul>';
		for( var name in data ){
			var _tmp_data = '';
			for( var prop in data[name] ){
				_tmp_data += 'data-'+ prop + '=' + data[name][prop] + ' ';
			}
			html += '<li '+ _tmp_data +'><span>'+ name +'</span></li>'
		}
		html += '</ul>';
		return html;
	}
	helper.isEnough = function( selector , dom ){

		var $dom = $(dom).clone(),
			$lis = $dom.find('li'),
			width = 0;

		$(selector).append( $dom.css('visibility','hidden') );

		$.each( $lis , function(){
			width += parseInt( $(this).width() + 1 );
		});

		if( width < $dom.width() ){
			$dom.remove();
			return false;
		}else{
			$dom.remove();
			return width;
		}
	}

	function Catmenu( options ){ 
		this.options = options;
		this.init();
	};

	Catmenu.prototype.init = function(){
		this.createHTML();
		this.bindEvents();
	};

	Catmenu.prototype.createHTML = function(){

		var options = this.options;

		//创建主容器
		var $catmenu = $('<div>').addClass('plugin-catmenu')
								.html('<div class="slide"><div class="wrap">'+ helper.lisHtml( options.data ) +'</div></div>');

		var width = helper.isEnough( options.selector , $catmenu );

		if( !width ){ //不够滚动直接flex一行排开

			$catmenu.find('ul').addClass('flex');
			$catmenu.find('.slide li').eq( parseInt(options.active) || 0 ).addClass('active');
			$( options.selector ).append( $catmenu );

		}else{
			$catmenu.append('<div class="more"><a href="#">展开更多</a></div>');
			$catmenu.append('<div class="list">'+ helper.lisHtml( options.data ) +'</div>');
			$catmenu.find('.slide').append('<div class="tips">'+ (options.tips || '跳转楼层') +'</div>');
			$catmenu.find('.slide ul').css('width', width );

			$catmenu.find('.slide li').eq( parseInt(options.active) || 0 ).addClass('active');
			$catmenu.find('.list li').eq( parseInt(options.active) || 0 ).addClass('active');

			$( options.selector ).append( $catmenu );
		}

		this.catmenu = $catmenu;

	}

	Catmenu.prototype.bindEvents = function(){

		var options = this.options,
			$catmenu = this.catmenu,

			$more = $catmenu.find('.more');

		if( $more.length > 0 ){

			$more.on('click',function(){
				$catmenu.toggleClass('active');
				return false;
			});

			var $slideLi = $catmenu.find('.slide li');
			var $listLi = $catmenu.find('.list li');

			$catmenu.find('.slide li,.list li').on('click',function(){

				var $this = $(this),
					index = $this.index(),
					width = $catmenu.width(),
					_leftnum = parseInt($slideLi.eq(index).offset().left + $catmenu.find('.slide .wrap').scrollLeft() - width/2 + $this.width()/2);

				$slideLi.removeClass('active').eq(index).addClass('active');
				$listLi.removeClass('active').eq(index).addClass('active');

				$catmenu.removeClass('active');

				
				var isListClick = false;

				if( $this.parents('.list').length > 0 ){
					isListClick = true;
				}

				options.handler.call( this , isListClick , function(){
					utils.runScroll({
						selector : $catmenu.find('.wrap'),
						scrollLeft : _leftnum,
						during : 300
					});
				});

				/*if( $this.parents('.list').length > 0 ){
					setTimeout(function(){
						utils.runScroll({
							selector : $catmenu.find('.wrap'),
							scrollLeft : _leftnum,
							during : 300,
							callback : function(){
								options.handler.call( $this[0] );
							}
						});
					},300);
				}else{
					utils.runScroll({
						selector : $catmenu.find('.wrap'),
						scrollLeft : _leftnum,
						during : 300,
						callback : function(){
							options.handler.call( $this[0] );
						}
					});
				}*/

			});


		}else{

			$catmenu.find('.slide li').on('click',function(){
				$(this).addClass('active').siblings().removeClass('active');
				options.handler.call( this );
			});
		}

	}


	return catmenu;

});











