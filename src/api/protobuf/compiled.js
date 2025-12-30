/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const protobuf = $root.protobuf = (() => {

    /**
     * Namespace protobuf.
     * @exports protobuf
     * @namespace
     */
    const protobuf = {};

    protobuf.MarkerDiffSnapshotVo = (function() {

        /**
         * Properties of a MarkerDiffSnapshotVo.
         * @memberof protobuf
         * @interface IMarkerDiffSnapshotVo
         * @property {number|Long|null} [version] MarkerDiffSnapshotVo version
         * @property {number|Long|null} [id] MarkerDiffSnapshotVo id
         * @property {string|null} [linkageId] MarkerDiffSnapshotVo linkageId
         */

        /**
         * Constructs a new MarkerDiffSnapshotVo.
         * @memberof protobuf
         * @classdesc Represents a MarkerDiffSnapshotVo.
         * @implements IMarkerDiffSnapshotVo
         * @constructor
         * @param {protobuf.IMarkerDiffSnapshotVo=} [properties] Properties to set
         */
        function MarkerDiffSnapshotVo(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MarkerDiffSnapshotVo version.
         * @member {number|Long} version
         * @memberof protobuf.MarkerDiffSnapshotVo
         * @instance
         */
        MarkerDiffSnapshotVo.prototype.version = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * MarkerDiffSnapshotVo id.
         * @member {number|Long} id
         * @memberof protobuf.MarkerDiffSnapshotVo
         * @instance
         */
        MarkerDiffSnapshotVo.prototype.id = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * MarkerDiffSnapshotVo linkageId.
         * @member {string|null|undefined} linkageId
         * @memberof protobuf.MarkerDiffSnapshotVo
         * @instance
         */
        MarkerDiffSnapshotVo.prototype.linkageId = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(MarkerDiffSnapshotVo.prototype, "_linkageId", {
            get: $util.oneOfGetter($oneOfFields = ["linkageId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new MarkerDiffSnapshotVo instance using the specified properties.
         * @function create
         * @memberof protobuf.MarkerDiffSnapshotVo
         * @static
         * @param {protobuf.IMarkerDiffSnapshotVo=} [properties] Properties to set
         * @returns {protobuf.MarkerDiffSnapshotVo} MarkerDiffSnapshotVo instance
         */
        MarkerDiffSnapshotVo.create = function create(properties) {
            return new MarkerDiffSnapshotVo(properties);
        };

        /**
         * Encodes the specified MarkerDiffSnapshotVo message. Does not implicitly {@link protobuf.MarkerDiffSnapshotVo.verify|verify} messages.
         * @function encode
         * @memberof protobuf.MarkerDiffSnapshotVo
         * @static
         * @param {protobuf.IMarkerDiffSnapshotVo} message MarkerDiffSnapshotVo message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MarkerDiffSnapshotVo.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.version);
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.id);
            if (message.linkageId != null && Object.hasOwnProperty.call(message, "linkageId"))
                writer.uint32(/* id 15, wireType 2 =*/122).string(message.linkageId);
            return writer;
        };

        /**
         * Encodes the specified MarkerDiffSnapshotVo message, length delimited. Does not implicitly {@link protobuf.MarkerDiffSnapshotVo.verify|verify} messages.
         * @function encodeDelimited
         * @memberof protobuf.MarkerDiffSnapshotVo
         * @static
         * @param {protobuf.IMarkerDiffSnapshotVo} message MarkerDiffSnapshotVo message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MarkerDiffSnapshotVo.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MarkerDiffSnapshotVo message from the specified reader or buffer.
         * @function decode
         * @memberof protobuf.MarkerDiffSnapshotVo
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protobuf.MarkerDiffSnapshotVo} MarkerDiffSnapshotVo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MarkerDiffSnapshotVo.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.protobuf.MarkerDiffSnapshotVo();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.version = reader.uint64();
                        break;
                    }
                case 2: {
                        message.id = reader.uint64();
                        break;
                    }
                case 15: {
                        message.linkageId = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MarkerDiffSnapshotVo message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof protobuf.MarkerDiffSnapshotVo
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protobuf.MarkerDiffSnapshotVo} MarkerDiffSnapshotVo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MarkerDiffSnapshotVo.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MarkerDiffSnapshotVo message.
         * @function verify
         * @memberof protobuf.MarkerDiffSnapshotVo
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MarkerDiffSnapshotVo.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.version != null && message.hasOwnProperty("version"))
                if (!$util.isInteger(message.version) && !(message.version && $util.isInteger(message.version.low) && $util.isInteger(message.version.high)))
                    return "version: integer|Long expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                    return "id: integer|Long expected";
            if (message.linkageId != null && message.hasOwnProperty("linkageId")) {
                properties._linkageId = 1;
                if (!$util.isString(message.linkageId))
                    return "linkageId: string expected";
            }
            return null;
        };

        /**
         * Creates a MarkerDiffSnapshotVo message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protobuf.MarkerDiffSnapshotVo
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protobuf.MarkerDiffSnapshotVo} MarkerDiffSnapshotVo
         */
        MarkerDiffSnapshotVo.fromObject = function fromObject(object) {
            if (object instanceof $root.protobuf.MarkerDiffSnapshotVo)
                return object;
            let message = new $root.protobuf.MarkerDiffSnapshotVo();
            if (object.version != null)
                if ($util.Long)
                    (message.version = $util.Long.fromValue(object.version)).unsigned = true;
                else if (typeof object.version === "string")
                    message.version = parseInt(object.version, 10);
                else if (typeof object.version === "number")
                    message.version = object.version;
                else if (typeof object.version === "object")
                    message.version = new $util.LongBits(object.version.low >>> 0, object.version.high >>> 0).toNumber(true);
            if (object.id != null)
                if ($util.Long)
                    (message.id = $util.Long.fromValue(object.id)).unsigned = true;
                else if (typeof object.id === "string")
                    message.id = parseInt(object.id, 10);
                else if (typeof object.id === "number")
                    message.id = object.id;
                else if (typeof object.id === "object")
                    message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber(true);
            if (object.linkageId != null)
                message.linkageId = String(object.linkageId);
            return message;
        };

        /**
         * Creates a plain object from a MarkerDiffSnapshotVo message. Also converts values to other types if specified.
         * @function toObject
         * @memberof protobuf.MarkerDiffSnapshotVo
         * @static
         * @param {protobuf.MarkerDiffSnapshotVo} message MarkerDiffSnapshotVo
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MarkerDiffSnapshotVo.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.version = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.version = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.id = options.longs === String ? "0" : 0;
            }
            if (message.version != null && message.hasOwnProperty("version"))
                if (typeof message.version === "number")
                    object.version = options.longs === String ? String(message.version) : message.version;
                else
                    object.version = options.longs === String ? $util.Long.prototype.toString.call(message.version) : options.longs === Number ? new $util.LongBits(message.version.low >>> 0, message.version.high >>> 0).toNumber(true) : message.version;
            if (message.id != null && message.hasOwnProperty("id"))
                if (typeof message.id === "number")
                    object.id = options.longs === String ? String(message.id) : message.id;
                else
                    object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
            if (message.linkageId != null && message.hasOwnProperty("linkageId")) {
                object.linkageId = message.linkageId;
                if (options.oneofs)
                    object._linkageId = "linkageId";
            }
            return object;
        };

        /**
         * Converts this MarkerDiffSnapshotVo to JSON.
         * @function toJSON
         * @memberof protobuf.MarkerDiffSnapshotVo
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MarkerDiffSnapshotVo.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MarkerDiffSnapshotVo
         * @function getTypeUrl
         * @memberof protobuf.MarkerDiffSnapshotVo
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MarkerDiffSnapshotVo.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protobuf.MarkerDiffSnapshotVo";
        };

        return MarkerDiffSnapshotVo;
    })();

    protobuf.MarkerDiffSnapshotVoList = (function() {

        /**
         * Properties of a MarkerDiffSnapshotVoList.
         * @memberof protobuf
         * @interface IMarkerDiffSnapshotVoList
         * @property {Array.<protobuf.IMarkerDiffSnapshotVo>|null} [snapshots] MarkerDiffSnapshotVoList snapshots
         */

        /**
         * Constructs a new MarkerDiffSnapshotVoList.
         * @memberof protobuf
         * @classdesc Represents a MarkerDiffSnapshotVoList.
         * @implements IMarkerDiffSnapshotVoList
         * @constructor
         * @param {protobuf.IMarkerDiffSnapshotVoList=} [properties] Properties to set
         */
        function MarkerDiffSnapshotVoList(properties) {
            this.snapshots = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MarkerDiffSnapshotVoList snapshots.
         * @member {Array.<protobuf.IMarkerDiffSnapshotVo>} snapshots
         * @memberof protobuf.MarkerDiffSnapshotVoList
         * @instance
         */
        MarkerDiffSnapshotVoList.prototype.snapshots = $util.emptyArray;

        /**
         * Creates a new MarkerDiffSnapshotVoList instance using the specified properties.
         * @function create
         * @memberof protobuf.MarkerDiffSnapshotVoList
         * @static
         * @param {protobuf.IMarkerDiffSnapshotVoList=} [properties] Properties to set
         * @returns {protobuf.MarkerDiffSnapshotVoList} MarkerDiffSnapshotVoList instance
         */
        MarkerDiffSnapshotVoList.create = function create(properties) {
            return new MarkerDiffSnapshotVoList(properties);
        };

        /**
         * Encodes the specified MarkerDiffSnapshotVoList message. Does not implicitly {@link protobuf.MarkerDiffSnapshotVoList.verify|verify} messages.
         * @function encode
         * @memberof protobuf.MarkerDiffSnapshotVoList
         * @static
         * @param {protobuf.IMarkerDiffSnapshotVoList} message MarkerDiffSnapshotVoList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MarkerDiffSnapshotVoList.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.snapshots != null && message.snapshots.length)
                for (let i = 0; i < message.snapshots.length; ++i)
                    $root.protobuf.MarkerDiffSnapshotVo.encode(message.snapshots[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified MarkerDiffSnapshotVoList message, length delimited. Does not implicitly {@link protobuf.MarkerDiffSnapshotVoList.verify|verify} messages.
         * @function encodeDelimited
         * @memberof protobuf.MarkerDiffSnapshotVoList
         * @static
         * @param {protobuf.IMarkerDiffSnapshotVoList} message MarkerDiffSnapshotVoList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MarkerDiffSnapshotVoList.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MarkerDiffSnapshotVoList message from the specified reader or buffer.
         * @function decode
         * @memberof protobuf.MarkerDiffSnapshotVoList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protobuf.MarkerDiffSnapshotVoList} MarkerDiffSnapshotVoList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MarkerDiffSnapshotVoList.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.protobuf.MarkerDiffSnapshotVoList();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.snapshots && message.snapshots.length))
                            message.snapshots = [];
                        message.snapshots.push($root.protobuf.MarkerDiffSnapshotVo.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MarkerDiffSnapshotVoList message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof protobuf.MarkerDiffSnapshotVoList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protobuf.MarkerDiffSnapshotVoList} MarkerDiffSnapshotVoList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MarkerDiffSnapshotVoList.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MarkerDiffSnapshotVoList message.
         * @function verify
         * @memberof protobuf.MarkerDiffSnapshotVoList
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MarkerDiffSnapshotVoList.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.snapshots != null && message.hasOwnProperty("snapshots")) {
                if (!Array.isArray(message.snapshots))
                    return "snapshots: array expected";
                for (let i = 0; i < message.snapshots.length; ++i) {
                    let error = $root.protobuf.MarkerDiffSnapshotVo.verify(message.snapshots[i]);
                    if (error)
                        return "snapshots." + error;
                }
            }
            return null;
        };

        /**
         * Creates a MarkerDiffSnapshotVoList message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protobuf.MarkerDiffSnapshotVoList
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protobuf.MarkerDiffSnapshotVoList} MarkerDiffSnapshotVoList
         */
        MarkerDiffSnapshotVoList.fromObject = function fromObject(object) {
            if (object instanceof $root.protobuf.MarkerDiffSnapshotVoList)
                return object;
            let message = new $root.protobuf.MarkerDiffSnapshotVoList();
            if (object.snapshots) {
                if (!Array.isArray(object.snapshots))
                    throw TypeError(".protobuf.MarkerDiffSnapshotVoList.snapshots: array expected");
                message.snapshots = [];
                for (let i = 0; i < object.snapshots.length; ++i) {
                    if (typeof object.snapshots[i] !== "object")
                        throw TypeError(".protobuf.MarkerDiffSnapshotVoList.snapshots: object expected");
                    message.snapshots[i] = $root.protobuf.MarkerDiffSnapshotVo.fromObject(object.snapshots[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a MarkerDiffSnapshotVoList message. Also converts values to other types if specified.
         * @function toObject
         * @memberof protobuf.MarkerDiffSnapshotVoList
         * @static
         * @param {protobuf.MarkerDiffSnapshotVoList} message MarkerDiffSnapshotVoList
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MarkerDiffSnapshotVoList.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.snapshots = [];
            if (message.snapshots && message.snapshots.length) {
                object.snapshots = [];
                for (let j = 0; j < message.snapshots.length; ++j)
                    object.snapshots[j] = $root.protobuf.MarkerDiffSnapshotVo.toObject(message.snapshots[j], options);
            }
            return object;
        };

        /**
         * Converts this MarkerDiffSnapshotVoList to JSON.
         * @function toJSON
         * @memberof protobuf.MarkerDiffSnapshotVoList
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MarkerDiffSnapshotVoList.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MarkerDiffSnapshotVoList
         * @function getTypeUrl
         * @memberof protobuf.MarkerDiffSnapshotVoList
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MarkerDiffSnapshotVoList.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protobuf.MarkerDiffSnapshotVoList";
        };

        return MarkerDiffSnapshotVoList;
    })();

    protobuf.MarkerVo = (function() {

        /**
         * Properties of a MarkerVo.
         * @memberof protobuf
         * @interface IMarkerVo
         * @property {number|Long|null} [version] MarkerVo version
         * @property {number|Long|null} [id] MarkerVo id
         * @property {number|Long|null} [creatorId] MarkerVo creatorId
         * @property {number|Long|null} [createTime] MarkerVo createTime
         * @property {number|Long|null} [updaterId] MarkerVo updaterId
         * @property {number|Long|null} [updateTime] MarkerVo updateTime
         * @property {string|null} [markerTitle] MarkerVo markerTitle
         * @property {string|null} [position] MarkerVo position
         * @property {string|null} [content] MarkerVo content
         * @property {string|null} [picture] MarkerVo picture
         * @property {string|null} [videoPath] MarkerVo videoPath
         * @property {number|Long|null} [refreshTime] MarkerVo refreshTime
         * @property {number|null} [hiddenFlag] MarkerVo hiddenFlag
         * @property {Array.<protobuf.IMarkerItemLinkVo>|null} [itemList] MarkerVo itemList
         * @property {number|Long|null} [markerCreatorId] MarkerVo markerCreatorId
         * @property {number|Long|null} [pictureCreatorId] MarkerVo pictureCreatorId
         * @property {string|null} [markerStamp] MarkerVo markerStamp
         * @property {protobuf.IMarkerExtra|null} [extra] MarkerVo extra
         * @property {string|null} [linkageId] MarkerVo linkageId
         */

        /**
         * Constructs a new MarkerVo.
         * @memberof protobuf
         * @classdesc Represents a MarkerVo.
         * @implements IMarkerVo
         * @constructor
         * @param {protobuf.IMarkerVo=} [properties] Properties to set
         */
        function MarkerVo(properties) {
            this.itemList = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MarkerVo version.
         * @member {number|Long} version
         * @memberof protobuf.MarkerVo
         * @instance
         */
        MarkerVo.prototype.version = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * MarkerVo id.
         * @member {number|Long} id
         * @memberof protobuf.MarkerVo
         * @instance
         */
        MarkerVo.prototype.id = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * MarkerVo creatorId.
         * @member {number|Long} creatorId
         * @memberof protobuf.MarkerVo
         * @instance
         */
        MarkerVo.prototype.creatorId = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * MarkerVo createTime.
         * @member {number|Long|null|undefined} createTime
         * @memberof protobuf.MarkerVo
         * @instance
         */
        MarkerVo.prototype.createTime = null;

        /**
         * MarkerVo updaterId.
         * @member {number|Long} updaterId
         * @memberof protobuf.MarkerVo
         * @instance
         */
        MarkerVo.prototype.updaterId = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * MarkerVo updateTime.
         * @member {number|Long|null|undefined} updateTime
         * @memberof protobuf.MarkerVo
         * @instance
         */
        MarkerVo.prototype.updateTime = null;

        /**
         * MarkerVo markerTitle.
         * @member {string} markerTitle
         * @memberof protobuf.MarkerVo
         * @instance
         */
        MarkerVo.prototype.markerTitle = "";

        /**
         * MarkerVo position.
         * @member {string} position
         * @memberof protobuf.MarkerVo
         * @instance
         */
        MarkerVo.prototype.position = "";

        /**
         * MarkerVo content.
         * @member {string} content
         * @memberof protobuf.MarkerVo
         * @instance
         */
        MarkerVo.prototype.content = "";

        /**
         * MarkerVo picture.
         * @member {string} picture
         * @memberof protobuf.MarkerVo
         * @instance
         */
        MarkerVo.prototype.picture = "";

        /**
         * MarkerVo videoPath.
         * @member {string} videoPath
         * @memberof protobuf.MarkerVo
         * @instance
         */
        MarkerVo.prototype.videoPath = "";

        /**
         * MarkerVo refreshTime.
         * @member {number|Long} refreshTime
         * @memberof protobuf.MarkerVo
         * @instance
         */
        MarkerVo.prototype.refreshTime = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * MarkerVo hiddenFlag.
         * @member {number} hiddenFlag
         * @memberof protobuf.MarkerVo
         * @instance
         */
        MarkerVo.prototype.hiddenFlag = 0;

        /**
         * MarkerVo itemList.
         * @member {Array.<protobuf.IMarkerItemLinkVo>} itemList
         * @memberof protobuf.MarkerVo
         * @instance
         */
        MarkerVo.prototype.itemList = $util.emptyArray;

        /**
         * MarkerVo markerCreatorId.
         * @member {number|Long|null|undefined} markerCreatorId
         * @memberof protobuf.MarkerVo
         * @instance
         */
        MarkerVo.prototype.markerCreatorId = null;

        /**
         * MarkerVo pictureCreatorId.
         * @member {number|Long|null|undefined} pictureCreatorId
         * @memberof protobuf.MarkerVo
         * @instance
         */
        MarkerVo.prototype.pictureCreatorId = null;

        /**
         * MarkerVo markerStamp.
         * @member {string} markerStamp
         * @memberof protobuf.MarkerVo
         * @instance
         */
        MarkerVo.prototype.markerStamp = "";

        /**
         * MarkerVo extra.
         * @member {protobuf.IMarkerExtra|null|undefined} extra
         * @memberof protobuf.MarkerVo
         * @instance
         */
        MarkerVo.prototype.extra = null;

        /**
         * MarkerVo linkageId.
         * @member {string} linkageId
         * @memberof protobuf.MarkerVo
         * @instance
         */
        MarkerVo.prototype.linkageId = "";

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(MarkerVo.prototype, "_createTime", {
            get: $util.oneOfGetter($oneOfFields = ["createTime"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(MarkerVo.prototype, "_updateTime", {
            get: $util.oneOfGetter($oneOfFields = ["updateTime"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(MarkerVo.prototype, "_markerCreatorId", {
            get: $util.oneOfGetter($oneOfFields = ["markerCreatorId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(MarkerVo.prototype, "_pictureCreatorId", {
            get: $util.oneOfGetter($oneOfFields = ["pictureCreatorId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new MarkerVo instance using the specified properties.
         * @function create
         * @memberof protobuf.MarkerVo
         * @static
         * @param {protobuf.IMarkerVo=} [properties] Properties to set
         * @returns {protobuf.MarkerVo} MarkerVo instance
         */
        MarkerVo.create = function create(properties) {
            return new MarkerVo(properties);
        };

        /**
         * Encodes the specified MarkerVo message. Does not implicitly {@link protobuf.MarkerVo.verify|verify} messages.
         * @function encode
         * @memberof protobuf.MarkerVo
         * @static
         * @param {protobuf.IMarkerVo} message MarkerVo message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MarkerVo.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.version);
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.id);
            if (message.creatorId != null && Object.hasOwnProperty.call(message, "creatorId"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.creatorId);
            if (message.createTime != null && Object.hasOwnProperty.call(message, "createTime"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.createTime);
            if (message.updaterId != null && Object.hasOwnProperty.call(message, "updaterId"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.updaterId);
            if (message.updateTime != null && Object.hasOwnProperty.call(message, "updateTime"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint64(message.updateTime);
            if (message.markerTitle != null && Object.hasOwnProperty.call(message, "markerTitle"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.markerTitle);
            if (message.position != null && Object.hasOwnProperty.call(message, "position"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.position);
            if (message.content != null && Object.hasOwnProperty.call(message, "content"))
                writer.uint32(/* id 10, wireType 2 =*/82).string(message.content);
            if (message.picture != null && Object.hasOwnProperty.call(message, "picture"))
                writer.uint32(/* id 11, wireType 2 =*/90).string(message.picture);
            if (message.videoPath != null && Object.hasOwnProperty.call(message, "videoPath"))
                writer.uint32(/* id 12, wireType 2 =*/98).string(message.videoPath);
            if (message.refreshTime != null && Object.hasOwnProperty.call(message, "refreshTime"))
                writer.uint32(/* id 13, wireType 0 =*/104).int64(message.refreshTime);
            if (message.hiddenFlag != null && Object.hasOwnProperty.call(message, "hiddenFlag"))
                writer.uint32(/* id 14, wireType 0 =*/112).uint32(message.hiddenFlag);
            if (message.itemList != null && message.itemList.length)
                for (let i = 0; i < message.itemList.length; ++i)
                    $root.protobuf.MarkerItemLinkVo.encode(message.itemList[i], writer.uint32(/* id 15, wireType 2 =*/122).fork()).ldelim();
            if (message.markerCreatorId != null && Object.hasOwnProperty.call(message, "markerCreatorId"))
                writer.uint32(/* id 100, wireType 0 =*/800).uint64(message.markerCreatorId);
            if (message.pictureCreatorId != null && Object.hasOwnProperty.call(message, "pictureCreatorId"))
                writer.uint32(/* id 101, wireType 0 =*/808).uint64(message.pictureCreatorId);
            if (message.markerStamp != null && Object.hasOwnProperty.call(message, "markerStamp"))
                writer.uint32(/* id 200, wireType 2 =*/1602).string(message.markerStamp);
            if (message.extra != null && Object.hasOwnProperty.call(message, "extra"))
                $root.protobuf.MarkerExtra.encode(message.extra, writer.uint32(/* id 400, wireType 2 =*/3202).fork()).ldelim();
            if (message.linkageId != null && Object.hasOwnProperty.call(message, "linkageId"))
                writer.uint32(/* id 500, wireType 2 =*/4002).string(message.linkageId);
            return writer;
        };

        /**
         * Encodes the specified MarkerVo message, length delimited. Does not implicitly {@link protobuf.MarkerVo.verify|verify} messages.
         * @function encodeDelimited
         * @memberof protobuf.MarkerVo
         * @static
         * @param {protobuf.IMarkerVo} message MarkerVo message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MarkerVo.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MarkerVo message from the specified reader or buffer.
         * @function decode
         * @memberof protobuf.MarkerVo
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protobuf.MarkerVo} MarkerVo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MarkerVo.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.protobuf.MarkerVo();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.version = reader.uint64();
                        break;
                    }
                case 2: {
                        message.id = reader.uint64();
                        break;
                    }
                case 3: {
                        message.creatorId = reader.uint64();
                        break;
                    }
                case 4: {
                        message.createTime = reader.uint64();
                        break;
                    }
                case 5: {
                        message.updaterId = reader.uint64();
                        break;
                    }
                case 6: {
                        message.updateTime = reader.uint64();
                        break;
                    }
                case 8: {
                        message.markerTitle = reader.string();
                        break;
                    }
                case 9: {
                        message.position = reader.string();
                        break;
                    }
                case 10: {
                        message.content = reader.string();
                        break;
                    }
                case 11: {
                        message.picture = reader.string();
                        break;
                    }
                case 12: {
                        message.videoPath = reader.string();
                        break;
                    }
                case 13: {
                        message.refreshTime = reader.int64();
                        break;
                    }
                case 14: {
                        message.hiddenFlag = reader.uint32();
                        break;
                    }
                case 15: {
                        if (!(message.itemList && message.itemList.length))
                            message.itemList = [];
                        message.itemList.push($root.protobuf.MarkerItemLinkVo.decode(reader, reader.uint32()));
                        break;
                    }
                case 100: {
                        message.markerCreatorId = reader.uint64();
                        break;
                    }
                case 101: {
                        message.pictureCreatorId = reader.uint64();
                        break;
                    }
                case 200: {
                        message.markerStamp = reader.string();
                        break;
                    }
                case 400: {
                        message.extra = $root.protobuf.MarkerExtra.decode(reader, reader.uint32());
                        break;
                    }
                case 500: {
                        message.linkageId = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MarkerVo message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof protobuf.MarkerVo
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protobuf.MarkerVo} MarkerVo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MarkerVo.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MarkerVo message.
         * @function verify
         * @memberof protobuf.MarkerVo
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MarkerVo.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.version != null && message.hasOwnProperty("version"))
                if (!$util.isInteger(message.version) && !(message.version && $util.isInteger(message.version.low) && $util.isInteger(message.version.high)))
                    return "version: integer|Long expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                    return "id: integer|Long expected";
            if (message.creatorId != null && message.hasOwnProperty("creatorId"))
                if (!$util.isInteger(message.creatorId) && !(message.creatorId && $util.isInteger(message.creatorId.low) && $util.isInteger(message.creatorId.high)))
                    return "creatorId: integer|Long expected";
            if (message.createTime != null && message.hasOwnProperty("createTime")) {
                properties._createTime = 1;
                if (!$util.isInteger(message.createTime) && !(message.createTime && $util.isInteger(message.createTime.low) && $util.isInteger(message.createTime.high)))
                    return "createTime: integer|Long expected";
            }
            if (message.updaterId != null && message.hasOwnProperty("updaterId"))
                if (!$util.isInteger(message.updaterId) && !(message.updaterId && $util.isInteger(message.updaterId.low) && $util.isInteger(message.updaterId.high)))
                    return "updaterId: integer|Long expected";
            if (message.updateTime != null && message.hasOwnProperty("updateTime")) {
                properties._updateTime = 1;
                if (!$util.isInteger(message.updateTime) && !(message.updateTime && $util.isInteger(message.updateTime.low) && $util.isInteger(message.updateTime.high)))
                    return "updateTime: integer|Long expected";
            }
            if (message.markerTitle != null && message.hasOwnProperty("markerTitle"))
                if (!$util.isString(message.markerTitle))
                    return "markerTitle: string expected";
            if (message.position != null && message.hasOwnProperty("position"))
                if (!$util.isString(message.position))
                    return "position: string expected";
            if (message.content != null && message.hasOwnProperty("content"))
                if (!$util.isString(message.content))
                    return "content: string expected";
            if (message.picture != null && message.hasOwnProperty("picture"))
                if (!$util.isString(message.picture))
                    return "picture: string expected";
            if (message.videoPath != null && message.hasOwnProperty("videoPath"))
                if (!$util.isString(message.videoPath))
                    return "videoPath: string expected";
            if (message.refreshTime != null && message.hasOwnProperty("refreshTime"))
                if (!$util.isInteger(message.refreshTime) && !(message.refreshTime && $util.isInteger(message.refreshTime.low) && $util.isInteger(message.refreshTime.high)))
                    return "refreshTime: integer|Long expected";
            if (message.hiddenFlag != null && message.hasOwnProperty("hiddenFlag"))
                if (!$util.isInteger(message.hiddenFlag))
                    return "hiddenFlag: integer expected";
            if (message.itemList != null && message.hasOwnProperty("itemList")) {
                if (!Array.isArray(message.itemList))
                    return "itemList: array expected";
                for (let i = 0; i < message.itemList.length; ++i) {
                    let error = $root.protobuf.MarkerItemLinkVo.verify(message.itemList[i]);
                    if (error)
                        return "itemList." + error;
                }
            }
            if (message.markerCreatorId != null && message.hasOwnProperty("markerCreatorId")) {
                properties._markerCreatorId = 1;
                if (!$util.isInteger(message.markerCreatorId) && !(message.markerCreatorId && $util.isInteger(message.markerCreatorId.low) && $util.isInteger(message.markerCreatorId.high)))
                    return "markerCreatorId: integer|Long expected";
            }
            if (message.pictureCreatorId != null && message.hasOwnProperty("pictureCreatorId")) {
                properties._pictureCreatorId = 1;
                if (!$util.isInteger(message.pictureCreatorId) && !(message.pictureCreatorId && $util.isInteger(message.pictureCreatorId.low) && $util.isInteger(message.pictureCreatorId.high)))
                    return "pictureCreatorId: integer|Long expected";
            }
            if (message.markerStamp != null && message.hasOwnProperty("markerStamp"))
                if (!$util.isString(message.markerStamp))
                    return "markerStamp: string expected";
            if (message.extra != null && message.hasOwnProperty("extra")) {
                let error = $root.protobuf.MarkerExtra.verify(message.extra);
                if (error)
                    return "extra." + error;
            }
            if (message.linkageId != null && message.hasOwnProperty("linkageId"))
                if (!$util.isString(message.linkageId))
                    return "linkageId: string expected";
            return null;
        };

        /**
         * Creates a MarkerVo message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protobuf.MarkerVo
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protobuf.MarkerVo} MarkerVo
         */
        MarkerVo.fromObject = function fromObject(object) {
            if (object instanceof $root.protobuf.MarkerVo)
                return object;
            let message = new $root.protobuf.MarkerVo();
            if (object.version != null)
                if ($util.Long)
                    (message.version = $util.Long.fromValue(object.version)).unsigned = true;
                else if (typeof object.version === "string")
                    message.version = parseInt(object.version, 10);
                else if (typeof object.version === "number")
                    message.version = object.version;
                else if (typeof object.version === "object")
                    message.version = new $util.LongBits(object.version.low >>> 0, object.version.high >>> 0).toNumber(true);
            if (object.id != null)
                if ($util.Long)
                    (message.id = $util.Long.fromValue(object.id)).unsigned = true;
                else if (typeof object.id === "string")
                    message.id = parseInt(object.id, 10);
                else if (typeof object.id === "number")
                    message.id = object.id;
                else if (typeof object.id === "object")
                    message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber(true);
            if (object.creatorId != null)
                if ($util.Long)
                    (message.creatorId = $util.Long.fromValue(object.creatorId)).unsigned = true;
                else if (typeof object.creatorId === "string")
                    message.creatorId = parseInt(object.creatorId, 10);
                else if (typeof object.creatorId === "number")
                    message.creatorId = object.creatorId;
                else if (typeof object.creatorId === "object")
                    message.creatorId = new $util.LongBits(object.creatorId.low >>> 0, object.creatorId.high >>> 0).toNumber(true);
            if (object.createTime != null)
                if ($util.Long)
                    (message.createTime = $util.Long.fromValue(object.createTime)).unsigned = true;
                else if (typeof object.createTime === "string")
                    message.createTime = parseInt(object.createTime, 10);
                else if (typeof object.createTime === "number")
                    message.createTime = object.createTime;
                else if (typeof object.createTime === "object")
                    message.createTime = new $util.LongBits(object.createTime.low >>> 0, object.createTime.high >>> 0).toNumber(true);
            if (object.updaterId != null)
                if ($util.Long)
                    (message.updaterId = $util.Long.fromValue(object.updaterId)).unsigned = true;
                else if (typeof object.updaterId === "string")
                    message.updaterId = parseInt(object.updaterId, 10);
                else if (typeof object.updaterId === "number")
                    message.updaterId = object.updaterId;
                else if (typeof object.updaterId === "object")
                    message.updaterId = new $util.LongBits(object.updaterId.low >>> 0, object.updaterId.high >>> 0).toNumber(true);
            if (object.updateTime != null)
                if ($util.Long)
                    (message.updateTime = $util.Long.fromValue(object.updateTime)).unsigned = true;
                else if (typeof object.updateTime === "string")
                    message.updateTime = parseInt(object.updateTime, 10);
                else if (typeof object.updateTime === "number")
                    message.updateTime = object.updateTime;
                else if (typeof object.updateTime === "object")
                    message.updateTime = new $util.LongBits(object.updateTime.low >>> 0, object.updateTime.high >>> 0).toNumber(true);
            if (object.markerTitle != null)
                message.markerTitle = String(object.markerTitle);
            if (object.position != null)
                message.position = String(object.position);
            if (object.content != null)
                message.content = String(object.content);
            if (object.picture != null)
                message.picture = String(object.picture);
            if (object.videoPath != null)
                message.videoPath = String(object.videoPath);
            if (object.refreshTime != null)
                if ($util.Long)
                    (message.refreshTime = $util.Long.fromValue(object.refreshTime)).unsigned = false;
                else if (typeof object.refreshTime === "string")
                    message.refreshTime = parseInt(object.refreshTime, 10);
                else if (typeof object.refreshTime === "number")
                    message.refreshTime = object.refreshTime;
                else if (typeof object.refreshTime === "object")
                    message.refreshTime = new $util.LongBits(object.refreshTime.low >>> 0, object.refreshTime.high >>> 0).toNumber();
            if (object.hiddenFlag != null)
                message.hiddenFlag = object.hiddenFlag >>> 0;
            if (object.itemList) {
                if (!Array.isArray(object.itemList))
                    throw TypeError(".protobuf.MarkerVo.itemList: array expected");
                message.itemList = [];
                for (let i = 0; i < object.itemList.length; ++i) {
                    if (typeof object.itemList[i] !== "object")
                        throw TypeError(".protobuf.MarkerVo.itemList: object expected");
                    message.itemList[i] = $root.protobuf.MarkerItemLinkVo.fromObject(object.itemList[i]);
                }
            }
            if (object.markerCreatorId != null)
                if ($util.Long)
                    (message.markerCreatorId = $util.Long.fromValue(object.markerCreatorId)).unsigned = true;
                else if (typeof object.markerCreatorId === "string")
                    message.markerCreatorId = parseInt(object.markerCreatorId, 10);
                else if (typeof object.markerCreatorId === "number")
                    message.markerCreatorId = object.markerCreatorId;
                else if (typeof object.markerCreatorId === "object")
                    message.markerCreatorId = new $util.LongBits(object.markerCreatorId.low >>> 0, object.markerCreatorId.high >>> 0).toNumber(true);
            if (object.pictureCreatorId != null)
                if ($util.Long)
                    (message.pictureCreatorId = $util.Long.fromValue(object.pictureCreatorId)).unsigned = true;
                else if (typeof object.pictureCreatorId === "string")
                    message.pictureCreatorId = parseInt(object.pictureCreatorId, 10);
                else if (typeof object.pictureCreatorId === "number")
                    message.pictureCreatorId = object.pictureCreatorId;
                else if (typeof object.pictureCreatorId === "object")
                    message.pictureCreatorId = new $util.LongBits(object.pictureCreatorId.low >>> 0, object.pictureCreatorId.high >>> 0).toNumber(true);
            if (object.markerStamp != null)
                message.markerStamp = String(object.markerStamp);
            if (object.extra != null) {
                if (typeof object.extra !== "object")
                    throw TypeError(".protobuf.MarkerVo.extra: object expected");
                message.extra = $root.protobuf.MarkerExtra.fromObject(object.extra);
            }
            if (object.linkageId != null)
                message.linkageId = String(object.linkageId);
            return message;
        };

        /**
         * Creates a plain object from a MarkerVo message. Also converts values to other types if specified.
         * @function toObject
         * @memberof protobuf.MarkerVo
         * @static
         * @param {protobuf.MarkerVo} message MarkerVo
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MarkerVo.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.itemList = [];
            if (options.defaults) {
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.version = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.version = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.id = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.creatorId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.creatorId = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.updaterId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.updaterId = options.longs === String ? "0" : 0;
                object.markerTitle = "";
                object.position = "";
                object.content = "";
                object.picture = "";
                object.videoPath = "";
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.refreshTime = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.refreshTime = options.longs === String ? "0" : 0;
                object.hiddenFlag = 0;
                object.markerStamp = "";
                object.extra = null;
                object.linkageId = "";
            }
            if (message.version != null && message.hasOwnProperty("version"))
                if (typeof message.version === "number")
                    object.version = options.longs === String ? String(message.version) : message.version;
                else
                    object.version = options.longs === String ? $util.Long.prototype.toString.call(message.version) : options.longs === Number ? new $util.LongBits(message.version.low >>> 0, message.version.high >>> 0).toNumber(true) : message.version;
            if (message.id != null && message.hasOwnProperty("id"))
                if (typeof message.id === "number")
                    object.id = options.longs === String ? String(message.id) : message.id;
                else
                    object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
            if (message.creatorId != null && message.hasOwnProperty("creatorId"))
                if (typeof message.creatorId === "number")
                    object.creatorId = options.longs === String ? String(message.creatorId) : message.creatorId;
                else
                    object.creatorId = options.longs === String ? $util.Long.prototype.toString.call(message.creatorId) : options.longs === Number ? new $util.LongBits(message.creatorId.low >>> 0, message.creatorId.high >>> 0).toNumber(true) : message.creatorId;
            if (message.createTime != null && message.hasOwnProperty("createTime")) {
                if (typeof message.createTime === "number")
                    object.createTime = options.longs === String ? String(message.createTime) : message.createTime;
                else
                    object.createTime = options.longs === String ? $util.Long.prototype.toString.call(message.createTime) : options.longs === Number ? new $util.LongBits(message.createTime.low >>> 0, message.createTime.high >>> 0).toNumber(true) : message.createTime;
                if (options.oneofs)
                    object._createTime = "createTime";
            }
            if (message.updaterId != null && message.hasOwnProperty("updaterId"))
                if (typeof message.updaterId === "number")
                    object.updaterId = options.longs === String ? String(message.updaterId) : message.updaterId;
                else
                    object.updaterId = options.longs === String ? $util.Long.prototype.toString.call(message.updaterId) : options.longs === Number ? new $util.LongBits(message.updaterId.low >>> 0, message.updaterId.high >>> 0).toNumber(true) : message.updaterId;
            if (message.updateTime != null && message.hasOwnProperty("updateTime")) {
                if (typeof message.updateTime === "number")
                    object.updateTime = options.longs === String ? String(message.updateTime) : message.updateTime;
                else
                    object.updateTime = options.longs === String ? $util.Long.prototype.toString.call(message.updateTime) : options.longs === Number ? new $util.LongBits(message.updateTime.low >>> 0, message.updateTime.high >>> 0).toNumber(true) : message.updateTime;
                if (options.oneofs)
                    object._updateTime = "updateTime";
            }
            if (message.markerTitle != null && message.hasOwnProperty("markerTitle"))
                object.markerTitle = message.markerTitle;
            if (message.position != null && message.hasOwnProperty("position"))
                object.position = message.position;
            if (message.content != null && message.hasOwnProperty("content"))
                object.content = message.content;
            if (message.picture != null && message.hasOwnProperty("picture"))
                object.picture = message.picture;
            if (message.videoPath != null && message.hasOwnProperty("videoPath"))
                object.videoPath = message.videoPath;
            if (message.refreshTime != null && message.hasOwnProperty("refreshTime"))
                if (typeof message.refreshTime === "number")
                    object.refreshTime = options.longs === String ? String(message.refreshTime) : message.refreshTime;
                else
                    object.refreshTime = options.longs === String ? $util.Long.prototype.toString.call(message.refreshTime) : options.longs === Number ? new $util.LongBits(message.refreshTime.low >>> 0, message.refreshTime.high >>> 0).toNumber() : message.refreshTime;
            if (message.hiddenFlag != null && message.hasOwnProperty("hiddenFlag"))
                object.hiddenFlag = message.hiddenFlag;
            if (message.itemList && message.itemList.length) {
                object.itemList = [];
                for (let j = 0; j < message.itemList.length; ++j)
                    object.itemList[j] = $root.protobuf.MarkerItemLinkVo.toObject(message.itemList[j], options);
            }
            if (message.markerCreatorId != null && message.hasOwnProperty("markerCreatorId")) {
                if (typeof message.markerCreatorId === "number")
                    object.markerCreatorId = options.longs === String ? String(message.markerCreatorId) : message.markerCreatorId;
                else
                    object.markerCreatorId = options.longs === String ? $util.Long.prototype.toString.call(message.markerCreatorId) : options.longs === Number ? new $util.LongBits(message.markerCreatorId.low >>> 0, message.markerCreatorId.high >>> 0).toNumber(true) : message.markerCreatorId;
                if (options.oneofs)
                    object._markerCreatorId = "markerCreatorId";
            }
            if (message.pictureCreatorId != null && message.hasOwnProperty("pictureCreatorId")) {
                if (typeof message.pictureCreatorId === "number")
                    object.pictureCreatorId = options.longs === String ? String(message.pictureCreatorId) : message.pictureCreatorId;
                else
                    object.pictureCreatorId = options.longs === String ? $util.Long.prototype.toString.call(message.pictureCreatorId) : options.longs === Number ? new $util.LongBits(message.pictureCreatorId.low >>> 0, message.pictureCreatorId.high >>> 0).toNumber(true) : message.pictureCreatorId;
                if (options.oneofs)
                    object._pictureCreatorId = "pictureCreatorId";
            }
            if (message.markerStamp != null && message.hasOwnProperty("markerStamp"))
                object.markerStamp = message.markerStamp;
            if (message.extra != null && message.hasOwnProperty("extra"))
                object.extra = $root.protobuf.MarkerExtra.toObject(message.extra, options);
            if (message.linkageId != null && message.hasOwnProperty("linkageId"))
                object.linkageId = message.linkageId;
            return object;
        };

        /**
         * Converts this MarkerVo to JSON.
         * @function toJSON
         * @memberof protobuf.MarkerVo
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MarkerVo.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MarkerVo
         * @function getTypeUrl
         * @memberof protobuf.MarkerVo
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MarkerVo.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protobuf.MarkerVo";
        };

        return MarkerVo;
    })();

    protobuf.MarkerItemLinkVo = (function() {

        /**
         * Properties of a MarkerItemLinkVo.
         * @memberof protobuf
         * @interface IMarkerItemLinkVo
         * @property {number|Long|null} [itemId] MarkerItemLinkVo itemId
         * @property {number|Long|null} [iconId] MarkerItemLinkVo iconId
         * @property {number|null} [count] MarkerItemLinkVo count
         */

        /**
         * Constructs a new MarkerItemLinkVo.
         * @memberof protobuf
         * @classdesc Represents a MarkerItemLinkVo.
         * @implements IMarkerItemLinkVo
         * @constructor
         * @param {protobuf.IMarkerItemLinkVo=} [properties] Properties to set
         */
        function MarkerItemLinkVo(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MarkerItemLinkVo itemId.
         * @member {number|Long} itemId
         * @memberof protobuf.MarkerItemLinkVo
         * @instance
         */
        MarkerItemLinkVo.prototype.itemId = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * MarkerItemLinkVo iconId.
         * @member {number|Long} iconId
         * @memberof protobuf.MarkerItemLinkVo
         * @instance
         */
        MarkerItemLinkVo.prototype.iconId = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * MarkerItemLinkVo count.
         * @member {number} count
         * @memberof protobuf.MarkerItemLinkVo
         * @instance
         */
        MarkerItemLinkVo.prototype.count = 0;

        /**
         * Creates a new MarkerItemLinkVo instance using the specified properties.
         * @function create
         * @memberof protobuf.MarkerItemLinkVo
         * @static
         * @param {protobuf.IMarkerItemLinkVo=} [properties] Properties to set
         * @returns {protobuf.MarkerItemLinkVo} MarkerItemLinkVo instance
         */
        MarkerItemLinkVo.create = function create(properties) {
            return new MarkerItemLinkVo(properties);
        };

        /**
         * Encodes the specified MarkerItemLinkVo message. Does not implicitly {@link protobuf.MarkerItemLinkVo.verify|verify} messages.
         * @function encode
         * @memberof protobuf.MarkerItemLinkVo
         * @static
         * @param {protobuf.IMarkerItemLinkVo} message MarkerItemLinkVo message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MarkerItemLinkVo.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.itemId != null && Object.hasOwnProperty.call(message, "itemId"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.itemId);
            if (message.iconId != null && Object.hasOwnProperty.call(message, "iconId"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.iconId);
            if (message.count != null && Object.hasOwnProperty.call(message, "count"))
                writer.uint32(/* id 10, wireType 0 =*/80).uint32(message.count);
            return writer;
        };

        /**
         * Encodes the specified MarkerItemLinkVo message, length delimited. Does not implicitly {@link protobuf.MarkerItemLinkVo.verify|verify} messages.
         * @function encodeDelimited
         * @memberof protobuf.MarkerItemLinkVo
         * @static
         * @param {protobuf.IMarkerItemLinkVo} message MarkerItemLinkVo message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MarkerItemLinkVo.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MarkerItemLinkVo message from the specified reader or buffer.
         * @function decode
         * @memberof protobuf.MarkerItemLinkVo
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protobuf.MarkerItemLinkVo} MarkerItemLinkVo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MarkerItemLinkVo.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.protobuf.MarkerItemLinkVo();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.itemId = reader.uint64();
                        break;
                    }
                case 2: {
                        message.iconId = reader.uint64();
                        break;
                    }
                case 10: {
                        message.count = reader.uint32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MarkerItemLinkVo message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof protobuf.MarkerItemLinkVo
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protobuf.MarkerItemLinkVo} MarkerItemLinkVo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MarkerItemLinkVo.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MarkerItemLinkVo message.
         * @function verify
         * @memberof protobuf.MarkerItemLinkVo
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MarkerItemLinkVo.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.itemId != null && message.hasOwnProperty("itemId"))
                if (!$util.isInteger(message.itemId) && !(message.itemId && $util.isInteger(message.itemId.low) && $util.isInteger(message.itemId.high)))
                    return "itemId: integer|Long expected";
            if (message.iconId != null && message.hasOwnProperty("iconId"))
                if (!$util.isInteger(message.iconId) && !(message.iconId && $util.isInteger(message.iconId.low) && $util.isInteger(message.iconId.high)))
                    return "iconId: integer|Long expected";
            if (message.count != null && message.hasOwnProperty("count"))
                if (!$util.isInteger(message.count))
                    return "count: integer expected";
            return null;
        };

        /**
         * Creates a MarkerItemLinkVo message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protobuf.MarkerItemLinkVo
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protobuf.MarkerItemLinkVo} MarkerItemLinkVo
         */
        MarkerItemLinkVo.fromObject = function fromObject(object) {
            if (object instanceof $root.protobuf.MarkerItemLinkVo)
                return object;
            let message = new $root.protobuf.MarkerItemLinkVo();
            if (object.itemId != null)
                if ($util.Long)
                    (message.itemId = $util.Long.fromValue(object.itemId)).unsigned = true;
                else if (typeof object.itemId === "string")
                    message.itemId = parseInt(object.itemId, 10);
                else if (typeof object.itemId === "number")
                    message.itemId = object.itemId;
                else if (typeof object.itemId === "object")
                    message.itemId = new $util.LongBits(object.itemId.low >>> 0, object.itemId.high >>> 0).toNumber(true);
            if (object.iconId != null)
                if ($util.Long)
                    (message.iconId = $util.Long.fromValue(object.iconId)).unsigned = true;
                else if (typeof object.iconId === "string")
                    message.iconId = parseInt(object.iconId, 10);
                else if (typeof object.iconId === "number")
                    message.iconId = object.iconId;
                else if (typeof object.iconId === "object")
                    message.iconId = new $util.LongBits(object.iconId.low >>> 0, object.iconId.high >>> 0).toNumber(true);
            if (object.count != null)
                message.count = object.count >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a MarkerItemLinkVo message. Also converts values to other types if specified.
         * @function toObject
         * @memberof protobuf.MarkerItemLinkVo
         * @static
         * @param {protobuf.MarkerItemLinkVo} message MarkerItemLinkVo
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MarkerItemLinkVo.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.itemId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.itemId = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.iconId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.iconId = options.longs === String ? "0" : 0;
                object.count = 0;
            }
            if (message.itemId != null && message.hasOwnProperty("itemId"))
                if (typeof message.itemId === "number")
                    object.itemId = options.longs === String ? String(message.itemId) : message.itemId;
                else
                    object.itemId = options.longs === String ? $util.Long.prototype.toString.call(message.itemId) : options.longs === Number ? new $util.LongBits(message.itemId.low >>> 0, message.itemId.high >>> 0).toNumber(true) : message.itemId;
            if (message.iconId != null && message.hasOwnProperty("iconId"))
                if (typeof message.iconId === "number")
                    object.iconId = options.longs === String ? String(message.iconId) : message.iconId;
                else
                    object.iconId = options.longs === String ? $util.Long.prototype.toString.call(message.iconId) : options.longs === Number ? new $util.LongBits(message.iconId.low >>> 0, message.iconId.high >>> 0).toNumber(true) : message.iconId;
            if (message.count != null && message.hasOwnProperty("count"))
                object.count = message.count;
            return object;
        };

        /**
         * Converts this MarkerItemLinkVo to JSON.
         * @function toJSON
         * @memberof protobuf.MarkerItemLinkVo
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MarkerItemLinkVo.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MarkerItemLinkVo
         * @function getTypeUrl
         * @memberof protobuf.MarkerItemLinkVo
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MarkerItemLinkVo.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protobuf.MarkerItemLinkVo";
        };

        return MarkerItemLinkVo;
    })();

    protobuf.MarkerExtra = (function() {

        /**
         * Properties of a MarkerExtra.
         * @memberof protobuf
         * @interface IMarkerExtra
         * @property {protobuf.IMarkerExtraUnderground|null} [underground] MarkerExtra underground
         * @property {protobuf.IMarkerExtraIconOverride|null} [iconOverride] MarkerExtra iconOverride
         * @property {Array.<string>|null} [v_1_6Island] MarkerExtra v_1_6Island
         * @property {protobuf.IMarkerExtra28Island|null} [v_2_8Island] MarkerExtra v_2_8Island
         */

        /**
         * Constructs a new MarkerExtra.
         * @memberof protobuf
         * @classdesc Represents a MarkerExtra.
         * @implements IMarkerExtra
         * @constructor
         * @param {protobuf.IMarkerExtra=} [properties] Properties to set
         */
        function MarkerExtra(properties) {
            this.v_1_6Island = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MarkerExtra underground.
         * @member {protobuf.IMarkerExtraUnderground|null|undefined} underground
         * @memberof protobuf.MarkerExtra
         * @instance
         */
        MarkerExtra.prototype.underground = null;

        /**
         * MarkerExtra iconOverride.
         * @member {protobuf.IMarkerExtraIconOverride|null|undefined} iconOverride
         * @memberof protobuf.MarkerExtra
         * @instance
         */
        MarkerExtra.prototype.iconOverride = null;

        /**
         * MarkerExtra v_1_6Island.
         * @member {Array.<string>} v_1_6Island
         * @memberof protobuf.MarkerExtra
         * @instance
         */
        MarkerExtra.prototype.v_1_6Island = $util.emptyArray;

        /**
         * MarkerExtra v_2_8Island.
         * @member {protobuf.IMarkerExtra28Island|null|undefined} v_2_8Island
         * @memberof protobuf.MarkerExtra
         * @instance
         */
        MarkerExtra.prototype.v_2_8Island = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(MarkerExtra.prototype, "_underground", {
            get: $util.oneOfGetter($oneOfFields = ["underground"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(MarkerExtra.prototype, "_iconOverride", {
            get: $util.oneOfGetter($oneOfFields = ["iconOverride"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(MarkerExtra.prototype, "_v_2_8Island", {
            get: $util.oneOfGetter($oneOfFields = ["v_2_8Island"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new MarkerExtra instance using the specified properties.
         * @function create
         * @memberof protobuf.MarkerExtra
         * @static
         * @param {protobuf.IMarkerExtra=} [properties] Properties to set
         * @returns {protobuf.MarkerExtra} MarkerExtra instance
         */
        MarkerExtra.create = function create(properties) {
            return new MarkerExtra(properties);
        };

        /**
         * Encodes the specified MarkerExtra message. Does not implicitly {@link protobuf.MarkerExtra.verify|verify} messages.
         * @function encode
         * @memberof protobuf.MarkerExtra
         * @static
         * @param {protobuf.IMarkerExtra} message MarkerExtra message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MarkerExtra.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.underground != null && Object.hasOwnProperty.call(message, "underground"))
                $root.protobuf.MarkerExtraUnderground.encode(message.underground, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.iconOverride != null && Object.hasOwnProperty.call(message, "iconOverride"))
                $root.protobuf.MarkerExtraIconOverride.encode(message.iconOverride, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.v_1_6Island != null && message.v_1_6Island.length)
                for (let i = 0; i < message.v_1_6Island.length; ++i)
                    writer.uint32(/* id 100, wireType 2 =*/802).string(message.v_1_6Island[i]);
            if (message.v_2_8Island != null && Object.hasOwnProperty.call(message, "v_2_8Island"))
                $root.protobuf.MarkerExtra28Island.encode(message.v_2_8Island, writer.uint32(/* id 101, wireType 2 =*/810).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified MarkerExtra message, length delimited. Does not implicitly {@link protobuf.MarkerExtra.verify|verify} messages.
         * @function encodeDelimited
         * @memberof protobuf.MarkerExtra
         * @static
         * @param {protobuf.IMarkerExtra} message MarkerExtra message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MarkerExtra.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MarkerExtra message from the specified reader or buffer.
         * @function decode
         * @memberof protobuf.MarkerExtra
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protobuf.MarkerExtra} MarkerExtra
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MarkerExtra.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.protobuf.MarkerExtra();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.underground = $root.protobuf.MarkerExtraUnderground.decode(reader, reader.uint32());
                        break;
                    }
                case 2: {
                        message.iconOverride = $root.protobuf.MarkerExtraIconOverride.decode(reader, reader.uint32());
                        break;
                    }
                case 100: {
                        if (!(message.v_1_6Island && message.v_1_6Island.length))
                            message.v_1_6Island = [];
                        message.v_1_6Island.push(reader.string());
                        break;
                    }
                case 101: {
                        message.v_2_8Island = $root.protobuf.MarkerExtra28Island.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MarkerExtra message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof protobuf.MarkerExtra
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protobuf.MarkerExtra} MarkerExtra
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MarkerExtra.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MarkerExtra message.
         * @function verify
         * @memberof protobuf.MarkerExtra
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MarkerExtra.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.underground != null && message.hasOwnProperty("underground")) {
                properties._underground = 1;
                {
                    let error = $root.protobuf.MarkerExtraUnderground.verify(message.underground);
                    if (error)
                        return "underground." + error;
                }
            }
            if (message.iconOverride != null && message.hasOwnProperty("iconOverride")) {
                properties._iconOverride = 1;
                {
                    let error = $root.protobuf.MarkerExtraIconOverride.verify(message.iconOverride);
                    if (error)
                        return "iconOverride." + error;
                }
            }
            if (message.v_1_6Island != null && message.hasOwnProperty("v_1_6Island")) {
                if (!Array.isArray(message.v_1_6Island))
                    return "v_1_6Island: array expected";
                for (let i = 0; i < message.v_1_6Island.length; ++i)
                    if (!$util.isString(message.v_1_6Island[i]))
                        return "v_1_6Island: string[] expected";
            }
            if (message.v_2_8Island != null && message.hasOwnProperty("v_2_8Island")) {
                properties._v_2_8Island = 1;
                {
                    let error = $root.protobuf.MarkerExtra28Island.verify(message.v_2_8Island);
                    if (error)
                        return "v_2_8Island." + error;
                }
            }
            return null;
        };

        /**
         * Creates a MarkerExtra message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protobuf.MarkerExtra
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protobuf.MarkerExtra} MarkerExtra
         */
        MarkerExtra.fromObject = function fromObject(object) {
            if (object instanceof $root.protobuf.MarkerExtra)
                return object;
            let message = new $root.protobuf.MarkerExtra();
            if (object.underground != null) {
                if (typeof object.underground !== "object")
                    throw TypeError(".protobuf.MarkerExtra.underground: object expected");
                message.underground = $root.protobuf.MarkerExtraUnderground.fromObject(object.underground);
            }
            if (object.iconOverride != null) {
                if (typeof object.iconOverride !== "object")
                    throw TypeError(".protobuf.MarkerExtra.iconOverride: object expected");
                message.iconOverride = $root.protobuf.MarkerExtraIconOverride.fromObject(object.iconOverride);
            }
            if (object.v_1_6Island) {
                if (!Array.isArray(object.v_1_6Island))
                    throw TypeError(".protobuf.MarkerExtra.v_1_6Island: array expected");
                message.v_1_6Island = [];
                for (let i = 0; i < object.v_1_6Island.length; ++i)
                    message.v_1_6Island[i] = String(object.v_1_6Island[i]);
            }
            if (object.v_2_8Island != null) {
                if (typeof object.v_2_8Island !== "object")
                    throw TypeError(".protobuf.MarkerExtra.v_2_8Island: object expected");
                message.v_2_8Island = $root.protobuf.MarkerExtra28Island.fromObject(object.v_2_8Island);
            }
            return message;
        };

        /**
         * Creates a plain object from a MarkerExtra message. Also converts values to other types if specified.
         * @function toObject
         * @memberof protobuf.MarkerExtra
         * @static
         * @param {protobuf.MarkerExtra} message MarkerExtra
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MarkerExtra.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.v_1_6Island = [];
            if (message.underground != null && message.hasOwnProperty("underground")) {
                object.underground = $root.protobuf.MarkerExtraUnderground.toObject(message.underground, options);
                if (options.oneofs)
                    object._underground = "underground";
            }
            if (message.iconOverride != null && message.hasOwnProperty("iconOverride")) {
                object.iconOverride = $root.protobuf.MarkerExtraIconOverride.toObject(message.iconOverride, options);
                if (options.oneofs)
                    object._iconOverride = "iconOverride";
            }
            if (message.v_1_6Island && message.v_1_6Island.length) {
                object.v_1_6Island = [];
                for (let j = 0; j < message.v_1_6Island.length; ++j)
                    object.v_1_6Island[j] = message.v_1_6Island[j];
            }
            if (message.v_2_8Island != null && message.hasOwnProperty("v_2_8Island")) {
                object.v_2_8Island = $root.protobuf.MarkerExtra28Island.toObject(message.v_2_8Island, options);
                if (options.oneofs)
                    object._v_2_8Island = "v_2_8Island";
            }
            return object;
        };

        /**
         * Converts this MarkerExtra to JSON.
         * @function toJSON
         * @memberof protobuf.MarkerExtra
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MarkerExtra.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MarkerExtra
         * @function getTypeUrl
         * @memberof protobuf.MarkerExtra
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MarkerExtra.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protobuf.MarkerExtra";
        };

        return MarkerExtra;
    })();

    protobuf.MarkerExtraUnderground = (function() {

        /**
         * Properties of a MarkerExtraUnderground.
         * @memberof protobuf
         * @interface IMarkerExtraUnderground
         * @property {boolean|null} [isUnderground] MarkerExtraUnderground isUnderground
         * @property {boolean|null} [isGlobal] MarkerExtraUnderground isGlobal
         * @property {Array.<string>|null} [regionLevels] MarkerExtraUnderground regionLevels
         */

        /**
         * Constructs a new MarkerExtraUnderground.
         * @memberof protobuf
         * @classdesc Represents a MarkerExtraUnderground.
         * @implements IMarkerExtraUnderground
         * @constructor
         * @param {protobuf.IMarkerExtraUnderground=} [properties] Properties to set
         */
        function MarkerExtraUnderground(properties) {
            this.regionLevels = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MarkerExtraUnderground isUnderground.
         * @member {boolean} isUnderground
         * @memberof protobuf.MarkerExtraUnderground
         * @instance
         */
        MarkerExtraUnderground.prototype.isUnderground = false;

        /**
         * MarkerExtraUnderground isGlobal.
         * @member {boolean|null|undefined} isGlobal
         * @memberof protobuf.MarkerExtraUnderground
         * @instance
         */
        MarkerExtraUnderground.prototype.isGlobal = null;

        /**
         * MarkerExtraUnderground regionLevels.
         * @member {Array.<string>} regionLevels
         * @memberof protobuf.MarkerExtraUnderground
         * @instance
         */
        MarkerExtraUnderground.prototype.regionLevels = $util.emptyArray;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(MarkerExtraUnderground.prototype, "_isGlobal", {
            get: $util.oneOfGetter($oneOfFields = ["isGlobal"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new MarkerExtraUnderground instance using the specified properties.
         * @function create
         * @memberof protobuf.MarkerExtraUnderground
         * @static
         * @param {protobuf.IMarkerExtraUnderground=} [properties] Properties to set
         * @returns {protobuf.MarkerExtraUnderground} MarkerExtraUnderground instance
         */
        MarkerExtraUnderground.create = function create(properties) {
            return new MarkerExtraUnderground(properties);
        };

        /**
         * Encodes the specified MarkerExtraUnderground message. Does not implicitly {@link protobuf.MarkerExtraUnderground.verify|verify} messages.
         * @function encode
         * @memberof protobuf.MarkerExtraUnderground
         * @static
         * @param {protobuf.IMarkerExtraUnderground} message MarkerExtraUnderground message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MarkerExtraUnderground.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.isUnderground != null && Object.hasOwnProperty.call(message, "isUnderground"))
                writer.uint32(/* id 1, wireType 0 =*/8).bool(message.isUnderground);
            if (message.isGlobal != null && Object.hasOwnProperty.call(message, "isGlobal"))
                writer.uint32(/* id 2, wireType 0 =*/16).bool(message.isGlobal);
            if (message.regionLevels != null && message.regionLevels.length)
                for (let i = 0; i < message.regionLevels.length; ++i)
                    writer.uint32(/* id 9, wireType 2 =*/74).string(message.regionLevels[i]);
            return writer;
        };

        /**
         * Encodes the specified MarkerExtraUnderground message, length delimited. Does not implicitly {@link protobuf.MarkerExtraUnderground.verify|verify} messages.
         * @function encodeDelimited
         * @memberof protobuf.MarkerExtraUnderground
         * @static
         * @param {protobuf.IMarkerExtraUnderground} message MarkerExtraUnderground message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MarkerExtraUnderground.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MarkerExtraUnderground message from the specified reader or buffer.
         * @function decode
         * @memberof protobuf.MarkerExtraUnderground
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protobuf.MarkerExtraUnderground} MarkerExtraUnderground
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MarkerExtraUnderground.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.protobuf.MarkerExtraUnderground();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.isUnderground = reader.bool();
                        break;
                    }
                case 2: {
                        message.isGlobal = reader.bool();
                        break;
                    }
                case 9: {
                        if (!(message.regionLevels && message.regionLevels.length))
                            message.regionLevels = [];
                        message.regionLevels.push(reader.string());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MarkerExtraUnderground message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof protobuf.MarkerExtraUnderground
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protobuf.MarkerExtraUnderground} MarkerExtraUnderground
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MarkerExtraUnderground.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MarkerExtraUnderground message.
         * @function verify
         * @memberof protobuf.MarkerExtraUnderground
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MarkerExtraUnderground.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.isUnderground != null && message.hasOwnProperty("isUnderground"))
                if (typeof message.isUnderground !== "boolean")
                    return "isUnderground: boolean expected";
            if (message.isGlobal != null && message.hasOwnProperty("isGlobal")) {
                properties._isGlobal = 1;
                if (typeof message.isGlobal !== "boolean")
                    return "isGlobal: boolean expected";
            }
            if (message.regionLevels != null && message.hasOwnProperty("regionLevels")) {
                if (!Array.isArray(message.regionLevels))
                    return "regionLevels: array expected";
                for (let i = 0; i < message.regionLevels.length; ++i)
                    if (!$util.isString(message.regionLevels[i]))
                        return "regionLevels: string[] expected";
            }
            return null;
        };

        /**
         * Creates a MarkerExtraUnderground message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protobuf.MarkerExtraUnderground
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protobuf.MarkerExtraUnderground} MarkerExtraUnderground
         */
        MarkerExtraUnderground.fromObject = function fromObject(object) {
            if (object instanceof $root.protobuf.MarkerExtraUnderground)
                return object;
            let message = new $root.protobuf.MarkerExtraUnderground();
            if (object.isUnderground != null)
                message.isUnderground = Boolean(object.isUnderground);
            if (object.isGlobal != null)
                message.isGlobal = Boolean(object.isGlobal);
            if (object.regionLevels) {
                if (!Array.isArray(object.regionLevels))
                    throw TypeError(".protobuf.MarkerExtraUnderground.regionLevels: array expected");
                message.regionLevels = [];
                for (let i = 0; i < object.regionLevels.length; ++i)
                    message.regionLevels[i] = String(object.regionLevels[i]);
            }
            return message;
        };

        /**
         * Creates a plain object from a MarkerExtraUnderground message. Also converts values to other types if specified.
         * @function toObject
         * @memberof protobuf.MarkerExtraUnderground
         * @static
         * @param {protobuf.MarkerExtraUnderground} message MarkerExtraUnderground
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MarkerExtraUnderground.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.regionLevels = [];
            if (options.defaults)
                object.isUnderground = false;
            if (message.isUnderground != null && message.hasOwnProperty("isUnderground"))
                object.isUnderground = message.isUnderground;
            if (message.isGlobal != null && message.hasOwnProperty("isGlobal")) {
                object.isGlobal = message.isGlobal;
                if (options.oneofs)
                    object._isGlobal = "isGlobal";
            }
            if (message.regionLevels && message.regionLevels.length) {
                object.regionLevels = [];
                for (let j = 0; j < message.regionLevels.length; ++j)
                    object.regionLevels[j] = message.regionLevels[j];
            }
            return object;
        };

        /**
         * Converts this MarkerExtraUnderground to JSON.
         * @function toJSON
         * @memberof protobuf.MarkerExtraUnderground
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MarkerExtraUnderground.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MarkerExtraUnderground
         * @function getTypeUrl
         * @memberof protobuf.MarkerExtraUnderground
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MarkerExtraUnderground.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protobuf.MarkerExtraUnderground";
        };

        return MarkerExtraUnderground;
    })();

    protobuf.MarkerExtraIconOverride = (function() {

        /**
         * Properties of a MarkerExtraIconOverride.
         * @memberof protobuf
         * @interface IMarkerExtraIconOverride
         * @property {number|Long|null} [id] MarkerExtraIconOverride id
         * @property {number|null} [minZoom] MarkerExtraIconOverride minZoom
         * @property {number|null} [maxZoom] MarkerExtraIconOverride maxZoom
         */

        /**
         * Constructs a new MarkerExtraIconOverride.
         * @memberof protobuf
         * @classdesc Represents a MarkerExtraIconOverride.
         * @implements IMarkerExtraIconOverride
         * @constructor
         * @param {protobuf.IMarkerExtraIconOverride=} [properties] Properties to set
         */
        function MarkerExtraIconOverride(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MarkerExtraIconOverride id.
         * @member {number|Long} id
         * @memberof protobuf.MarkerExtraIconOverride
         * @instance
         */
        MarkerExtraIconOverride.prototype.id = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * MarkerExtraIconOverride minZoom.
         * @member {number} minZoom
         * @memberof protobuf.MarkerExtraIconOverride
         * @instance
         */
        MarkerExtraIconOverride.prototype.minZoom = 0;

        /**
         * MarkerExtraIconOverride maxZoom.
         * @member {number} maxZoom
         * @memberof protobuf.MarkerExtraIconOverride
         * @instance
         */
        MarkerExtraIconOverride.prototype.maxZoom = 0;

        /**
         * Creates a new MarkerExtraIconOverride instance using the specified properties.
         * @function create
         * @memberof protobuf.MarkerExtraIconOverride
         * @static
         * @param {protobuf.IMarkerExtraIconOverride=} [properties] Properties to set
         * @returns {protobuf.MarkerExtraIconOverride} MarkerExtraIconOverride instance
         */
        MarkerExtraIconOverride.create = function create(properties) {
            return new MarkerExtraIconOverride(properties);
        };

        /**
         * Encodes the specified MarkerExtraIconOverride message. Does not implicitly {@link protobuf.MarkerExtraIconOverride.verify|verify} messages.
         * @function encode
         * @memberof protobuf.MarkerExtraIconOverride
         * @static
         * @param {protobuf.IMarkerExtraIconOverride} message MarkerExtraIconOverride message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MarkerExtraIconOverride.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.id);
            if (message.minZoom != null && Object.hasOwnProperty.call(message, "minZoom"))
                writer.uint32(/* id 2, wireType 5 =*/21).float(message.minZoom);
            if (message.maxZoom != null && Object.hasOwnProperty.call(message, "maxZoom"))
                writer.uint32(/* id 3, wireType 5 =*/29).float(message.maxZoom);
            return writer;
        };

        /**
         * Encodes the specified MarkerExtraIconOverride message, length delimited. Does not implicitly {@link protobuf.MarkerExtraIconOverride.verify|verify} messages.
         * @function encodeDelimited
         * @memberof protobuf.MarkerExtraIconOverride
         * @static
         * @param {protobuf.IMarkerExtraIconOverride} message MarkerExtraIconOverride message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MarkerExtraIconOverride.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MarkerExtraIconOverride message from the specified reader or buffer.
         * @function decode
         * @memberof protobuf.MarkerExtraIconOverride
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protobuf.MarkerExtraIconOverride} MarkerExtraIconOverride
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MarkerExtraIconOverride.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.protobuf.MarkerExtraIconOverride();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.uint64();
                        break;
                    }
                case 2: {
                        message.minZoom = reader.float();
                        break;
                    }
                case 3: {
                        message.maxZoom = reader.float();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MarkerExtraIconOverride message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof protobuf.MarkerExtraIconOverride
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protobuf.MarkerExtraIconOverride} MarkerExtraIconOverride
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MarkerExtraIconOverride.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MarkerExtraIconOverride message.
         * @function verify
         * @memberof protobuf.MarkerExtraIconOverride
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MarkerExtraIconOverride.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                    return "id: integer|Long expected";
            if (message.minZoom != null && message.hasOwnProperty("minZoom"))
                if (typeof message.minZoom !== "number")
                    return "minZoom: number expected";
            if (message.maxZoom != null && message.hasOwnProperty("maxZoom"))
                if (typeof message.maxZoom !== "number")
                    return "maxZoom: number expected";
            return null;
        };

        /**
         * Creates a MarkerExtraIconOverride message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protobuf.MarkerExtraIconOverride
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protobuf.MarkerExtraIconOverride} MarkerExtraIconOverride
         */
        MarkerExtraIconOverride.fromObject = function fromObject(object) {
            if (object instanceof $root.protobuf.MarkerExtraIconOverride)
                return object;
            let message = new $root.protobuf.MarkerExtraIconOverride();
            if (object.id != null)
                if ($util.Long)
                    (message.id = $util.Long.fromValue(object.id)).unsigned = true;
                else if (typeof object.id === "string")
                    message.id = parseInt(object.id, 10);
                else if (typeof object.id === "number")
                    message.id = object.id;
                else if (typeof object.id === "object")
                    message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber(true);
            if (object.minZoom != null)
                message.minZoom = Number(object.minZoom);
            if (object.maxZoom != null)
                message.maxZoom = Number(object.maxZoom);
            return message;
        };

        /**
         * Creates a plain object from a MarkerExtraIconOverride message. Also converts values to other types if specified.
         * @function toObject
         * @memberof protobuf.MarkerExtraIconOverride
         * @static
         * @param {protobuf.MarkerExtraIconOverride} message MarkerExtraIconOverride
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MarkerExtraIconOverride.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.id = options.longs === String ? "0" : 0;
                object.minZoom = 0;
                object.maxZoom = 0;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                if (typeof message.id === "number")
                    object.id = options.longs === String ? String(message.id) : message.id;
                else
                    object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
            if (message.minZoom != null && message.hasOwnProperty("minZoom"))
                object.minZoom = options.json && !isFinite(message.minZoom) ? String(message.minZoom) : message.minZoom;
            if (message.maxZoom != null && message.hasOwnProperty("maxZoom"))
                object.maxZoom = options.json && !isFinite(message.maxZoom) ? String(message.maxZoom) : message.maxZoom;
            return object;
        };

        /**
         * Converts this MarkerExtraIconOverride to JSON.
         * @function toJSON
         * @memberof protobuf.MarkerExtraIconOverride
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MarkerExtraIconOverride.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MarkerExtraIconOverride
         * @function getTypeUrl
         * @memberof protobuf.MarkerExtraIconOverride
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MarkerExtraIconOverride.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protobuf.MarkerExtraIconOverride";
        };

        return MarkerExtraIconOverride;
    })();

    protobuf.MarkerExtra28Island = (function() {

        /**
         * Properties of a MarkerExtra28Island.
         * @memberof protobuf
         * @interface IMarkerExtra28Island
         * @property {string|null} [islandName] MarkerExtra28Island islandName
         * @property {Array.<string>|null} [islandState] MarkerExtra28Island islandState
         */

        /**
         * Constructs a new MarkerExtra28Island.
         * @memberof protobuf
         * @classdesc Represents a MarkerExtra28Island.
         * @implements IMarkerExtra28Island
         * @constructor
         * @param {protobuf.IMarkerExtra28Island=} [properties] Properties to set
         */
        function MarkerExtra28Island(properties) {
            this.islandState = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MarkerExtra28Island islandName.
         * @member {string} islandName
         * @memberof protobuf.MarkerExtra28Island
         * @instance
         */
        MarkerExtra28Island.prototype.islandName = "";

        /**
         * MarkerExtra28Island islandState.
         * @member {Array.<string>} islandState
         * @memberof protobuf.MarkerExtra28Island
         * @instance
         */
        MarkerExtra28Island.prototype.islandState = $util.emptyArray;

        /**
         * Creates a new MarkerExtra28Island instance using the specified properties.
         * @function create
         * @memberof protobuf.MarkerExtra28Island
         * @static
         * @param {protobuf.IMarkerExtra28Island=} [properties] Properties to set
         * @returns {protobuf.MarkerExtra28Island} MarkerExtra28Island instance
         */
        MarkerExtra28Island.create = function create(properties) {
            return new MarkerExtra28Island(properties);
        };

        /**
         * Encodes the specified MarkerExtra28Island message. Does not implicitly {@link protobuf.MarkerExtra28Island.verify|verify} messages.
         * @function encode
         * @memberof protobuf.MarkerExtra28Island
         * @static
         * @param {protobuf.IMarkerExtra28Island} message MarkerExtra28Island message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MarkerExtra28Island.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.islandName != null && Object.hasOwnProperty.call(message, "islandName"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.islandName);
            if (message.islandState != null && message.islandState.length)
                for (let i = 0; i < message.islandState.length; ++i)
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.islandState[i]);
            return writer;
        };

        /**
         * Encodes the specified MarkerExtra28Island message, length delimited. Does not implicitly {@link protobuf.MarkerExtra28Island.verify|verify} messages.
         * @function encodeDelimited
         * @memberof protobuf.MarkerExtra28Island
         * @static
         * @param {protobuf.IMarkerExtra28Island} message MarkerExtra28Island message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MarkerExtra28Island.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MarkerExtra28Island message from the specified reader or buffer.
         * @function decode
         * @memberof protobuf.MarkerExtra28Island
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protobuf.MarkerExtra28Island} MarkerExtra28Island
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MarkerExtra28Island.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.protobuf.MarkerExtra28Island();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.islandName = reader.string();
                        break;
                    }
                case 2: {
                        if (!(message.islandState && message.islandState.length))
                            message.islandState = [];
                        message.islandState.push(reader.string());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MarkerExtra28Island message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof protobuf.MarkerExtra28Island
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protobuf.MarkerExtra28Island} MarkerExtra28Island
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MarkerExtra28Island.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MarkerExtra28Island message.
         * @function verify
         * @memberof protobuf.MarkerExtra28Island
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MarkerExtra28Island.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.islandName != null && message.hasOwnProperty("islandName"))
                if (!$util.isString(message.islandName))
                    return "islandName: string expected";
            if (message.islandState != null && message.hasOwnProperty("islandState")) {
                if (!Array.isArray(message.islandState))
                    return "islandState: array expected";
                for (let i = 0; i < message.islandState.length; ++i)
                    if (!$util.isString(message.islandState[i]))
                        return "islandState: string[] expected";
            }
            return null;
        };

        /**
         * Creates a MarkerExtra28Island message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protobuf.MarkerExtra28Island
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protobuf.MarkerExtra28Island} MarkerExtra28Island
         */
        MarkerExtra28Island.fromObject = function fromObject(object) {
            if (object instanceof $root.protobuf.MarkerExtra28Island)
                return object;
            let message = new $root.protobuf.MarkerExtra28Island();
            if (object.islandName != null)
                message.islandName = String(object.islandName);
            if (object.islandState) {
                if (!Array.isArray(object.islandState))
                    throw TypeError(".protobuf.MarkerExtra28Island.islandState: array expected");
                message.islandState = [];
                for (let i = 0; i < object.islandState.length; ++i)
                    message.islandState[i] = String(object.islandState[i]);
            }
            return message;
        };

        /**
         * Creates a plain object from a MarkerExtra28Island message. Also converts values to other types if specified.
         * @function toObject
         * @memberof protobuf.MarkerExtra28Island
         * @static
         * @param {protobuf.MarkerExtra28Island} message MarkerExtra28Island
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MarkerExtra28Island.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.islandState = [];
            if (options.defaults)
                object.islandName = "";
            if (message.islandName != null && message.hasOwnProperty("islandName"))
                object.islandName = message.islandName;
            if (message.islandState && message.islandState.length) {
                object.islandState = [];
                for (let j = 0; j < message.islandState.length; ++j)
                    object.islandState[j] = message.islandState[j];
            }
            return object;
        };

        /**
         * Converts this MarkerExtra28Island to JSON.
         * @function toJSON
         * @memberof protobuf.MarkerExtra28Island
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MarkerExtra28Island.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MarkerExtra28Island
         * @function getTypeUrl
         * @memberof protobuf.MarkerExtra28Island
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MarkerExtra28Island.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protobuf.MarkerExtra28Island";
        };

        return MarkerExtra28Island;
    })();

    protobuf.MarkerVoList = (function() {

        /**
         * Properties of a MarkerVoList.
         * @memberof protobuf
         * @interface IMarkerVoList
         * @property {Array.<protobuf.IMarkerVo>|null} [markers] MarkerVoList markers
         * @property {Object.<string,protobuf.ISysUserSmallVo>|null} [users] MarkerVoList users
         */

        /**
         * Constructs a new MarkerVoList.
         * @memberof protobuf
         * @classdesc Represents a MarkerVoList.
         * @implements IMarkerVoList
         * @constructor
         * @param {protobuf.IMarkerVoList=} [properties] Properties to set
         */
        function MarkerVoList(properties) {
            this.markers = [];
            this.users = {};
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MarkerVoList markers.
         * @member {Array.<protobuf.IMarkerVo>} markers
         * @memberof protobuf.MarkerVoList
         * @instance
         */
        MarkerVoList.prototype.markers = $util.emptyArray;

        /**
         * MarkerVoList users.
         * @member {Object.<string,protobuf.ISysUserSmallVo>} users
         * @memberof protobuf.MarkerVoList
         * @instance
         */
        MarkerVoList.prototype.users = $util.emptyObject;

        /**
         * Creates a new MarkerVoList instance using the specified properties.
         * @function create
         * @memberof protobuf.MarkerVoList
         * @static
         * @param {protobuf.IMarkerVoList=} [properties] Properties to set
         * @returns {protobuf.MarkerVoList} MarkerVoList instance
         */
        MarkerVoList.create = function create(properties) {
            return new MarkerVoList(properties);
        };

        /**
         * Encodes the specified MarkerVoList message. Does not implicitly {@link protobuf.MarkerVoList.verify|verify} messages.
         * @function encode
         * @memberof protobuf.MarkerVoList
         * @static
         * @param {protobuf.IMarkerVoList} message MarkerVoList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MarkerVoList.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.markers != null && message.markers.length)
                for (let i = 0; i < message.markers.length; ++i)
                    $root.protobuf.MarkerVo.encode(message.markers[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.users != null && Object.hasOwnProperty.call(message, "users"))
                for (let keys = Object.keys(message.users), i = 0; i < keys.length; ++i) {
                    writer.uint32(/* id 2, wireType 2 =*/18).fork().uint32(/* id 1, wireType 0 =*/8).uint64(keys[i]);
                    $root.protobuf.SysUserSmallVo.encode(message.users[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                }
            return writer;
        };

        /**
         * Encodes the specified MarkerVoList message, length delimited. Does not implicitly {@link protobuf.MarkerVoList.verify|verify} messages.
         * @function encodeDelimited
         * @memberof protobuf.MarkerVoList
         * @static
         * @param {protobuf.IMarkerVoList} message MarkerVoList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MarkerVoList.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MarkerVoList message from the specified reader or buffer.
         * @function decode
         * @memberof protobuf.MarkerVoList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protobuf.MarkerVoList} MarkerVoList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MarkerVoList.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.protobuf.MarkerVoList(), key, value;
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.markers && message.markers.length))
                            message.markers = [];
                        message.markers.push($root.protobuf.MarkerVo.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        if (message.users === $util.emptyObject)
                            message.users = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = 0;
                        value = null;
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.uint64();
                                break;
                            case 2:
                                value = $root.protobuf.SysUserSmallVo.decode(reader, reader.uint32());
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.users[typeof key === "object" ? $util.longToHash(key) : key] = value;
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MarkerVoList message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof protobuf.MarkerVoList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protobuf.MarkerVoList} MarkerVoList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MarkerVoList.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MarkerVoList message.
         * @function verify
         * @memberof protobuf.MarkerVoList
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MarkerVoList.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.markers != null && message.hasOwnProperty("markers")) {
                if (!Array.isArray(message.markers))
                    return "markers: array expected";
                for (let i = 0; i < message.markers.length; ++i) {
                    let error = $root.protobuf.MarkerVo.verify(message.markers[i]);
                    if (error)
                        return "markers." + error;
                }
            }
            if (message.users != null && message.hasOwnProperty("users")) {
                if (!$util.isObject(message.users))
                    return "users: object expected";
                let key = Object.keys(message.users);
                for (let i = 0; i < key.length; ++i) {
                    if (!$util.key64Re.test(key[i]))
                        return "users: integer|Long key{k:uint64} expected";
                    {
                        let error = $root.protobuf.SysUserSmallVo.verify(message.users[key[i]]);
                        if (error)
                            return "users." + error;
                    }
                }
            }
            return null;
        };

        /**
         * Creates a MarkerVoList message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protobuf.MarkerVoList
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protobuf.MarkerVoList} MarkerVoList
         */
        MarkerVoList.fromObject = function fromObject(object) {
            if (object instanceof $root.protobuf.MarkerVoList)
                return object;
            let message = new $root.protobuf.MarkerVoList();
            if (object.markers) {
                if (!Array.isArray(object.markers))
                    throw TypeError(".protobuf.MarkerVoList.markers: array expected");
                message.markers = [];
                for (let i = 0; i < object.markers.length; ++i) {
                    if (typeof object.markers[i] !== "object")
                        throw TypeError(".protobuf.MarkerVoList.markers: object expected");
                    message.markers[i] = $root.protobuf.MarkerVo.fromObject(object.markers[i]);
                }
            }
            if (object.users) {
                if (typeof object.users !== "object")
                    throw TypeError(".protobuf.MarkerVoList.users: object expected");
                message.users = {};
                for (let keys = Object.keys(object.users), i = 0; i < keys.length; ++i) {
                    if (typeof object.users[keys[i]] !== "object")
                        throw TypeError(".protobuf.MarkerVoList.users: object expected");
                    message.users[keys[i]] = $root.protobuf.SysUserSmallVo.fromObject(object.users[keys[i]]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a MarkerVoList message. Also converts values to other types if specified.
         * @function toObject
         * @memberof protobuf.MarkerVoList
         * @static
         * @param {protobuf.MarkerVoList} message MarkerVoList
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MarkerVoList.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.markers = [];
            if (options.objects || options.defaults)
                object.users = {};
            if (message.markers && message.markers.length) {
                object.markers = [];
                for (let j = 0; j < message.markers.length; ++j)
                    object.markers[j] = $root.protobuf.MarkerVo.toObject(message.markers[j], options);
            }
            let keys2;
            if (message.users && (keys2 = Object.keys(message.users)).length) {
                object.users = {};
                for (let j = 0; j < keys2.length; ++j)
                    object.users[keys2[j]] = $root.protobuf.SysUserSmallVo.toObject(message.users[keys2[j]], options);
            }
            return object;
        };

        /**
         * Converts this MarkerVoList to JSON.
         * @function toJSON
         * @memberof protobuf.MarkerVoList
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MarkerVoList.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MarkerVoList
         * @function getTypeUrl
         * @memberof protobuf.MarkerVoList
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MarkerVoList.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protobuf.MarkerVoList";
        };

        return MarkerVoList;
    })();

    protobuf.SysUserSmallVo = (function() {

        /**
         * Properties of a SysUserSmallVo.
         * @memberof protobuf
         * @interface ISysUserSmallVo
         * @property {string|null} [username] SysUserSmallVo username
         * @property {string|null} [nickname] SysUserSmallVo nickname
         * @property {string|null} [qq] SysUserSmallVo qq
         * @property {string|null} [phone] SysUserSmallVo phone
         * @property {string|null} [logo] SysUserSmallVo logo
         * @property {string|null} [remark] SysUserSmallVo remark
         */

        /**
         * Constructs a new SysUserSmallVo.
         * @memberof protobuf
         * @classdesc Represents a SysUserSmallVo.
         * @implements ISysUserSmallVo
         * @constructor
         * @param {protobuf.ISysUserSmallVo=} [properties] Properties to set
         */
        function SysUserSmallVo(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SysUserSmallVo username.
         * @member {string} username
         * @memberof protobuf.SysUserSmallVo
         * @instance
         */
        SysUserSmallVo.prototype.username = "";

        /**
         * SysUserSmallVo nickname.
         * @member {string} nickname
         * @memberof protobuf.SysUserSmallVo
         * @instance
         */
        SysUserSmallVo.prototype.nickname = "";

        /**
         * SysUserSmallVo qq.
         * @member {string} qq
         * @memberof protobuf.SysUserSmallVo
         * @instance
         */
        SysUserSmallVo.prototype.qq = "";

        /**
         * SysUserSmallVo phone.
         * @member {string|null|undefined} phone
         * @memberof protobuf.SysUserSmallVo
         * @instance
         */
        SysUserSmallVo.prototype.phone = null;

        /**
         * SysUserSmallVo logo.
         * @member {string|null|undefined} logo
         * @memberof protobuf.SysUserSmallVo
         * @instance
         */
        SysUserSmallVo.prototype.logo = null;

        /**
         * SysUserSmallVo remark.
         * @member {string|null|undefined} remark
         * @memberof protobuf.SysUserSmallVo
         * @instance
         */
        SysUserSmallVo.prototype.remark = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(SysUserSmallVo.prototype, "_phone", {
            get: $util.oneOfGetter($oneOfFields = ["phone"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(SysUserSmallVo.prototype, "_logo", {
            get: $util.oneOfGetter($oneOfFields = ["logo"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(SysUserSmallVo.prototype, "_remark", {
            get: $util.oneOfGetter($oneOfFields = ["remark"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new SysUserSmallVo instance using the specified properties.
         * @function create
         * @memberof protobuf.SysUserSmallVo
         * @static
         * @param {protobuf.ISysUserSmallVo=} [properties] Properties to set
         * @returns {protobuf.SysUserSmallVo} SysUserSmallVo instance
         */
        SysUserSmallVo.create = function create(properties) {
            return new SysUserSmallVo(properties);
        };

        /**
         * Encodes the specified SysUserSmallVo message. Does not implicitly {@link protobuf.SysUserSmallVo.verify|verify} messages.
         * @function encode
         * @memberof protobuf.SysUserSmallVo
         * @static
         * @param {protobuf.ISysUserSmallVo} message SysUserSmallVo message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SysUserSmallVo.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.username != null && Object.hasOwnProperty.call(message, "username"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.username);
            if (message.nickname != null && Object.hasOwnProperty.call(message, "nickname"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.nickname);
            if (message.qq != null && Object.hasOwnProperty.call(message, "qq"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.qq);
            if (message.phone != null && Object.hasOwnProperty.call(message, "phone"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.phone);
            if (message.logo != null && Object.hasOwnProperty.call(message, "logo"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.logo);
            if (message.remark != null && Object.hasOwnProperty.call(message, "remark"))
                writer.uint32(/* id 15, wireType 2 =*/122).string(message.remark);
            return writer;
        };

        /**
         * Encodes the specified SysUserSmallVo message, length delimited. Does not implicitly {@link protobuf.SysUserSmallVo.verify|verify} messages.
         * @function encodeDelimited
         * @memberof protobuf.SysUserSmallVo
         * @static
         * @param {protobuf.ISysUserSmallVo} message SysUserSmallVo message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SysUserSmallVo.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a SysUserSmallVo message from the specified reader or buffer.
         * @function decode
         * @memberof protobuf.SysUserSmallVo
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protobuf.SysUserSmallVo} SysUserSmallVo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SysUserSmallVo.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.protobuf.SysUserSmallVo();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.username = reader.string();
                        break;
                    }
                case 2: {
                        message.nickname = reader.string();
                        break;
                    }
                case 3: {
                        message.qq = reader.string();
                        break;
                    }
                case 4: {
                        message.phone = reader.string();
                        break;
                    }
                case 5: {
                        message.logo = reader.string();
                        break;
                    }
                case 15: {
                        message.remark = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a SysUserSmallVo message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof protobuf.SysUserSmallVo
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protobuf.SysUserSmallVo} SysUserSmallVo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SysUserSmallVo.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a SysUserSmallVo message.
         * @function verify
         * @memberof protobuf.SysUserSmallVo
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        SysUserSmallVo.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.username != null && message.hasOwnProperty("username"))
                if (!$util.isString(message.username))
                    return "username: string expected";
            if (message.nickname != null && message.hasOwnProperty("nickname"))
                if (!$util.isString(message.nickname))
                    return "nickname: string expected";
            if (message.qq != null && message.hasOwnProperty("qq"))
                if (!$util.isString(message.qq))
                    return "qq: string expected";
            if (message.phone != null && message.hasOwnProperty("phone")) {
                properties._phone = 1;
                if (!$util.isString(message.phone))
                    return "phone: string expected";
            }
            if (message.logo != null && message.hasOwnProperty("logo")) {
                properties._logo = 1;
                if (!$util.isString(message.logo))
                    return "logo: string expected";
            }
            if (message.remark != null && message.hasOwnProperty("remark")) {
                properties._remark = 1;
                if (!$util.isString(message.remark))
                    return "remark: string expected";
            }
            return null;
        };

        /**
         * Creates a SysUserSmallVo message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protobuf.SysUserSmallVo
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protobuf.SysUserSmallVo} SysUserSmallVo
         */
        SysUserSmallVo.fromObject = function fromObject(object) {
            if (object instanceof $root.protobuf.SysUserSmallVo)
                return object;
            let message = new $root.protobuf.SysUserSmallVo();
            if (object.username != null)
                message.username = String(object.username);
            if (object.nickname != null)
                message.nickname = String(object.nickname);
            if (object.qq != null)
                message.qq = String(object.qq);
            if (object.phone != null)
                message.phone = String(object.phone);
            if (object.logo != null)
                message.logo = String(object.logo);
            if (object.remark != null)
                message.remark = String(object.remark);
            return message;
        };

        /**
         * Creates a plain object from a SysUserSmallVo message. Also converts values to other types if specified.
         * @function toObject
         * @memberof protobuf.SysUserSmallVo
         * @static
         * @param {protobuf.SysUserSmallVo} message SysUserSmallVo
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        SysUserSmallVo.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.username = "";
                object.nickname = "";
                object.qq = "";
            }
            if (message.username != null && message.hasOwnProperty("username"))
                object.username = message.username;
            if (message.nickname != null && message.hasOwnProperty("nickname"))
                object.nickname = message.nickname;
            if (message.qq != null && message.hasOwnProperty("qq"))
                object.qq = message.qq;
            if (message.phone != null && message.hasOwnProperty("phone")) {
                object.phone = message.phone;
                if (options.oneofs)
                    object._phone = "phone";
            }
            if (message.logo != null && message.hasOwnProperty("logo")) {
                object.logo = message.logo;
                if (options.oneofs)
                    object._logo = "logo";
            }
            if (message.remark != null && message.hasOwnProperty("remark")) {
                object.remark = message.remark;
                if (options.oneofs)
                    object._remark = "remark";
            }
            return object;
        };

        /**
         * Converts this SysUserSmallVo to JSON.
         * @function toJSON
         * @memberof protobuf.SysUserSmallVo
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        SysUserSmallVo.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for SysUserSmallVo
         * @function getTypeUrl
         * @memberof protobuf.SysUserSmallVo
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        SysUserSmallVo.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protobuf.SysUserSmallVo";
        };

        return SysUserSmallVo;
    })();

    return protobuf;
})();

export const google = $root.google = (() => {

    /**
     * Namespace google.
     * @exports google
     * @namespace
     */
    const google = {};

    google.protobuf = (function() {

        /**
         * Namespace protobuf.
         * @memberof google
         * @namespace
         */
        const protobuf = {};

        protobuf.Timestamp = (function() {

            /**
             * Properties of a Timestamp.
             * @memberof google.protobuf
             * @interface ITimestamp
             * @property {number|Long|null} [seconds] Timestamp seconds
             * @property {number|null} [nanos] Timestamp nanos
             */

            /**
             * Constructs a new Timestamp.
             * @memberof google.protobuf
             * @classdesc Represents a Timestamp.
             * @implements ITimestamp
             * @constructor
             * @param {google.protobuf.ITimestamp=} [properties] Properties to set
             */
            function Timestamp(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Timestamp seconds.
             * @member {number|Long} seconds
             * @memberof google.protobuf.Timestamp
             * @instance
             */
            Timestamp.prototype.seconds = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Timestamp nanos.
             * @member {number} nanos
             * @memberof google.protobuf.Timestamp
             * @instance
             */
            Timestamp.prototype.nanos = 0;

            /**
             * Creates a new Timestamp instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.ITimestamp=} [properties] Properties to set
             * @returns {google.protobuf.Timestamp} Timestamp instance
             */
            Timestamp.create = function create(properties) {
                return new Timestamp(properties);
            };

            /**
             * Encodes the specified Timestamp message. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.ITimestamp} message Timestamp message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Timestamp.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.seconds != null && Object.hasOwnProperty.call(message, "seconds"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int64(message.seconds);
                if (message.nanos != null && Object.hasOwnProperty.call(message, "nanos"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.nanos);
                return writer;
            };

            /**
             * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.ITimestamp} message Timestamp message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Timestamp.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Timestamp message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.Timestamp} Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Timestamp.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.Timestamp();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.seconds = reader.int64();
                            break;
                        }
                    case 2: {
                            message.nanos = reader.int32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Timestamp message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.Timestamp} Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Timestamp.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Timestamp message.
             * @function verify
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Timestamp.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.seconds != null && message.hasOwnProperty("seconds"))
                    if (!$util.isInteger(message.seconds) && !(message.seconds && $util.isInteger(message.seconds.low) && $util.isInteger(message.seconds.high)))
                        return "seconds: integer|Long expected";
                if (message.nanos != null && message.hasOwnProperty("nanos"))
                    if (!$util.isInteger(message.nanos))
                        return "nanos: integer expected";
                return null;
            };

            /**
             * Creates a Timestamp message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.Timestamp} Timestamp
             */
            Timestamp.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.Timestamp)
                    return object;
                let message = new $root.google.protobuf.Timestamp();
                if (object.seconds != null)
                    if ($util.Long)
                        (message.seconds = $util.Long.fromValue(object.seconds)).unsigned = false;
                    else if (typeof object.seconds === "string")
                        message.seconds = parseInt(object.seconds, 10);
                    else if (typeof object.seconds === "number")
                        message.seconds = object.seconds;
                    else if (typeof object.seconds === "object")
                        message.seconds = new $util.LongBits(object.seconds.low >>> 0, object.seconds.high >>> 0).toNumber();
                if (object.nanos != null)
                    message.nanos = object.nanos | 0;
                return message;
            };

            /**
             * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.Timestamp} message Timestamp
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Timestamp.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.seconds = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.seconds = options.longs === String ? "0" : 0;
                    object.nanos = 0;
                }
                if (message.seconds != null && message.hasOwnProperty("seconds"))
                    if (typeof message.seconds === "number")
                        object.seconds = options.longs === String ? String(message.seconds) : message.seconds;
                    else
                        object.seconds = options.longs === String ? $util.Long.prototype.toString.call(message.seconds) : options.longs === Number ? new $util.LongBits(message.seconds.low >>> 0, message.seconds.high >>> 0).toNumber() : message.seconds;
                if (message.nanos != null && message.hasOwnProperty("nanos"))
                    object.nanos = message.nanos;
                return object;
            };

            /**
             * Converts this Timestamp to JSON.
             * @function toJSON
             * @memberof google.protobuf.Timestamp
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Timestamp.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Timestamp
             * @function getTypeUrl
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Timestamp.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.Timestamp";
            };

            return Timestamp;
        })();

        return protobuf;
    })();

    return google;
})();

export { $root as default };
