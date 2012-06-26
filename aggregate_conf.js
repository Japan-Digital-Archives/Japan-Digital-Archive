module.exports = {
	watch:{
		filePattern:/.*\.js$/
	},
	convert:[
		{
		    input: 'web/js/loaders/about.js',
		    output: 'web/js_min/about.js',
		    message:"Don't forget to check the JS paths in /src/Zeega/CoreBundle/Resources/views/Editor/editor.html.twig"
		},
		{
		    input: 'web/js/loaders/home.js',
		    output: 'web/js_min/home.js',
		    message:"Don't forget to check the JS paths in /src/Zeega/CoreBundle/Resources/views/Editor/editor.html.twig"
		},
		{
		    input: 'web/js/loaders/item.js',
		    output: 'web/js_min/item.js',
		    message:"Don't forget to check the JS paths in /src/Zeega/CoreBundle/Resources/views/Editor/editor.html.twig"
		},
		{
		    input: 'web/js/loaders/search.js',
		    output: 'web/js_min/search.js',
		    message:"Don't forget to check the JS paths in /src/Zeega/CoreBundle/Resources/views/Editor/editor.html.twig"
		}		
	]
}
