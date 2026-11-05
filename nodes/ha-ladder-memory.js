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
    const persist = require('./lib/persistent.js');

    RED.nodes.registerType("ha-ladder-m-memory", function (n) {
        const node = this;
        RED.nodes.createNode(node, n);

        node.varname = "M" + n.address;
        node.name = node.varname;
        node.persistent = n.persistent > 0;
        node.tupdate = n.tupdate;
        node.onwork = false;
        node.statustxt = node.persistent ? node.name + " ↻ " + node.tupdate + "s" : node.name;
        
        syslib.setStatus(node, node.statustxt, "green");

        if (node.persistent)
            node.iserror = !persist.createPersistentStorage(node);

        syslib.initVariable(node, "M", node.varname, n.meminit);

        if (node.persistent && !node.iserror)
            node.iserror = !persist.getPersistent(node, node.varname);

        function update() {
            if (!persist.compareVariable(node, node.varname, node.jsoncompare)) {
                node.jsoncompare = persist.jsonVariable(node, node.varname);

                if (persist.setPersistent(node, node.varname))
                    syslib.setStatus(node, node.statustxt, "blue");
            }
            else
                syslib.setStatus(node, node.statustxt, "green");

            node.onwork = false;
        }

        if (node.persistent && !node.iserror) {
            node.id_tupdate = setInterval(function() {
                if (!node.onwork) {
                    node.onwork = true;
                    update();
                }
            }, node.tupdate * 1000);
        }

        node.on('close', (removed, done) => {
            clearInterval(node.id_tupdate);

            if (node.persistent && !node.iserror) {
                setTimeout(function() {
                    if (removed)
                        persist.deletePersistent(node, node.varname);
                    else
                        update();
                    syslib.deleteVariable(node, node.varname);
                    done();
                }, 50);
            }
            else {
                syslib.deleteVariable(node, node.varname);
                done();
            }
        });
    });

    RED.nodes.registerType("ha-ladder-ma-memory", function (n) {
        const node = this;
        RED.nodes.createNode(node, n);

        node.varname = "MA" + n.address;
        node.name = node.varname;
        node.persistent = n.persistent > 0;
        node.tupdate = n.tupdate;
        node.onwork = false;
        node.statustxt = node.persistent ? node.name + " ↻ " + node.tupdate + "s" : node.name;

        node.meminit = [];
        
        for(var i = 0; i < n.meminit.length; i++) {
            node.meminit[i] = parseFloat(n.meminit[i]);
            if (isNaN(node.meminit[i]))
                node.meminit[i] = 0;
        }

        syslib.setStatus(node, node.statustxt, "green");

        if (node.persistent)
            node.iserror = !persist.createPersistentStorage(node);

        syslib.initVariable(node, "MA", node.varname, node.meminit);

        if (node.persistent && !node.iserror)
            node.iserror = !persist.getPersistent(node, node.varname);

        function update() {
            if (!persist.compareVariable(node, node.varname, node.jsoncompare)) {
                node.jsoncompare = persist.jsonVariable(node, node.varname);

                if (persist.setPersistent(node, node.varname))
                    syslib.setStatus(node, node.statustxt, "blue");
            }
            else
                syslib.setStatus(node, node.statustxt, "green");

            node.onwork = false;
        }

        if (node.persistent && !node.iserror) {
            node.id_tupdate = setInterval(function() {
                if (!node.onwork) {
                    node.onwork = true;
                    update();
                }
            }, node.tupdate * 1000);
        }

        node.on('close', (removed, done) => {
            clearInterval(node.id_tupdate);

            if (node.persistent && !node.iserror) {
                setTimeout(function() {
                    if (removed)
                        persist.deletePersistent(node, node.varname);
                    else
                        update();
                    syslib.deleteVariable(node, node.varname);
                    done();
                }, 50);
            }
            else {
                syslib.deleteVariable(node, node.varname);
                done();
            }
        });
    });
}