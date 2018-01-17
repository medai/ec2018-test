//подключем сам ГАЛП
var gulp = require('gulp');   
//!!!!!!!! gulp-load-plugins загружает все плагины которые есть в bower components, к плагину обращаемся plugins.ххх
var plugins = require('gulp-load-plugins')();  
//!! del для очистки директорий
var del = require('del');
//!! для задания последовательности выполнения задач
var es = require('event-stream');
// этот плагин вытаскивает все главные файлы JS из bower и создает массив
var bowerFiles = require('main-bower-files');
//!! browser-sync - для запуска сервера
var browserSync = require('browser-sync');


/* = = = PATH SEGMENT START  = = = */
var paths = {
  // откуда будем брать
  scripts: 'app/**/*.js', //path for our js files
  styles: './app/**/*.css', //path for our *.css
  images: 'app/img/**/*', //path for our images
  index: 'app/index.html', //path for our index.html
  partials: ['app/**/*.html', '!app/index.html'], //path for our *.html files  
  json: './app/**/*.json',
  vendorFonts: ['./bower_components/bootstrap/fonts/*.{eot,svg,ttf,woff,woff2}',
                './bower_components/font-awesome/fonts/*.{eot,svg,ttf,woff,woff2}'
                ],

  //куда положим DEV  
  distDev: 'develop-vershion', //path for our DEV directory
  distDevBower: 'develop-vershion/bower_components', //path for our DEV directory
  distDevCss: 'develop-vershion/css', //path for our DEV directory and CSS folder
  distDevImg: 'develop-vershion/img', //path for our DEV directory and IMG folder  
  distDevFonts: 'develop-vershion/fonts', //path for our DEV directory and IMG folder 
  //куда положим PROD  
  distProd: 'prodaction-vershion', //path for our PROD directory
  distProdCss: 'prodaction-vershion/css', //path for our PROD directory and CSS folder
  distProdImg: 'prodaction-vershion/img', //path for our DEV directory and IMG folder
  distProdScripts: 'prodaction-vershion/scripts', //path for our PROD directory and JS folder
  distProdFonts: 'prodaction-vershion/fonts' //path for our PROD directory and JS folder
};
/* = = = PATH SEGMENT FINISH  = = = */



/* = = = PIPE SEGMENT START = = = */
var pipes = {};
// Sorts our scripts, first jQuery, and then angular, use GULP plugin "ORDER"
pipes.orderedVendorScripts = function() {
  return plugins.order(['jquery.js', 'angular.js']); 
};
// Check our JS scripts through jsHint
pipes.validatedAppScripts = function() {
  return gulp.src(paths.scripts)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'));
};
// Built index.html
pipes.buildIndexFile = function() {
  return gulp.src(paths.index);
};
/* = = = PIPE SEGMENT FINISH = = = */




/* = = = DEVELOP PIPE SEGMENT START = = = */
// Copy all the JS from the bower_components and then moves to DEVELOP directory
pipes.builtVendorJsDev = function() {
  return gulp.src(bowerFiles('**/*.js'))
    .pipe(gulp.dest(paths.distDevBower));
};
// Copy all the CSS from the bower_components and then moves to DEVELOP directory
pipes.builtVendorCssDev = function() {
  return gulp.src(bowerFiles('**/*.css'))
    .pipe(gulp.dest(paths.distDevBower));
};
// Copy all the LESS from the bower_components and then moves to DEVELOP directory
pipes.builtVendorLessDev = function() {
  return gulp.src(bowerFiles('**/*.less'))
    .pipe(plugins.less())    
    .pipe(gulp.dest(paths.distDevBower));
};
pipes.builtVendorIconsDev = function() {
    return gulp.src(paths.vendorFonts)
        .pipe(gulp.dest(paths.distDevFonts));
};

// Copy App Script and then moves to DEV directory
pipes.builtAppScriptsDev = function() {
  return pipes.validatedAppScripts()
    .pipe(plugins.ngAnnotate()) // We use ngAnnotate for inject on Angular
    .pipe(gulp.dest(paths.distDev));
};

// Copy App Style css file
pipes.builtAppStylesDev = function() {
    return gulp.src(paths.styles)
      .pipe(plugins.autoprefixer({
        browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4']
      })) 
      .pipe(gulp.dest(paths.distDev));
};

// Copy images files and then moves to DEV directory
pipes.builtAppImagesDev = function() {
  return gulp.src(paths.images)
      .pipe(gulp.dest(paths.distDevImg));
};

// Copy all html files and then moves to DEV directory
pipes.builtAppHtmlDev = function() {
  return gulp.src(paths.partials)
      .pipe(plugins.htmlhint({'doctype-first': false}))
      .pipe(plugins.htmlhint.reporter())
      .pipe(gulp.dest(paths.distDev));
};

pipes.builtAppjsonDev = function() {
  return gulp.src(paths.json)
      .pipe(gulp.dest(paths.distDev));
};

// Built all project
pipes.builtIndexDev = function() {
//!! вытаскиваем все основные файлы JS из bower_components
  var orderedVendorJS = pipes.builtVendorJsDev()
//!! и затем их сортируем нашей функцией
    .pipe(pipes.orderedVendorScripts());  
//!! вытаскиваем все основные файлы CSS из bower_components
  var orderedVendorCss = pipes.builtVendorCssDev();
//!! вытаскиваем все основные файлы LESS из bower_components
  var orderedVendorLess = pipes.builtVendorLessDev();


//!! вытаскиваем все наши файлы JS
  var orderedAppScripts = pipes.builtAppScriptsDev();


//!! вытаскиваем все наши файлы CSS
  var orderedAppStyles = pipes.builtAppStylesDev();



  return pipes.buildIndexFile()
//!! переносим ИНДЕКС файл в папку paths.distDev
    .pipe(gulp.dest(paths.distDev)) // write first to get relative path for inject

    .pipe(plugins.inject(orderedVendorJS, {relative: true, name: 'bower-js'}))
    .pipe(plugins.inject(orderedVendorCss, {relative: true, name: 'bower-css'}))
    .pipe(plugins.inject(orderedVendorLess, {relative: true, name: 'bower-less'}))

    .pipe(plugins.inject(orderedAppScripts, {relative: true}))
    .pipe(plugins.inject(orderedAppStyles, {relative: true}))


    .pipe(gulp.dest(paths.distDev));
};

// Run streaming Assembly
pipes.builtAppDev = function() {
  return es.merge( pipes.builtIndexDev(),
                    pipes.builtAppjsonDev(),
                   pipes.builtAppHtmlDev(),
                   pipes.builtAppImagesDev(),
                   pipes.builtVendorIconsDev()
                  );
};
/* = = = DEVELOP PIPE SEGMENT FINISH = = = */






/* = = = DEVELOP TASKS START = = = */
// removes all compiled dev files
gulp.task('clean-dev', function() {
  return del(paths.distDev);
});

// builds a complete prod environment
gulp.task('build-app-dev', pipes.builtAppDev);

// cleans and builds a complete dev environment
gulp.task('clean-build-app-dev', ['clean-dev'], pipes.builtAppDev);

// clean, build, and watch live changes to the dev environment
gulp.task('watch-dev', ['clean-build-app-dev'], function() {
  var indexPath;
  var partialsPath;
  var reload = browserSync.reload;
    indexPath = paths.index;
    partialsPath = paths.partials;
  // start browser-sync to auto-reload the dev server
  browserSync({
    port: 8000,
    server: {
      baseDir: paths.distDev
    }
  });

  // watch index
  gulp.watch(indexPath, function() {
    return pipes.builtIndexDev()
        .pipe(reload({stream: true}));
  });

  // watch app scripts
  gulp.watch(paths.scripts, function() {
    return pipes.builtAppScriptsDev()
        .pipe(reload({stream: true}));
  });

  // watch html partials
  gulp.watch(partialsPath, function() {
    return pipes.builtAppHtmlDev()
        .pipe(reload({stream: true}));

  });

  // watch json partials
  gulp.watch(paths.json, function() {
    return pipes.builtAppjsonDev()
        .pipe(reload({stream: true}));

  });

  // watch styles сss
  gulp.watch(paths.styles, function() {
    return pipes.builtAppStylesDev()
        .pipe(reload({stream: true}));
  });

  // watch images
  gulp.watch(paths.images, function() {
    return pipes.builtAppImagesDev()
        .pipe(reload({stream: true}));
  });

});
/* = = = DEVELOP TASKS FINISH = = = */





/* = = = DEFAULT TASKS START = = = */
// If we start only gulp command we built DEV folder and DEV server
gulp.task('default', ['watch-dev']);
/* = = = DEFAULT TASKS FINISH = = = */








































/* = = = PRODACTION PIPE SEGMENT START = = = */
// Copy all the scripts from the bower_components and then moves to PROD/scripts directory
pipes.builtVendorJsProd = function() {
  return gulp.src(bowerFiles('**/*.js'))
      .pipe(pipes.orderedVendorScripts())
      .pipe(plugins.concat('vendor.min.js'))
      .pipe(plugins.uglify())
      .pipe(gulp.dest(paths.distProdScripts));
};
// Copy all the Styles CSS from the bower_components and then moves to PROD/Styles directory
pipes.builtVendorCssProd = function() {
  return gulp.src(bowerFiles('**/*.css'))
    .pipe(plugins.concat('vendorCss.min.css'))
    .pipe(plugins.csso())
    .pipe(gulp.dest(paths.distProdCss));
};
// Copy all the Styles LESS from the bower_components and then moves to PROD/Styles directory
pipes.builtVendorLessProd = function() {
  return gulp.src(bowerFiles('**/*.less'))
    .pipe(plugins.less()) 
    .pipe(plugins.concat('vendorLess.min.css'))
    .pipe(plugins.csso())
    .pipe(gulp.dest(paths.distProdCss));
};
// Copy Fonts files and then moves to Prod directory
pipes.builtVendorFontsProd = function() {
    return gulp.src(paths.vendorFonts)
        .pipe(gulp.dest(paths.distProdFonts));
};
// Copy images files and then moves to Prod directory
pipes.builtAppImagesProd = function() {
  return gulp.src(paths.images)
    .pipe(gulp.dest(paths.distProdImg));
};
// Copy all html files and then moves to PROD directory, before we check our files through htmlHint
pipes.builtAppHtmlProd = function() {
  return gulp.src(paths.partials)
      .pipe(plugins.htmlhint({'doctype-first': false}))
      .pipe(plugins.htmlhint.reporter())
      .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
      .pipe(gulp.dest(paths.distProd));
};
// Built App Script concat, minification and then moves to PROD directory
pipes.builtAppJsProd = function() {
  return pipes.validatedAppScripts()
      .pipe(plugins.ngAnnotate())
      .pipe(plugins.concat('script.min.js'))
      .pipe(plugins.uglify())
      .pipe(gulp.dest(paths.distProdScripts));
};
// Built style css file
pipes.builtAppCssProd = function() {
  return gulp.src(paths.styles)
      .pipe(plugins.autoprefixer({
          browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4']
      }))      
      .pipe(plugins.concat('style.min.css'))
      .pipe(plugins.uncss({ html: ['app/**/*.html'] }))
      .pipe(plugins.minifyCss({compatibility: 'ie8'}))  
      .pipe(gulp.dest(paths.distProdCss));
};




// Built all project
pipes.builtIndexProd = function() {
  var vendorJs = pipes.builtVendorJsProd();
  var vendorCss = pipes.builtVendorCssProd();
  var vendorLess = pipes.builtVendorLessProd();
  var appScripts = pipes.builtAppJsProd();
  var appStyles = pipes.builtAppCssProd();
  return pipes.buildIndexFile()
      .pipe(gulp.dest(paths.distProd)) // write first to get relative path for inject
      .pipe(plugins.inject(vendorJs, {relative: true, name: 'bower-js'}))
      .pipe(plugins.inject(vendorCss, {relative: true, name: 'bower-css'}))      
      .pipe(plugins.inject(vendorLess, {relative: true, name: 'bower-less'}))  
      .pipe(plugins.inject(appScripts, {relative: true}))
      .pipe(plugins.inject(appStyles, {relative: true}))
      .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
      .pipe(gulp.dest(paths.distProd));
};

// Run streaming Assembly
pipes.builtAppProd = function() {
  return es.merge( pipes.builtIndexProd(),
                   pipes.builtAppHtmlProd(),
                   pipes.builtAppImagesProd(),
                   pipes.builtVendorFontsProd()
                  );
};
/* = = = PRODACTION PIPE SEGMENT FINISH = = = */









/* = = = PROD TASKS START = = = */
// removes all compiled prod files
gulp.task('clean-prod', function() {
  return del(paths.distProd);
});

// builds a complete prod environment
gulp.task('build-app-prod', pipes.builtAppProd);

// cleans and builds a complete prod environment
gulp.task('clean-build-app-prod', ['clean-prod'], pipes.builtAppProd);

// clean, build, and watch live changes to the prod environment
gulp.task('watch-prod', ['clean-build-app-prod'], function() {
  var indexPath;
  var partialsPath;
  var reload = browserSync.reload;
    indexPath = paths.index;
    partialsPath = paths.partials;
  // start browser-sync to auto-reload the dev server
  browserSync({
    port: 8000,
    server: {
      baseDir: paths.distProd
    }
  });

  // watch index
  gulp.watch(indexPath, function() {
    return pipes.builtIndexProd()
      .pipe(reload({stream: true}));
  });

  // watch app scripts
  gulp.watch(paths.scripts, function() {
    return pipes.builtAppJsProd()
      .pipe(reload({stream: true}));
  });

  // watch html partials
  gulp.watch(partialsPath, function() {
    return pipes.builtAppHtmlProd()
      .pipe(reload({stream: true}));

  });

  // watch styles
  gulp.watch(paths.styles, function() {
    return pipes.builtAppCssProd()
      .pipe(reload({stream: true}));
  });

  // watch images
  gulp.watch(paths.images, function() {
    return pipes.builtAppImagesProd()
      .pipe(reload({stream: true}));
  });

});
/* = = = PROD TASKS FINISH = = = */







