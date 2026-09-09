"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFields = buildFields;
var sdk_1 = require("@bsv/sdk");
/**
 * Builds the PushDrop field array for a Token-instance, in the locked field contract:
 *
 *   0  version
 *   1  uuid
 *   2  category
 *   3  subCategory
 *   4  createdAt
 *   5  anchorTxid          (other Token-instances; the anchor does not have this)
 *   6+ schema fields        (in schema.fields order)
 *
 * Everything is stored as UTF-8 strings. The schema's type drives validation/rendering,
 * not the storage format.
 *
 * Returns number[][] — what PushDrop.lock expects.
 */
function buildFields(schema, values, meta) {
    var enc = function (v) { return sdk_1.Utils.toArray(String(v), 'utf8'); };
    var fields = [
        enc(schema.version),
        enc(meta.uuid),
        enc(schema.category),
        enc(schema.subCategory),
        enc(meta.createdAt),
        enc(meta.anchorTxid)
    ];
    // Schema fields, pos 6+. Loop schema.fields IN ORDER.
    //    Rules:
    //      - required + value missing  -> throw (do not build a broken token)
    //      - optional + value missing  -> empty string '' (KEEP the position, NEVER skip)
    //      - otherwise                 -> enc(value)
    //
    //    Why never skip: skipping a field shifts every following position,
    //    and validation/parsing will no longer line up.
    for (var _i = 0, _a = schema.fields; _i < _a.length; _i++) {
        var field = _a[_i];
        var value = values[field.name];
        if (value === undefined || value === null) {
            if (field.required) {
                throw new Error("Missing required field: ".concat(field.name));
            }
            fields.push(enc(''));
        }
        else {
            fields.push(enc(value));
        }
    }
    return fields;
}
