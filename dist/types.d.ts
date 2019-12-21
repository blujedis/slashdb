/// <reference types="node" />
import { WriteStream } from 'fs';
export declare const __metadata__: unique symbol;
export interface IOptions {
    directory: string;
}
export interface IMap<T extends object = {}> {
    [key: string]: T;
}
export interface ICollections {
    [key: string]: IMap<IMap>;
}
export interface IDb {
    [__metadata__]: {
        collections: string[];
    };
    [key: string]: IMap<IMap>;
}
export interface IDbOptions {
    data?: IDb;
    stream?: WriteStream;
}
export interface IChain<T = any> {
    get: () => T[];
    and: (key: string, operator: string, value: string | number | boolean) => this;
    or: (key: string, operator: string, value: string | number | boolean) => this;
}
export declare type Operator = '==' | '>' | '<' | '!=' | '<=' | '>=' | 'in' | 'not';
export declare type Value<T extends object = any> = string | number | boolean | Date | T | Value<T>[];
