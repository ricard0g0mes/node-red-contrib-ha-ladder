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

    RED.nodes.registerType("ha-ladder-timer", function (n) {
        const node = this;
        RED.nodes.createNode(node, n);

        node.varname = "T" + n.address;
        node.name = node.varname;
        node.operation = n.operation;
        node.preset = syslib.initConstant("#T", n.timev, n.timeu);

        node.trun = false;
        node.toggle = false;
        node.iserror = false;
        syslib.setStatus(node, node.name);

        if (!syslib.initVariable(node, "T", node.varname))
            node.iserror = syslib.outError(node, node.varname + " duplicate", "duplicate " +  node.varname + " variable");

        function startTimer() {
            node.ctxvar[syslib.T_ET] = 0;
            node.ctxvar[syslib.T_TT] = true;

            if (node.ctxvar[syslib.T_PT] <= 0)
                node.ctxvar[syslib.T_PT] = node.preset;
                
            node.pt = node.ctxvar[syslib.T_PT];
            node.trun = true;
            node.tstart = Date.now();

            node.t_id = setInterval(function () {
                if (!node.ctxvar[syslib.T_TT])
                    return;

    
                if (node.ctxvar[syslib.T_ET] >= node.pt) {
                    node.ctxvar[syslib.T_TT] = false;
                    node.ctxvar[syslib.T_ET] = node.pt;
                    node.timerpause = false;
                    clearInterval(node.t_id);
                }
                else
                    node.ctxvar[syslib.T_ET] = Date.now() - node.tstart;
            }, 10);
        }

        function stopTimer() {
            node.trun = false;
            node.ctxvar[syslib.T_TT] = false;
            clearInterval(node.t_id);
            node.ctxvar[syslib.T_ET] = 0;
        }

        function pauseTimer() {
            node.ctxvar[syslib.T_TT] = false;
        }

        function resumeTimer() {
            if (!node.trun)
                startTimer();
            else if (!node.ctxvar[syslib.T_TT]) {
                node.tstart = Date.now() - node.ctxvar[syslib.T_ET];
                node.ctxvar[syslib.T_TT] = true;
            }

            node.timerpause = false;
        }

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
                    node.ctxvar[syslib.T_ET] = 0;
                    node.ctxvar[syslib.T_PT] = node.preset;    
                } 
            }
            
            var pos_edge = syslib.posEdge(node, payload_in);
            var neg_edge = syslib.negEdge(node, payload_in);
            var timer_done = node.ctxvar[syslib.T_ET] >= node.ctxvar[syslib.T_PT];

            node.ctxvar[syslib.T_Q] = false;

            if (node.ctxvar[syslib.T_PT] <= 0)
                node.ctxvar[syslib.T_PT] = node.preset;

            switch (node.operation) {
                case "TON":
                    if (pos_edge && !node.trun)
                        startTimer();
                    if (!payload_in)
                        stopTimer();
                    node.ctxvar[syslib.T_Q] = payload_in && timer_done;
                    break;

                case "TOF":
                    if (neg_edge && !node.trun)
                        startTimer();
                    if (payload_in)
                        stopTimer();

                    node.ctxvar[syslib.T_Q] = payload_in || node.ctxvar[syslib.T_TT];
                    break;

                case "TP":
                    if (pos_edge && !node.ctxvar[syslib.T_TT])
                        startTimer();

                    node.ctxvar[syslib.T_Q] = node.ctxvar[syslib.T_TT];
                    break;

                case "TPI":
                    if (!payload_in) {
                        stopTimer();
                        node.toggle = false;
                    }
                    else if (pos_edge) {
                        startTimer();
                        node.toggle = true;
                    }
                    else if (timer_done) {
                        startTimer();
                        node.toggle = !node.toggle;
                    }

                    node.ctxvar[syslib.T_Q] = node.toggle;
                    break;

                case "TONR":
                    if (node.ctxvar[syslib.T_R])
                        stopTimer();
                    else if (pos_edge)
                        resumeTimer();
                    else if (!payload_in)
                        pauseTimer();

                    node.ctxvar[syslib.T_Q] = timer_done;
                    break;
            }

            var status_txt = node.name + " : ";

            if (node.operation === "TPI")
                status_txt += n.timev + n.timeu;
            else
                status_txt += syslib.fromMiliseconds(node.ctxvar[syslib.T_ET]);

            syslib.setStatusBool(node, node.ctxvar[syslib.T_Q], status_txt);
            msg.payload = node.ctxvar[syslib.T_Q];
            node.send(msg);
         });

        node.on('close', () => {
            clearInterval(node.t_id);
            syslib.deleteVariable(node, node.varname);
        });
    });
}