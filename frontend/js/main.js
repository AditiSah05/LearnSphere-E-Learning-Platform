// Session expiry: if any authenticated request comes back 401, the token is
// stale/expired — clear it and send the user back to login instead of
// leaving the page silently broken (blank data, dead buttons).
(function () {
    const originalFetch = window.fetch;
    window.fetch = function (input, init) {
        const headers = (init && init.headers) || {};
        const hasAuth = !!(headers.Authorization || headers['Authorization']);
        return originalFetch(input, init).then((res) => {
            if (hasAuth && res.status === 401 && localStorage.getItem('token')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (!window.location.pathname.endsWith('login.html')) {
                    if (typeof showToast === 'function') showToast('Session expired — please log in again.', 'info');
                    setTimeout(() => (window.location.href = 'login.html'), 800);
                }
            }
            return res;
        });
    };
})();


// Auth-aware navbar: swap the login icon for a user menu when logged in
(function () {
    try {
        var token = localStorage.getItem('token');
        var user = JSON.parse(localStorage.getItem('user') || 'null');
        if (!token || !user || !user.name) return;

        document.querySelectorAll('a[href="login.html"].nav-item.nav-link').forEach(function (link) {
            var initial = user.name.trim().charAt(0).toUpperCase();
            var firstName = user.name.trim().split(' ')[0];
            var wrapper = document.createElement('div');
            wrapper.className = 'nav-item dropdown user-menu';
            wrapper.innerHTML =
                '<a href="#" class="nav-link dropdown-toggle d-flex align-items-center" data-bs-toggle="dropdown" aria-expanded="false">' +
                '<span class="user-avatar">' + initial + '</span>' +
                '<span class="ms-2 d-none d-lg-inline">' + firstName + '</span>' +
                '</a>' +
                '<div class="dropdown-menu dropdown-menu-end fade-down m-0">' +
                '<a class="dropdown-item" href="dashboard.html"><i class="fa fa-columns me-2"></i>Dashboard</a>' +
                '<a class="dropdown-item" href="#" id="logoutBtn"><i class="fa fa-sign-out-alt me-2"></i>Logout</a>' +
                '</div>';
            link.replaceWith(wrapper);
        });

        document.addEventListener('click', function (e) {
            if (e.target.closest('#logoutBtn')) {
                e.preventDefault();
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'index.html';
            }
        });
    } catch (e) {}
})();


(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();


    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.sticky-top').css('top', '0px');
        } else {
            $('.sticky-top').css('top', '-100px');
        }
    });


    // Dropdown on mouse hover
    const $dropdown = $(".dropdown");
    const $dropdownToggle = $(".dropdown-toggle");
    const $dropdownMenu = $(".dropdown-menu");
    const showClass = "show";

    $(window).on("load resize", function () {
        if (this.matchMedia("(min-width: 992px)").matches) {
            $dropdown.hover(
                function () {
                    const $this = $(this);
                    $this.addClass(showClass);
                    $this.find($dropdownToggle).attr("aria-expanded", "true");
                    $this.find($dropdownMenu).addClass(showClass);
                },
                function () {
                    const $this = $(this);
                    $this.removeClass(showClass);
                    $this.find($dropdownToggle).attr("aria-expanded", "false");
                    $this.find($dropdownMenu).removeClass(showClass);
                }
            );
        } else {
            $dropdown.off("mouseenter mouseleave");
        }
    });


    // Button ripple effect
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.btn');
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const ripple = document.createElement('span');
        ripple.className = 'btn-ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        btn.appendChild(ripple);
        setTimeout(function () { ripple.remove(); }, 600);
    });


    // Newsletter form — Subscribe is a mailto link, not a submit button, so
    // pressing Enter in the email field must do the same thing as clicking it.
    $('#newsletterForm').on('submit', function (e) {
        e.preventDefault();
        window.location.href = $(this).find('a[href^="mailto:"]').attr('href');
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        center: true,
        margin: 24,
        dots: true,
        loop: true,
        nav: false,
        responsive: {
            0: {
                items: 1
            },
            768: {
                items: 2
            },
            992: {
                items: 3
            }
        }
    });


    // Course Preview Modal
    const courseData = {
        'img/course-1.jpg': {
            title: 'HTML Course for Beginners',
            instructor: 'Zoe Bachman',
            duration: '2.0 Hrs',
            rating: '4.55',
            price: '₹ 0',
            learners: '5.8L+ Learners',
            level: 'Beginner',
            description: 'Start at the beginning by learning HTML basics — an important foundation for building and editing web pages. HTML provides the content that gives web pages structure, and by using elements and tags, you can add text, images, videos, forms, and more.'
        },
        'img/course-2.jpg': {
            title: 'Front End Development-CSS',
            instructor: 'Sarah Johnson',
            duration: '4.0 Hrs',
            rating: '4.55',
            price: '₹ 199',
            learners: '5.2L+ Learners',
            level: 'Beginner',
            description: 'Master CSS to style beautiful, responsive websites. Learn about selectors, box model, flexbox, grid, animations, and modern layout techniques.'
        },
        'img/course-3.jpg': {
            title: 'Introduction to JavaScript',
            instructor: 'Mike Chen',
            duration: '2.5 Hrs',
            rating: '4.46',
            price: '₹ 0',
            learners: '76L+ Learners',
            level: 'Beginner',
            description: 'Learn JavaScript fundamentals for interactive web development. Covers variables, functions, DOM manipulation, events, and basic algorithms.'
        },
        'img/course-4.jpg': {
            title: 'Python Programming',
            instructor: 'Alex Rivera',
            duration: '3.0 Hrs',
            rating: '3.54',
            price: '₹ 299',
            learners: '3.3L+ Learners',
            level: 'Beginner',
            description: 'Start your Python journey with hands-on programming exercises. Learn syntax, data types, loops, functions, and object-oriented programming basics.'
        },
        'img/course-5.jpg': {
            title: 'SQL for Data Science',
            instructor: 'Emily Watson',
            duration: '5.0 Hrs',
            rating: '4.54',
            price: '₹ 0',
            learners: '1.3L+ Learners',
            level: 'Intermediate',
            description: 'Learn SQL queries and database management for data analysis. Covers SELECT, JOIN, GROUP BY, subqueries, and data aggregation techniques.'
        },
        'img/course-6.jpg': {
            title: 'ChatGPT for Beginners',
            instructor: 'David Kim',
            duration: '4.5 Hrs',
            rating: '3.55',
            price: '₹ 0',
            learners: '3.5L+ Learners',
            level: 'Beginner',
            description: 'Understand how to use ChatGPT and AI tools effectively. Learn prompt engineering, practical applications, and how to integrate AI into your workflow.'
        },
        'img/course-7.jpg': {
            title: 'AWS for Beginners',
            instructor: 'Lisa Thompson',
            duration: '3.0 Hrs',
            rating: '4.53',
            price: '₹ 0',
            learners: '1L+ Learners',
            level: 'Beginner',
            description: 'Get started with Amazon Web Services cloud computing. Learn about EC2, S3, Lambda, and core AWS services for deploying applications.'
        },
        'img/course-8.jpg': {
            title: 'Microsoft Azure Essentials',
            instructor: 'James Wilson',
            duration: '3.5 Hrs',
            rating: '4.64',
            price: '₹ 149',
            learners: '4.4L+ Learners',
            level: 'Intermediate',
            description: 'Learn Microsoft Azure cloud platform fundamentals. Covers virtual machines, storage, networking, and Azure Active Directory.'
        },
        'img/course-9.jpg': {
            title: 'Introduction to MS Excel',
            instructor: 'Rachel Green',
            duration: '3.5 Hrs',
            rating: '4.6',
            price: '₹ 0',
            learners: '4.2L+ Learners',
            level: 'Beginner',
            description: 'Master Excel spreadsheets for data management and analysis. Learn formulas, pivot tables, charts, and data visualization techniques.'
        },
        'img/course-10.jpg': {
            title: 'Statistics For Data Science',
            instructor: 'Dr. Patel',
            duration: '2.5 Hrs',
            rating: '4.55',
            price: '₹ 299',
            learners: '5.3L+ Learners',
            level: 'Intermediate',
            description: 'Learn statistical concepts essential for data science. Covers probability, distributions, hypothesis testing, and regression analysis.'
        },
        'img/course-11.jpg': {
            title: 'Java Programming',
            instructor: 'Kevin Brown',
            duration: '2.0 Hrs',
            rating: '4.45',
            price: '₹ 0',
            learners: '5L+ Learners',
            level: 'Beginner',
            description: 'Learn Java programming from basics to object-oriented concepts. Covers classes, inheritance, interfaces, and exception handling.'
        },
        'img/course-12.png': {
            title: 'C for Beginners',
            instructor: 'Nancy Drew',
            duration: '1.5 Hrs',
            rating: '4.5',
            price: '₹ 0',
            learners: '1.1L+ Learners',
            level: 'Beginner',
            description: 'Start with C programming language fundamentals. Learn variables, control structures, functions, pointers, and memory management.'
        }
    };

    $(document).ready(function() {
        $('.course-item').on('click', function(e) {
            if ($(e.target).closest('a').length) return;
            
            const imgSrc = $(this).find('img.img-fluid').attr('src');
            const data = courseData[imgSrc];
            
            if (!data) return;
            
            $('#modalCourseTitle').text(data.title);
            $('#modalInstructor').text(data.instructor);
            $('#modalDuration').text(data.duration);
            $('#modalRatingStars').text('★ '.repeat(Math.round(data.rating)));
            $('#modalRatingValue').text(data.rating);
            $('#modalPrice').text(data.price);
            $('#modalLearners').text(data.learners);
            $('#modalLevel').text(data.level);
            $('#modalDescription').text(data.description);
            
            const courseModal = new bootstrap.Modal(document.getElementById('coursePreviewModal'));
            courseModal.show();
        });
    });

})(jQuery);





