var projects = document.querySelectorAll('section');
var sectionCutoffs = [];

function partitionPage() {
	var cumulativeHeight = 0;
	projects.forEach(function(project, index) {
		var currentProjectHeight = project.scrollHeight;
		sectionCutoffs.push(currentProjectHeight + cumulativeHeight);
		cumulativeHeight += currentProjectHeight;
	});
}

function addActiveState(dot) {
	var activeDot = document.querySelector('.navItem.active');
	if (activeDot) activeDot.classList.remove('active');
	dot.classList += ' active';
}

function renderNav() {
	var nav = document.querySelector('nav');
	nav.style.height = `${20 * projects.length}px`;
	projects.forEach(function(project, index) {
		var dot = document.createElement('a');
		dot.classList = "navItem";
		dot.addEventListener('click', function() {
			addActiveState(dot);
		});
		dot.href = `#${project.id}`;
		nav.appendChild(dot);
	});
	getActiveSection();
}

function getActiveSection() {
	var activeSectionIndex;

	projects.forEach(function(project, index) {
		if (verge.inViewport(project)) visibleSectionIndex = index;
	});

	var dots = document.querySelectorAll('.navItem');
	addActiveState(dots[visibleSectionIndex])
}

function setUpScrollListener() {
	var throttled = throttle(getActiveSection, 500);
	window.addEventListener('scroll', throttled);
}

function initialize() {
	if (window.innerWidth > 700) {
		renderNav();
		getActiveSection();
		setUpScrollListener();
		partitionPage();
	}
}

// Shoutout to https://codepen.io/SitePoint/pen/RRLVAL for this vanilla throttle implementation
function throttle(fn, wait) {
  var time = Date.now();
  return function() {
    if ((time + wait - Date.now()) < 0) {
      fn();
      time = Date.now();
    }
  }
}

initialize();
