import * as graph from './graphFunctions.js';

const canvas = document.getElementById('appCanvas');
const context = canvas.getContext('2d');
const VKEY = 86;
const EKEY = 69;
const CKEY = 67;
let selection = undefined;

function draw() {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // draw every edge
    for (let i = 0; i < graph.edges.length; i++) {
        let edge = graph.edges[i];
        let fromVertex = graph.edges[i].from;
        let toVertex = graph.edges[i].to;
        context.beginPath();
        context.lineWidth = 3;
        context.strokeStyle = edge.highlight ? '#ff0000' : '#000000';
        context.moveTo(fromVertex.x, fromVertex.y);
        context.lineTo(toVertex.x, toVertex.y);
        context.stroke();

        if (edge.weight != 0) {
            let textX = (toVertex.x + fromVertex.x) / 2;
            let textY = (toVertex.y + fromVertex.y) / 2;
            context.font = '20px arial';
            context.fillStyle = 'red';
            context.fillText(edge.weight, textX, textY);
        }
    }

    // draw every vertex
    for (let i = 0; i < graph.vertices.length; i++) {
        let v = graph.vertices[i];

        context.beginPath();
        context.lineWidth = 1;

        if (v.selected) {
            context.fillStyle = v.selectedFill;
        } else if (v.leaf) {
            context.fillStyle = v.leafFill;
        } else if (v.setA) {
            context.fillStyle = v.setAFill;
        } else if (v.setB) {
            context.fillStyle = v.setBFill;
        } else {
            context.fillStyle = v.fillStyle;
        }

        context.arc(v.x, v.y, v.radius, 0, Math.PI * 2, true);
        context.strokeStyle = v.strokeStyle;
        context.fill();
        context.stroke();

        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = '24px arial';
        context.fillStyle = 'black'
        context.fillText(v.number, v.x, v.y);

        if (v.selected) {
            context.textAlign = 'left';
            context.textBaseline = 'top';
            context.font = '30px arial';
            context.fillStyle = 'black'

            let nbrs = graph.getNbrNumbers(v).sort((a,b) => a-b);
            context.fillText(`deg(v${v.number}) = ${nbrs.length}`, 10, 10);
            context.fillText(`Neighbours: ${nbrs}`, 10, 40);
        }
    }

    let density = 2 * graph.edges.length / graph.vertices.length;
    standardFont();
    context.fillText(`Graph density: ${density.toFixed(2)}`, 10, window.innerHeight - 80);
}

function standardFont() {
    context.textAlign = 'left';
    context.textBaseline = 'top';
    context.font = '30px arial';
    context.fillStyle = 'black';
}

/**
 * finds first vertex around (x, y)
 */
function within(x, y) {
    return graph.vertices.find(v => {
        return x > (v.x - v.radius) &&
            y > (v.y - v.radius) &&
            x < (v.x + v.radius) &&
            y < (v.y + v.radius);
    });
}

function getVerticesForPath() {
    graph.deselectAll();
    let vertexStr = document.getElementById('pathFinder').value;
    let pathedVertices = vertexStr.split(' ');

    if (pathedVertices.length > 2 || pathedVertices.length < 2) {
        alert("Can only path between two vertices.");
        return;
    }

    if (pathedVertices.some(isNaN)) {
        alert("Vertices must be numeric.");
        return;
    }

    if (!graph.isVertex(pathedVertices[0]) || 
        !graph.isVertex(pathedVertices[1])) {
        alert("Can only path between existing vertices.");
        return;
    }

    let pathList = [];
    let numberOfPaths = graph.getPath(graph.vertices[pathedVertices[0]-1],
                    graph.vertices[pathedVertices[1]-1], pathList);
    let vertexPath = graph.getVertexPath(pathList);
    graph.highlightPath(vertexPath);
    
    draw();
    standardFont();
    context.fillText(`Exists ${pathedVertices[0]},${pathedVertices[1]} path?: ${pathList}`,
                        10, 70);
    context.fillText(`Total paths: ${numberOfPaths}`, 10, 110);
}

function checkConnectivity() {
    graph.deselectAll();
    draw();
    standardFont();
    let result = graph.isConnected();
    context.fillText(`Is connected?: ${result}`, 10, 70);
}

function returnCycles() {
    graph.deselectAll();
    let allCycles = graph.getCycles([]);
    for (let i = 0; i < allCycles.length; i++) {
        let numberCycle = allCycles[i];
        let vertexCycle = graph.getVertexPath(numberCycle);
        graph.highlightPath(vertexCycle);
    }

    draw();
    standardFont();
    context.fillText(`Total cycles: ${allCycles.length}`, 10, 70);
    context.fillText(`Girth: ${graph.getSmallestCycle(allCycles)}`, 10, 110);
}

function checkEulerianCircuit() {
    graph.deselectAll();
    draw();
    standardFont();
    context.fillText(`Has Eulerian Circuit?: ${graph.existsEulerianCircuit()}`, 10, 70);
}

function showBridges() {
    graph.deselectAll();
    let bridges = graph.getBridges();
    graph.highlightEdges(bridges);
    draw();
    standardFont();
    context.fillText(`Total bridges: ${bridges.length}`, 10, 70);
}

function checkTree() {
    graph.deselectAll();
    let result = graph.isTree();
    let leafVertices = [];
    let totalLeaves = graph.countLeaves(leafVertices);

    for (let i = 0; i < leafVertices.length; i++) {
        let vertex = leafVertices[i];
        vertex.leaf = true;
    }

    draw();
    standardFont();
    context.fillText(`Is a tree?: ${result}`, 10, 70);
    context.fillText(`Total leaves: ${totalLeaves}`, 10, 110);
}

function checkBipartite() {
    graph.deselectAll();
    let result = graph.isBipartite();
    draw();
    standardFont();
    context.fillText(`Is bipartite?: ${result}`, 10, 70);
}

function runPrimsAlgo() {
    graph.deselectAll();
    let mstEdges = graph.primsAlgo();
    let totalWeight = graph.getTotalWeight(mstEdges);
    graph.highlightEdges(mstEdges);
    draw();
    standardFont();
    context.fillText(`Total weight: ${totalWeight}`, 10, 70);
}

function addCompleteGraph(size) {
    let leftShift = window.innerWidth * 0.2;
    let topShift = window.innerHeight * 0.1;
    let horizontalMid = window.innerWidth / 2 - leftShift;
    let verticalMid = window.innerHeight / 2 - topShift;

    graph.clear();

    if (size == 3) {
        graph.addVertex(horizontalMid, verticalMid - 75);
        graph.addVertex(horizontalMid + 50, verticalMid);
        graph.addVertex(horizontalMid - 50, verticalMid);

        for (let i = 0; i < graph.vertices.length; i++) {
            for (let j = 0; j < graph.vertices.length; j++) {
                if (i != j) {
                    graph.addEdge(graph.vertices[i], graph.vertices[j], 0);
                }
            }
        }

        draw();
    } else if (size == 4) {
        graph.addVertex(horizontalMid - 100, verticalMid - 100);
        graph.addVertex(horizontalMid + 100, verticalMid - 100);
        graph.addVertex(horizontalMid + 100, verticalMid + 100);
        graph.addVertex(horizontalMid - 100, verticalMid + 100);

        for (let i = 0; i < graph.vertices.length; i++) {
            for (let j = 0; j < graph.vertices.length; j++) {
                if (i != j) {
                    graph.addEdge(graph.vertices[i], graph.vertices[j], 0);
                }
            }
        }

        draw();
    } else if (size == 5) {
        graph.addVertex(horizontalMid, verticalMid - 150);
        graph.addVertex(horizontalMid + 100, verticalMid - 80);
        graph.addVertex(horizontalMid - 100, verticalMid - 80);
        graph.addVertex(horizontalMid + 60, verticalMid + 30);
        graph.addVertex(horizontalMid - 60, verticalMid + 30);

        for (let i = 0; i < graph.vertices.length; i++) {
            for (let j = 0; j < graph.vertices.length; j++) {
                if (i != j) {
                    graph.addEdge(graph.vertices[i], graph.vertices[j], 0);
                }
            }
        }

        draw();
    } else {
        return;
    }
}

function addBipartiteGraph(size) {
    let leftShift = window.innerWidth * 0.2;
    let topShift = window.innerHeight * 0.1;
    let horizontalMid = window.innerWidth / 2 - leftShift;
    let verticalMid = window.innerHeight / 2 - topShift;

    graph.clear();

    if (size == 3) {
        graph.addVertex(horizontalMid - 150, verticalMid - 75);
        graph.addVertex(horizontalMid, verticalMid - 75);
        graph.addVertex(horizontalMid + 150, verticalMid - 75);
        graph.addVertex(horizontalMid - 150, verticalMid + 75);
        graph.addVertex(horizontalMid, verticalMid + 75);
        graph.addVertex(horizontalMid + 150, verticalMid + 75);

        for (let i = 0; i <= 2; i++) {
            for (let j = 3; j <= 5; j++) {
                graph.addEdge(graph.vertices[i], graph.vertices[j], 0);
            }
        }

        draw();
    } else if (size == 4) {
        graph.addVertex(horizontalMid - 225, verticalMid - 75);
        graph.addVertex(horizontalMid - 75, verticalMid - 75);
        graph.addVertex(horizontalMid + 75, verticalMid - 75);
        graph.addVertex(horizontalMid + 225, verticalMid - 75);
        graph.addVertex(horizontalMid - 225, verticalMid + 75);
        graph.addVertex(horizontalMid - 75, verticalMid + 75);
        graph.addVertex(horizontalMid + 75, verticalMid + 75);
        graph.addVertex(horizontalMid + 225, verticalMid + 75);

        for (let i = 0; i <= 3; i++) {
            for (let j = 4; j <= 7; j++) {
                graph.addEdge(graph.vertices[i], graph.vertices[j], 0);
            }
        }

        draw();
    } else {
        return;
    }
}

function addBasicTree() {
    let leftShift = window.innerWidth * 0.2;
    let topShift = window.innerHeight * 0.1;
    let horizontalMid = window.innerWidth / 2 - leftShift;
    let verticalMid = window.innerHeight / 2 - topShift;

    graph.clear();

    graph.addVertex(horizontalMid, verticalMid - 200);
    graph.addVertex(horizontalMid - 150, verticalMid - 75);
    graph.addVertex(horizontalMid + 150, verticalMid - 75);
    graph.addVertex(horizontalMid - 250, verticalMid + 50);
    graph.addVertex(horizontalMid - 75, verticalMid + 50);
    graph.addVertex(horizontalMid + 75, verticalMid + 50);
    graph.addVertex(horizontalMid + 250, verticalMid + 50);

    graph.addEdge(graph.vertices[0], graph.vertices[1], 0);
    graph.addEdge(graph.vertices[0], graph.vertices[2], 0);
    graph.addEdge(graph.vertices[1], graph.vertices[3], 0);
    graph.addEdge(graph.vertices[1], graph.vertices[4], 0);
    graph.addEdge(graph.vertices[2], graph.vertices[5], 0);
    graph.addEdge(graph.vertices[2], graph.vertices[6], 0);

    draw();
}



/* Key and mouse functions */

function getMousePos(canvasObj, e) {
    var rect = canvasObj.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
}

function move(e) {
    if (selection && e.buttons) {
        let pos = getMousePos(canvas, e);
        selection.x = pos.x;
        selection.y = pos.y;
        draw();
    }
}

function down(e) {
    if(e.target.id === 'appCanvas') {
        graph.deselectAll();
        let pos = getMousePos(canvas, e);
        let target = within(pos.x, pos.y);

        if (selection && selection.selected) {
            selection.selected = false;
        }

        if (target) {
            if (selection && selection !== target) {
                if (!graph.isEdge(selection, target)) {
                    let weight = -1;
                    while (weight < 0) {
                        weight = +prompt("Enter weight:", 0);
                    }
                    graph.addEdge(selection, target, weight);
                }
            }
            selection = target;
            selection.selected = true;
            draw();
        }
    }
}

function up(e) {
    if(e.target.id === 'appCanvas') {
        let pos = getMousePos(canvas, e);
        if (!selection) {
            graph.addVertex(pos.x, pos.y);
            draw();
        }

        if (selection && !selection.selected) {
            selection = undefined;
        }

        draw();
    }
}

function keys(e) {
    if (e.keyCode === VKEY) {
        graph.removeVertex();
    }

    if (e.keyCode === EKEY) {
        graph.removeEdge();
    }

    if (e.keyCode === CKEY) {
        graph.clear()
    }

    selection = undefined;
    draw();
}


window.onmousemove = move;
window.onmouseup = up;
window.onmousedown = down;
window.onkeydown = keys;




document.getElementById("pathBtn").onclick = function() {
    getVerticesForPath();
};

document.getElementById("connectedBtn").onclick = function() {
    checkConnectivity();
};

document.getElementById("cyclesBtn").onclick = function() {
    returnCycles();
};

document.getElementById("eulerCircuitBtn").onclick = function() {
    checkEulerianCircuit();
};

document.getElementById("bridgesBtn").onclick = function() {
    showBridges();
};

document.getElementById("treeBtn").onclick = function() {
    checkTree();
};

document.getElementById("bipartiteBtn").onclick = function() {
    checkBipartite();
};

document.getElementById("primsBtn").onclick = function() {
    runPrimsAlgo();
};




document.getElementById("k3Btn").onclick = function() {
    addCompleteGraph(3);
};

document.getElementById("k4Btn").onclick = function() {
    addCompleteGraph(4);
};

document.getElementById("k5Btn").onclick = function() {
    addCompleteGraph(5);
};

document.getElementById("k33Btn").onclick = function() {
    addBipartiteGraph(3);
};

document.getElementById("k44Btn").onclick = function() {
    addBipartiteGraph(4);
};

document.getElementById("addTreeBtn").onclick = function() {
    addBasicTree();
};




function resize() {
    canvas.width = window.innerWidth * 0.6;
    canvas.height = window.innerHeight * 0.8;
}

window.onresize = resize;
resize();