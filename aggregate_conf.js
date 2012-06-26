module.exports = {
	watch:{
		filePattern:/.*\.js$/
	},
	convert:[
		{
		    input: 'web/js/loaders/about_min.js',
		    output: 'web/js_min/about.js',
		    message:"Don't forget to check the JS paths in /src/Zeega/CoreBundle/Resources/views/Editor/editor.html.twig"
		}
	]
}
