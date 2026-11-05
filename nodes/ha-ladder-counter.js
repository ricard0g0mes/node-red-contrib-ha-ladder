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

    RED.nodes.registerType("ha-ladder-counter", function (n) {
        const node = this;
        RED.nodes.createNode(node, n);

        node.varname = "C" + n.address;
        node.name = node.varname;
        node.operation = n.operation;
        node.preset = parseInt(n.preset);
        node.iserror = false;
        syslib.setStatus(node, node.name);

        if (!syslib.initVariable(node, "C", node.varname))
            node.iserror = syslib.outError(node, node.varname + " duplicate", "duplicate " +  node.varname + " variable");

        node.on("input", (msg) => {
            var payload_in = syslib.getPayloadBool(node, msg);

            if (payload_in === undefined)
                return;

            if (node.ctxvar === undefined) {
                node.ctxvar = syslib.getVariable(node, node.varname);

                if (node.ctxvar === undefined) {
                    msg.payload = false;
                    node.send(msg); 
                    node.iserror = true;
                    return;
                }
                else {
                    node.ctxvar[syslib.C_CV] = node.operation == "CTD" ? node.preset : 0;
                    node.ctxvar[syslib.C_PV] = node.preset;    
                } 
            }

            if (node.ctxvar[syslib.C_PV] <= 0)
                node.ctxvar[syslib.C_PV] = node.preset;

            switch(node.operation) {
                case "CTU":
                    if (node.ctxvar[syslib.C_R] === true)
                        node.ctxvar[syslib.C_CV] = 0;
                    else if (syslib.posEdge(node, payload_in) && (node.ctxvar[syslib.C_CV] < node.ctxvar[syslib.C_PV])) {
                        node.ctxvar[syslib.C_CV]++;
                    }
                    break;
                case "CTD":
                    if (node.ctxvar[syslib.C_LD] === true)
                        node.ctxvar[syslib.C_CV] = node.ctxvar[syslib.C_PV];
                    else if (syslib.posEdge(node, payload_in) && (node.ctxvar[syslib.C_CV] > 0)) {
                        node.ctxvar[syslib.C_CV]--;
                    }
                    break;
                case "CTUD":
                    if (node.ctxvar[syslib.C_R] === true)
                        node.ctxvar[syslib.C_CV] = 0;
                    else if (node.ctxvar[syslib.C_LD] === true)
                        node.ctxvar[syslib.C_CV] = node.ctxvar[syslib.C_PV];
                    else if (syslib.posEdge(node, payload_in) && (node.ctxvar[syslib.C_CV] < node.ctxvar[syslib.C_PV])) {
                        node.ctxvar[syslib.C_CV]++;
                    }
                    else if (syslib.posEdge2(node, node.ctxvar[syslib.C_CD]) && (node.ctxvar[syslib.C_CV] > 0)) {
                        node.ctxvar[syslib.C_CV]--;
                    }
                    break;
                }

            node.ctxvar[syslib.C_QU] = (node.ctxvar[syslib.C_CV] >= node.ctxvar[syslib.C_PV]);
            node.ctxvar[syslib.C_QD] = (node.ctxvar[syslib.C_CV] <= 0);

            var outval = (node.operation == "CTD") ? node.ctxvar[syslib.C_QD] : node.ctxvar[syslib.C_QU];

            syslib.setStatusBool(node, outval, node.varname + " : " + node.ctxvar[syslib.C_CV]);

            msg.payload = outval;

            if (node.operation == "CTUD") {
                var msg2 = RED.util.cloneMessage(msg);
                msg2.payload = node.ctxvar[syslib.C_QD];
                node.send([msg, msg2]);
            }
            else
                node.send(msg);
        });

        node.on('close', () => {
            syslib.deleteVariable(node, node.varname);
        });
    });
}