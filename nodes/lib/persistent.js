/**
 * Copyright 2024 Derya Y. (iot.HA Ladder@gmail.com).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use node file except in compliance with the License.
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

const syslib = require('./syslib.js');
const fs = require('fs');
const path = require("path");
const os = require("os");
const storage_path = path.join(os.homedir(), ".HA Ladder", "persistent");

/**
* Compare variable with json string.
* @param node - the node object
* @param varname - the variable name
* @param jsonscompare - the array json string to compare
* @returns true if equal
*/
module.exports.compareVariable = function(node, varname, jsoncompare) {
    if (jsoncompare === undefined)
        return false;

    const store = node.context().global;
    var ctxvar = store.get(varname);
    return (JSON.stringify(ctxvar) === jsoncompare);
}

/**
* Convert variable to json string.
* @param node - the node object
* @param varname - the variable name
* @returns the variable json string
*/
module.exports.jsonVariable = function(node, varname) {
    const store = node.context().global;
    var ctxvar = store.get(varname);
    return JSON.stringify(ctxvar);
}

/**
* Create persistent storage.
* @param node - the node object
* @returns true if ok
*/
module.exports.createPersistentStorage = function(node) {
    try {
        if (!fs.existsSync(storage_path)) {
            fs.mkdirSync(storage_path, { recursive: true });
        }
    }
    catch(e)
    {
        syslib.outError(node, "storage error", e.message);
        return false;
    }

    return true;
}

/**
* Read persistent variable.
* @param node - the node object
* @param varname - the variable name
* @returns true if ok or not exist
*/
module.exports.getPersistent = function(node, varname) {
    try {
        const storage_filename = path.join(storage_path, varname + ".json");
        const store = node.context().global;

        if (!fs.existsSync(storage_filename))
            return true;

        var per_data = fs.readFileSync(storage_filename, 'utf8');
        var ctxvar = JSON.parse(per_data);

        if (!syslib.checkVariable(node, varname, ctxvar))
            return false;
        
        store.set(varname, ctxvar);
    }
    catch(e)
    {
        syslib.outError(node, "read error", e.message);
        return false;
    }

    return true;
}

/**
* Save persistent variable.
* @param node - the node object
* @param varname - the variable name
* @returns true if ok
*/
module.exports.setPersistent = function(node, varname) {
    try {
        const store = node.context().global;
        const storage_filename = path.join(storage_path, varname + ".json");

        var ctxvar = store.get(varname);
        fs.writeFileSync(storage_filename, JSON.stringify(ctxvar), 'utf8');
    }
    catch(e)
    {
        syslib.outError(node, "write error", e.message);
        return false;
    }

    return true;
}

/**
* Delete persistent variable.
* @param node - the node object
* @param varname - the variable name
*/
module.exports.deletePersistent = function(node, varname) {
    try {
        const storage_filename = path.join(storage_path, varname + ".json");
        fs.unlinkSync(storage_filename);
    }
    catch(e)
    {
    }
}
