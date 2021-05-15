NUM_GENES = 250;
VEL = 25;
NUM_BALLS = 100;
MUTATION_RATE = 0.02;

avg_fitness = 0;
generation = 0;
balls = [];

document.addEventListener("DOMContentLoaded", setup);        

class Ball {
    constructor(x,y,ctx) {
        this.x = x;
        this.y = y;
        this.ctx = ctx;
        this.r = 10; // radius
        this.index = 0;
        this.fitness = 0;
        this.done = false;
    }

    draw() {
        this.ctx.fillStyle = 'rgb(173, 216, 230)';
        if (this.done) {
            this.ctx.fillStyle = 'rgb(32, 171, 56)';
        }
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI, false); 
        this.ctx.fill();
    }

    update() {
        if (380 < this.x && 420 > this.x && 745 < this.y && 785 > this.y) {
            this.done = true;
            this.index++;
        }
        else if (this.index < NUM_GENES) {
            this.x += VEL*this.genes[this.index][0];
            this.y += VEL*this.genes[this.index][1];
            this.index++;
        }
    }

    setGenes(genes) {
        this.genes = genes;
    }

    setRandomGenes() {
        this.genes = [];
        for (let i = 0; i < NUM_GENES; i++) {
            this.genes[i] = [Math.random()-0.5, Math.random()-0.5] // random x,y vector
        }
    }

    calcFitness() {
        var d = Math.sqrt((this.x - 400) ** 2 + (this.y - 765) ** 2);
        this.fitness = Math.max(0, 1 - d/800);
    }
}

function setup() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    for (let i = 0; i < NUM_BALLS; i++) {
        var b = new Ball(395, 25, ctx);
        b.setRandomGenes();
        balls.push(b);
    }

    animateLoop();
}

function loop() {
    if (generation == 2000) {
        return
    }
    for (let j = 0; j < NUM_GENES; j++) {
        for (let i = 0; i < NUM_BALLS; i++) {
            balls[i].update();
        }
    }
    nextGen()
    
    loop();
}

function animateLoop() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    requestAnimationFrame(animateLoop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < NUM_BALLS; i++) {
        var b = balls[i];
        b.update();
        b.draw();
    }
    
    // draw goal
    ctx.fillStyle = 'rgb(173, 216, 230)';
    ctx.fillRect(380, 745, 40, 40);
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.font = "30px Arial";
    ctx.fillText("Generation: " + generation.toString(), 15, 45);
    ctx.fillText("Avg fitness: " + avg_fitness.toFixed(2).toString(), 15, 90);

    if (balls[0].index == NUM_GENES) {
        nextGen()
    }

}

function nextGen() {
    generation++;
    console.log("Generation", generation);

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    // mating pool
    var candidates = [];
    var total_fitness = 0;
    for (let i = 0; i < NUM_BALLS; i++) {
        var b = balls[i];
        b.calcFitness();
        total_fitness += b.fitness; 
        for (let j = 0; j < (2 ** (b.fitness * 10)); j++) {
            candidates.push(b);
        }
    }
    avg_fitness = total_fitness / NUM_BALLS;
    console.log("Average fitness", avg_fitness);

    // reproduce
    var newBalls = [];
    for (let i = 0; i < NUM_BALLS; i++) {
        // dad 
        var d = candidates[Math.floor(Math.random() * candidates.length)];
        // mom
        var m = candidates[Math.floor(Math.random() * candidates.length)];
        // baby
        var b = new Ball(395, 25, ctx);
        // baby's genes
        var genes = [];
        
        for (let j = 0; j < NUM_GENES; j++) {
            // choose random gene MUTATION_RATE % of time (currently 5%)
            if (Math.random() < MUTATION_RATE) {
                genes.push([Math.random()-0.5, Math.random()-0.5]);
            }
            else if (j % 2) { // dad's genes first half
                genes.push(d.genes[j]);
            }
            else { // mom's genes second
                genes.push(m.genes[j]);
            }
        }
        b.setGenes(genes);
        newBalls.push(b)
    }

    balls = newBalls; // replace previous generation with current
}
