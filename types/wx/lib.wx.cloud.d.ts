/*! *****************************************************************************
Copyright (c) 2019 Tencent, Inc. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of 
this software and associated documentation files (the "Software"), to deal in 
the Software without restriction, including without limitation the rights to 
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies 
of the Software, and to permit persons to whom the Software is furnished to do 
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all 
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
SOFTWARE.
***************************************************************************** */

/////////////////////
///// WX Cloud Apis
/////////////////////

/**
 * Common interfaces and types
 */

interface IAPIError {
    errMsg: string
}

interface IAPIParam<T = any> {
    config?: ICloudConfig
    success?: (res: T) => void
    fail?: (err: IAPIError) => void
    complete?: (val: T | IAPIError) => void
}

interface IAPISuccessParam {
    errMsg: string
}

type IAPICompleteParam = IAPISuccessParam | IAPIError

type IAPIFunction<T, P extends IAPIParam<T>> = (param?: P) => Promise<T>

interface IInitCloudConfig {
    env?:
        | string
        | {
              database?: string
              functions?: string
              storage?: string,
          }
    traceUser?: boolean
}

interface ICloudConfig {
    env?: string
    traceUser?: boolean
}

interface IICloudAPI {
    init: (config?: IInitCloudConfig) => void
    [api: string]: AnyFunction | IAPIFunction<any, any>
}

interface ICloudService {
    name: string

    getAPIs: () => { [name: string]: IAPIFunction<any, any> }
}

interface ICloudServices {
    [serviceName: string]: ICloudService
}

interface ICloudMetaData {
    session_id: string
}

declare class InternalSymbol {}

interface AnyObject {
    [x: string]: any
}

type AnyArray = any[]

type AnyFunction = (...args: any[]) => any

/**
 * extend wx with cloud
 */
interface WxCloud {
    init: (config?: ICloudConfig) => void

    callFunction(param: OQ<ICloud.CallFunctionParam>): void
    callFunction(
        param: RQ<ICloud.CallFunctionParam>,
    ): Promise<ICloud.CallFunctionResult>

    uploadFile(param: OQ<ICloud.UploadFileParam>): MPNS.UploadTask
    uploadFile(
        param: RQ<ICloud.UploadFileParam>,
    ): Promise<ICloud.UploadFileResult>

    downloadFile(
        param: OQ<ICloud.DownloadFileParam>,
    ): MPNS.DownloadTask
    downloadFile(
        param: RQ<ICloud.DownloadFileParam>,
    ): Promise<ICloud.DownloadFileResult>

    getTempFileURL(param: OQ<ICloud.GetTempFileURLParam>): void
    getTempFileURL(
        param: RQ<ICloud.GetTempFileURLParam>,
    ): Promise<ICloud.GetTempFileURLResult>

    deleteFile(param: OQ<ICloud.DeleteFileParam>): void
    deleteFile(
        param: RQ<ICloud.DeleteFileParam>,
    ): Promise<ICloud.DeleteFileResult>

    database: (config?: ICloudConfig) => DB.Database
}

declare namespace ICloud {
    interface ICloudAPIParam<T = any> extends IAPIParam<T> {
        config?: ICloudConfig
    }

    // === API: callFunction ===
    type CallFunctionData = AnyObject

    interface CallFunctionResult extends IAPISuccessParam {
        result: AnyObject | string | undefined
    }

    interface CallFunctionParam extends ICloudAPIParam<CallFunctionResult> {
        name: string
        data?: CallFunctionData
        slow?: boolean
    }
    // === end ===

    // === API: uploadFile ===
    interface UploadFileResult extends IAPISuccessParam {
        fileID: string
        statusCode: number
    }

    interface UploadFileParam extends ICloudAPIParam<UploadFileResult> {
        cloudPath: string
        filePath: string
        header?: AnyObject
    }
    // === end ===

    // === API: downloadFile ===
    interface DownloadFileResult extends IAPISuccessParam {
        tempFilePath: string
        statusCode: number
    }

    interface DownloadFileParam extends ICloudAPIParam<DownloadFileResult> {
        fileID: string
        cloudPath?: string
    }
    // === end ===

    // === API: getTempFileURL ===
    interface GetTempFileURLResult extends IAPISuccessParam {
        fileList: GetTempFileURLResultItem[]
    }

    interface GetTempFileURLResultItem {
        fileID: string
        tempFileURL: string
        maxAge: number
        status: number
        errMsg: string
    }

    interface GetTempFileURLParam extends ICloudAPIParam<GetTempFileURLResult> {
        fileList: string[]
    }
    // === end ===

    // === API: deleteFile ===
    interface DeleteFileResult extends IAPISuccessParam {
        fileList: DeleteFileResultItem[]
    }

    interface DeleteFileResultItem {
        fileID: string
        status: number
        errMsg: string
    }

    interface DeleteFileParam extends ICloudAPIParam<DeleteFileResult> {
        fileList: string[]
    }
    // === end ===
}

// === Database ===
declare namespace DB {
    /**
     * The class of all exposed cloud database instances
     */
    class Database {
        readonly config: ICloudConfig
        readonly command: DatabaseCommand
        readonly Geo: IGeo
        readonly serverDate: () => ServerDate
        readonly RegExp: IRegExpConstructor

        private constructor()

        collection(collectionName: string): CollectionReference
    }

    class CollectionReference extends Query {
        readonly collectionName: string
        readonly database: Database

        private constructor(name: string, database: Database)

        doc(docId: string | number): DocumentReference

        // add(options: IAddDocumentOptions): Promise<IAddResult> | void

        add(options: OQ<IAddDocumentOptions>): void
        add(options: RQ<IAddDocumentOptions>): Promise<IAddResult>
    }

    class DocumentReference {
        private constructor(docId: string | number, database: Database)

        field(object: object): this

        get(options: OQ<IGetDocumentOptions>): void
        get(options?: RQ<IGetDocumentOptions>): Promise<IQuerySingleResult>

        set(options: OQ<ISetSingleDocumentOptions>): void
        set(options?: RQ<ISetSingleDocumentOptions>): Promise<ISetResult>

        update(options: OQ<IUpdateSingleDocumentOptions>): void
        update(
            options?: RQ<IUpdateSingleDocumentOptions>,
        ): Promise<IUpdateResult>

        remove(options: OQ<IRemoveSingleDocumentOptions>): void
        remove(
            options?: RQ<IRemoveSingleDocumentOptions>,
        ): Promise<IRemoveResult>
    }

    class Query {
        where(condition: IQueryCondition): Query

        orderBy(fieldPath: string, order: string): Query

        limit(max: number): Query

        skip(offset: number): Query

        field(object: object): Query

        get(options: OQ<IGetDocumentOptions>): void
        get(options?: RQ<IGetDocumentOptions>): Promise<IQueryResult>

        count(options: OQ<ICountDocumentOptions>): void
        count(options?: RQ<ICountDocumentOptions>): Promise<ICountResult>
    }

    interface DatabaseCommand {
        eq(val: any): DatabaseQueryCommand
        neq(val: any): DatabaseQueryCommand
        gt(val: any): DatabaseQueryCommand
        gte(val: any): DatabaseQueryCommand
        lt(val: any): DatabaseQueryCommand
        lte(val: any): DatabaseQueryCommand
        in(val: any[]): DatabaseQueryCommand
        nin(val: any[]): DatabaseQueryCommand

        geoNear(options: IGeoNearCommandOptions): DatabaseQueryCommand
        geoWithin(options: IGeoWithinCommandOptions): DatabaseQueryCommand
        geoIntersects(
            options: IGeoIntersectsCommandOptions,
        ): DatabaseQueryCommand

        and(
            ...expressions: Array<DatabaseLogicCommand | IQueryCondition>
        ): DatabaseLogicCommand
        or(
            ...expressions: Array<DatabaseLogicCommand | IQueryCondition>
        ): DatabaseLogicCommand

        set(val: any): DatabaseUpdateCommand
        remove(): DatabaseUpdateCommand
        inc(val: number): DatabaseUpdateCommand
        mul(val: number): DatabaseUpdateCommand

        push(...values: any[]): DatabaseUpdateCommand
        pop(): DatabaseUpdateCommand
        shift(): DatabaseUpdateCommand
        unshift(...values: any[]): DatabaseUpdateCommand
    }

    enum LOGIC_COMMANDS_LITERAL {
        AND = 'and',
        OR = 'or',
        NOT = 'not',
        NOR = 'nor',
    }

    class DatabaseLogicCommand {
        fieldName: string | InternalSymbol
        operator: LOGIC_COMMANDS_LITERAL | string
        operands: any[]

        _setFieldName(fieldName: string): DatabaseLogicCommand

        and(
            ...expressions: Array<DatabaseLogicCommand | IQueryCondition>
        ): DatabaseLogicCommand
        or(
            ...expressions: Array<DatabaseLogicCommand | IQueryCondition>
        ): DatabaseLogicCommand
    }

    enum QUERY_COMMANDS_LITERAL {
        // normal
        EQ = 'eq',
        NEQ = 'neq',
        GT = 'gt',
        GTE = 'gte',
        LT = 'lt',
        LTE = 'lte',
        IN = 'in',
        NIN = 'nin',
        // geo
        GEO_NEAR = 'geoNear',
        GEO_WITHIN = 'geoWithin',
        GEO_INTERSECTS = 'geoIntersects',
    }

    class DatabaseQueryCommand extends DatabaseLogicCommand {
        operator: QUERY_COMMANDS_LITERAL | string

        _setFieldName(fieldName: string): DatabaseQueryCommand

        eq(val: any): DatabaseLogicCommand
        neq(val: any): DatabaseLogicCommand
        gt(val: any): DatabaseLogicCommand
        gte(val: any): DatabaseLogicCommand
        lt(val: any): DatabaseLogicCommand
        lte(val: any): DatabaseLogicCommand
        in(val: any[]): DatabaseLogicCommand
        nin(val: any[]): DatabaseLogicCommand

        geoNear(options: IGeoNearCommandOptions): DatabaseLogicCommand
        geoWithin(options: IGeoWithinCommandOptions): DatabaseLogicCommand
        geoIntersects(
            options: IGeoIntersectsCommandOptions,
        ): DatabaseLogicCommand
    }

    enum UPDATE_COMMANDS_LITERAL {
        SET = 'set',
        REMOVE = 'remove',
        INC = 'inc',
        MUL = 'mul',
        PUSH = 'push',
        POP = 'pop',
        SHIFT = 'shift',
        UNSHIFT = 'unshift',
    }

    class DatabaseUpdateCommand {
        fieldName: string | InternalSymbol
        operator: UPDATE_COMMANDS_LITERAL
        operands: any[]

        constructor(
            operator: UPDATE_COMMANDS_LITERAL,
            operands: any[],
            fieldName?: string | InternalSymbol,
        )

        _setFieldName(fieldName: string): DatabaseUpdateCommand
    }

    class Batch {}

    /**
     * A contract that all API provider must adhere to
     */
    class APIBaseContract<
        PROMISE_RETURN,
        CALLBACK_RETURN,
        PARAM extends IAPIParam,
        CONTEXT = any
    > {
        getContext(param: PARAM): CONTEXT

        /**
         * In case of callback-style invocation, this function will be called
         */
        getCallbackReturn(param: PARAM, context: CONTEXT): CALLBACK_RETURN

        getFinalParam<T extends PARAM>(param: PARAM, context: CONTEXT): T

        run<T extends PARAM>(param: T): Promise<PROMISE_RETURN>
    }

    interface IGeoPointConstructor {
        new (longitude: number, latitide: number): GeoPoint
        new (geojson: IGeoJSONPoint): GeoPoint
        (longitude: number, latitide: number): GeoPoint
        (geojson: IGeoJSONPoint): GeoPoint
    }

    interface IGeoMultiPointConstructor {
        new (points: GeoPoint[] | IGeoJSONMultiPoint): GeoMultiPoint
        (points: GeoPoint[] | IGeoJSONMultiPoint): GeoMultiPoint
    }

    interface IGeoLineStringConstructor {
        new (points: GeoPoint[] | IGeoJSONLineString): GeoLineString
        (points: GeoPoint[] | IGeoJSONLineString): GeoLineString
    }

    interface IGeoMultiLineStringConstructor {
        new (
            lineStrings: GeoLineString[] | IGeoJSONMultiLineString,
        ): GeoMultiLineString
        (
            lineStrings: GeoLineString[] | IGeoJSONMultiLineString,
        ): GeoMultiLineString
    }

    interface IGeoPolygonConstructor {
        new (lineStrings: GeoLineString[] | IGeoJSONPolygon): GeoPolygon
        (lineStrings: GeoLineString[] | IGeoJSONPolygon): GeoPolygon
    }

    interface IGeoMultiPolygonConstructor {
        new (polygons: GeoPolygon[] | IGeoJSONMultiPolygon): GeoMultiPolygon
        (polygons: GeoPolygon[] | IGeoJSONMultiPolygon): GeoMultiPolygon
    }

    interface IGeo {
        Point: IGeoPointConstructor
        MultiPoint: IGeoMultiPointConstructor
        LineString: IGeoLineStringConstructor
        MultiLineString: IGeoMultiLineStringConstructor
        Polygon: IGeoPolygonConstructor
        MultiPolygon: IGeoMultiPolygonConstructor
    }

    interface IGeoJSONPoint {
        type: 'Point'
        coordinates: [number, number]
    }

    interface IGeoJSONMultiPoint {
        type: 'MultiPoint'
        coordinates: Array<[number, number]>
    }

    interface IGeoJSONLineString {
        type: 'LineString'
        coordinates: Array<[number, number]>
    }

    interface IGeoJSONMultiLineString {
        type: 'MultiLineString'
        coordinates: Array<Array<[number, number]>>
    }

    interface IGeoJSONPolygon {
        type: 'Polygon'
        coordinates: Array<Array<[number, number]>>
    }

    interface IGeoJSONMultiPolygon {
        type: 'MultiPolygon'
        coordinates: Array<Array<Array<[number, number]>>>
    }

    type IGeoJSONObject =
        | IGeoJSONPoint
        | IGeoJSONMultiPoint
        | IGeoJSONLineString
        | IGeoJSONMultiLineString
        | IGeoJSONPolygon
        | IGeoJSONMultiPolygon

    abstract class GeoPoint {
        longitude: number
        latitude: number

        constructor(longitude: number, latitude: number)

        toJSON(): object
        toString(): string
    }

    abstract class GeoMultiPoint {
        points: GeoPoint[]

        constructor(points: GeoPoint[])

        toJSON(): IGeoJSONMultiPoint
        toString(): string
    }

    abstract class GeoLineString {
        points: GeoPoint[]

        constructor(points: GeoPoint[])

        toJSON(): IGeoJSONLineString
        toString(): string
    }

    abstract class GeoMultiLineString {
        lines: GeoLineString[]

        constructor(lines: GeoLineString[])

        toJSON(): IGeoJSONMultiLineString
        toString(): string
    }

    abstract class GeoPolygon {
        lines: GeoLineString[]

        constructor(lines: GeoLineString[])

        toJSON(): IGeoJSONPolygon
        toString(): string
    }

    abstract class GeoMultiPolygon {
        polygons: GeoPolygon[]

        constructor(polygons: GeoPolygon[])

        toJSON(): IGeoJSONMultiPolygon
        toString(): string
    }

    type GeoInstance =
        | GeoPoint
        | GeoMultiPoint
        | GeoLineString
        | GeoMultiLineString
        | GeoPolygon
        | GeoMultiPolygon

    interface IGeoNearCommandOptions {
        geometry: GeoPoint
        maxDistance?: number
        minDistance?: number
    }

    interface IGeoWithinCommandOptions {
        geometry: GeoPolygon | GeoMultiPolygon
    }

    interface IGeoIntersectsCommandOptions {
        geometry:
            | GeoPoint
            | GeoMultiPoint
            | GeoLineString
            | GeoMultiLineString
            | GeoPolygon
            | GeoMultiPolygon
    }

    interface IServerDateOptions {
        offset: number
    }

    abstract class ServerDate {
        readonly options: IServerDateOptions
        constructor(options?: IServerDateOptions)
    }

    interface IRegExpOptions {
        regexp: string
        options?: string
    }

    interface IRegExpConstructor {
        new (options: IRegExpOptions): RegExp
        (options: IRegExpOptions): RegExp
    }

    abstract class RegExp {
        readonly regexp: string
        readonly options: string
        constructor(options: IRegExpOptions)
    }

    type DocumentId = string | number

    interface IDocumentData {
        _id?: DocumentId
        [key: string]: any
    }

    type IDBAPIParam = IAPIParam

    interface IAddDocumentOptions extends IDBAPIParam {
        data: IDocumentData
    }

    type IGetDocumentOptions = IDBAPIParam

    type ICountDocumentOptions = IDBAPIParam

    interface IUpdateDocumentOptions extends IDBAPIParam {
        data: IUpdateCondition
    }

    interface IUpdateSingleDocumentOptions extends IDBAPIParam {
        data: IUpdateCondition
    }

    interface ISetDocumentOptions extends IDBAPIParam {
        data: IUpdateCondition
    }

    interface ISetSingleDocumentOptions extends IDBAPIParam {
        data: IUpdateCondition
    }

    interface IRemoveDocumentOptions extends IDBAPIParam {
        query: IQueryCondition
    }

    type IRemoveSingleDocumentOptions = IDBAPIParam

    interface IQueryCondition {
        [key: string]: any
    }

    type IStringQueryCondition = string

    interface IQueryResult extends IAPISuccessParam {
        data: IDocumentData[]
    }

    interface IQuerySingleResult extends IAPISuccessParam {
        data: IDocumentData
    }

    interface IUpdateCondition {
        [key: string]: any
    }

    type IStringUpdateCondition = string

    interface IAddResult extends IAPISuccessParam {
        _id: DocumentId
    }

    interface IUpdateResult extends IAPISuccessParam {
        stats: {
            updated: number,
            // created: number,
        }
    }

    interface ISetResult extends IAPISuccessParam {
        _id: DocumentId
        stats: {
            updated: number
            created: number,
        }
    }

    interface IRemoveResult extends IAPISuccessParam {
        stats: {
            removed: number,
        }
    }

    interface ICountResult extends IAPISuccessParam {
        total: number
    }
}

type Optional<T> = { [K in keyof T]+?: T[K] }

type OQ<
    T extends Optional<
        Record<'complete' | 'success' | 'fail', (...args: any[]) => any>
    >
> =
    | (RQ<T> & Required<Pick<T, 'success'>>)
    | (RQ<T> & Required<Pick<T, 'fail'>>)
    | (RQ<T> & Required<Pick<T, 'complete'>>)
    | (RQ<T> & Required<Pick<T, 'success' | 'fail'>>)
    | (RQ<T> & Required<Pick<T, 'success' | 'complete'>>)
    | (RQ<T> & Required<Pick<T, 'fail' | 'complete'>>)
    | (RQ<T> & Required<Pick<T, 'fail' | 'complete' | 'success'>>)

type RQ<
    T extends Optional<
        Record<'complete' | 'success' | 'fail', (...args: any[]) => any>
    >
> = Pick<T, Exclude<keyof T, 'complete' | 'success' | 'fail'>>
