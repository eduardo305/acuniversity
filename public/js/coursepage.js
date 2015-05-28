var coursepage = (function() {
	var self = {
		toggleSignin: function() {
			var token = window.localStorage.getItem('token');

			if (token) {
				$('.ac-signin-container').toggleClass('hide');
				$('.ac-signout-container').toggleClass('hide');
			}
		},

		getCourse: function(courseid) {
			$.ajax({
				url: '/api/courses/' + courseid,
				method: 'get',
				dataType: 'json',
				headers: {
					'x-access-token': window.localStorage.getItem('token')
				},

				success: function(data) {
					if (data.success) {
						$.each(data.course.attendees, function(index, value) {
							$('#ac-courses-container').append('<div class=\'row\' id=' + value._id + ' class=\'ac-attendee\'><div class=\'small-4 medium-6 columns\'>' + value.name + '</div><div class=\'small-8 medium-6 columns\'>' + value.email + '</div><hr>');
						});
					} 
				},

				error: function(error, status) {

				}

			});

		},

		init: function(courseid) {
			this.getCourse(courseid);
			this.toggleSignin();
		}
	};

	return self;
})();

coursepage.init(window.location.pathname.substr(9, window.location.pathname.length));