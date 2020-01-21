'use strict';

const isUndefined = arg => typeof arg === 'undefined';

const isNull = arg => arg === null;

const isUndefinedOrNull = arg => typeof arg === 'undefined' || arg === null;

const isString = arg => !isUndefinedOrNull(arg) && (typeof arg === 'string' || arg.constructor === String);

const isNumber = arg => !isUndefinedOrNull(arg) && (typeof arg === 'number' || arg.constructor === Number);

const isBoolean = arg => !isUndefinedOrNull(arg) && (typeof arg === 'boolean' || arg.constructor === Boolean);

const isArray = arg => !isUndefinedOrNull(arg) && Array.isArray(arg);

const isFunction = arg => !isUndefinedOrNull(arg) && typeof arg === 'function';

const isPromise = arg => !isUndefinedOrNull(arg) && isFunction(arg.then);

module.exports = {

  /**
     * Prüfen, ob arg = undefined
     * @param {*} arg
     */
  isUndefined,

  /**
     * Prüfen, ob arg = null
     * @param {*} arg
     */
  isNull,

  /**
     * Prüfen, ob arg = null oder undefined
     * @param {*} arg
     */
  isUndefinedOrNull,

  /**
     * Prüfen, ob arg vom Typ string ist
     * @param {*} arg
     */
  isString,

  /**
     * Prüfen, ob arg vom Typ number ist
     * @param {*} arg
     */
  isNumber,

  /**
     * Prüfen, ob arg vom Typ boolean ist
     * @param {*} arg
     */
  isBoolean,

  /**
     * Prüfen, ob arg ein array ist
     * @param {*} arg
     */
  isArray,

  /**
     * Prüfen, ob arg eine Funktion ist
     * @param {*} arg
     */
  isFunction,

  /**
     * Prüfen, ob arg ein Promise ist
     * @param {*} arg
     */
  isPromise,
};
