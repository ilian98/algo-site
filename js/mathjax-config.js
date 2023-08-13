window.MathJax = {
	loader: {
		load: ['output/svg', '[tex]/color']
	},
	tex: {
		packages: {'[+]': ['color']},
		inlineMath: [['$', '$'], ['\\(', '\\)']]
	},
	startup: {
        ready () {
            const {mathjax} = MathJax._.mathjax;
            const {SVG} = MathJax._.output.svg_ts;
            
            MathJax.startup.defaultReady();
            
            const svgOutput = new SVG(MathJax.config.svg);
            const svgDocument = mathjax.document(document, {
                ...MathJax.config.options,
                InputJax: MathJax.startup.input,
                OutputJax: svgOutput
            });
      
            MathJax.tex2svg = (math, options = {}) => {
                options.format = svgDocument.inputJax[0].name;
                return svgDocument.convert(math, options);
            };
        },
		pageReady() {
			return MathJax.startup.defaultPageReady().then(function () {
				MathJax.typeset([".hljs-comment"]);
			});
		}
	}
};
