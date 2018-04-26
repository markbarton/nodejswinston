const winston = require("winston");
const moment = require("moment");
const path = require("path");
const PROJECT_ROOT = path.join(__dirname, "..");

const consoleLogger = new winston.transports.Console({
  timestamp: function() {
    const today = moment();
    return today.format("DD-MM-YYYY h:mm:ssa");
  },
  colorize: true,
  level: "debug"
});

const logger = new winston.Logger({
  transports: [consoleLogger]
});

if (process.env.NODE_ENV === "production") {
  logger.transports.console.level = "info";
}
if (process.env.NODE_ENV === "development") {
  logger.transports.console.level = "debug";
}

module.exports.info = function() {
  logger.info.apply(logger, formatLogArguments(arguments));
};
module.exports.log = function() {
  logger.log.apply(logger, formatLogArguments(arguments));
};
module.exports.warn = function() {
  logger.warn.apply(logger, formatLogArguments(arguments));
};
module.exports.debug = function() {
  logger.debug.apply(logger, formatLogArguments(arguments));
};
module.exports.verbose = function() {
  logger.verbose.apply(logger, formatLogArguments(arguments));
};

module.exports.error = function() {
  logger.error.apply(logger, formatLogArguments(arguments));
};

function formatLogArguments(args) {
  args = Array.prototype.slice.call(args);
  const stackInfo = getStackInfo(1);

  if (stackInfo) {
    const calleeStr = `(${stackInfo.relativePath}:${stackInfo.line})`;
    if (typeof args[0] === "string") {
      args[0] = args[0] + " " + calleeStr;
    } else {
      args.unshift(calleeStr);
    }
  }
  return args;
}

function getStackInfo(stackIndex) {
  const stacklist = new Error().stack.split("\n").slice(3);
  // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
  // do not remove the regex expresses to outside of this method (due to a BUG in node.js)
  const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi;
  const stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi;

  const s = stacklist[stackIndex] || stacklist[0];
  const sp = stackReg.exec(s) || stackReg2.exec(s);

  if (sp && sp.length === 5) {
    return {
      method: sp[1],
      relativePath: path.relative(PROJECT_ROOT, sp[2]),
      line: sp[3],
      pos: sp[4],
      file: path.basename(sp[2]),
      stack: stacklist.join("\n")
    };
  }
}

logger.exitOnError = false;
