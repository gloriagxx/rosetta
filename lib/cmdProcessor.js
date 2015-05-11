var createPreprocesor = function(basePath, logger) {
  var log = logger.create('preprocessor.commonjs');

  return function(content, file, done) {
    var pat = /(define *\(( *function.+))/;
    var mat = pat.exec(content);
    if (!mat) {
      return done(content);
    }

    var id = file.path.replace(basePath, '');
    var output = content.replace(mat[1], "define('" + id + "'," + mat[2]);

    done(output);
  };
};

createPreprocesor.$inject = ['config.basePath', 'logger'];

// PUBLISH DI MODULE
module.exports = {
  'preprocessor:commonjs': ['factory', createPreprocesor]
};
