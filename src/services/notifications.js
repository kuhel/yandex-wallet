export default ({
 	_favicon_origin: '/favicon.ico',
 	_favicon_event: '/favicon_event.ico',
 	_title_origin: 'page',
	init: function(title, src) {
		this._title_origin = title || this._title_origin;
		this._favicon_origin = src || this._favicon_origin;
	},
	sendNotification: function(title, src) {
		const self = this;
		if (!self.isPageVisible()()) { // send notifications only for not active windows
			self.changeFavicon(src || self._favicon_event);
			self.changeTitle(title);
			window.onfocus = null;
			window.onfocus = ()=>{
				setTimeout(()=>{
					self.changeFavicon(self._favicon_origin);
					self.changeTitle(self._title_origin);	
				}, 10);
				
			};
		}
	},
	changeFavicon: function (src) {
		/*!
		 * Dynamically changing favicons with JavaScript
		 * Works in all A-grade browsers except Safari and Internet Explorer
		 * Demo: http://mathiasbynens.be/demo/dynamic-favicons
		 */

		// HTML5™, baby! http://mathiasbynens.be/notes/document-head
		const header = document.head || document.getElementsByTagName('head')[0];

		let link = document.createElement('link');
		let oldLink = document.getElementById('dynamic-favicon');
		link.id = 'dynamic-favicon';
		link.rel = 'shortcut icon';
		link.href = src;
		if (oldLink) {
			header.removeChild(oldLink);
		}
		header.appendChild(link);
	},
	changeTitle: function (title) {
		document.title = title;	
	},
	isPageVisible: function() {
		return (function(){
		    var stateKey, eventKey, keys = {
		        hidden: "visibilitychange",
		        webkitHidden: "webkitvisibilitychange",
		        mozHidden: "mozvisibilitychange",
		        msHidden: "msvisibilitychange"
		    };
		    for (stateKey in keys) {
		        if (stateKey in document) {
		            eventKey = keys[stateKey];
		            break;
		        }
		    }
		    return function(c) {
		        if (c) document.addEventListener(eventKey, c);
	        	return !document[stateKey];
	    	}
		})();
	}
});
