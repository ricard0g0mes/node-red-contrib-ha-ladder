/**
 * Copyright 2024 Derya Y. (iot.redplc@gmail.com) — original redPlc.
 * Modifications Copyright 2026 — HA Ladder fork (Apache-2.0).
 */
"use strict";

module.exports = function (RED) {
    const syslib = require("./lib/syslib.js");
    const ha = require("./lib/ha.js");

    RED.nodes.registerType("ha-ladder-coil", function (n) {
        const node = this;
        RED.nodes.createNode(node, n);

        node.operation = n.operation || "ST";
        node.source = n.source || "ha"; // ha | mem
        node.entity_id = (n.entity_id || "").trim();
        node.server = n.server;
        node.vartype = n.vartype || "M";
        node.address = n.address || 0;
        node.index = syslib.getIndex(n.vartype, n.index, n.counter, n.timer, n.fflop);
        node.lastWritten = undefined;
        node.iserror = false;
        node.busy = false;

        if (node.source === "ha") {
            node.name = node.entity_id || "coil";
            node.serverNode = ha.getServer(RED, node);
        } else {
            node.varname = node.vartype + node.address;
            node.name =
                node.varname +
                "." +
                syslib.getIndexName(node.vartype, n.index, n.counter, n.timer, n.fflop);
        }

        syslib.setStatus(node, node.name);

        node.on("input", (msg) => {
            const payload_in = syslib.getPayloadBool(node, msg);
            if (payload_in === undefined) return;

            let setvalue;

            switch (node.operation) {
                case "ST":
                    setvalue = payload_in;
                    break;
                case "SN":
                    setvalue = !payload_in;
                    break;
                case "R":
                    setvalue = payload_in ? false : undefined;
                    break;
                case "S":
                    setvalue = payload_in ? true : undefined;
                    break;
                case "P":
                    setvalue = syslib.posEdge(node, payload_in) ? true : undefined;
                    break;
                case "N":
                    setvalue = syslib.negEdge(node, payload_in) ? true : undefined;
                    break;
                default:
                    setvalue = payload_in;
            }

            if (setvalue !== undefined) {
                if (node.source === "ha") {
                    if (!node.entity_id || !node.serverNode) {
                        node.iserror = syslib.outError(node, "no entity/server");
                    } else if (node.lastWritten !== setvalue && !node.busy) {
                        node.busy = true;
                        node.lastWritten = setvalue;
                        Promise.resolve(ha.callOnOff(node.serverNode, node.entity_id, setvalue))
                            .catch((e) => {
                                node.lastWritten = undefined;
                                syslib.outError(node, "HA call fail", e.message || String(e));
                            })
                            .finally(() => {
                                node.busy = false;
                            });
                    }
                } else {
                    if (node.ctxvar === undefined) {
                        node.ctxvar = syslib.getVariable(node, node.varname, node.index);
                        if (node.ctxvar === undefined) {
                            node.iserror = true;
                            msg.payload = false;
                            node.send(msg);
                            return;
                        }
                    }
                    node.ctxvar[node.index] = setvalue;
                }
            }

            const shown =
                node.source === "ha"
                    ? node.lastWritten
                    : node.ctxvar
                      ? node.ctxvar[node.index]
                      : false;
            syslib.setStatusBool(
                node,
                payload_in,
                (node.entity_id || node.name) + " : " + Number(!!shown)
            );
            msg.payload = payload_in;
            node.send(msg);
        });
    });
};
