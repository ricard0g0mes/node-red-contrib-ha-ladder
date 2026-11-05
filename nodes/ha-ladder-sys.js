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

    /* inject */
    RED.nodes.registerType("ha-ladder-sys-inject", function(n) {
        const node = this;
        RED.nodes.createNode(node, n);

        node.tupdate = n.tupdate;
        node.outputs = n.outputs;
        node.sdelay = n.sdelay;
        node.run = true;
        syslib.setStatusBool(node, node.run, "↻ ↓ " + node.tupdate + "ms");

        node.on("input", (msg) => {
            if (typeof msg.payload !== "boolean")
                return;
            
            node.run = msg.payload;
            syslib.setStatusBool(node, node.run, "↻ ↓ " + node.tupdate + "ms");
        });

        function send_outputs(state) {
            if (!node.run)
                return;

            for (var i=0; i < node.outputs; i++) {
                node.outbuf = new Array(node.outputs);
                node.outbuf[i] = { payload: state, outn: i };
                node.send(node.outbuf);
            }
        }

        node.id_sdelay = setTimeout( () => {
            send_outputs(false);
            node.id_tupdate = setInterval(send_outputs, node.tupdate, true);
        }, node.sdelay);

        node.on('close', () => {
            node.run = false;
            clearTimeout(node.id_sdelay);
            clearInterval(node.id_tupdate);
        });
    });

    /* onstart */
    RED.nodes.registerType("ha-ladder-sys-onstart", function (n) {
        const node = this;
        RED.nodes.createNode(node, n);
        syslib.setStatus(node, "td=" + n.sdelay + "ms", "green");

        node.id_sdelay = setTimeout( function() {
            node.send({ payload: true });
        }, n.sdelay);

        node.on('close', function () {
            clearTimeout(node.id_sdelay);
        });
    });

    /* firstscan */
    RED.nodes.registerType("ha-ladder-sys-firstscan", function (n) {
        const node = this;
        RED.nodes.createNode(node, n);

        node.init = false;
        node.status({ fill: "grey" });
 
        node.on("input", function (msg) {
            if (msg.payload === false)
                node.send(msg);
            else if (!node.init) {
                node.init = true;
                node.status({ fill: "green" });
                node.send(msg);
            }
        });
     });

    /* rail */
    RED.nodes.registerType("ha-ladder-sys-rail", function (n) {
        const node = this;
        RED.nodes.createNode(node, n);

        node.init = false;
        node.rtype = n.rtype;

        node.status({ fill: "grey" });

        node.on("input", function (msg) {
            if (!node.init) {
                node.init = true;
                var color = (node.rtype == "1") ? "green" : "blue";
                if (msg.hasOwnProperty("outn"))
                    node.status({ fill: color, text: (msg.outn < 10) ? "0" + msg.outn : msg.outn });
                else
                    node.status({ fill: color});
            }

            if (node.rtype == "1")
                node.send(msg);
        });
    });
}