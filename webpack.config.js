var webpack = require("webpack"),
    ngAnnotatePlugin = require('ng-annotate-webpack-plugin'),
  //AngularPlugin = require('angular-webpack-plugin'),
    path = require('path'),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    autoprefixer = require('autoprefixer-core'),
    csswring = require('csswring'),
    ngMin = require('ngmin-webpack-plugin');

// Commandline arguments
// 
//--env=XXX: sets a global ENV variable 
//--minify:  minifies output
//--hot:     enable Hot Module Replacement
var argv = require('optimist')
            .default('ip','localhost')
            .alias('e','env').default('e','dev')
            .alias('m','minify')
            .argv;

var isDevServer = process.argv.join('').indexOf('webpack-dev-server') > -1;

var config = {
  entry:{
    'main':['main'],  // Contains app code
    'libs':'libs'     // Contains all libraries
  },
  output:{
    // Paths
    path: path.resolve('dist'),
    publicPath: '',
    
    // Filenames
    filename:"[name].bundle.js",
    chunkFilename: "[name].[id].js",

    // Hot Module Replacement settings:
    hotUpdateMainFilename: "updates/[hash].update.json",
    hotUpdateChunkFilename: "updates/[hash].[id].update.js"
  },
  resolve: {
      // All source is relative to 'src' directory
      root: path.resolve('src'),

      // Alias Angular modules to filenames (or bower_components)
      // This way, AngularPlugin can automatically require files 
      // based on angular modules.
      alias: {
        //'ui.router':'angular-ui-router'
      },

      // Check NPM and Bower for components. Also link to blocks.
      modulesDirectories: ["node_modules", "web_modules","bower_components", "src/blocks"]
  },
  module:{
    loaders:[
      // Support for *.json files.
      { test: /\.json$/,                    loader: "json-loader" },
      // Support for CSS (with hot module replacement)
      { test: /\.css$/,                     loader: "style-loader!css-loader" },
      // Support for LESS (with hot module replacement)
      { test: /\.styl/,                    loaders: ["style", "css", "postcss", "stylus"] },
      // Copy all assets in to asset folder (use hash filename)
      { test: /\.(png|jpg|gif|woff|eot|ttf|svg)$/,      loader: "file-loader?name=assets/[hash].[ext]" },
      // Load all *.jade as templates
      { test: /(?!\.html)\.jade$/,          loader: "jade-loader" },
      // Copy all .html.jade as static html files (keep filename)
      { test: /index[a-z-]*\.html\.jade$/,  loader: "file-loader?name=[path][name]&context=./src!jade-html-loader" },
      // Copy all .html as static file (keep filename)
      { test: /index[a-z-]*\.html$/,        loader: "file-loader?name=[path][name].html&context=./src" },
    ]
  },
  postcss: [ autoprefixer, csswring],
  plugins:[
    // Add Bower support
    new webpack.ResolverPlugin(
      new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
    ),

    // Add Angular support (annotate for minification)
    new ngAnnotatePlugin({add: true}),
    //new AngularPlugin(),
    
    // Optimize output; dedupe 
    new webpack.optimize.DedupePlugin(),
    
    // Optimize output; group libraries in seperate file
    new webpack.optimize.CommonsChunkPlugin('libs','libs.bundle.js',['main'],Infinity),
    
    // Set global 'ENV' variable to support multiple builds 
    new webpack.DefinePlugin({
      DEV_SERVER_IP: JSON.stringify(argv.ip),
      ENV: JSON.stringify(argv.env)
    }),
  ],
  node: {
    fs: "empty"  // required for jade-html-loader to work
  },
  devServer: {
    publicPath: '/'
  },
  devtool: isDevServer?'#eval':undefined,
  recordsPath: path.resolve('.webpack.json')
};

// Add 'dev-server' snippet to communicate with webpack-dev-server
// (also supports hot module replacement)
if(isDevServer){
  config.entry.main.unshift('dev-server');
  //config.plugins.push(new webpack.HotModuleReplacementPlugin()); // use --hot command line arguement for now!
}

// Modify config for production / minification
if(argv.minify){

  // Remove sourcemaps
  delete config.devtool;

  config.plugins.push(
    //Add ngMin
    new ngMin(),
    //and UglifyJS
    new webpack.optimize.UglifyJsPlugin({
      mangle:false,//<-need for angular work
      compress:{
        drop_console:true
      },
      output: {
        comments: false
      }
    }),
    // Optimize OccuranceOrder
    new webpack.optimize.OccurenceOrderPlugin(true)
  );
}

module.exports = config;