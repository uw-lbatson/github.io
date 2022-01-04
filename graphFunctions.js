export let vertices = [];
export let edges = [];

export function isEdge(v1, v2) {
    for (let i = 0; i < edges.length; i++) {
        let edge = edges[i];
        if ((v1 == edge.from && v2 == edge.to) ||
            (v1 == edge.to && v2 == edge.from)) {
            return true;
        }
    }

    return false;
}

export function vertexOnEdge(vertex, edge) {
    if (edge.to == vertex || edge.from == vertex) {
        return true;
    }

    return false;
}

export function addEdge(v1, v2, value) {
    let edge = { from: v1, to: v2, highlight: false, weight: value }
    edges.push(edge);
}

export function addVertex(vx, vy) {
    let vertex = {
        number: vertices.length + 1,
        x: vx,
        y: vy,
        radius: 15,
        fillStyle: '#8c92ff',
        strokeStyle: '#000000',
        selectedFill: '#ff2b59',
        leafFill: '#32b354',
        setAFill: '#fcba03',
        setBFill: '#c63fe8',
        selected: false,
        leaf: false,
        setA: false,
        setB: false
    };
    vertices.push(vertex);
}

export function removeVertex() {
    let removedVertex = vertices.pop();
    edges = edges.filter(edge => !vertexOnEdge(removedVertex, edge));
    deselectAll();
}

export function removeEdge() {
    edges.pop();
    deselectAll();
}

export function clear() {
    vertices = [];
    edges = [];
    deselectAll();
}

export function printEdges() {
    for (let i = 0; i < edges.length; i++) {
        let edge = graph.edges[i];
        console.log(`Edge ${i}: (${edge.from.number}, ${edge.to.number})`);
    }
}

export function isVertex(vertexNumber) {
    for (let i = 0; i < vertices.length; i++) {
        let v = vertices[i];
        if (v.number == vertexNumber) {
            return true;
        }
    }

    return false;
}

export function getNbrNumbers(vertex) {
    let neighbours = [];
    for (let i = 0; i < edges.length; i++) {
        let edge = edges[i];

        if (edge.from == vertex) {
            neighbours.push(edge.to.number);
        }

        if (edge.to == vertex) {
            neighbours.push(edge.from.number);
        }
    }

    return neighbours;
}

export function pathExists(v1, v2, visited, queue) {
    visited[v1.number - 1] = true;
    queue[queue.length] = v1;

    if (v1 == v2) {
        return queue;
    }

    let vertexNbrs = getNeighbours(v1);
    if (vertexNbrs.includes(v2)) {
        queue[queue.length] = v2;
        return queue;
    }

    for (let i = 0; i < vertexNbrs.length; i++) {
        if (!visited[vertexNbrs[i].number - 1]) {
            if (pathExists(vertexNbrs[i], v2, visited, queue)) {
                return queue;
            }
        }
    }

    return false;
}

export function getPath(v1, v2, allPaths) {
    let visited = [];
    let pathList = [];
    visited[v1.number - 1] = false;
    pathList.push(v1.number);
    getAllPaths(v1, v2, visited, pathList, v1, allPaths);

    let parsedPaths = parsePaths(allPaths);
    let shortestPath = getShortestPath(parsedPaths);

    for (let i = 0; i < shortestPath.length; i++) {
        allPaths[i] = shortestPath[i];
    }
    allPaths.length = shortestPath.length;

    return parsedPaths.length;
}

export function getPathNumbers(path) {
    if (path) {
        let pathNumbers = [];
        for (let i = 0; i < path.length; i++) {
            pathNumbers.push(path[i].number);
        }
        return pathNumbers;
    }
    return false;
}

export function highlightPath(pathList) {
    for (let i = 0; i < pathList.length - 1; i++) {
        highlightEdge(pathList[i], pathList[i + 1]);
    }
}

export function deselectAll() {
    for (let i = 0; i < vertices.length; i++) {
        let vertex = vertices[i];
        vertex.selected = false;
        vertex.leaf = false;
        vertex.setA = false;
        vertex.setB = false;
    }

    for (let i = 0; i < edges.length; i++) {
        let edge = edges[i];
        edge.highlight = false;
    }
}

export function isConnected() {
    if (vertices.length == 0) {
        return "Graph has no vertices";
    }

    let startingVertex = vertices[0];
    for (let i = 0; i < vertices.length; i++) {
        if (pathExists(startingVertex, vertices[i], [], [])) {
            continue;
        } else {
            return false;
        }
    }

    return true;
}

export function getVertexPath(numberPath) {
    let vertexPath = [];
    for (let i = 0; i < numberPath.length; i++) {
        for (let j = 0; j < vertices.length; j++) {
            if (vertices[j].number == numberPath[i]) {
                vertexPath.push(vertices[j])
            }
        }
    }
    return vertexPath;
}

export function getCycles(allCycles) {
    let degreeTwoVertices = getVerticesOfDegreeTwo();
    let visited = [];
    let cycleList = [];
    for (let i = 0; i < degreeTwoVertices.length; i++) {
        visited[degreeTwoVertices[i].number - 1] = false;
        cycleList.push(degreeTwoVertices[i].number);
        getAllCycles(degreeTwoVertices[i], visited, cycleList, allCycles, degreeTwoVertices);
        cycleList = [];
    }

    allCycles = parsePaths(allCycles);
    for (let i = 0; i < allCycles.length; i++) {
        allCycles[i].pop();
    }

    let set = new Set();
    let noCopies = allCycles.filter((item) => {
        let key = [...item].sort((a, b) => a - b).join();
        return !set.has(key) ? (set.add(key), true) : false;
    });

    allCycles = Array.from(noCopies);
    for (let i = 0; i < allCycles.length; i++) {
        allCycles[i][allCycles[i].length] = allCycles[i][0];
    }

    return allCycles;
}

export function getSmallestCycle(cycleList) {
    if (cycleList.length == 0) {
        return Infinity;
    }

    let smallestCycleIndex = 0;
    for (let i = 0; i < cycleList.length; i++) {
        if (cycleList[smallestCycleIndex].length > cycleList[i].length) {
            smallestCycleIndex = i;
        }
    }

    return cycleList[smallestCycleIndex].length - 1;
}

export function existsEulerianCircuit() {
    if (vertices.length == 0) {
        return "Graph has no vertices";
    }

    if (!isConnected()) {
        for (let i = 0; i < vertices.length; i++) {
            let vertex = vertices[i];
            let nbrs = getNeighbours(vertex);
            if (nbrs.length == 0) {
                continue;
            } else {
                if (nbrs.length % 2 == 1) {
                    return false;
                }
            }
        }
        return true;
    } else {
        for (let i = 0; i < vertices.length; i++) {
            let vertex = vertices[i];
            let nbrs = getNeighbours(vertex);
            if (nbrs.length % 2 == 1) {
                return false;
            }
        }
        return true;
    }
}

export function getBridges() {
    let cycles = getCycles([]);
    let cycleEdges = [];
    let bridges = [];

    for (let i = 0; i < cycles.length; i++) {
        cycles[i] = getEdgesFromPath(getVertexPath(cycles[i]));
    }

    cycleEdges = cycles.flat();

    for (let i = 0; i < edges.length; i++) {
        let edge = edges[i];
        if (!cycleEdges.includes(edge)) {
            bridges.push(edge);
        }
    }

    return bridges;
}

export function highlightEdges(edgeList) {
    for (let i = 0; i < edgeList.length; i++) {
        let edge = edgeList[i];
        edge.highlight = true;
    }
}

// consider reducing time by checking if connected with n vertices, n-1 edges
export function isTree() {
    if (vertices.length == 0) {
        return "No vertices";
    }

    let cycles = getCycles([]);
    let isForest = false;

    for (let i = 0; i < vertices.length; i++) {
        let vertex = vertices[i];
        let nbrs = getNeighbours(vertex);
        if (nbrs.length == 0) {
            isForest = true;
        }
    }

    if (cycles.length == 0 && isForest) {
        return "Forest";
    } else if (cycles.length == 0 && !isForest) {
        return true;
    }

    return false;
}

export function countLeaves(leafVertices) {
    let total = 0;

    if (isTree() && isTree() != "Forest") {
        for (let i = 0; i < vertices.length; i++) {
            let vertex = vertices[i];
            let nbrs = getNeighbours(vertex);
            if (nbrs.length == 1) {
                total++;
                leafVertices[leafVertices.length] = vertex;
            }
        }
        return total;
    }

    return "Graph is not a tree";
}

export function isBipartite(setB) {
    if (vertices.length == 0) {
        return "No vertices";
    }

    let cycles = getCycles([]);

    for (let i = 0; i < cycles.length; i++) {
        let cycle = cycles[i];
        if (cycle.length % 2 == 0) {
            return false;
        }
    }

    if (vertices.length != 0 && edges.length != 0) {
        vertices[0].setA = true;
        getBipartition(vertices[0]);
    } else {
        for (let i = 0; i < vertices.length; i++) {
            if (i % 2 == 0) {
                vertices[i].setA = true;
            } else {
                vertices[i].setB = true;
            }
        }
    }

    return true;
}




function getNeighbours(vertex) {
    let neighbours = [];
    for (let i = 0; i < edges.length; i++) {
        let edge = edges[i];

        if (edge.from == vertex) {
            neighbours.push(edge.to);
        }

        if (edge.to == vertex) {
            neighbours.push(edge.from);
        }
    }

    neighbours.sort((a, b) => a.number - b.number);
    return neighbours;
}

function highlightEdge(v1, v2) {
    if (isVertex(v1.number) && isVertex(v2.number)) {
        for (let i = 0; i < edges.length; i++) {
            let edge = edges[i];
            if ((v1 == edge.to && v2 == edge.from) ||
                (v1 == edge.from && v2 == edge.to)) {
                edge.highlight = true;
            }
        }
    }
}

function getAllPaths(v1, v2, visited, pathList, startingVertex, allPaths) {
    if (v1 == v2) {
        for (let i = 0; i < pathList.length; i++) {
            allPaths[allPaths.length] = pathList[i];
        }
        allPaths[allPaths.length] = ' ';
        return;
    }

    visited[v1.number - 1] = true;
    let nbrs = getNeighbours(v1);

    for (let i = 0; i < nbrs.length; i++) {
        if (!visited[nbrs[i].number - 1]) {
            pathList.push(nbrs[i].number);
            getAllPaths(nbrs[i], v2, visited, pathList, startingVertex, allPaths);
            pathList.splice(pathList.indexOf(nbrs[i].number), 1);
        }
    }

    visited[v1.number - 1] = false;
}

function parsePaths(pathList) {
    let parsedPaths = [];
    let currentPath = [];
    let pathNumber = 0;
    for (let i = 0; i < pathList.length; i++) {
        if (pathList[i] == ' ' || i == pathList.length - 1) {
            parsedPaths[pathNumber] = currentPath.slice();
            pathNumber++;
            currentPath = [];
            continue;
        } else {
            currentPath[currentPath.length] = pathList[i];
        }
    }
    return parsedPaths;
}

function getShortestPath(parsedPaths) {
    let smallestPathIndex = 0;
    for (let i = 0; i < parsedPaths.length; i++) {
        if (parsedPaths[smallestPathIndex].length > parsedPaths[i].length) {
            smallestPathIndex = i;
            continue;
        }
    }

    return parsedPaths[smallestPathIndex];
}

function getVerticesOfDegreeTwo() {
    let degreeTwoVertices = [];
    for (let i = 0; i < vertices.length; i++) {
        if (getNbrNumbers(vertices[i].length >= 2)) {
            degreeTwoVertices.push(vertices[i]);
        }
    }
    return degreeTwoVertices;
}

function areNumberNeighbours(v1Number, v2Number) {
    for (let i = 0; i < edges.length; i++) {
        let edge = edges[i];
        if ((edge.to.number == v1Number && edge.from.number == v2Number) ||
            (edge.to.number == v2Number && edge.from.number == v1Number)) {
            return true;
        }
    }
    return false;
}

function getAllCycles(v1, visited, cycleList, allCycles, degreeTwos) {
    if (areNumberNeighbours(v1.number, cycleList[0]) && cycleList.length >= 3) {
        for (let i = 0; i < cycleList.length; i++) {
            allCycles[allCycles.length] = cycleList[i];
        }
        allCycles[allCycles.length] = cycleList[0];
        allCycles[allCycles.length] = ' ';
        return;
    }

    visited[v1.number - 1] = true;
    let nbrs = getNeighbours(v1);

    for (let i = 0; i < nbrs.length; i++) {
        if (!visited[nbrs[i].number - 1] && degreeTwos.includes(nbrs[i])) {
            cycleList.push(nbrs[i].number);
            getAllCycles(nbrs[i], visited, cycleList, allCycles, degreeTwos);
            cycleList.splice(cycleList.indexOf(nbrs[i].number), 1);
        }
    }

    visited[v1.number - 1] = false;
}

function getEdgesFromPath(vertexPath) {
    let edgeList = [];
    for (let i = 0; i < vertexPath.length - 1; i++) {
        let v1 = vertexPath[i];
        let v2 = vertexPath[i + 1];
        for (let j = 0; j < edges.length; j++) {
            let edge = edges[j];
            if ((edge.from == v1 && edge.to == v2) ||
                (edge.from == v2 && edge.to == v1)) {
                edgeList.push(edge);
            }
        }
    }
    return edgeList;
}


function getBipartition(vertex) {
    let nbrs = getNeighbours(vertex);
    for (let i = 0; i < nbrs.length; i++) {
        let neighbour = nbrs[i];
        if (!neighbour.setA && !neighbour.setB) {
            if (vertex.setA) {
                neighbour.setB = true;
            } else {
                neighbour.setA = true;
            }
            getBipartition(neighbour);
        }
    }
}