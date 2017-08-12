var projects = document.querySelectorAll('section');
var sectionCutoffs = [];

function partitionPage() {
	var cumulativeHeight = 0;
	projects.forEach(function(project, index) {
		var currentProjectHeight = project.scrollHeight;
		console.log(project.id, currentProjectHeight);
		sectionCutoffs.push(currentProjectHeight + cumulativeHeight);
		cumulativeHeight += currentProjectHeight;
	});
	console.log('cutoffs', sectionCutoffs);
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
	var dots = document.querySelectorAll('.navItem');
	var activeDot = document.querySelector('.navItem.active');
	var scrollDepth = window.pageYOffset;
	var activeSectionIndex;

	sectionCutoffs.forEach(function(cutoff, index) {
		var prevCutoff = index > 0 ? sectionCutoffs[index - 1] : 0;
		var isBetweenCutoffs = scrollDepth > prevCutoff && scrollDepth < cutoff;
		var isLast = index === (sectionCutoffs.length - 1) && scrollDepth > cutoff;
		if (isBetweenCutoffs || isLast) {
			activeSectionIndex = index;
			addActiveState(dots[activeSectionIndex]);
		}
	});
}

function setUpScrollListener() {
	var throttled = throttle(getActiveSection, 500);
	window.addEventListener('scroll', throttled);
}

function initialize() {
	if (window.innerWidth > 700) {
		getActiveSection();
		setUpScrollListener();
		partitionPage();
		renderNav();
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
