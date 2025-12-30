import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace protobuf. */
export namespace protobuf {

    /** Properties of a MarkerDiffSnapshotVo. */
    interface IMarkerDiffSnapshotVo {

        /** MarkerDiffSnapshotVo version */
        version?: (number|Long|null);

        /** MarkerDiffSnapshotVo id */
        id?: (number|Long|null);

        /** MarkerDiffSnapshotVo linkageId */
        linkageId?: (string|null);
    }

    /** Represents a MarkerDiffSnapshotVo. */
    class MarkerDiffSnapshotVo implements IMarkerDiffSnapshotVo {

        /**
         * Constructs a new MarkerDiffSnapshotVo.
         * @param [properties] Properties to set
         */
        constructor(properties?: protobuf.IMarkerDiffSnapshotVo);

        /** MarkerDiffSnapshotVo version. */
        public version: (number|Long);

        /** MarkerDiffSnapshotVo id. */
        public id: (number|Long);

        /** MarkerDiffSnapshotVo linkageId. */
        public linkageId?: (string|null);

        /**
         * Creates a new MarkerDiffSnapshotVo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MarkerDiffSnapshotVo instance
         */
        public static create(properties?: protobuf.IMarkerDiffSnapshotVo): protobuf.MarkerDiffSnapshotVo;

        /**
         * Encodes the specified MarkerDiffSnapshotVo message. Does not implicitly {@link protobuf.MarkerDiffSnapshotVo.verify|verify} messages.
         * @param message MarkerDiffSnapshotVo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: protobuf.IMarkerDiffSnapshotVo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MarkerDiffSnapshotVo message, length delimited. Does not implicitly {@link protobuf.MarkerDiffSnapshotVo.verify|verify} messages.
         * @param message MarkerDiffSnapshotVo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: protobuf.IMarkerDiffSnapshotVo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MarkerDiffSnapshotVo message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns MarkerDiffSnapshotVo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): protobuf.MarkerDiffSnapshotVo;

        /**
         * Decodes a MarkerDiffSnapshotVo message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns MarkerDiffSnapshotVo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): protobuf.MarkerDiffSnapshotVo;

        /**
         * Verifies a MarkerDiffSnapshotVo message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MarkerDiffSnapshotVo message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MarkerDiffSnapshotVo
         */
        public static fromObject(object: { [k: string]: any }): protobuf.MarkerDiffSnapshotVo;

        /**
         * Creates a plain object from a MarkerDiffSnapshotVo message. Also converts values to other types if specified.
         * @param message MarkerDiffSnapshotVo
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: protobuf.MarkerDiffSnapshotVo, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MarkerDiffSnapshotVo to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for MarkerDiffSnapshotVo
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a MarkerDiffSnapshotVoList. */
    interface IMarkerDiffSnapshotVoList {

        /** MarkerDiffSnapshotVoList snapshots */
        snapshots?: (protobuf.IMarkerDiffSnapshotVo[]|null);
    }

    /** Represents a MarkerDiffSnapshotVoList. */
    class MarkerDiffSnapshotVoList implements IMarkerDiffSnapshotVoList {

        /**
         * Constructs a new MarkerDiffSnapshotVoList.
         * @param [properties] Properties to set
         */
        constructor(properties?: protobuf.IMarkerDiffSnapshotVoList);

        /** MarkerDiffSnapshotVoList snapshots. */
        public snapshots: protobuf.IMarkerDiffSnapshotVo[];

        /**
         * Creates a new MarkerDiffSnapshotVoList instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MarkerDiffSnapshotVoList instance
         */
        public static create(properties?: protobuf.IMarkerDiffSnapshotVoList): protobuf.MarkerDiffSnapshotVoList;

        /**
         * Encodes the specified MarkerDiffSnapshotVoList message. Does not implicitly {@link protobuf.MarkerDiffSnapshotVoList.verify|verify} messages.
         * @param message MarkerDiffSnapshotVoList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: protobuf.IMarkerDiffSnapshotVoList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MarkerDiffSnapshotVoList message, length delimited. Does not implicitly {@link protobuf.MarkerDiffSnapshotVoList.verify|verify} messages.
         * @param message MarkerDiffSnapshotVoList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: protobuf.IMarkerDiffSnapshotVoList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MarkerDiffSnapshotVoList message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns MarkerDiffSnapshotVoList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): protobuf.MarkerDiffSnapshotVoList;

        /**
         * Decodes a MarkerDiffSnapshotVoList message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns MarkerDiffSnapshotVoList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): protobuf.MarkerDiffSnapshotVoList;

        /**
         * Verifies a MarkerDiffSnapshotVoList message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MarkerDiffSnapshotVoList message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MarkerDiffSnapshotVoList
         */
        public static fromObject(object: { [k: string]: any }): protobuf.MarkerDiffSnapshotVoList;

        /**
         * Creates a plain object from a MarkerDiffSnapshotVoList message. Also converts values to other types if specified.
         * @param message MarkerDiffSnapshotVoList
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: protobuf.MarkerDiffSnapshotVoList, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MarkerDiffSnapshotVoList to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for MarkerDiffSnapshotVoList
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a MarkerVo. */
    interface IMarkerVo {

        /** MarkerVo version */
        version?: (number|Long|null);

        /** MarkerVo id */
        id?: (number|Long|null);

        /** MarkerVo creatorId */
        creatorId?: (number|Long|null);

        /** MarkerVo createTime */
        createTime?: (number|Long|null);

        /** MarkerVo updaterId */
        updaterId?: (number|Long|null);

        /** MarkerVo updateTime */
        updateTime?: (number|Long|null);

        /** MarkerVo markerTitle */
        markerTitle?: (string|null);

        /** MarkerVo position */
        position?: (string|null);

        /** MarkerVo content */
        content?: (string|null);

        /** MarkerVo picture */
        picture?: (string|null);

        /** MarkerVo videoPath */
        videoPath?: (string|null);

        /** MarkerVo refreshTime */
        refreshTime?: (number|Long|null);

        /** MarkerVo hiddenFlag */
        hiddenFlag?: (number|null);

        /** MarkerVo itemList */
        itemList?: (protobuf.IMarkerItemLinkVo[]|null);

        /** MarkerVo markerCreatorId */
        markerCreatorId?: (number|Long|null);

        /** MarkerVo pictureCreatorId */
        pictureCreatorId?: (number|Long|null);

        /** MarkerVo markerStamp */
        markerStamp?: (string|null);

        /** MarkerVo extra */
        extra?: (protobuf.IMarkerExtra|null);

        /** MarkerVo linkageId */
        linkageId?: (string|null);
    }

    /** Represents a MarkerVo. */
    class MarkerVo implements IMarkerVo {

        /**
         * Constructs a new MarkerVo.
         * @param [properties] Properties to set
         */
        constructor(properties?: protobuf.IMarkerVo);

        /** MarkerVo version. */
        public version: (number|Long);

        /** MarkerVo id. */
        public id: (number|Long);

        /** MarkerVo creatorId. */
        public creatorId: (number|Long);

        /** MarkerVo createTime. */
        public createTime?: (number|Long|null);

        /** MarkerVo updaterId. */
        public updaterId: (number|Long);

        /** MarkerVo updateTime. */
        public updateTime?: (number|Long|null);

        /** MarkerVo markerTitle. */
        public markerTitle: string;

        /** MarkerVo position. */
        public position: string;

        /** MarkerVo content. */
        public content: string;

        /** MarkerVo picture. */
        public picture: string;

        /** MarkerVo videoPath. */
        public videoPath: string;

        /** MarkerVo refreshTime. */
        public refreshTime: (number|Long);

        /** MarkerVo hiddenFlag. */
        public hiddenFlag: number;

        /** MarkerVo itemList. */
        public itemList: protobuf.IMarkerItemLinkVo[];

        /** MarkerVo markerCreatorId. */
        public markerCreatorId?: (number|Long|null);

        /** MarkerVo pictureCreatorId. */
        public pictureCreatorId?: (number|Long|null);

        /** MarkerVo markerStamp. */
        public markerStamp: string;

        /** MarkerVo extra. */
        public extra?: (protobuf.IMarkerExtra|null);

        /** MarkerVo linkageId. */
        public linkageId: string;

        /**
         * Creates a new MarkerVo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MarkerVo instance
         */
        public static create(properties?: protobuf.IMarkerVo): protobuf.MarkerVo;

        /**
         * Encodes the specified MarkerVo message. Does not implicitly {@link protobuf.MarkerVo.verify|verify} messages.
         * @param message MarkerVo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: protobuf.IMarkerVo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MarkerVo message, length delimited. Does not implicitly {@link protobuf.MarkerVo.verify|verify} messages.
         * @param message MarkerVo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: protobuf.IMarkerVo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MarkerVo message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns MarkerVo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): protobuf.MarkerVo;

        /**
         * Decodes a MarkerVo message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns MarkerVo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): protobuf.MarkerVo;

        /**
         * Verifies a MarkerVo message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MarkerVo message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MarkerVo
         */
        public static fromObject(object: { [k: string]: any }): protobuf.MarkerVo;

        /**
         * Creates a plain object from a MarkerVo message. Also converts values to other types if specified.
         * @param message MarkerVo
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: protobuf.MarkerVo, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MarkerVo to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for MarkerVo
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a MarkerItemLinkVo. */
    interface IMarkerItemLinkVo {

        /** MarkerItemLinkVo itemId */
        itemId?: (number|Long|null);

        /** MarkerItemLinkVo iconId */
        iconId?: (number|Long|null);

        /** MarkerItemLinkVo count */
        count?: (number|null);
    }

    /** Represents a MarkerItemLinkVo. */
    class MarkerItemLinkVo implements IMarkerItemLinkVo {

        /**
         * Constructs a new MarkerItemLinkVo.
         * @param [properties] Properties to set
         */
        constructor(properties?: protobuf.IMarkerItemLinkVo);

        /** MarkerItemLinkVo itemId. */
        public itemId: (number|Long);

        /** MarkerItemLinkVo iconId. */
        public iconId: (number|Long);

        /** MarkerItemLinkVo count. */
        public count: number;

        /**
         * Creates a new MarkerItemLinkVo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MarkerItemLinkVo instance
         */
        public static create(properties?: protobuf.IMarkerItemLinkVo): protobuf.MarkerItemLinkVo;

        /**
         * Encodes the specified MarkerItemLinkVo message. Does not implicitly {@link protobuf.MarkerItemLinkVo.verify|verify} messages.
         * @param message MarkerItemLinkVo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: protobuf.IMarkerItemLinkVo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MarkerItemLinkVo message, length delimited. Does not implicitly {@link protobuf.MarkerItemLinkVo.verify|verify} messages.
         * @param message MarkerItemLinkVo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: protobuf.IMarkerItemLinkVo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MarkerItemLinkVo message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns MarkerItemLinkVo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): protobuf.MarkerItemLinkVo;

        /**
         * Decodes a MarkerItemLinkVo message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns MarkerItemLinkVo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): protobuf.MarkerItemLinkVo;

        /**
         * Verifies a MarkerItemLinkVo message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MarkerItemLinkVo message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MarkerItemLinkVo
         */
        public static fromObject(object: { [k: string]: any }): protobuf.MarkerItemLinkVo;

        /**
         * Creates a plain object from a MarkerItemLinkVo message. Also converts values to other types if specified.
         * @param message MarkerItemLinkVo
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: protobuf.MarkerItemLinkVo, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MarkerItemLinkVo to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for MarkerItemLinkVo
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a MarkerExtra. */
    interface IMarkerExtra {

        /** MarkerExtra underground */
        underground?: (protobuf.IMarkerExtraUnderground|null);

        /** MarkerExtra iconOverride */
        iconOverride?: (protobuf.IMarkerExtraIconOverride|null);

        /** MarkerExtra v_1_6Island */
        v_1_6Island?: (string[]|null);

        /** MarkerExtra v_2_8Island */
        v_2_8Island?: (protobuf.IMarkerExtra28Island|null);
    }

    /** Represents a MarkerExtra. */
    class MarkerExtra implements IMarkerExtra {

        /**
         * Constructs a new MarkerExtra.
         * @param [properties] Properties to set
         */
        constructor(properties?: protobuf.IMarkerExtra);

        /** MarkerExtra underground. */
        public underground?: (protobuf.IMarkerExtraUnderground|null);

        /** MarkerExtra iconOverride. */
        public iconOverride?: (protobuf.IMarkerExtraIconOverride|null);

        /** MarkerExtra v_1_6Island. */
        public v_1_6Island: string[];

        /** MarkerExtra v_2_8Island. */
        public v_2_8Island?: (protobuf.IMarkerExtra28Island|null);

        /**
         * Creates a new MarkerExtra instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MarkerExtra instance
         */
        public static create(properties?: protobuf.IMarkerExtra): protobuf.MarkerExtra;

        /**
         * Encodes the specified MarkerExtra message. Does not implicitly {@link protobuf.MarkerExtra.verify|verify} messages.
         * @param message MarkerExtra message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: protobuf.IMarkerExtra, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MarkerExtra message, length delimited. Does not implicitly {@link protobuf.MarkerExtra.verify|verify} messages.
         * @param message MarkerExtra message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: protobuf.IMarkerExtra, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MarkerExtra message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns MarkerExtra
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): protobuf.MarkerExtra;

        /**
         * Decodes a MarkerExtra message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns MarkerExtra
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): protobuf.MarkerExtra;

        /**
         * Verifies a MarkerExtra message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MarkerExtra message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MarkerExtra
         */
        public static fromObject(object: { [k: string]: any }): protobuf.MarkerExtra;

        /**
         * Creates a plain object from a MarkerExtra message. Also converts values to other types if specified.
         * @param message MarkerExtra
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: protobuf.MarkerExtra, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MarkerExtra to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for MarkerExtra
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a MarkerExtraUnderground. */
    interface IMarkerExtraUnderground {

        /** MarkerExtraUnderground isUnderground */
        isUnderground?: (boolean|null);

        /** MarkerExtraUnderground isGlobal */
        isGlobal?: (boolean|null);

        /** MarkerExtraUnderground regionLevels */
        regionLevels?: (string[]|null);
    }

    /** Represents a MarkerExtraUnderground. */
    class MarkerExtraUnderground implements IMarkerExtraUnderground {

        /**
         * Constructs a new MarkerExtraUnderground.
         * @param [properties] Properties to set
         */
        constructor(properties?: protobuf.IMarkerExtraUnderground);

        /** MarkerExtraUnderground isUnderground. */
        public isUnderground: boolean;

        /** MarkerExtraUnderground isGlobal. */
        public isGlobal?: (boolean|null);

        /** MarkerExtraUnderground regionLevels. */
        public regionLevels: string[];

        /**
         * Creates a new MarkerExtraUnderground instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MarkerExtraUnderground instance
         */
        public static create(properties?: protobuf.IMarkerExtraUnderground): protobuf.MarkerExtraUnderground;

        /**
         * Encodes the specified MarkerExtraUnderground message. Does not implicitly {@link protobuf.MarkerExtraUnderground.verify|verify} messages.
         * @param message MarkerExtraUnderground message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: protobuf.IMarkerExtraUnderground, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MarkerExtraUnderground message, length delimited. Does not implicitly {@link protobuf.MarkerExtraUnderground.verify|verify} messages.
         * @param message MarkerExtraUnderground message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: protobuf.IMarkerExtraUnderground, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MarkerExtraUnderground message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns MarkerExtraUnderground
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): protobuf.MarkerExtraUnderground;

        /**
         * Decodes a MarkerExtraUnderground message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns MarkerExtraUnderground
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): protobuf.MarkerExtraUnderground;

        /**
         * Verifies a MarkerExtraUnderground message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MarkerExtraUnderground message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MarkerExtraUnderground
         */
        public static fromObject(object: { [k: string]: any }): protobuf.MarkerExtraUnderground;

        /**
         * Creates a plain object from a MarkerExtraUnderground message. Also converts values to other types if specified.
         * @param message MarkerExtraUnderground
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: protobuf.MarkerExtraUnderground, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MarkerExtraUnderground to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for MarkerExtraUnderground
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a MarkerExtraIconOverride. */
    interface IMarkerExtraIconOverride {

        /** MarkerExtraIconOverride id */
        id?: (number|Long|null);

        /** MarkerExtraIconOverride minZoom */
        minZoom?: (number|null);

        /** MarkerExtraIconOverride maxZoom */
        maxZoom?: (number|null);
    }

    /** Represents a MarkerExtraIconOverride. */
    class MarkerExtraIconOverride implements IMarkerExtraIconOverride {

        /**
         * Constructs a new MarkerExtraIconOverride.
         * @param [properties] Properties to set
         */
        constructor(properties?: protobuf.IMarkerExtraIconOverride);

        /** MarkerExtraIconOverride id. */
        public id: (number|Long);

        /** MarkerExtraIconOverride minZoom. */
        public minZoom: number;

        /** MarkerExtraIconOverride maxZoom. */
        public maxZoom: number;

        /**
         * Creates a new MarkerExtraIconOverride instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MarkerExtraIconOverride instance
         */
        public static create(properties?: protobuf.IMarkerExtraIconOverride): protobuf.MarkerExtraIconOverride;

        /**
         * Encodes the specified MarkerExtraIconOverride message. Does not implicitly {@link protobuf.MarkerExtraIconOverride.verify|verify} messages.
         * @param message MarkerExtraIconOverride message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: protobuf.IMarkerExtraIconOverride, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MarkerExtraIconOverride message, length delimited. Does not implicitly {@link protobuf.MarkerExtraIconOverride.verify|verify} messages.
         * @param message MarkerExtraIconOverride message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: protobuf.IMarkerExtraIconOverride, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MarkerExtraIconOverride message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns MarkerExtraIconOverride
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): protobuf.MarkerExtraIconOverride;

        /**
         * Decodes a MarkerExtraIconOverride message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns MarkerExtraIconOverride
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): protobuf.MarkerExtraIconOverride;

        /**
         * Verifies a MarkerExtraIconOverride message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MarkerExtraIconOverride message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MarkerExtraIconOverride
         */
        public static fromObject(object: { [k: string]: any }): protobuf.MarkerExtraIconOverride;

        /**
         * Creates a plain object from a MarkerExtraIconOverride message. Also converts values to other types if specified.
         * @param message MarkerExtraIconOverride
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: protobuf.MarkerExtraIconOverride, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MarkerExtraIconOverride to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for MarkerExtraIconOverride
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a MarkerExtra28Island. */
    interface IMarkerExtra28Island {

        /** MarkerExtra28Island islandName */
        islandName?: (string|null);

        /** MarkerExtra28Island islandState */
        islandState?: (string[]|null);
    }

    /** Represents a MarkerExtra28Island. */
    class MarkerExtra28Island implements IMarkerExtra28Island {

        /**
         * Constructs a new MarkerExtra28Island.
         * @param [properties] Properties to set
         */
        constructor(properties?: protobuf.IMarkerExtra28Island);

        /** MarkerExtra28Island islandName. */
        public islandName: string;

        /** MarkerExtra28Island islandState. */
        public islandState: string[];

        /**
         * Creates a new MarkerExtra28Island instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MarkerExtra28Island instance
         */
        public static create(properties?: protobuf.IMarkerExtra28Island): protobuf.MarkerExtra28Island;

        /**
         * Encodes the specified MarkerExtra28Island message. Does not implicitly {@link protobuf.MarkerExtra28Island.verify|verify} messages.
         * @param message MarkerExtra28Island message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: protobuf.IMarkerExtra28Island, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MarkerExtra28Island message, length delimited. Does not implicitly {@link protobuf.MarkerExtra28Island.verify|verify} messages.
         * @param message MarkerExtra28Island message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: protobuf.IMarkerExtra28Island, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MarkerExtra28Island message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns MarkerExtra28Island
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): protobuf.MarkerExtra28Island;

        /**
         * Decodes a MarkerExtra28Island message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns MarkerExtra28Island
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): protobuf.MarkerExtra28Island;

        /**
         * Verifies a MarkerExtra28Island message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MarkerExtra28Island message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MarkerExtra28Island
         */
        public static fromObject(object: { [k: string]: any }): protobuf.MarkerExtra28Island;

        /**
         * Creates a plain object from a MarkerExtra28Island message. Also converts values to other types if specified.
         * @param message MarkerExtra28Island
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: protobuf.MarkerExtra28Island, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MarkerExtra28Island to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for MarkerExtra28Island
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a MarkerVoList. */
    interface IMarkerVoList {

        /** MarkerVoList markers */
        markers?: (protobuf.IMarkerVo[]|null);

        /** MarkerVoList users */
        users?: ({ [k: string]: protobuf.ISysUserSmallVo }|null);
    }

    /** Represents a MarkerVoList. */
    class MarkerVoList implements IMarkerVoList {

        /**
         * Constructs a new MarkerVoList.
         * @param [properties] Properties to set
         */
        constructor(properties?: protobuf.IMarkerVoList);

        /** MarkerVoList markers. */
        public markers: protobuf.IMarkerVo[];

        /** MarkerVoList users. */
        public users: { [k: string]: protobuf.ISysUserSmallVo };

        /**
         * Creates a new MarkerVoList instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MarkerVoList instance
         */
        public static create(properties?: protobuf.IMarkerVoList): protobuf.MarkerVoList;

        /**
         * Encodes the specified MarkerVoList message. Does not implicitly {@link protobuf.MarkerVoList.verify|verify} messages.
         * @param message MarkerVoList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: protobuf.IMarkerVoList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MarkerVoList message, length delimited. Does not implicitly {@link protobuf.MarkerVoList.verify|verify} messages.
         * @param message MarkerVoList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: protobuf.IMarkerVoList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MarkerVoList message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns MarkerVoList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): protobuf.MarkerVoList;

        /**
         * Decodes a MarkerVoList message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns MarkerVoList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): protobuf.MarkerVoList;

        /**
         * Verifies a MarkerVoList message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MarkerVoList message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MarkerVoList
         */
        public static fromObject(object: { [k: string]: any }): protobuf.MarkerVoList;

        /**
         * Creates a plain object from a MarkerVoList message. Also converts values to other types if specified.
         * @param message MarkerVoList
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: protobuf.MarkerVoList, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MarkerVoList to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for MarkerVoList
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a SysUserSmallVo. */
    interface ISysUserSmallVo {

        /** SysUserSmallVo username */
        username?: (string|null);

        /** SysUserSmallVo nickname */
        nickname?: (string|null);

        /** SysUserSmallVo qq */
        qq?: (string|null);

        /** SysUserSmallVo phone */
        phone?: (string|null);

        /** SysUserSmallVo logo */
        logo?: (string|null);

        /** SysUserSmallVo remark */
        remark?: (string|null);
    }

    /** Represents a SysUserSmallVo. */
    class SysUserSmallVo implements ISysUserSmallVo {

        /**
         * Constructs a new SysUserSmallVo.
         * @param [properties] Properties to set
         */
        constructor(properties?: protobuf.ISysUserSmallVo);

        /** SysUserSmallVo username. */
        public username: string;

        /** SysUserSmallVo nickname. */
        public nickname: string;

        /** SysUserSmallVo qq. */
        public qq: string;

        /** SysUserSmallVo phone. */
        public phone?: (string|null);

        /** SysUserSmallVo logo. */
        public logo?: (string|null);

        /** SysUserSmallVo remark. */
        public remark?: (string|null);

        /**
         * Creates a new SysUserSmallVo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SysUserSmallVo instance
         */
        public static create(properties?: protobuf.ISysUserSmallVo): protobuf.SysUserSmallVo;

        /**
         * Encodes the specified SysUserSmallVo message. Does not implicitly {@link protobuf.SysUserSmallVo.verify|verify} messages.
         * @param message SysUserSmallVo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: protobuf.ISysUserSmallVo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified SysUserSmallVo message, length delimited. Does not implicitly {@link protobuf.SysUserSmallVo.verify|verify} messages.
         * @param message SysUserSmallVo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: protobuf.ISysUserSmallVo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SysUserSmallVo message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns SysUserSmallVo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): protobuf.SysUserSmallVo;

        /**
         * Decodes a SysUserSmallVo message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns SysUserSmallVo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): protobuf.SysUserSmallVo;

        /**
         * Verifies a SysUserSmallVo message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a SysUserSmallVo message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns SysUserSmallVo
         */
        public static fromObject(object: { [k: string]: any }): protobuf.SysUserSmallVo;

        /**
         * Creates a plain object from a SysUserSmallVo message. Also converts values to other types if specified.
         * @param message SysUserSmallVo
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: protobuf.SysUserSmallVo, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this SysUserSmallVo to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for SysUserSmallVo
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}

/** Namespace google. */
export namespace google {

    /** Namespace protobuf. */
    namespace protobuf {

        /** Properties of a Timestamp. */
        interface ITimestamp {

            /** Timestamp seconds */
            seconds?: (number|Long|null);

            /** Timestamp nanos */
            nanos?: (number|null);
        }

        /** Represents a Timestamp. */
        class Timestamp implements ITimestamp {

            /**
             * Constructs a new Timestamp.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.ITimestamp);

            /** Timestamp seconds. */
            public seconds: (number|Long);

            /** Timestamp nanos. */
            public nanos: number;

            /**
             * Creates a new Timestamp instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Timestamp instance
             */
            public static create(properties?: google.protobuf.ITimestamp): google.protobuf.Timestamp;

            /**
             * Encodes the specified Timestamp message. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Timestamp message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Timestamp;

            /**
             * Decodes a Timestamp message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Timestamp;

            /**
             * Verifies a Timestamp message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Timestamp message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Timestamp
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.Timestamp;

            /**
             * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
             * @param message Timestamp
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.Timestamp, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Timestamp to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Timestamp
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}
