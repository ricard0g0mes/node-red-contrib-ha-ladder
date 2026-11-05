/**
 * Copyright 2024 Derya Y. (iot.HA Ladder@gmail.com).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use node file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

"use strict";

/**
* Outputs error on status and error log.
* @param node - the node object
* @param errShort - the error text display on status
* @param errLong - the error text display on log
* @returns true for set node.error
*/
function outError(node, errShort, errLong) {
    if (node.save_txt !== errShort) {
        node.save_txt = errShort;
        node.save_color = "red";
        node.status({fill: "red", shape: "dot", text: errShort});
        if (errLong)
            node.error(errLong);
    }

    return true;
}

module.exports.outError = outError;

/**
* Sets status text and icon.
* @param node - the node object
* @param txt - the text display on status
* @param color - the color of icon
* @returns true for set node.error
*/
module.exports.setStatus = function(node, txt = "", color = "grey") {
    if ((node.save_txt !== txt) || (node.save_color !== color)) {
        node.save_txt = txt;
        node.save_color = color;
        node.status({ fill: color, shape: "dot", text: txt });
    }

    return true;
}

/**
 * Sets status text and icon from boolean.
 * @param node - the node object
 * @param state - the boolean state
 * @param txt - the text display on status
 * @param color_on - the color of icon for true
 * @param color_off - the color of icon for false
 */
module.exports.setStatusBool = function(node, state, txt = "", color_on = "green", color_off = "grey") {
    var color = state ? color_on : color_off;
    if ((node.save_state !== state) || (node.save_txt !== txt) || (node.save_color !== color)) {
        node.save_state = state;
        node.save_color = color;
        node.save_txt = txt;
        node.status({ fill: color, shape: "dot", text: txt });
    }
}

/**
* Check for positive transition.
* @param node - the node object
* @param var_in - the state to check
* @returns true is positive transition
*/
module.exports.posEdge = function(node, var_in) {
    var ret = ((var_in === true) && (node.psave_val === false));
    node.psave_val = var_in;
    return ret;
}

/**
* Check for positive transition on second input.
* @param node - the node object
* @param var_in - the state to check
* @returns true is positive transition
*/
module.exports.posEdge2 = function(node, var_in) {
    var ret = ((var_in === true) && (node.psave_val2 === false));
    node.psave_val2 = var_in;
    return ret;
}

/**
* Check for negative transition.
* @param node - the node object
* @param var_in - the state to check
* @returns true is negative transition
*/
module.exports.negEdge = function(node, var_in) {
    var ret = ((var_in === false) && (node.nsave_val === true));
    node.nsave_val = var_in;
    return ret;
}

/**
* Return constant depends on variable type
* @param vartype - the variable type
* @param constval - the constant value
* @param unit - the time unit
* @param constant - the constant name
* @returns constant value
*/
module.exports.initConstant = function(vartype, constval, unit, constant) {
    var value = Number(constval); 

    if (vartype == "#")
        return value;
    else if (vartype == "#T")
        // Convert to miliseconds
        switch(unit) {
            case "ms": return parseInt(value);
            case "s":  return parseInt(value) * 1000;
            case "m":  return parseInt(value) * 60 * 1000;
            case "h":  return parseInt(value) * 60 * 60 * 1000;
            case "d":  return parseInt(value) * 24 * 60 * 60 * 1000;
        }
    else if (vartype == "#C")
        switch(constant) {
            case "PI": return Math.PI;
            case "E":  return Math.E;
            case "LN2": return Math.LN2;
            case "LN10": return Math.LN10;
            case "LOG2E": return Math.LOG2E;
            case "LOG10E": return Math.LOG10E;
            case "SQRT2": return Math.SQRT2;
            case "SQRT1_2": return Math.SQRT1_2;
        }
    
    return undefined;
}

/**
* Convert milisecond in day, hour, minute, second, milisecond.
* @param value - the value to convert
* @returns formated time string
*/
module.exports.fromMiliseconds = function (value) {
    const DIV_D = 24 * 60 * 60 * 1000;
    const DIV_H = 60 * 60 * 1000;
    const DIV_M = 60 * 1000;
    const DIV_S = 1000;

    value = parseInt(value);

    if (value < 0)
        value = Math.abs(value);

    if (value === 0)
        return "0";

    var days = Math.trunc(value / DIV_D);
    var rem = value % DIV_D;

    var hours = Math.trunc(rem / DIV_H);
    rem = rem % DIV_H;

    var minutes = Math.trunc(rem / DIV_M);
    rem = rem % DIV_M;

    var seconds = Math.trunc(rem / DIV_S);
    var miliseconds = rem % DIV_S;

    var outstring = "";

    if (days > 0)
        outstring += days + "d";
    
    if (hours > 0) 
        outstring += hours + "h";

    if (minutes > 0) 
        outstring += minutes + "m";

    if (seconds > 0) 
        outstring += seconds + "s";

    if ((days == 0) && (hours == 0) && (minutes == 0) && (miliseconds > 0)) 
        outstring += miliseconds + "ms";

    if (outstring == "")
        outstring = "0";

    return outstring;
}

/**
* Rounds number to fix decimal after point.
* https://www.jacklmoore.com/notes/rounding-in-javascript/
* @param value - the value to fix
* @param decimals - decimals after point
* @returns formated time string
*/
module.exports.toFixed = function (value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

const N_INDEX = 64; // size of index
module.exports.N_INDEX = N_INDEX;

// timer index
const T_ET = 0; // timer value
const T_PT = 1; // timer preset
const T_Q  = 2; // timer done
const T_R  = 3; // timer reset
const T_TT = 4; // timer timed (run)

module.exports.T_ET = T_ET;
module.exports.T_PT = T_PT;
module.exports.T_Q  = T_Q;
module.exports.T_R  = T_R;
module.exports.T_TT = T_TT;

// counter index
const C_CV  = 0; // counter value
const C_PV  = 1; // counter preset
const C_QU  = 2; // counter done up
const C_QD  = 3; // counter done down
const C_R   = 4; // counter reset
const C_LD  = 5; // counter load preset
const C_CD  = 6; // counter down input

module.exports.C_CV  = C_CV;
module.exports.C_PV  = C_PV;
module.exports.C_QU  = C_QU;
module.exports.C_QD  = C_QD;
module.exports.C_R   = C_R;
module.exports.C_LD  = C_LD;
module.exports.C_CD  = C_CD;

// flip-flop index
const FF_Q  = 0; // flip-flop output
const FF_R  = 1; // flip-flop reset
const FF_S  = 2; // flip-flop set

module.exports.FF_Q  = FF_Q;
module.exports.FF_R  = FF_R;
module.exports.FF_S  = FF_S;

/**
* Get index depends of variable type.
* @param vartype - the variable type
* @param index - the index of array
* @param counter - the timer variable
* @param timer - the timer variable
* @param fflop - the flipflop variable
* @returns index of variable
*/
module.exports.getIndex = function(vartype, index, counter, timer, fflop) {
    switch (vartype) {
        case "C":
            switch (counter) {
                case "CV": index = C_CV; break;
                case "PV": index = C_PV; break;
                case "QU": index = C_QU; break;
                case "QD": index = C_QD; break;
                case "R":  index = C_R;  break;
                case "LD": index = C_LD; break;
                case "CD": index = C_CD; break;
            }
            break;

        case "T":
            switch (timer) {
                case "ET": index = T_ET; break;
                case "PT": index = T_PT; break;
                case "Q":  index = T_Q;  break;
                case "R":  index = T_R;  break;
                case "TT": index = T_TT; break;
            }
            break;
        case "FF":
            switch (fflop) {
                case "Q": index = FF_Q; break;
                case "R": index = FF_R; break;
                case "S": index = FF_S; break;
            }
            break;
    }

    return index;
}

/**
* Get index name depends on variable type.
* @param vartype - the variable type
* @param index - the index of array
* @param counter - the timer variable
* @param timer - the timer variable
* @param fflop - the flipflop variable
* @returns index of variable
*/
module.exports.getIndexName = function(vartype, index, counter, timer, fflop) {
    switch (vartype) {
        case "C":
            return counter;
        case "T":
            return timer;
        case "FF":
            return fflop;
    }
    
    return index;
}

/**
* Initialize variable.
* @param node - the node object
* @param vartype - the variable type
* @param varname - the variable name
* @param initarray - the array for init variable
* @returns true is variable initialized, false already exist
*/
module.exports.initVariable = function(node, vartype, varname, initarray = undefined) {
    const store = node.context().global;

    node.isvarinit = false;

    if (store.get(varname) !== undefined)
        return false;

    var ctxvar = new Array;

    switch(vartype) {
        case "C":
            ctxvar[C_CV] = 0;
            ctxvar[C_PV] = 10;
            ctxvar[C_QU] = false;
            ctxvar[C_QD] = false;
            ctxvar[C_R]  = false;
            ctxvar[C_LD] = false;
            ctxvar[C_CD] = false;
            break;
        case "T":
            ctxvar[T_ET] = 0;
            ctxvar[T_PT] = 1000;
            ctxvar[T_Q]  = false;
            ctxvar[T_R]  = false;
            ctxvar[T_TT] = false;
            break;
        case "FF":
            ctxvar[FF_Q] = false;
            ctxvar[FF_R] = false;
            ctxvar[FF_S] = false;
            break;
        case "I":
        case "Q":
        case "M":
                ctxvar = Array(N_INDEX).fill(false);
            break;
        case "IA":
        case "QA":
        case "MA":
                ctxvar = Array(N_INDEX).fill(0);
            break;
    }

    if (initarray !== undefined)
        for(var i = 0; i < initarray.length; i++)
            ctxvar[i] = initarray[i];    

    store.set(varname, ctxvar);

    node.isvarinit = true;
    return true;
}

/**
* Delete variable.
* @param node - the node object
* @param varname - the variable name
*/
module.exports.deleteVariable = function(node, varname) {
    if (node.isvarinit !== true)
        return;
    
    node.isvarinit = false;

    const store = node.context().global;

    if (store.get(varname) == undefined)
        return;

    store.set(varname, undefined);
}

/**
* Check variable for valid.
* @param node - the node object
* @param varname - the variable name
* @param ctxvar - the variable object
* @param index - the index of array
* @returns true is variable valid
*/
function checkVariable(node, varname, ctxvar, index) {
    if (typeof ctxvar === "undefined") {
        outError(node, varname + " undefined", "variable " +  varname + " undefined");
        return false;
    }

    if (!Array.isArray(ctxvar)) {
        outError(node, varname + " not array", "variable " +  varname + " not array");
        return false;
    }

    if (index !== undefined) {
        if (index >= ctxvar.length) {
            outError(node, varname + "." + index + " not used", "variable " +  varname + "." + index + " not used");
            return false;
        }

        if (typeof ctxvar[index] === "undefined") {
            outError(node, varname + "." + index + " undefined", "variable " +  varname + "." + index + " undefined");
            return false;
        }
    }

    return true;
}

module.exports.checkVariable = checkVariable;

/**
* Checks and get variable object.
* @param node - the node object
* @param varname - the variable name
* @param index - the index of array
* @returns the variable object
*/
module.exports.getVariable = function(node, varname, index = undefined) {
    const store = node.context().global;
    var ctxvar = store.get(varname);

    if (!checkVariable(node, varname, ctxvar, index))
        return undefined;
    
    return ctxvar;
}


/**
* Scan for multiple inputs and performs logical operation.
* @param node - the node object
* @param msg - the input message object
* @param instruction - the logical operation (or, and, xor)
* @returns result of logical operation
*/
module.exports.getPayloadBool = function(node, msg, instruction = "or") {
    if (node.iserror === true)
        return;

    if (typeof msg.payload !== "boolean") {
        node.iserror = outError(node, "not bool", "payload is not boolean");
        return;
    }

    if (msg.hasOwnProperty("outn")) {
        if (!node.hasOwnProperty("save_outn"))
            node.save_outn = msg.outn;
        else if (node.save_outn !== msg.outn) {
            node.iserror = outError(node, "cross wire", "cross wire between rungs");
            return;
        }
    }

    if (!node.hasOwnProperty("save_input_sum"))
        node.save_input_sum = 1;

    if (node.save_msgid !== msg._msgid) {
        node.save_msgid = msg._msgid;
        node.save_input_cnt = 1;
        if (instruction === "xor") {
            node.save_payload = false;
            node.save_xor = msg.payload;
        }
        else
            node.save_payload = msg.payload;
    }
    else {
        switch (instruction) {
            case "and":
                node.save_payload = node.save_payload && msg.payload;
                break;
            case "xor":
                if (node.save_xor !== msg.payload)
                    node.save_payload = true;
                break;
            default: // or
                node.save_payload = node.save_payload || msg.payload;
        }

        node.save_input_cnt++;

        if (node.save_input_cnt > node.save_input_sum) {
            node.save_input_sum = node.save_input_cnt;
            return;
        }
    }

    if (node.save_input_cnt == node.save_input_sum)
        return node.save_payload;
}
