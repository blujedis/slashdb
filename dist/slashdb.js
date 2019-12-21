"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fast_glob_1 = __importDefault(require("fast-glob"));
const fs_1 = require("fs");
const path_1 = require("path");
const slash_1 = __importDefault(require("slash"));
const shortid_1 = __importDefault(require("shortid"));
const os_1 = require("os");
const lodash_set_1 = __importDefault(require("lodash.set"));
const utils_1 = require("./utils");
const db_1 = require("./db");
const readFilePromise = utils_1.toPromise(fs_1.readFile);
const statPromise = utils_1.toPromise(fs_1.stat);
class SlashDb {
    constructor(options) {
        this.options = options;
        this.confs = new Map();
        this.dbs = [];
        this.options.directory = this.options.directory.replace(/\/$/, '');
    }
    /**
     * Parses a row's namespace and value converting to object from JSON.
     *
     * @param row the row to be parsed.
     */
    parseRow(row) {
        row = row.trim();
        const idx = row.indexOf(':');
        const namespace = row.slice(0, idx).trim();
        const value = utils_1.tryParseJSON(row.slice(idx + 1).trim());
        if (!value)
            throw new Error(`Failed to parse row:\n${row}`);
        return {
            namespace,
            value
        };
    }
    /**
     * Parses a file's rows.
     *
     * @param data the file data string or Buffer to parse.
     */
    parseFile(data) {
        data = (data instanceof Buffer) ? data.toString() : data;
        const rows = data.split(os_1.EOL);
        return rows.reduce((a, c) => {
            c = c.trim();
            if (!c.length)
                return a;
            const parsed = this.parseRow(c);
            lodash_set_1.default(a, parsed.namespace, parsed.value);
            return a;
        }, {});
    }
    /**
     * Loads files for a given database.
     *
     * @param root the root path where database directories are stored.
     * @param files the file paths to be loaded.
     */
    async loadFiles(root, files) {
        root = root.replace(/^\.?\//, '').replace(/\/$/, '');
        return files.reduce(async (result, path) => {
            const accumulator = await result;
            const stats = await statPromise(path);
            const { err: fileErr, data } = await utils_1.promise(readFilePromise(path));
            if (fileErr)
                throw new Error(`Failed to load file: ${path}.`);
            const birthtime = stats.birthtimeMs;
            const parsed = path_1.parse(slash_1.default(path));
            // const namespace = (parsed.dir + '/' + parsed.name).replace(/^\.?\//, '').replace(root, '').replace(/^\//, '').replace(/\//g, '.');
            return Promise.resolve([...accumulator, {
                    path,
                    birthtime,
                    data: this.parseFile(data)
                }]);
        }, Promise.resolve([]));
    }
    /**
     * Loads the directory files creating in memory database.
     *
     * @param root the root path where database directories are stored.
     * @param dir the directory to be parsed.
     * @param sort when true files are sorted by birthtimeMs.
     */
    async loadDirectory(root, dir, sort = true) {
        const dirs = await fast_glob_1.default(dir + '/**/*.sla', { onlyFiles: true });
        const name = dir.split('/').pop();
        const loaded = await this.loadFiles(root, dirs);
        if (!sort || !loaded || !loaded.length)
            return null;
        loaded.sort((a, b) => {
            if (a.birthtime > b.birthtime)
                return 1;
            else if (a.birthtime < b.birthtime)
                return -1;
            return 0;
        });
        return loaded.reduce((a, c) => {
            utils_1.deepMerge(a.data, c.data);
            return a;
        }, { name, data: {}, filename: loaded[loaded.length - 1].path });
    }
    /**
     * Load database(s) in root options path or specified directories.
     *
     * @param dirs an array of directories to load.
     */
    async load(dirs = []) {
        const path = this.options.directory + '/**/*';
        if (!dirs.length) {
            const { err, data } = await utils_1.promise(fast_glob_1.default(path, { onlyDirectories: true }));
            // Don't continue if root directory can't be loaded.
            if (err)
                throw err;
            dirs = data || [];
        }
        const run = async () => {
            await utils_1.asyncForEach(dirs, async (d) => {
                const dbConf = await this.loadDirectory(this.options.directory, d);
                if (this.confs.has(dbConf.name))
                    throw new Error(`Duplicate database ${dbConf.name} could not be set.`);
                this.confs.set(dbConf.name, dbConf);
            });
            return this.confs;
        };
        return run();
    }
    /**
     * Connect to a database.
     *
     * @param name the database to connect to.
     */
    connect(name) {
        const conf = this.confs.get(name);
        if (!conf) {
            this.confs.set(name, {
                name: name,
                data: {},
                filename: this.options.directory + '/' + name + `/${shortid_1.default.generate()}.sla`
            });
        }
        const db = new db_1.Db(conf);
        this.dbs.push(db);
        return db;
    }
    close() {
        this.dbs.forEach(db => {
            db.close();
        });
    }
}
exports.SlashDb = SlashDb;
//# sourceMappingURL=slashdb.js.map