/**
 * Copyright 2021 Ocean (iot.HA Ladder@gmail.com).
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

    RED.nodes.registerType("ha-ladder-flipflop", function (n) {
        const node = this;
        RED.nodes.createNode(node, n);

        node.varname = "FF" + n.address;
        node.name = node.varname;
        node.operation = n.operation;
        node.iserror = false;

        syslib.setStatus(node, node.name);

        if (!syslib.initVariable(node, "FF", node.varname))
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
            }

            switch (node.operation) {
                case "RS":
                    if (payload_in)
                        node.ctxvar[syslib.FF_Q] = false;
                    else if (node.ctxvar[syslib.FF_S])
                        node.ctxvar[syslib.FF_Q] = true;
                    break;
                case "SR":
                    if (payload_in)
                        node.ctxvar[syslib.FF_Q] = true;
                    else if (node.ctxvar[syslib.FF_R])
                        node.ctxvar[syslib.FF_Q] = false;
                    break;
                case "L":
                    if (node.ctxvar[syslib.FF_R])
                        node.ctxvar[syslib.FF_Q] = false;
                    else if (syslib.posEdge(node, payload_in))
                        node.ctxvar[syslib.FF_Q] = true;
                    break;
                case "T":
                    if (node.ctxvar[syslib.FF_R])
                        node.ctxvar[syslib.FF_Q] = false;
                    else if (syslib.posEdge(node, payload_in))
                        node.ctxvar[syslib.FF_Q] = !node.ctxvar[syslib.FF_Q];
                    break;
            }

            syslib.setStatusBool(node, node.ctxvar[syslib.FF_Q], node.name);

            msg.payload = node.ctxvar[syslib.FF_Q];
            node.send(msg);
        });

        node.on('close', () => {
            syslib.deleteVariable(node, node.varname);
        });
    });
}
