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

    RED.nodes.registerType("ha-ladder-compare", function (n) {
        const node = this;
        RED.nodes.createNode(node, n);

        node.operation = n.operation;

        node.varname1 = n.vartype1 + n.address1;
        node.index1 = syslib.getIndex(n.vartype1, n.index1, n.counter1, n.timer1);

        node.varname2 = n.vartype2 + n.address2;
        node.index2 = syslib.getIndex(n.vartype2, n.index2, n.counter2, n.timer2);
        node.const2 = syslib.initConstant(n.vartype2, n.const2, n.timeu2);
        node.isconst2 = (node.const2 !== undefined);

        node.name = node.varname1 + "." + syslib.getIndexName(n.vartype1, n.index1, n.counter1, n.timer1);
        node.iserror = false;
        syslib.setStatus(node, node.name);

        node.on("input", (msg) => {
            var payload_in = syslib.getPayloadBool(node, msg);

            if (payload_in === undefined)
                return;

            if (node.ctxvar1 === undefined) {
                node.ctxvar1 = syslib.getVariable(node, node.varname1, node.index1);

                if (node.ctxvar1 === undefined) {
                    node.iserror = true;
                    return;
                }
            }

            if (!node.isconst2 && (node.ctxvar2 === undefined)) {
                node.ctxvar2 = syslib.getVariable(node, node.varname2, node.index2);

                if (node.ctxvar2 === undefined) {
                    node.iserror = true;
                    return;
                }
            }

            var val_1 = node.ctxvar1[node.index1];
            var val_2 = (node.isconst2) ? node.const2 : node.ctxvar2[node.index2];
            var payload_out = false;

            switch (node.operation) {
                case "eq":
                    payload_out = (val_1 == val_2);
                    break;
                case "ne":
                    payload_out = (val_1 != val_2);
                    break;
                case "lt":
                    payload_out = (val_1 < val_2);
                    break;
                case "gt":
                    payload_out = (val_1 > val_2);
                    break;
                case "le":
                    payload_out = (val_1 <= val_2);
                    break;
                case "ge":
                    payload_out = (val_1 >= val_2);
                    break;
                case "inc":
                    if (node.preval === undefined)
                        payload_out = false;
                    else
                        payload_out = val_1 > (node.preval + val_2);
                    node.preval = val_1;
                    break;
                case "dec":
                    if (node.preval === undefined)
                        payload_out = false;
                    else
                        payload_out = val_1 < (node.preval - val_2);
                    node.preval = val_1;
                }

            msg.payload = payload_out ? payload_in : false;

            var status_txt = node.name + " : ";

            switch(n.vartype1) {
                case "T":
                    status_txt += syslib.fromMiliseconds(node.ctxvar1[node.index1]);
                    break;
                default:
                    status_txt += String(node.ctxvar1[node.index1]);
            }

            syslib.setStatusBool(node, msg.payload, status_txt);
            node.send(msg);
        });
     });
}