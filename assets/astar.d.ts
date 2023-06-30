declare class Graph {
    constructor(arr: number[][]);
    readonly grid: any[][]
}

declare class GridNode {
    x: number
    y: number
}

declare namespace astar {
    function search(Graph, start, end): GridNode[];
}