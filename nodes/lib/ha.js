"use strict";

/**
 * Home Assistant access via node-red-contrib-home-assistant-websocket only.
 * Reads are sync from the websocket client cache or global context.
 */

function getServer(RED, node) {
    if (!node.server) return null;
    return RED.nodes.getNode(node.server);
}

function getHA(serverNode) {
    if (!serverNode) return null;
    try {
        const haMod = require("node-red-contrib-home-assistant-websocket/dist/homeAssistant");
        if (haMod.homeAssistantConnections) {
            const hit = haMod.homeAssistantConnections.get(serverNode.id);
            if (hit) return hit;
        }
        if (typeof haMod.getHomeAssistant === "function") {
            return haMod.getHomeAssistant(serverNode);
        }
    } catch (e) {
        /* fall through */
    }
    return serverNode.homeAssistant || null;
}

function stateFromGlobal(ladderNode, entityId) {
    if (!ladderNode) return null;
    try {
        const store = ladderNode.context().global.get("homeassistant");
        if (!store) return null;
        const bucket = store.homeAssistant || store[Object.keys(store)[0]];
        if (bucket && bucket.states && bucket.states[entityId]) {
            return bucket.states[entityId];
        }
    } catch (e) {
        /* ignore */
    }
    return null;
}

function getState(serverNode, entityId, ladderNode) {
    if (!entityId) return null;

    const ha = getHA(serverNode);
    if (ha) {
        try {
            if (typeof ha.getState === "function") {
                const s = ha.getState(entityId);
                if (s) return s;
            }
            if (typeof ha.getStates === "function") {
                const states = ha.getStates();
                if (states && states[entityId]) return states[entityId];
            }
        } catch (e) {
            /* fall through */
        }
    }

    return stateFromGlobal(ladderNode, entityId);
}

function isEntityOn(stateObj, entityId) {
    if (!stateObj) return false;
    const s = String(stateObj.state || "").toLowerCase();
    if (entityId && entityId.startsWith("event.")) return false;
    return (
        s === "on" ||
        s === "home" ||
        s === "open" ||
        s === "unlocked" ||
        s === "playing" ||
        s === "true" ||
        s === "1"
    );
}

function domainOf(entityId) {
    const i = entityId.indexOf(".");
    return i > 0 ? entityId.slice(0, i) : "";
}

async function callOnOff(serverNode, entityId, on) {
    if (!entityId) throw new Error("entity missing");
    const domain = domainOf(entityId);
    if (!domain) throw new Error("invalid entity_id");

    let service;
    if (domain === "lock") service = on ? "unlock" : "lock";
    else if (domain === "cover") service = on ? "open_cover" : "close_cover";
    else service = on ? "turn_on" : "turn_off";

    const target = { entity_id: entityId };
    const ha = getHA(serverNode);
    if (!ha) throw new Error("HA client missing — configure a Home Assistant server node");

    if (typeof ha.callService === "function") {
        return ha.callService(domain, service, {}, target);
    }
    if (typeof ha.send === "function") {
        return ha.send({
            type: "call_service",
            domain,
            service,
            service_data: {},
            target,
        });
    }
    throw new Error("HA client has no callService/send");
}

module.exports = {
    getServer,
    getHA,
    getState,
    isEntityOn,
    domainOf,
    callOnOff,
};
