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

    RED.nodes.registerType("ha-ladder-scale", function (n) {
        const node = this;
        RED.nodes.createNode(node, n);

        node.varname1 = n.vartype1 + n.address1;
        node.index1 = n.index1;

        node.varname2 = n.vartype2 + n.address2;
        node.index2 = n.index2;

        node.in_min = Number(n.const1);
        node.in_max = Number(n.const2);
        node.sc_min = Number(n.const3);
        node.sc_max = Number(n.const4);

        node.name = node.varname2 + "." + n.index2;
        node.clamp = n.clamp;
        node.tofix = n.tofix;
        node.iserror = false;
        syslib.setStatus(node, node.name);

        if (node.in_min >= node.in_max)
            node.iserror = syslib.outError(node, "input min>=max", "input min>=max " + node.in_min + ">=" + node.in_max);
        else if (node.sc_min >= node.sc_max)
            node.iserror = syslib.outError(node, "scale min>=max", "scale min>=max " + node.sc_min + ">=" + node.sc_max);
        else {
            try {
                node.factor = (node.sc_max - node.sc_min) / (node.in_max - node.in_min);
                node.offset = node.sc_min - (node.in_min * node.factor);
            }
            catch (e) {
                node.iserror = syslib.outError(node, "inv. result", "invalid factor or offset");
            }
        }

        node.on("input", (msg) => {
            var payload_in = syslib.getPayloadBool(node, msg);

            if (payload_in === undefined)
                return;
    
            if (node.ctxvar1 === undefined) {
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
                    msg.payload = false;
                    node.send(msg); 
                    node.iserror = true;
                    return;
                }
            }

            if (payload_in) {
                var s_val = node.ctxvar1[node.index1];
                
                if (node.clamp) {
                    if (s_val < node.in_min)
                        s_val = node.in_min;
                    else if (s_val > node.in_max)
                        s_val = node.in_max;
                }

                var t_val = (s_val * node.factor) + node.offset;
                node.ctxvar2[node.index2] = syslib.toFixed(t_val, node.tofix);
            }

            msg.payload = payload_in;

            syslib.setStatusBool(node, msg.payload, node.name + " : " + String(node.ctxvar2[node.index2]));
            node.send(msg);
        });
     });
}