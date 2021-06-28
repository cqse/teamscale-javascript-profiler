import {IDataStorage} from "./DataStorage";
import {Contract} from "@cqse/common-qualities";

export abstract class CoveragePersisterBase {

    protected readonly _storage: IDataStorage;

    constructor(storage: IDataStorage) {
        this._storage = Contract.requireDefined(storage);
    }

    public abstract finalizePerstistence(): void;

}