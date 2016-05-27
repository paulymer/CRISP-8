/// <reference path="NodeUtilities.ts" />

class PathParts {
    public dirname: string;
    public basename: string;
    public extname: string;

    constructor(combinedPath: string) {
        this.dirname = path.dirname(combinedPath);
        this.extname = path.extname(combinedPath);
        this.basename = path.basename(combinedPath, this.extname);
    }

    toString() {
        let combinedPath: string = "";
        if (this.dirname && this.dirname.length > 0) {
            combinedPath = this.dirname + "/";
        }
        combinedPath += this.basename + this.extname;
        return combinedPath;
    }
}
