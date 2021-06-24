
export interface IDataStorage {

    putCoverage(project: string, sourceFilePath: string, coveredOriginalLines: number[]): void;

    singalUnmappedCoverage(): void;

}

export class DataStorage implements IDataStorage {

    public putCoverage(project: string, sourceFilePath: string, coveredOriginalLines: number[]): void {
        const uniformPath = this.makeUniformPath(sourceFilePath);
        // console.log(`Final Coverage: ${project} ${uniformPath} ${coveredOriginalLines}`);
    }

    private makeUniformPath(path: string): string {
        return path.replace("\\", "/");
    }

    singalUnmappedCoverage(): void {
    }

}