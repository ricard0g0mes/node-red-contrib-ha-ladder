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

    RED.nodes.registerType("ha-ladder-move", function (n) {
        const node = this;
        RED.nodes.createNode(node, n);

        node.varname1 = n.vartype1 + n.address1;
        node.index1 = syslib.getIndex(n.vartype1, n.index1, n.counter1, n.timer1);
        node.const1 = syslib.initConstant(n.vartype1, n.const1, n.timeu1, n.fconst1);
        node.isconst1 = (node.const1 !== undefined);

        node.varname2 = n.vartype2 + n.address2;
        node.index2 = syslib.getIndex(n.vartype2, n.index2, n.counter2, n.timer2);

        node.tofix = n.tofix;
        node.name = node.varname2 + "." + syslib.getIndexName(n.vartype2, n.index2, n.counter2, n.timer2);
        node.iserror = false;
        syslib.setStatus(node, node.name);
            
        node.on("input", (msg) => {
            var payload_in = syslib.getPayloadBool(node, msg);

            if (payload_in === undefined)
                return;
            
            if (!node.isconst1 && (node.ctxvar1 === undefined)) {
                node.ctxvar1 = syslib.getVariable(node, node.varname1, node.index1);

                if (node.ctxvar1 === undefined) {
                    msg.payload = false;
                    node.send(msg);
                    node.iserror = true;
                    return;
                }
            }

            if (node.ctxvar2 === undefined) {
                node.ctxvar2 = syslib.getVariable(node, node.varname2, node.index2);

                if (node.ctxvar2 === undefined) {
                    node.iserror = true;
                    msg.payload = false;
                    node.send(msg);
                    return;
                }
            }

            if (payload_in) {
                if (node.isconst1)
                    node.ctxvar2[node.index2] = node.const1;
                else
                    node.ctxvar2[node.index2] = node.ctxvar1[node.index1];
            }

            msg.payload = payload_in;

            var status_txt = node.name + " : ";

            switch(n.vartype2) {
                case "T":
                    node.ctxvar2[node.index2] = parseInt(node.ctxvar2[node.index2]);
                    status_txt += syslib.fromMiliseconds(node.ctxvar2[node.index2]);
                    break;
                case "C":
                    node.ctxvar2[node.index2] = parseInt(node.ctxvar2[node.index2]);
                    status_txt += String(node.ctxvar2[node.index2]);
                    break;
                default:
                    node.ctxvar2[node.index2] = syslib.toFixed(node.ctxvar2[node.index2], node.tofix);
                    status_txt += String(node.ctxvar2[node.index2]);
            }

            syslib.setStatusBool(node,msg.payload, status_txt);

            node.send(msg);
        });
    });
}