/**
 * index.js
 */
"use strict";
{
  /* check for nodejs version */
  const {versions: {node: nodeVersion}} = require("process");
  const NODE_MAJOR = 8;

  let [nodeMajor] = nodeVersion.split(".");
  nodeMajor = Number(nodeMajor);

  if (!Number.isInteger(nodeMajor) || nodeMajor < NODE_MAJOR) {
    throw new Error(`Only runs in node >= ${NODE_MAJOR}`);
  }

  /* api */
  const {ChildProcess, CmdArgs} = require("./modules/child-process");
  const {Input, Output} = require("./modules/native-message");
  const {Setup} = require("./modules/setup");
  const {browserData} = require("./modules/browser-data");
  const {
    escapeChar, getType, isString, logError, logMsg, logWarn,
    stringifyPositiveInt, stripHtmlTags, throwErr,
  } = require("./modules/common");
  const {
    CHAR, DIR_HOME, EXT_CHROME, EXT_WEB, INDENT, IS_BE, IS_LE, IS_MAC, IS_WIN,
  } = require("./modules/constant");
  module.exports = {
    ChildProcess, CmdArgs, Input, Output, Setup,
    browserData, escapeChar, getType, isString, logError, logMsg, logWarn,
    stringifyPositiveInt, stripHtmlTags, throwErr,
    CHAR, DIR_HOME, EXT_CHROME, EXT_WEB, INDENT, IS_BE, IS_LE, IS_MAC, IS_WIN,
  };
}
