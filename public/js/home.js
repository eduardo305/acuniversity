var home = (function() {
	var self = {

		toggleSignin: function() {
			var token = window.localStorage.getItem('token');

			if (token) {
				$('.ac-signin-container').toggleClass('hide');
				$('.ac-signout-container').toggleClass('hide');
			}
		},

		init: function() {
			this.toggleSignin();

			var token = window.localStorage.getItem('token');

			if (token) {
				window.location.href = '/courses';	
			} else {
				window.location.href = '/signin';
			}
		}

	};

	return self;

})();

home.init();