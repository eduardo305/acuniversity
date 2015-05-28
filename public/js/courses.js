var courses = (function() {
	var self = {
		toggleSignin: function() {
			var token = window.localStorage.getItem('token');

			if (token) {
				$('.ac-signin-container').toggleClass('hide');
				$('.ac-signout-container').toggleClass('hide');
			}
		},

		getCourses: function() {
			$.ajax({
				url: '/api/courses',
				method: 'get',
				dataType: 'json',
				headers: {
					'x-access-token': window.localStorage.getItem('token')
				},

				success: function(data) {

					var toggleRegisterButtons = function() {
						var user = JSON.parse(window.localStorage.getItem('user'));
						var that;
						$.each(data.courses, function(index, course) {
							that = course;
							$.each(course.attendees, function(index, attendee) {
								if (attendee === user._id) {
									that.isRegistered = true;
								}
							});
						});

						window.localStorage.setItem('courses', JSON.stringify(data.courses));
					};

					if (data.success) {
						toggleRegisterButtons();

						$.each(data.courses, function(index, value) {
							//$('#ac-courses-container ul').append('<li id=' + value._id + '><div class=\'row\'><div class=\'small-8 columns\'>' + value.name + ' </div><div class=\'small-4 columns\'><button>register</button></div></div></li>');
							$('#ac-courses-container').append('<div class=\'row\' id=' + value._id + ' class=\'ac-course\'><div class=\'small-8 columns ac-course-info\'>' + value.name + '<div class=\'ac-hosts\'>Hosts: ' + value.host + '</div></div><div class=\'small-4 columns\'><button class=\'button tiny right\'>register</button></div></div>');
							if (value.isRegistered) {
								$('div#' + value._id).find('button').html('unregister');	
							}
							$('#ac-courses-container').find('#' + value._id).find('.ac-course-info').append('<div class=\'ac-dates\'>Dates: ' + new Date(value.startdate).toLocaleDateString('US') + ' - ' + new Date(value.enddate).toLocaleDateString('US') + '</div>');
							$('#ac-courses-container').find('#' + value._id).find('.ac-course-info').append('<div class=\'ac-credits\'>Credits: ' + value.credits + '</div>');

							if (JSON.parse(window.localStorage.getItem('user')).admin) {
								$('#ac-courses-container').find('#' + value._id).find('.ac-course-info').append('<div class=\'ac-details-button\'><a href=\'/courses/' +  value._id + '\'>participants</a></div>')
							}
							$('#ac-courses-container').find('#' + value._id).append('<hr>')
							
						});

						//window.localStorage.setItem('courses', JSON.stringify(data.courses));

						$('#ac-courses-container button').click(function() {
							var courses = JSON.parse(window.localStorage.getItem('courses'));
							var $that = $(this).parent().parent();

							for (var i = 0; i < courses.length; i++) {
								if (courses[i]._id === $that.attr('id')) {
									currentCourse = courses[i];
								}
							}

							if ($that.find('button')[0].innerText === 'unregister') {
								currentCourse.attendees = $.grep(currentCourse.attendees, function(attendee) {
									return attendee !== JSON.parse(window.localStorage.getItem('user'))._id;
								});
							} else {
								currentCourse.attendees.push(JSON.parse(window.localStorage.getItem('user'))._id);	
							}

							$.ajax({
								url: '/api/courses/' + $that.attr('id'),
								method: 'put',
								dataType: 'json',
								data: {courseid:  $that.attr('id'), attendees: JSON.stringify(currentCourse.attendees)},
								headers: {
									'x-access-token': window.localStorage.getItem('token')
								},

								success: function(data) {
									if (data.success) {
										window.location.reload();

									} else {
										alert(data.message);
									}

								},

								error: function(error, status) {
									console.log('deu errado');	

								}
							});

							
						});
					} else {
						window.location.href = '/';
					}
					
				},

				error: function(error, status) {
					console.log('não deu certo');
				}

			});
		},

		init: function() {
			this.getCourses();
			this.toggleSignin();
		}
	};

	return self;

})();

courses.init();