// ┌─────────────────────────────────────────────────────────────────┐ //
// │ bisque.js 0.5.0 by Hiroshi Shu                                 │ //
// │                                                                 │ //
// │ under MIT license                                               │ //
// └─────────────────────────────────────────────────────────────────┘ //


(function( win, doc ){

'use strict';

if( !win.addEventListener ) return;

function isStr( str ){
	return typeof str === 'string';
}

function isNum( num ){
	return !!( 0 - num ) || num === 0 || num === '0';
}

function pF( val ){
	return parseFloat( parseFloat( val ).toFixed(8) );
}

function toRad( deg ){
	return deg % 360 * Math.PI / 180;
}
	
function toDeg( rad ){
	return rad * 180 / Math.PI;
}

function hypot( x, y ){
	return msqrt( mpow( x, 2 ) + mpow( y, 2 ) );
}

function getStyle( el, prop ){
	return win.getComputedStyle( el )[ prop ];
}

function $$( sel, context ){
	if( !sel ) return [];
	return [].slice.call( ( context || doc ).querySelectorAll( sel ) );
}



var mmax   = Math.max,
	mmin   = Math.min,
	msqrt  = Math.sqrt,
	mabs   = Math.abs,
	mpow   = Math.pow,
	mround = Math.round,
	mcos   = Math.cos,
	msin   = Math.sin,
	macos  = Math.acos,
	masin  = Math.asin,
	mtan   = Math.tan,
	matan  = Math.atan,
	matan2 = Math.atan2,
	mfloor = Math.floor,
	mceil  = Math.ceil,
	
	ATTR  = 'getAttribute',
	BYID  = 'getElementById',
	BYTAG = 'getElementsByTagName',
	ELEM  = 'createElement',
	ON    = 'addEventListener',
	TRANS = 'transparent',

	tmp = doc[ELEM]('p'),
	tmpStyle = tmp.style,
	replacedPseudo = [],
	storage = win.localStorage,
		
	prefix = (function(i){
		var pre = 'Khtml O Moz ms Webkit'.split(' ');
		while( i-- ){
			if( isStr( tmpStyle[ pre[i] + 'Transform' ] ) ) {
				return '-' + pre[i][0].toLowerCase() + pre[i].substring(1) + '-';
			}
		}
	})(5);
	
function camelCase( str ){
	return str.replace(/-(\w{2})/g, 
		function( $0, $1 ){ 
			if( $1 === 'ms' ) return $1;
			else return $1[0].toUpperCase() + $1[1];
		}
	);
}
	
function addPrefix( cssText ){
	return cssText.replace(
	/(?!-)((background|border|box|transition|transform|animation)([^:]*))/ig,
		function( prop ){
			if( isStr( tmpStyle[ prop ] ) ) return prop;
			var prefixed = camelCase( prefix + prop );
			if( isStr( tmpStyle[ prefixed ] ) ) return prefix + prop;
			return prop;
	}).replace( /@keyframes/ig, function(){
		if( isStr( tmpStyle.animation ) ) return '@keyframes';
		var prefixed = camelCase( prefix + 'animation' );
		if( isStr( tmpStyle[ prefixed ] ) ) return '@' + prefix + 'keyframes';
		return '@keyframes';
	});
}

function toPx( val, el ){
	if( !val ) return;
	if( isNum( val ) ) return val;
	if( /px$/.test( val ) ) return pF( val );
	else {
		if( !pF( val ) ) return;
		var tmp = doc[ELEM]('div'), px;
		tmp.style.width = val; 
		tmp.style.height = '1px';
		el.parentNode.appendChild( tmp );
		px = tmp.offsetWidth;
		el.parentNode.removeChild( tmp );
		return px;
	}
}

function getPaddingBorder( get ){
	var dir = ['top', 'right', 'bottom', 'left'], 
		dirStyle = [];

	dir.forEach(function(d){
		var p = 'padding-'+ d, bd = 'border-' + d,
			bdw = 'border-' + d + '-width',
			bds = 'border-' + d + '-style',
			bdc = 'border-' + d + '-color';

		get( p )   && dirStyle.push( p   + ':' + get(  p  ) );
		get( bd )  && dirStyle.push( bd  + ':' + get( bd  ) );
		get( bdw ) && dirStyle.push( bdw + ':' + get( bdw ) );
		get( bds ) && dirStyle.push( bds + ':' + get( bds ) );
		get( bdc ) && dirStyle.push( bdc + ':' + get( bdc ).replace(/~~~/g, ',') );
	});
	
	tmpStyle.cssText = [
		'width:0;height:0;',
		'padding:' + get('padding'),
		'border-width:' + get('border-width'),
		'border-style:' + get('border-style'),
		'border-color:' + (get('border-color') || '').replace(/~~~/g, ','),
		dirStyle.join(';')
	].join(';');
}



var Color;
(function(){

	function toRgb( h, c, x, d, a ){
		var r = ( d + [c, x, 0, 0, x, c][h] ) * 255,
			g = ( d + [x, c, c, x, 0, 0][h] ) * 255,
			b = ( d + [0, 0, x, c, c, x][h] ) * 255;
		return [ ~~r, ~~g, ~~b, a ];
	}

	function toHex( val ){
		var value = (+val).toString(16);
		return value.length > 1 ? value : '0' + value;
	}

	function getRgb( colorName ){
		var t = doc[ELEM]('p');
		t.style.color = colorName;
		doc.body.appendChild( t );
		var color = getStyle( t, 'color' ).match(/\d+/g);
		doc.body.removeChild( t );
		return color;
	}
		
	var colors = {}, colorFn = {
		hsl2rgb: function( h, s, l, a ){
			h = ( h % 360 ) / 60; s /= 100; l /= 100;
			var c = 2 * s * ( l < .5 ? l : 1 - l ),
				x = c * ( 1 - mabs( h % 2 - 1 ) ),
				d = l - c / 2;
			return toRgb( ~~h, c, x, d, a );
		},
		
		hsl2hex: function( h, s, l, a ){
			var rgb = this.hsl2rgb( h, s, l, a );
			return this.rgb2hex.apply( 0, rgb );
		},

		hsb2rgb: function( h, s, b ){
			h = ( h % 360 ) / 60; s /= 100; b /= 100;
			var c = b * s,
				x = c * ( 1 - mabs( h % 2 - 1 ) ),
				d = b - c;
			return toRgb( ~~h, c, x, d );
		},
		
		hsb2hex: function( h, s, b ){
			var rgb = this.hsb2rgb( h, s, b );
			return this.rgb2hex.apply( 0, rgb );
		},
		
		rgb2hsb: function( r, g, b ){
			r /= 255; g /= 255; b /= 255; 
			var b = mmax( r, g, b ),
				c = b - mmin( r, g, b ),
				s = c == 0 ? 0 : c / b,
				h = (c == 0 ? null :
					b == r ? ( g - b ) / c :
					b == g ? ( b - r ) / c + 2 :
						( r - g ) / c + 4
				);
			h = ( h + 360 ) % 6 * 60;
			return [ ~~h, ~~( s * 100 ), ~~( b * 100 ) ];
		},

		rgb2hex: function( r, g, b ){
			return '#' + toHex(r) + toHex(g) + toHex(b);
		},
		
		hex2rgb: function( hex ){
			if( hex.length === 3 ) hex = hex.replace(/(\w)/g, '$1$1');
			return hex.replace(/([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/ig,
				function( $0, r, g, b ){
					return [ parseInt( r, 16 ), parseInt( g, 16 ), parseInt( b, 16 ) ].join(' ');
				} 
			).split(' ');
		},
		
		hex2hsb: function( hex ){
			var rgb = this.hex2rgb( hex );
			return this.rgb2hsb.apply( 0, rgb );
		},
		
		keyword2hex: function( color ){
			return this.rgb2hex.apply( 0, getRgb( color ) );
		},

		keyword2hsb: function( color ){
			return this.rgb2hsb.apply( 0, getRgb( color ) );
		}
	};

	Color = function( val, type ){
		if( colors[ val + type ] ) return colors[ val + type ];
		var m = val.match(/((?:rgb|hs[lb])a?|#)(.+)/),
			$1 = m ? m[1] : 'keyword',
			$2 = m ? m[2].match(/[A-f\d\.]+/g) : [ val.replace(')', '') ];

		if( $1 === '#' && !type ) return value;
		$1 = $1 === '#' ? 'hex' : $1.replace('a', '');
		return colors[ val + type ] = colorFn[ $1 + '2' + ( type || 'hex' ) ].apply( colorFn, $2 );
	};
	
})();



var Shape;
(function(){

	var shapes = {}, u = 'px';
	
	Shape = {
		rect: function( rules, params ){
			var id = 'rect' + params.join('');
			if( params.length < 4 ) throw new Error();
			if( shapes[ id ] ) return shapes[ id ];
			
			var x = +params[0] ? params[0] + u : params[0],
				y = +params[1] ? params[1] + u : params[1],
				w = +params[2] ? params[2] + u : params[2],
				h = +params[3] ? params[3] + u : params[3];
			
			rules.push( 'left:' + x , 'top:' + y , 'width:' + w , 'height:' + h );
			params[4] && rules.push( 'background-color:' + params[4] );
			return shapes[ id ] = rules.join(';') + ';';
		},
		
		circle: function( rules, params ){
			var type = '';
			if( !params[0].indexOf('1-') ) type = params.shift();
			if( params.length < 3 ) throw new Error();
			
			var id = 'circle' + type + params.join('');
			if( shapes[ id ] ) return shapes[ id ];
			
			params.splice( 2, 0, params[2] );
			type && params.unshift( type );
			return shapes[ id ] = this.ellipse( rules, params );
		},
		
		ellipse: function( rules, params ){
			var type = '';
			if( !params[0].indexOf('1-') ) type = params.shift();
			if( params.length < 4 ) throw new Error();
			
			var id = 'ellipse' + type + params.join('');
			if( shapes[ id ] ) return shapes[ id ];

			var cx = pF( params[0] ),
				cy = pF( params[1] ),
				rx = pF( params[2] ),
				ry = pF( params[3] ),
				radius = [0, 0, 0, 0], 
				radiusY = [0, 0, 0, 0],
				half = { 
					t: [0, 1], r: [1, 2], 
					b: [2, 3], l: [3, 0] 
				},
				quar = { 
					'tl': 0, 'tr': 1, 'br': 2, 'bl': 3 
				},
				
				halfPat = /1\-2\-(t|b|l|r)/,
				quarPat = /1\-4\-((t|b)(l|r))/,
				dir, left, top, w, h, isQuarter, isHalf;
				
			if( !isNum( cx + cy + rx + ry ) ) throw new Error();
			
			if( !type ){
				rules.push(
					'border-radius:50%',
					this.rect( [], [ cx - rx, cy - ry, rx * 2, ry * 2, params[4] ] )
				);
			}
			else if( isQuarter = type.match( quarPat ) ){
				dir = quar[ isQuarter[1] ];
				radius[ dir ] = '100%';
				left = ( dir && dir < 3 ) ? cx : cx - rx;
				top = dir < 2 ? cy - ry : cy;
				
				rules.push(
					'border-radius:' + radius.join(' '),
					this.rect( [], [ left, top, rx, ry, params[4] ] )
				);
			}
			else if( isHalf = type.match( halfPat ) ){
				dir = half[ isHalf[1] ];
				if( /l|r/.test( isHalf[1] ) ){
					radius[ dir[0] ] = radius[ dir[1] ] = '100%';
					radiusY[ dir[0] ] = radiusY[ dir[1] ] = '50%';
					top = cy - ry;
					left = dir[1] ? cx : cx - rx;
					w = rx; h = ry * 2; 
				} else {
					radius[ dir[0] ] = radius[ dir[1] ] = '50%';
					radiusY[ dir[0] ] = radiusY[ dir[1] ] = '100%';
					left = cx - rx;
					top = dir[0] ? cy : cy - ry;
					w = rx * 2; h = ry; 
				}
				
				rules.push(
					'border-radius:' + radius.join(' ') + '/' + radiusY.join(' '),
					this.rect( [], [ left, top, w, h, params[4] ] )
				);
			} else {
				throw new Error();
			}
			return shapes[ id ] = rules.join(';');		
		},
		
		triangle: function( rules, params ){
			if( params.length < 5 ) throw new Error();
			var id = 'triangle' + params.join('');
			if( shapes[ id ] ) return shapes[ id ];
			
			var x = pF( params[1] ),
				y = pF( params[2] ),
				w = pF( params[3] ),
				h = pF( params[4] ),
				color = params[5] || TRANS,
				hw = w / 2, hh = h / 2, left, bw;
				
			if( !isNum( x + y + w + h ) ) throw new Error();
			
			if( /left|right/.test( params[0] ) ){
				rules.push( 'border-color:' + [ TRANS, color ].join(' ') );
				bw = params[0] == 'left' ? [ hh, w, hh, 0 ] : [ hh, 0, hh, w ];
				left = params[0] == 'left' ? x - w : x; 
			} 
			else if( /up|down/.test( params[0] ) ){
				rules.push( 'border-color:' + [ color, TRANS ].join(' ') );
				bw = params[0] == 'up' ? [ 0, hw, h ] : [ h, hw, 0 ];
				left = params[0] == 'up' ? x - hw : x; 
			} else {
				throw new Error();
			}
			
			rules.push(
				'border-style:solid', 
				'border-width:' + bw.join( u + ' ' ) + u,
				this.rect( [], [ left, y, 0, 0 ] )
			);
			return shapes[ id ] = rules.join(';');
		},
		
		sector: function( rules, params ){
			if( params.length < 4 ) throw new Error();
			var id = 'sector' + params.join('');
			if( shapes[ id ] ) return shapes[ id ];
			
			var cx = pF( params[0] ), 
				cy = pF( params[1] ),
				r  = pF( params[2] ),
				angle = mmin( mabs( ( pF( params[3] ) || 0 ) ), 90 ),
				start = pF( params[4] ) % 360,
				color = ( isNum( start ) ? params[5] : params[4] ) || 'black',
				rad = toRad( angle / 2 ),
				w   = mceil( mtan( rad ) * r );
			
			if( !isNum( cx + cy + r + angle ) ) throw new Error();
			
			rules.push(
				'border-width:' + r + u + ' ' + w + u,
				'border-color:' + [ color, TRANS, TRANS ].join(' '),
				'border-style:solid'
			);
			
			isNum( start ) && rules.push(
				'transform:rotate(' + ( 90 - start - angle / 2 ) + 'deg)'
			);
			rules.push( this.rect( [], [ cx - w, cy - r, 0, 0 ] ) );
			return shapes[ id ] = rules.join(';');
		},
		
		line: function( rules, params ){
			if( params.length < 4 ) throw new Error();
			var id = 'line' + params.join('');
			if( shapes[ id ] ) return shapes[ id ];
			
			var x1 = pF( params[0] ), 
				y1 = pF( params[1] ),
				x2 = pF( params[2] ),
				y2 = pF( params[3] ),
				h  = pF( params[4] ),
				color = params[5] || 'black',
				style = params[6] || 'solid',
				
				dx = x1 - x2, dy = y1 - y2,
				w = hypot( dx, dy ),
				angle = ( 180 + toDeg( matan2( dy, dx ) ) ) % 360;
				
			if( !isNum( w + h ) ) throw new Error();

			angle && rules.push(
				'transform:rotate(' + pF( angle ) + 'deg)',
				'transform-origin:left'
			);
			rules.push(
				'border-top:' + [ h + u, style, color ].join(' '),
				this.rect( [], [ x1, y1 - h / 2, w, 0 ] )
			);
			return shapes[ id ] = rules.join(';');
		}
	}
})();



var biskit, _biskit, spinBtnFix, inputSliderFix;
(function(){

	var kit = {};
	
	//-bis-kit: slider [orient='vertical']
	//::track ::thumb ::fill-upper ::fill-lower ::tooltip 
	kit.slider = function( sel, rules, get ){
		$$( sel ).forEach( function( elem ){
			if( !elem.tagName.match(/input/i) ) return;
			var p = getProps( elem ), range = p.max - p.min;
			if( range <= 0 ) return;
			
			getPaddingBorder( get );
			var	size = ( p.vertical ? get('height') : get('width') ) || '120px',
				dir  = p.vertical ? 'Top' : 'Left',
				pad  = tmpStyle[ 'padding' + dir ] || 0,
				bdw  = tmpStyle[ 'border' + dir + 'Width' ] || 0,
				fillStyle = p.vertical ? 'left:0;right:0;' : 'top:0;bottom:0;',
				
				sliderInput = doc[ELEM]('em'),
				thumb = doc[ELEM]('b'), tip   = doc[ELEM]('i'),
				fillL = doc[ELEM]('s'), fillU = doc[ELEM]('u');
			
			thumb.setAttribute('pseudo', 'thumb');
			tip.setAttribute('pseudo', 'tooltip');
			fillL.setAttribute('pseudo', 'filllower');
			fillU.setAttribute('pseudo', 'fillupper');
			fillL.style.cssText = fillU.style.cssText = fillStyle;
			thumb.style.cssText = p.vertical ? 'left:0;right:0;' : 'top:0;bottom:0;';
			
			elem.style.display = 'none';
			tip.style.cssText = 'position:absolute;visibility:hidden;';
			tip.innerHTML = p.value;
			sliderInput.className = 'bis-slider';
			
			rules.push(
				sel, '+.bis-slider:before{',
					'width:', p.vertical ? '16px' : size, ';',
					'height:', p.vertical ? size : '16px', ';',
				'}'
			);
			
			sliderInput.appendChild( fillU );
			sliderInput.appendChild( fillL );
			sliderInput.appendChild( thumb );
			sliderInput.appendChild(  tip  );
			elem.parentNode.insertBefore( sliderInput, elem.nextSibling ); 
		} );
	};

	inputSliderFix = function( elem ){
		var fillU = elem.firstChild, fillL = fillU.nextSibling,
			tip = elem.lastChild, thumb = tip.previousSibling,
			p = getProps( elem.previousSibling ),
			ratio = ( p.value - p.min ) / ( p.max - p.min ),
			rat = p.vertical ? 1 - ratio : ratio,
			
			dir  = p.vertical ? 'Top' : 'Left',
			tdir = dir.toLowerCase(),
			sdir = p.vertical ? 'Height' : 'Width',
			fdir = sdir.toLowerCase(),
			
			size = toPx( getStyle( elem, fdir ), elem ) || 20,
			pad  = toPx( getStyle( elem, 'padding' + dir ), elem ) || 0,
			ts   = thumb[ 'offset' + sdir ],
			pos  = pad + rat * ( size - ts ) + 'px',
			lsize = ratio * ( size - ts ) + ts / 2,
			usize = ( 1 - ratio ) * ( size - ts ) + ts / 2;
		
		thumb.style[ tdir ] = tip.style[ tdir ] = pos;
		fillL.style[ tdir ] = p.vertical ? pad + usize + 'px' : pad + 'px';
		fillU.style[ tdir ] = p.vertical ? pad + 'px' : pad + lsize + 'px';
		fillL.style[ fdir ] = lsize + 'px';
		fillU.style[ fdir ] = usize + 'px';
	}
	
	function sliderChange( x, y, input, thumb, p, param ){
		//off, rect, bdw, pad, range, thumbSize
		var copy = input.nextSibling, tip = copy.lastChild,
			first = copy.firstChild, 
			fillU = first.tagName.match(/css3pie/i) ? first.nextSibling : first,
			next = fillU.nextSibling,
			fillL = next.tagName.match(/css3pie/i) ? next.nextSibling : next,
			
			dir = p.vertical ? 'top' : 'left',
			sizeDir  = p.vertical ? 'height' : 'width',
			size = toPx( getStyle( copy, sizeDir ), copy ), 
			thre = size + param[3] - param[5],
			rangeSize = size - param[5],
			
			curr = ( p.vertical ? y : x ) - param[1][ dir ] - param[2] - param[0], 
			pos  = mmin( mmax( curr, param[3] ), thre ),
			diff  = p.vertical ? thre - pos : pos - param[3], 
			value = mceil( diff / rangeSize * param[4] / p.step ) * p.step,
			lsize = diff + param[5] / 2,
			usize = size - diff - param[5] / 2;
		
		thumb.style[ dir ] = tip.style[ dir ] = pos + 'px';
		input.value = tip.innerHTML = mmin( p.min + value, p.max );
		if( p.vertical ) fillL.style[ dir ] = param[3] + usize + 'px';
		else fillU.style[ dir ] = param[3] + lsize + 'px';
		fillL.style[ sizeDir ] = lsize + 'px';
		fillU.style[ sizeDir ] = usize + 'px';
		fireChange( input );
	}

	

	//knob
	kit.knob = function( sel, trs ){
		$$( sel ).forEach( function( elem ){
			if( !elem.tagName.match(/input/i) ) return;
			var p = getProps( elem ), range = p.max - p.min,
				angelRange = p.end - p.start;
			if( range <= 0 || angelRange <= 0 ) return;
			
			var	ratio = ( p.value - p.min ) / range,
				init = +p.start + ratio * angelRange,
				trsVal = 'rotate(' + init + 'deg)', 
				wrapper = doc[ELEM]('em'),
				knobInput = doc[ELEM]('b');
				
			
			if( init ) knobInput.style.cssText = trs + trsVal;
			knobInput.className = 'bis-knob'; 

			elem.style.display = 'none';
			wrapper.appendChild( knobInput );
			elem.parentNode.insertBefore( wrapper, elem.nextSibling );
		} );
	};
	
	function setRotation( diff, input, knob, p, param ){
		var range = p.max - p.min,
			value = p.value + ~~( range < 10 ? diff / 5 : diff ) * p.step,
			angleRange = p.end - p.start,
			stepAng = p.step / range * angleRange;
		value = mmin( mmax( value, p.min ), p.max );
		
		var ratio = ( value - p.min ) / range,
			angle = +p.start + ~~( ratio * angleRange / stepAng ) * stepAng,
			trsVal = 'rotate(' + angle + 'deg)';
		
		var trs = camelCase( addPrefix('transform') );
		knob.style[ trs ] = trsVal;

		input.value = value;
		fireChange( input );
	}
	
	

	//number
	//::spin-up ::spin-down
	kit.number = function( sel, rules ){
		rules.push(
			sel, '::-ms-clear{',
				'display:none;',
			'}'
		);
		
		$$( sel ).forEach( function( elem ){
			if( !elem.tagName.match(/input/i) ) return;
			elem.type = 'text';	
			var	spinButton = doc[ELEM]('em'),
				spinup = doc[ELEM]('b'), spindown = doc[ELEM]('i');
				
			spinButton.className = 'bis-spin-button';
			spinup.setAttribute('pseudo', 'spinup');
			spindown.setAttribute('pseudo', 'spindown');
			spinButton.appendChild( spinup );
			spinButton.appendChild( spindown );
			elem.parentNode.insertBefore( spinButton, elem.nextSibling );
		} );
	}
	
	function numberChange( input, ratio, p ){
		var value = isNum( input.value ) ? mmin( mmax( +input.value, p.min ), p.max ) : p.min;
		value = +value + p.step * ratio;
		input.value = mmin( mmax( value, p.min ), p.max );
		fireChange( input );
	}
	
	

	//progress
	//::progress-bar
	kit.progress = function( sel, rules ){
		$$( sel ).forEach( function( elem ){
			var p = getProps( elem );
			if( !elem.tagName.match(/progress/i) ) return;
			var style = p.vertical ? 'width:100%;height:' : 'height:100%;width:',
				prog = doc[ELEM]('em'), bar = doc[ELEM]('b');
				
			elem.style.display = 'none';
			bar.setAttribute('pseudo', 'progressbar');
			prog.className = 'bis-progress';
			prog.appendChild( bar );
			elem.parentNode.insertBefore( prog, elem.nextSibling );
			setInterval( function(){
				var max = pF( elem[ATTR]('max') ) || 0, val = pF( elem[ATTR]('value') ) || 0,
					pos = !val || val > max ? 0 : val / max * 100;
				bar.style.cssText = style + pos + '%';
			}, 100 );
		} );
	};
	
	
	
	function getProps( el ){
		var p = {
			min: isNum( el[ ATTR ]('min') )  ? +el[ ATTR ]('min')  : 0,
			max: isNum( el[ ATTR ]('max') )  ? +el[ ATTR ]('max')  : 100,
			step: isNum( el[ ATTR ]('step') ) ? +el[ ATTR ]('step') : 1,
			start: isNum( el[ ATTR ]('start') ) ? mmax( +el[ ATTR ]('start'), -180 ) : -135,
			end: isNum( el[ ATTR ]('end') ) ? mmin( +el[ ATTR ]('end'), 180 ) : 135,
			vertical: el[ ATTR ]('orient') === 'vertical'
		};
		p.value = isNum( el.value ) ? mmin( mmax( +el.value, p.min ), p.max ) : p.min;
		return p;
	}
	
	function fireChange( el ){
		var evt = doc.createEvent('HTMLEvents');  
		evt.initEvent( 'change', true, true );  
		el.dispatchEvent( evt );
	}

	function docEvents(){
		var startX, startY, drag, input, select,
			props, colorParam, sliderParam, tip, interval,
			hasTouch = 'createTouch' in doc;
		
		function start( evt ){
			startX = evt.clientX; startY = evt.clientY;
			var target = evt.target, targetClass = target.className || '',
				parent = target.parentNode, gparent = parent.parentNode,
				parentTag = parent.tagName, parentClass = parent.className || '';
			
			if( targetClass.match('bis-knob') ){
				drag = target;
				input = drag.parentNode.previousSibling;
				props = getProps( input );			
			}
			else if( parentClass.match('bis-slider') ){
				if( target[ATTR]('pseudo') === 'thumb' ) drag = target;
				input = parent.previousSibling;
				props = getProps( input );
				
				var dir = props.vertical ? 'Top' : 'Left',
					sizeDir = props.vertical ? 'Height' : 'Width',
					pad  = toPx( getStyle( parent, 'padding' + dir ), parent ), 
					bdw  = toPx( getStyle( parent, 'border' + dir + 'Width' ), parent ), 
					parentRect = parent.getBoundingClientRect(),
					range = props.max - props.min, off, thumbSize;
							
				if( drag ){
					var rect = drag.getBoundingClientRect();
					off = props.vertical ? startY - rect.top : startX - rect.left,
					thumbSize = drag[ 'offset' + sizeDir ];	
					tip = drag.nextSibling;		
					tip.style.visibility = 'visible';
				}
				sliderParam = [ off, parentRect, bdw, pad, range, thumbSize ];
			}
			else if( parentClass.match('bis-spin-button') ){
				var prev = parent.previousSibling;
				if( /input/i.test( prev.tagName ) ) {
					input = prev; props = getProps( input );
					var ratio = target[ATTR]('pseudo') === 'spinup' ? 1 : -1;
					interval = setInterval( function(){
						numberChange( input, ratio, props );
					}, 150 );
				}
				doc.onselectstart = function(){ return false };
			}
			
			if( drag ) {
				doc.documentElement.style.msTouchAction = 'none';
				doc.onselectstart = function(){ return false };
			}
		}
		
		function move( evt, olde ){
			if( !drag ) return;
			var x = evt.clientX, y = evt.clientY, 
				dragClass = drag.className, 
				parent = drag.parentNode;

			if( dragClass && dragClass.match('bis-knob') ){
				var diff = startY - evt.clientY;
				setRotation( diff, input, drag, props );
			}
			else if( parent.className.match('bis-slider') ){
				sliderChange( x, y, input, drag, props, sliderParam );
			}

			olde ? olde.preventDefault() : evt.preventDefault();
		}
		
		function end(){
			if( tip ) tip.style.visibility = 'hidden';
			doc.onselectstart = drag = null;
			clearInterval( interval );
		}

		function click( evt ){
			doc.documentElement.style.msTouchAction = 'auto';
			var target = evt.target, targetClass = target.className || '',
				targetTag = target.tagName, parent = target.parentNode,
				parentClass = parent.className || '',
				x = evt.clientX, y = evt.clientY;
				
			if( parentClass.match('bis-slider') && target[ATTR]('pseudo') !== 'thumb' ){
				var	dir = props.vertical ? 'Height' : 'Width',
					thumb = parent.lastChild.previousSibling;
				sliderParam[5] = thumb[ 'offset' + dir ];
				sliderParam[0] = sliderParam[5] / 2;
				sliderChange( x, y, input, thumb, props, sliderParam );
				input = null;
			}
			else if( parentClass.match('bis-spin-button') ){
				var ratio = target[ATTR]('pseudo') === 'spinup' ? 1 : -1;
				if( input ) {
					numberChange( input, ratio, props ); input = null;
				}
				if( select ){
					spinSelectChange( select, ratio ); select = null;
				} 
			}
		}

		function addEvents( el, o ){
			for( var t in o ){
				el[ ON ]( t, o[t], false );
			}
		}
		
		hasTouch ? addEvents( doc, {
			'touchstart': function( evt ){
				evt = evt || window.evt;
				var touch = evt.targetTouches[0];
				start( touch );
			},
			'touchmove': function( evt ){
				evt = evt || window.evt;
				var touch = evt.targetTouches[0];
				move( touch, evt );
			},
			'touchend': end, 
			'click': click
		} ) : addEvents( doc, {
			'mousedown': start, 
			'mousemove': move,
			'mouseup': end, 
			'click': click
		} );
		
	}

	//This will be loaded after whole csstext be parsed
	spinBtnFix = function( elem ){
		var container = elem.previousSibling,
			upB = elem.firstChild, downB = elem.lastChild,
			w = container.offsetWidth, 
			h = container.offsetHeight, 
			left = container.offsetLeft,
			top = container.offsetTop;
			
		elem.style.cssText = [
			'left:' + ( left + w ) + 'px',
			'top:' + top + 'px',
			'height:' + h + 'px'
		].join(';');
		
		upB.style.cssText = downB.style.cssText = [
			'width:' + h / 2 + 'px',
			'height:' + '50%'
		].join(';');
	};

	
	biskit = function( sel, rules, get ){
		if( !$$( sel ).length ) return;
		var type = get('-bis-kit');

		switch( type ){
			case 'knob':
				kit.knob( sel, addPrefix('transform:') );
			break;
			case 'number':
				kit.number( sel, rules );
			break;
			case 'slider':
				kit.slider( sel, rules, get );
			break;
			case 'progress':
				kit.progress( sel, rules );
			break;
			default:
			return;
		}
	}
	
	_biskit = function( cssText ){
		var reg = /-bis-kit/g, match, start,
			i, j, k, type, selBe, selAf, selector, sel, selreg, opt, optreg;
			
		while( match = reg.exec( cssText ) ){
			start = match.index;
			i = cssText.lastIndexOf( '}', start );
			j = cssText.lastIndexOf( '{', start );
			k = cssText.indexOf( ';', start );
			type = cssText.slice( j + 1, k + 1 );
			
			selector = cssText.slice( i + 1, j ).replace(/([\.\[\]\(\)\+])/g, '\\$1');
			sel = selector.replace(/,/g, '|');
			selreg = new RegExp( '(' + sel + ')(?!\\+)', 'g' );
			selBe  = cssText.slice( i + 1, j + 1 );

			switch( type ){
				case '-bis-kit:knob;':
					selAf = selBe.replace('{', '{width:16px;height:16px;background-color:#ccc;');
				break;
				case '-bis-kit:slider;':
					selAf = selBe.replace('{', '{position:relative;');
				break;
				case '-bis-kit:progress;':
					selAf = selBe.replace('{', '{display:block;background-color:gray;');
				break;
				default:
				continue;
			}

			cssText = cssText.replace( selBe, selAf ).replace( selreg, '$1+em' ).replace( type, '' );
		}
		
		cssText = cssText.replace(/::track/g, '.bis-slider:before'
		).replace(/::thumb/g,	   '.bis-slider>[pseudo=thumb]'
		).replace(/::tooltip/g,	   '.bis-slider>[pseudo=tooltip]'
		).replace(/::fill-lower/g, '.bis-slider>[pseudo=filllower]'
		).replace(/::fill-upper/g, '.bis-slider>[pseudo=fillupper]' 
		).replace(/::spin-up/g,    '+em.bis-spin-button>[pseudo=spinup]'
		).replace(/::spin-down/g,  '+em.bis-spin-button>[pseudo=spindown]'
		).replace(/::progress-bar/g,  '.bis-progress>[pseudo=progressbar]');
		
		cssText += [
			'em>s{',
				'text-decoration:none;',
			'}',
			'.bis-slider:before,.bis-slider>[pseudo=thumb],',
			'.bis-slider>[pseudo=filllower],',
			'.bis-slider>[pseudo=fillupper]{',
				'position:absolute;',
				'margin:auto;', 
			'}',
			'.bis-slider:before{',
				'content:"";',
				'top:0;left:0;bottom:0;right:0;',
				'background-color:gray;',
			'}',
			'.bis-slider>[pseudo=thumb]{',
				'background-color:silver;',
				'width:16px;height:16px;',
			'}',
			'.bis-progress>[pseudo=progressbar]{',
				'display:block;',
				'background-color:silver;',
			'}',
			'.bis-spin-button,.bis-spin-button>[pseudo=spinup],',
			'.bis-spin-button>[pseudo=spindown]{',
				'position:absolute;',
			'}',
			'.bis-spin-button>[pseudo=spinup],.bis-spin-button>[pseudo=spindown]{',
				'background-color:silver;',
			'}',
			'.bis-spin-button>[pseudo=spinup]{',
				'top:0;',
			'}',
			'.bis-spin-button>[pseudo=spindown]{',
				'bottom:0;',
			'}',
			'.bis-spin-button>[pseudo=spinup]:hover,',
			'.bis-spin-button>[pseudo=spindown]:hover{',
				'background-color:gray;',
			'}'
		].join('');

		docEvents();

		return cssText;
	}
})();



var gradient, _gradient;
(function(){

	var canvas  = doc[ELEM]('canvas'),
		dataURL = 'toDataURL' in canvas,
		legacy  = (function( webkit ){
			tmpStyle.cssText = 'background:-webkit-linear-gradient(#000,#111)';
			return webkit ? !tmpStyle.background : 0;
		})( prefix === '-webkit-' );
		
	function keyword2angle( angle ){
		return {
			'bottom right': 90 + angle, 'right bottom': 90 + angle,
			'top right': 90 - angle, 'right top': 90 - angle,
			'top left': 270 + angle, 'left top': 270 + angle,
			'bottom left': 270 - angle, 'left bottom': 270 - angle,
			top: 0, right: 90, bottom: 180, left: 270
		}
	};
	
	function keyword2pos( w, h ){
		return {
			'bottom right': [ w, h ], 'right bottom': [ w, h ],
			'top right': [ w, 0 ], 'right top': [ w, 0 ],
			'top left': [ 0, 0 ], 'left top': [ 0, 0 ],
			'bottom left': [ 0, h ], 'left bottom': [ 0, h ],
			center: [ w / 2, h / 2 ]
		}
	};
	
	function angle2point( angle, w, h ){
		var rad, length, sin, cos, x1, y1, x2, y2;
		
		if( !( angle % 180 ) ){
			x1 = 0; y1 = angle ? 0 : h; 
			x2 = 0; y2 = angle ? h : 0;
			length = h;
		}
		else if( angle % 180 === 90 ){
			x1 = angle % 270 ? 0 : w; y1 = 0; 
			x2 = angle % 270 ? w : 0; y2 = 0;
			length = w;
		}
		else {
			//http://blogs.msdn.com/b/ie/archive/2012/06/25/unprefixed-css3-gradients-in-ie10.aspx
			angle = mabs( pF( angle ) - 450 ) % 360;
			rad = toRad( angle ); 
			sin = msin( rad ); cos = mcos( rad );
			//http://dev.w3.org/csswg/css-images-3/#linear-gradients
			length = mabs( w * cos ) + mabs( h * sin );
			var hw = w / 2, hh = h / 2, hl = length / 2;
			x1 = pF( hw - hl * cos ); y1 = pF( hh + hl * sin );
			x2 = pF( hw + hl * cos ); y2 = pF( hh - hl * sin );
		}
		return [ x1, y1, x2, y2, length ];
	}
	
	function pos2radius( size, position, w, h, repeat, elem ){
		var x = toPx( position[0], elem ), 
			y = isNum( position[1] ) ? toPx( position[1], elem ) : h / 2,
			dx = w - x, dy = h - y, r, 
			c1 = hypot( x, y ), c2 = hypot( dx, y ),
			c3 = hypot( dx, dy ), c4 = hypot( x, dy ),
			cs = mmin( x, y, dx, dy ), 
			fs = mmax( x, y, dx, dy ),
			cc = mmin( c1, c2, c3, c4 ),
			fc = mmax( c1, c2, c3, c4 );
			
		if( repeat ) return [ x, y, 0, x, y, fc ];
		
		switch( size ){
			case 'closest-side':
				r = cs;
			break;
			case 'farthest-side':
				r = fs;
			break;
			case 'closest-corner':
				r = cc;
			break;
			case 'farthest-corner':
				r = fc
			break;
			default:
				r = toPx( size, elem ) || 0;
			break;
		}
		return [ x, y, 0, x, y, r ];
	}
	
	function pixel( val, r ){
		return val.match('%') ? pF( val ) / 100 * r : pF( val );
	}
	
	function parseBgSize( bgSize, bgImgs, w, h ){
		var size = [], len = bgImgs.length, i = 0,
			value = bgSize.split(',');
		
		value.forEach( function( val ){
			val = val.split(' ');
			val[0] = pixel( val[0], w );
			val[1] = val[1] ? pixel( val[1], h ) : val[0] * h / w;
			size.push( val );
		} );
	
		while( len - size.length > 0 ){
			size[ size.length ] = size[ i++ ];
		}
		return size;
	}
	
	function prefixGradient( img, w, h, angles ){
		if( img.match('linear') ){
			return prefix + img.replace(
				/to ((left|right|top|bottom)( left| right| top| bottom)?)/, 
				function( match, k ){
					return angles[k] + 'deg';
				}
			).replace(/(-?(\d*\.)?\d+)deg/, 
				function( match, angle ){
					return mabs( angle - 450 ) % 360 + 'deg';
				}
			);
		}
		
		if( img.match('radial') ){
			return prefix + img.replace(/gradient\((.*) at ([^,]+,)/ig, 
				function( match, shape, pos ){
					return 'gradient(' + pos + ( shape ? shape + ',' : '' );
				}
			).replace(/([^,-]+) ellipse|ellipse ([^,-]+)/ig,
				function( match, before, after ){
					return before ? before : after;
				}
			).replace(/([^,-]+) circle|circle ([^,-]+)/ig, 
				function( match, before, after ){
					return before ? before + ' ' + before : after + ' ' + after;
				}
			);
		}
	}
	
	function canvasGradient( w, h, type, param, stops, bdr ){
		canvas.width = w; canvas.height = h;
		var ctx = canvas.getContext('2d'), 
			ctype = type[0].toUpperCase() + type.substring(1),
			grd = ctx['create' + ctype + 'Gradient'].apply( ctx, param );

		stops.forEach( function( stop ){
			grd.addColorStop( stop[1], stop[0].replace(/~~~/g, ',') );
		} );
		
		ctx.fillStyle = grd;
		if( w === h && bdr === '50%' ){
			ctx.arc( w/2, w/2, w/2, 0, 2 * Math.PI, false );
			ctx.fill();
		} else {
			ctx.fillRect( 0, 0, w, h );
		}
		
		return "url('" + canvas.toDataURL() + "')";
	}
	
	function legacyGradient( w, h, type, param, stops ){
		var grd = [ '-webkit-gradient(' + type ];
	
		type === 'linear' && grd.push(
			param[0] + ' ' + param[1],
			param[2] + ' ' + param[3]
		);
		type === 'radial' && grd.push(
			param[0] + ' ' + param[1], param[2],
			param[3] + ' ' + param[4], param[5]
		);
		stops.forEach( function( stop ){
			grd.push( 'color-stop(' + stop[1], stop[0] + ')' );
		} );
		return grd.join(',') + ')';
	}
		
	function getParam( info, type, w, h, angles, pos, repeat, elem ){
		if( type === 'linear' ){
			var dir = info.match(/\(to ([A-z ]+)|(-?(?:\d*\.)?\d+)deg/);
			if( dir[1] && dir[1] in angles ) dir[2] = angles[ dir[1] ];
			if( !isNum( dir[2] ) ) return;
			return angle2point( +dir[2], w, h );
		}
		
		if( type === 'radial' ){
			if( !info.match('circle') ) return;
			var shape = info.split(' at '),
				size = shape[0].replace(/.+\(|\s?circle\s?/g, ''),
				position = shape[1] ? pos[ shape[1] ] : pos['center'];
			
			size = size || 'farthest-corner';
			position = position || shape[1].split(' ');
			return pos2radius( size, position, w, h, repeat, elem );
		}
	}
	
	function nextStop( stops, i ){
		var len = stops.length;
		for( ; i < len; i += 1 ){
			if( stops[i][1] ) return [ i, stops[i][1] ];
		}
	}
	
	function convertStop( val, l ){
		if( val.match('%') ) return pF( val ) / 100;
		else return pF( val ) / l;
	}
	
	function parseStop( parts, length, repeat ){
		var len = parts.length, stops = [], last = 0, larger;
		parts[ len - 1 ] = parts[ len - 1 ].slice(0, -1);
		
		//http://dev.w3.org/csswg/css-images-3/#color-stop-syntax
		parts.forEach( function( part, i ){
			part = part.split(' ');
			if( part[1] ){
				var value = convertStop( part[1], length );
				larger = mmax( value, last );
				part[1] = value < larger ? larger : value;
			} else {
				part[1] = i ? i === len - 1 ? 1 : part[1] : 0;
			}
			last = part[1];
			
			//Canvas and legacy have to be in [0,1]
			part[1] = mmax( mmin( part[1], 1 ), 0 );
			stops.push( part );
		} );
		
		//Deal with stops do not have a position
		stops.forEach( function( stop, i ){
			if( !isNum( stop[1] ) ){
				var prev = stops[ i - 1 ][1],
					nexts = nextStop( stops, i ),
					next = nexts[1],
					num = nexts[0] - i + 1;
				stop[1] = pF( prev + ( next - prev ) / num );
			}
		} );
		
		//Repeating gradient
		var slen = stops.length, j, lastPos, pos;
		while( repeat && stops[ stops.length - 1 ][1] < 1 ){
			lastPos = stops[ stops.length - 1 ][1];
			for( j = 0; j < slen; j += 1 ){
				pos = mmin( stops[j][1] + lastPos, 1 );
				stops.push( [ stops[j][0], pos ] );
			}
		}
		
		return stops;
	}
	
	_gradient = function( elem ){
		if( !elem ) return;
		
		var w = elem.offsetWidth, h = elem.offsetHeight,
			bgImgs = elem.bgimg[0].split(','),
			size = elem.bgimg[1], bdr = elem.bgimg[2],
			bgSize = size ? parseBgSize( size, bgImgs, w, h ) : 0,
			greg = /^(repeating-)?(linear|radial)/, 
			bgImages = [], grd;
		
		bgImgs.forEach( function( img, i ){
			if( !greg.test( img ) ){
				bgImgs[i] = img; return;
			}
			img = img.replace(/(linear-gradient)\((?!-|\s|\d|to)/, '$1(to bottom&&&');
			img = img.replace(/(radial-gradient)\((?!-|\s|\d|clo|far|ell|cir|at)/, '$1(ellipse&&&');
			
			var imgW = bgSize ? bgSize[i][0] : w,
				imgH = bgSize ? bgSize[i][1] : h,
				pos  = keyword2pos( w, h ),
				angle  = toDeg( matan( w / h ) ),
				angles = keyword2angle( angle ),
				
				parts = img.split('&&&'),
				info = parts.shift(), match = info.match( greg ),
				type = match[2], repeat = match[1],
				param = getParam( info, type, imgW, imgH, angles, pos, repeat, elem );
			
			if( parts.length < 2 || !param ) return;			
			var stops = parseStop( parts, param[5] || param[4], repeat ),
				lastColor = stops[ stops.length - 1 ][0];
			
			if( param[5] === 0 ){
				param[5] = hypot( imgW, imgH );
				stops = [[ lastColor, 0 ], [ lastColor, 1 ]];
			}
			
			if( legacy ){
				bgImages[i] = legacyGradient( imgW, imgH, type, param, stops ).replace(/~~~/g, ',');
			} else {
				grd = prefixGradient( img, imgW, imgH, angles ).replace(/&&&|~~~/g, ',');
				tmpStyle.cssText = 'background-image:' + grd;
				if( tmpStyle.backgroundImage ) bgImages[i] = grd;
				if( !tmpStyle.background && dataURL ){
					bgImages[i] = canvasGradient( imgW, imgH, type, param, stops, bdr );
				}
			}
		} );

		elem.style.backgroundImage = bgImages.join(',');
	};

	gradient = function( sel, rules, get ){		
		var img = get('background-image'), size = get('background-size'),
			bdr = get('border-radius'), m; 

		if( m = sel.match(':(before|after)') ){
			replacedPseudo.push( sel );
			sel = sel.replace( m[0], '' );
			
			$$( sel ).forEach( function( elem ){
				var child = m[1] === 'before' ? elem.firstChild : elem.lastChild, pseudo;
				if( child && child.className.match( m[1] ) ){
					pseudo = child;
					pseudo.className += ' bis-prefixed-gradient';
				} else {
					pseudo = doc[ELEM]('b');
					pseudo.className = m[1] + ' bis-prefixed-gradient';
					m[1] === 'before' ? elem.insertBefore( pseudo, child ) : 
								 elem.appendChild( pseudo );
				}
				pseudo.bgimg = [ img, size, bdr ];
			} );
		} else {
			$$( sel ).forEach( function( elem ){
				elem.bgimg = [ img, size, bdr ];
				elem.className += ' bis-prefixed-gradient';
			} );
		}
	};

})();	


var iterate, shadowCopy, _shadowCopy;	
(function(){

	iterate = function( value ){
		var formulaM = /\(((-)?[\d\.]*)m((-|\+)[\d\.]+)?\)/g,
			formulaN = /\(((-)?[\d\.]*)n((-|\+)[\d\.]+)?\)/g;
		if( !formulaN.test( value ) ) return value;
		var values = value.split(",");
		
		values.forEach( function( val, index ){
			var parts = val.split(" "),
				m = +parts.shift(),
				n = +parts[0] ? +parts.shift() : 0,
				i = 0, j = 0, str = [], substrM, substrN;
			if( !m ) return;
			
			val = parts.join(" ");
			for( ; i < m; i += 1 ){
				substrM = val.replace( n ? formulaM : formulaN,
					function( $0, $1, $2, $3 ){
						$1 === '-' && ( $1 = -1 );
						return ( +$1 ) * i + ( +$3 || 0 ); 
				} );
				for( ; j < n; j += 1 ){
					substrN = substrM.replace( formulaN, 
						function( $0, $1, $2, $3 ){
							$1 === '-' && ( $1 = -1 );
							return ( +$1 ) * j + ( +$3 || 0 ); 
					} );
					str.push( substrN );
				}
				j = 0;
				!n && str.push( substrM );
			}
			values[ index ] = str.join(",");
		} );
		return values.join(",");
	};
	
	function replaceColor( colorStr, replacement ){
		if( !colorStr ) return;
		var colors = colorStr.replace(/\s*(,)\s*/g, '$1').split(' ');
		colors.forEach( function( c, i ){
			c !== TRANS && ( colors[i] = replacement );
		} );
		return colors.join(' ');
	}
	
	shadowCopy = function( sel, rules, get ){
		if( !$$( sel ).length || get('position') !== 'absolute' ) return;
		
		var copies = get('-bis-shadow-copy').split(','),
			bgColor = get('background-color');

		getPaddingBorder( get );
		rules.push(
			sel + '+em{',
				'position:absolute;',
				'left:' + get('left') + ';',
				'top:' + get('top') + ';',
				'bottom:' + get('bottom') + ';',
				'right:' + get('right') + ';',
			'}',
			sel + '+em>b{',
				'position:absolute;',
				'width:' + get('width') + ';',
				'height:' + get('height') + ';',
				'box-sizing:' + get('box-sizing') + ';',
				'border-radius:' + get('border-radius') + ';',
				'border:' + get('border') + ';',
				'padding:' + ( tmpStyle.padding || 0 ) + ';',
				'border-width:' + ( tmpStyle.borderWidth || 0 ) + ';',
				'border-style:' + ( tmpStyle.borderStyle || 'none' ) + ';',
			'}'
		);
		
		copies.forEach( function( copy, index ){
			var parts = copy.split(' '),
				left = parts.shift(),
				top = parts.shift(),
				color = parts.shift(),
				trs = parts.length ? parts.join(' ').split('/') : [],
				transform = trs[0] ? trs[0] : '',
				origin = trs[1] ? trs[1] : '';
			
			rules.push(
				sel + '+em>b.copy' + index + '{',
					'left:' + left + ';',
					'top:' + top + ';',
					'border-color:' + replaceColor( tmpStyle.borderColor, color ) + ';',
					bgColor ? 'background-color:' + color + ';' : '',
					transform ? 'transform:' + transform + ';' : '',
					origin ? 'transform-origin:' + origin + ';' : '',
				'}'
			);
		} );
		
		$$( sel ).forEach( function( elem ){
			var copyElem = doc[ELEM]('em');
			copyElem.className = 'bis-shadow-copy';
			copies.forEach( function( copy, index ){
				var li = doc[ELEM]('b');
				li.className = 'copy' + index;
				copyElem.appendChild( li );
			} );
			elem.parentNode.insertBefore( copyElem, elem.nextSibling );
		} );
	};
	
	_shadowCopy = function( elem ){
		var ori = elem.previousSibling;
		elem.style.cssText = [
			'width:'  + ori.offsetWidth  + 'px',
			'height:' + ori.offsetHeight + 'px'
		].join(';');
	};

})();



var process;
(function(){

	//Caching elements and props
	var start = -1, _start = -1,
		elements = {}, sels = {}, rules = {};
	
	function searchSels( cssText, prop ){
		start = cssText.indexOf( prop, start + 1 );
		if( start < 0 ) return;
		if( start in sels ) return sels[start];
		var	i = cssText.lastIndexOf( '}', start ),
			j = cssText.lastIndexOf( '{', start );
		return ( sels[start] = cssText.slice( i + 1, j ).split(',') );
	}
	
	function searchRules( cssText, sel ){
		_start = cssText.indexOf( sel, _start + 1 );
		if( _start < 0 ) return;
		//Should be the exact selector, not psuedo or similar names 
		var not = /[^,\{ ]/.test( cssText[ _start + sel.length ] );
		if( not ) return ' ';
		if( _start in rules ) return rules[ _start ];
		var	i = cssText.indexOf( '{', _start ),
			j = cssText.indexOf( '}', _start );
		return ( rules[ _start ] = cssText.slice( i + 1, j ) );
	}
	
	function findProp( cssText, sel, prop ){
		!elements[sel] && ( elements[sel] = {} );
		var rules, i, j, k, match, 
			reg = new RegExp( '(^|;)'+ prop + ':', 'g' );

		while( rules = searchRules( cssText, sel ) ){
			while( match = reg.exec( rules ) ){
				i = match.index;
			};
			if( !isNum( i ) ) continue;
			j = rules.indexOf( ':', i );
			k = rules.indexOf( ';', j );
			i = null;
			elements[sel][prop] = rules.slice( j + 1, k );
		}
		return elements[sel][prop];
	}
	
	function getProp( cssText, sel, prop ){
		if( elements[sel] && elements[sel][prop] ) return elements[sel][prop];
		findProp( cssText, sel, prop );

		var appendix = /(.+)(:(hover|active)|\.[\w-]+)/,
			m = sel.match( appendix );
		if( m && !elements[sel][prop] ){
			elements[sel][prop] = findProp( cssText, m[1], prop );
		}
		return elements[sel][prop];
	}
	
	process = function( prop, cssText, fn ){
		var selectors, _sel, rules = [];		
		while( selectors = searchSels( cssText, prop ) ){
			selectors.forEach( function( sel ){
				if( sel === _sel ) return;
				fn( sel, rules,
					function( prop ){
						return getProp( cssText, sel, prop );
					} );
				_sel = sel;
			} );
		}
		return cssText + rules.join('');
	};
	
})();


var parse;
(function(){

	function px2em( text ){
		var m, i, j, before, after, reg = /@(\d+),/g;
		while( m = reg.exec( text ) ){
			i = m.index;
			j = text.indexOf( '}}', i );
			before = text.slice( i, j + 2 );
			after = before.replace( /((-?\d*\.)?\d+)px/g, function( $0, $1 ){
				return pF( $1 / m[1] ) + 'em';
			} ).replace( m[0], '' ).replace('}}', '}');
			text = text.replace( before, after );
		}
		return text;
	}
	
	function normalize( text ){
		return text.replace( /(rgb|hsl)a?\([^a-l]+\)/g, 
			function( $0 ){
				return $0.replace(/,/g, '~~~');
			}
		).replace( /-((\d*\.)?\d+)/g, '###$1'
		).replace( /gradient\([^-\/;]+\)/g, 
			function( $0 ){
				return $0.replace(/,/g, '&&&');
			}
		).replace( /###/g, '-'
		).replace( /-bis-shape:(\w+)\(([^;]+)\);/g,
			function( $0, $1, $2 ){
				if( $1 in Shape ){
					try{
						return Shape[ $1 ]( ['position:absolute'], $2.split(',') );
					}catch(e){
						debug( "Incorrect parameter: <b style='color:red'>" + $0 + '</b>', 'shape-' + $1 );
					}
				} else {
					debug( "Incorrect shape type: <b style='color:red'>" + $0 + '</b>', 'shape' );
				}
			}
		).replace( /((?:box|text)-shadow|background-image|-bis-shadow-copy):([^;]+)/g, 
			function( $0, $1, $2 ){
				return $1 + ':' + iterate( $2 );
			}
		);
	}
	
	function format( text ){
		return text.replace(/&&&|~~~/g, ',').replace(/(\{|;(?!base))/g, '$1\n\t'
				).replace(/\t\}/g, '}\n').replace(/,/g, ', ');
	}
	
	parse = function( cssText ){
		doc.body.appendChild( tmp );
		cssText = cssText.replace(/(@\d+){/g, '$1,');//px2em: @320{}
		cssText = process( '-bis-kit', cssText, biskit );
		cssText = px2em( normalize( cssText ) );
		cssText = process( '-bis-shadow-copy:', cssText, shadowCopy );
		cssText = _biskit( cssText );
//console.log(format( cssText ));
		tmpStyle.cssText = 'background:linear-gradient(#000,#111)';
		!tmpStyle.background && process( '-gradient(', cssText, gradient );

		cssText = addPrefix( cssText );
		replacedPseudo.forEach( function( before ){
			var after = before.replace(/:(be|af)/, '>.$1');
			cssText = cssText.replace( before, after );
		} );
		
		doc.body.removeChild( tmp );
		return format( cssText );
	};
	
})();



function debug( text, id ){
	var isDev = ( location.hostname == '127.0.0.1' ||
    	location.hostname == '0.0.0.0'   ||
    	location.hostname == 'localhost' ||
		!location.hostname.indexOf('192.168.') ||
    	location.port.length > 0
	);

	if( !isDev && id ) return;
	var msg = doc[ELEM]('p'), 
		docs = id ? "&nbsp;&nbsp;&nbsp;&nbsp;<a target='blank' href='//sargentjs.com/docs/#" + id + "'>View docs</a>" : '';
		
	msg.style.cssText = [
		'position:fixed', 'left:0', 'top:0', 'width:100%', 'z-index:10000', 'padding:1em 0', 
		'color:#666', 'background-color:#EEE', 'text-align:center'
	].join(';');
	
	msg.innerHTML = text + docs;
	doc.body.appendChild( msg );
}

function loadSheet( sheet, id ){
	var xhr  = new XMLHttpRequest(),
		href = sheet.href.replace(/(\.css).*/, '$1'),
		last = storage ? storage.getItem( href + '-last' ) : 0, 
		current, cssText;
		
	xhr.onreadystatechange = function(){
		if ( xhr.readyState === 4 ){ 
			if ( xhr.status >= 200 && xhr.status < 300 ){	
				current = Date.parse( xhr.getResponseHeader('Last-Modified') );
				if( last !== current ){
					//compress css
					cssText =  xhr.responseText.replace(
					/\s*([@{}:;, ])\s*|\/\*([^*\\\\]|\*(?!\/))+\*\/|[\n\r\t]/g, '$1');
					createStyle( parse( cssText ), sheet, id, current );
				} else {
					cssText = storage.getItem( href );
					createStyle( cssText, sheet, id );
				}
			} else {
				debug( "Something wrong with the connection. Please refresh the page!" );
			}
		} 
	}
	
	xhr.open( 'GET', href, false );
	xhr.send();	
}

function createStyle( cssText, sheet, id, last ){
	var resultStyle = doc[BYID]( 'bis-sheet-' + id );
	
	if( !resultStyle ){
		resultStyle = doc[ELEM]('style'); 
		var head = $$( 'head' )[0];
		resultStyle.type = 'text/css';
		resultStyle.id = 'bis-sheet-' + id;			
		resultStyle.media = sheet.media || 'screen';	
		head.appendChild( resultStyle );
	}
	
	resultStyle.innerHTML = cssText;
	
	if( last && storage ){
		var href = sheet.href.replace(/(\.css).*/, '$1');
		storage.setItem( href + '-last', last );
		storage.setItem( href, cssText );
	}
}

doc[ON]('DOMContentLoaded', function(){
	var sheets = [];

	$$( 'link' ).forEach( function( link ){
		link.href && /^http/.test( link.href ) && 
		link.rel === 'stylesheet/bisque' && sheets.push( link );
	} );
	
	//bisque icons
	$$('.bis').forEach( function( elem ){ 
		elem.innerHTML += '<b></b><i></i><s></s>' 
	});
	
	sheets.forEach( loadSheet );
	
	$$('.bis-spin-button').forEach( spinBtnFix );
	$$('.bis-slider').forEach( inputSliderFix );
	$$('.bis-shadow-copy').forEach( _shadowCopy );
	$$('.bis-prefixed-gradient').forEach( _gradient );
}, false);

})( window, document )