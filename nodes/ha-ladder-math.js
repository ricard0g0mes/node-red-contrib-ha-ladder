/**
 * Copyright 2024 Derya Y. (iot.HA Ladder@gmail.com).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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

module.exports = function (RED) {

    const syslib = require('./lib/syslib.js');

    RED.nodes.registerType("ha-ladder-math", function (n) {
        var node = this;
        RED.nodes.createNode(node, n);

        node.operation = n.operation;

        node.varname = n.vartype + n.address;
        node.index = syslib.getIndex(n.vartype, n.index, n.counter, n.timer);

        node.varname1 = n.vartype1 + n.address1;
        node.index1 = syslib.getIndex(n.vartype1, n.index1, n.counter1, n.timer1);
        node.const1 = syslib.initConstant(n.vartype1, n.const1, n.timeu1, n.fconst1);
        node.isconst1 = (node.const1 !== undefined);

        node.varname2 = n.vartype2 + n.address2;
        node.index2 = syslib.getIndex(n.vartype2, n.index2, n.counter2, n.timer2);
        node.const2 = syslib.initConstant(n.vartype2, n.const2, n.timeu2, n.fconst2);
        node.isconst2 = (node.const2 !== undefined);

        node.tofix = n.tofix;
        node.name = node.varname + "." + syslib.getIndexName(n.vartype, n.index, n.counter, n.timer);
        node.iserror = false;
        syslib.setStatus(node, node.name);

        node.on("input", (msg) => {
            var payload_in = syslib.getPayloadBool(node, msg);

            if (payload_in === undefined)
                return;
            
            if (node.ctxvar === undefined) {
                node.ctxvar = syslib.getVariable(node, node.varname, node.index);

                if (node.ctxvar === undefined) {
                    msg.payload = false;
                    node.send(msg); 
                    node.iserror = true;
                    return;
                }
            }

            if (!node.isconst1 && (node.ctxvar1 === undefined)) {
                node.ctxvar1 = syslib.getVariable(node, node.varname1, node.index1);

                if (node.ctxvar1 === undefined) {
                    msg.payload = false;
                    node.send(msg); 
                    node.iserror = true;
                    return;
                }
            }

            if (!node.isconst2 && (node.ctxvar2 === undefined)) {
                node.ctxvar2 = syslib.getVariable(node, node.varname2, node.index2);

                if (node.ctxvar2 === undefined) {
                    msg.payload = false;
                    node.send(msg); 
                    node.iserror = true;
                    return;
                }
            }

            msg.payload = payload_in;

            if (payload_in) {
                    var val_out;
                    var val_op1 = node.isconst1 ? node.const1 : node.ctxvar1[node.index1];
                    var val_op2 = node.isconst2 ? node.const2 : node.ctxvar2[node.index2];

                try {
                    switch (node.operation) {
                        case "add": val_out = (val_op1 + val_op2); break;
                        case "sub": val_out = (val_op1 - val_op2); break;
                        case "mul": val_out = (val_op1 * val_op2); break;
                        case "div": val_out = (val_op1 / val_op2); break;
                        case "mod": val_out = (val_op1 % val_op2); break;
                        case "inc": val_out = ++val_op1; break;
                        case "dec": val_out = --val_op1; break;
                        case "min": val_out = Math.min(val_op1, val_op2); break;
                        case "max": val_out = Math.max(val_op1, val_op2); break;
                        case "abs": val_out = Math.abs(val_op1); break;
                        case "acos": val_out = Math.acos(val_op1); break;
                        case "acosh": val_out = Math.acosh(val_op1); break;
                        case "asin": val_out = Math.asin(val_op1); break;
                        case "asinh": val_out = Math.asinh(val_op1); break;
                        case "atan": val_out = Math.atan(val_op1); break;
                        case "cbrt": val_out = Math.cbrt(val_op1); break;
                        case "ceil": val_out = Math.ceil(val_op1); break;
                        case "cos": val_out = Math.cos(val_op1); break;
                        case "cosh": val_out = Math.cosh(val_op1); break;
                        case "exp": val_out = Math.exp(val_op1); break;
                        case "floor": val_out = Math.floor(val_op1); break;
                        case "log": val_out = Math.log(val_op1); break;
                        case "log10": val_out = Math.log10(val_op1); break;
                        case "log2": val_out = Math.log2(val_op1); break;
                        case "pow": val_out = Math.pow(val_op1, val_op2); break;
                        case "rnd1": val_out = Math.random() * val_op1; break;
                        case "rnd2": val_out = Math.random() * (val_op2 - val_op1 + 1) + val_op1; break;
                        case "round": val_out = Math.round(val_op1); break;
                        case "sin": val_out = Math.sin(val_op1); break;
                        case "sinh": val_out = Math.sinh(val_op1); break;
                        case "sqrt": val_out = Math.sqrt(val_op1); break;
                        case "tan": val_out = Math.tan(val_op1); break;
                        case "tanh": val_out = Math.tanh(val_op1); break;
                        case "trunc": val_out = Math.trunc(val_op1); break;
                        case "torad": val_out = val_op1 * (Math.PI / 180); break;
                        case "todeg": val_out = val_op1 / (Math.PI / 180); break;
                    }
                }
                catch (e) {}

                if ((val_out === undefined) || isNaN(val_out) || !isFinite(val_out)) {
                    syslib.outError(node, "invalid result");
                    msg.payload = false;
                    node.send(msg);
                    return;
                }

                switch(n.vartype) {
                    case "T":
                    case "C":
                        node.ctxvar[node.index] = parseInt(val_out);
                        break;
                    default:
                        node.ctxvar[node.index] = syslib.toFixed(val_out, node.tofix);
                }
            }

            var status_txt = node.name + " : ";

            switch(n.vartype) {
                case "T":
                    status_txt += syslib.fromMiliseconds(node.ctxvar[node.index]);
                    break;
                default:
                    status_txt += String(node.ctxvar[node.index]);
            }

            syslib.setStatusBool(node, msg.payload, status_txt);
            node.send(msg);
        });
    });
}