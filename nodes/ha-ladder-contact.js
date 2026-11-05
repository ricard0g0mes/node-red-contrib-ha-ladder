/**
 * Copyright 2024 Derya Y. (iot.redplc@gmail.com) — original redPlc.
 * Modifications Copyright 2026 — HA Ladder fork (Apache-2.0).
 */
"use strict";

module.exports = function (RED) {
    const syslib = require("./lib/syslib.js");
    const ha = require("./lib/ha.js");

    RED.nodes.registerType("ha-ladder-contact", function (n) {
        const node = this;
        RED.nodes.createNode(node, n);

        node.operation = n.operation || "NO";
        node.source = n.source || "ha"; // ha | mem
        node.entity_id = (n.entity_id || "").trim();
        node.server = n.server;
        node.vartype = n.vartype || "M";
        node.address = n.address || 0;
        node.index = syslib.getIndex(n.vartype, n.index, n.counter, n.timer, n.fflop);
        node.counter = n.counter;
        node.timer = n.timer;
        node.fflop = n.fflop;
        node.prevEventState = undefined;
        node.iserror = false;

        if (node.source === "ha") {
            node.name = node.entity_id || "contact";
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

            let value = false;

            if (node.source === "ha") {
                if (!node.entity_id || !node.serverNode) {
                    node.iserror = syslib.outError(node, "no entity/server");
                    msg.payload = false;
                    node.send(msg);
                    return;
                }
                const st = ha.getState(node.serverNode, node.entity_id, node);
                if (node.entity_id.startsWith("event.")) {
                    const cur = st ? String(st.state) : "";
                    const changed =
                        node.prevEventState !== undefined &&
                        cur !== "" &&
                        cur !== node.prevEventState;
                    node.prevEventState = cur || node.prevEventState;
                    value = changed;
                } else {
                    value = ha.isEntityOn(st, node.entity_id);
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
                value = !!node.ctxvar[node.index];
            }

            switch (node.operation) {
                case "NO":
                    msg.payload = value ? payload_in : false;
                    break;
                case "NC":
                    msg.payload = !value ? payload_in : false;
                    break;
                case "P":
                    msg.payload = syslib.posEdge(node, value) ? payload_in : false;
                    break;
                case "N":
                    msg.payload = syslib.negEdge(node, value) ? payload_in : false;
                    break;
                default:
                    msg.payload = value ? payload_in : false;
            }

            syslib.setStatusBool(
                node,
                msg.payload,
                (node.entity_id || node.name) + " : " + Number(value)
            );
            node.send(msg);
        });
    });
};
