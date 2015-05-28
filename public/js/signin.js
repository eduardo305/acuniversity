var signin = (function() {

	var self = {
		signin: function(credentials) {

			var dataForSignin;

			if (credentials && credentials.type) {
				dataForSignin = $('form#ac-signin-form').serialize();
			} else {
				dataForSignin = credentials;
			}

			$.ajax({
				url: '/api/authenticate',
				method: 'POST',
				data: dataForSignin,
				dataType: 'json',

				success: function(data) {
					if (data.success) {
						window.localStorage.setItem('token', data.token);
						window.localStorage.setItem('user', JSON.stringify(data.user));
						window.location.href = '/courses';
					} else {
						alert(data.message);
					}
				},

				error: function(error, status) {
					
				}

			});

			return false;
		},

		signup: function() {
			var dataForSignup = $('form#ac-signup-form').serialize();

			$.ajax({
				url: '/setup',
				method: 'POST',
				data: dataForSignup,
				dataType: 'json',

				success: function(data) {
					if (data.success) {
						signin.signin(dataForSignup);
					} else {
						alert(data.message);
					}

				},

				error: function(error, status) {
					console.log('error');
				}
			});

			return false;
		},

		toggleSignin: function() {
			var token = window.localStorage.getItem('token');

			if (token) {
				$('.ac-signin-container').toggleClass('hide');
				$('.ac-signout-container').toggleClass('hide');
			}
		},

		signout: function() {
			window.localStorage.clear();
			window.location.href = '/';

			return false;
		},

		init: function() {
			$('.ac-signin').click(this.signin);
			$('.ac-signup').click(this.signup);
			$('.ac-signout-container a').click(this.signout);
			
		}

	};

	return self;

})();

signin.init();

