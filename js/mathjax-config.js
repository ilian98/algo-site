window.MathJax = {
	loader: {
		load: ['[tex]/color']
	},
	tex: {
		packages: {'[+]': ['color']},
		inlineMath: [['$', '$'], ['\\(', '\\)']]
	},
	svg: {
		fontCache: 'global'
	},
	startup: {
		pageReady() {
			return MathJax.startup.defaultPageReady().then(function () {
				MathJax.typeset([".hljs-comment"]);
			});
		}
	}
};
