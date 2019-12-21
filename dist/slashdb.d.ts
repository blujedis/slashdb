import { IOptions, IDbOptions } from './types';
import { Db } from './db';
export declare class SlashDb {
    options: IOptions;
    confs: Map<string, IDbOptions>;
    dbs: Db[];
    constructor(options: IOptions);
    /**
     * Parses a row's namespace and value converting to object from JSON.
     *
     * @param row the row to be parsed.
     */
    private parseRow;
    /**
     * Parses a file's rows.
     *
     * @param data the file data string or Buffer to parse.
     */
    private parseFile;
    /**
     * Loads files for a given database.
     *
     * @param root the root path where database directories are stored.
     * @param files the file paths to be loaded.
     */
    private loadFiles;
    /**
     * Loads the directory files creating in memory database.
     *
     * @param root the root path where database directories are stored.
     * @param dir the directory to be parsed.
     * @param sort when true files are sorted by birthtimeMs.
     */
    private loadDirectory;
    /**
     * Load database(s) in root options path or specified directories.
     *
     * @param dirs an array of directories to load.
     */
    load(dirs?: string[]): Promise<Map<string, IDbOptions>>;
    /**
     * Connect to a database.
     *
     * @param name the database to connect to.
     */
    connect(name: string): Db;
    close(): void;
}
