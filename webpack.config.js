const path = require('path');

module.exports = {
  mode : 'development',
  entry: './src/projectsListAndTasks.js',
  output: {
    filename: 'projectsListAndTasks.js',
    path: path.resolve(__dirname, 'dist')
  }
};
