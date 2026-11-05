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

    RED.nodes.registerType("ha-ladder-function", function (n) {
        const node = this;
        RED.nodes.createNode(node, n);

        node.operation = n.operation.toLowerCase();
        node.name = n.operation;
        node.prevVal = false;
        syslib.setStatus(node);

        node.on("input", (msg) => {
            var payload_in = syslib.getPayloadBool(node, msg, node.operation);

            if (payload_in === undefined)
                return;

            switch (node.operation) {
                case "not":
                    msg.payload = !payload_in;
                    break;
                case "nop":
                case "or":
                case "and":
                case "xor":
                    msg.payload = payload_in;
                    break;
                case "p_trigger":
                    msg.payload = syslib.posEdge(node, payload_in);
                    break;
                case "n_trigger":
                    msg.payload = syslib.negEdge(node, payload_in);
                    break;
            }

            node.prevVal = payload_in;

            syslib.setStatusBool(node, msg.payload);
            node.send(msg);
        });
    });
}