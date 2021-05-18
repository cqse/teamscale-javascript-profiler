
export interface IDataStorage {

    putSourceMap(): void;

    putCoverage(): void;

}

export class DataStorage implements IDataStorage {

    putCoverage(): void {
    }

    putSourceMap(): void {
    }

}