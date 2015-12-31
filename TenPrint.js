"use strict";

const LS = 0;
const RS = 1;
const MLS = 2;
const MRS = 3;

const LEFT = 0;
const UP = 1;
const RIGHT = 2;
const DOWN = 3;

const RightSlash = "\u2571";
const LeftSlash  = "\u2572";
const MarkedESC  = "\x1b[7m"; //"\x1b[90m"; // "\x1b[7m";
const BLINK	 = "\x1b[5m";
const RESET      = "\x1b[0m";

const maxTries = 100000;
var LastMaze = null;

function nextChar(){ 
	let a = [RS, LS]; 
	return a[Math.round(Math.random(a.length-1))];
}


function TenPrint(width, height, walk){
  let maze = buildMaze(width, height);
  let count = 0;
   
  if(walk){ 
	while(!walkMaze(maze) && count < maxTries){
		count++;
		maze = buildMaze(width, height);
		process.stdout.write("0x" + count.toString(16));
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
	}
	
	if(count != maxTries){
		console.log("\nFound Solution After " + count + " Tries"); 
	 		
	}else{
		console.log("\nTimedout After " + count + " Tries");
	}
  }

  printMaze(maze);
  
  // Save the last maze for REPL
  LastMaze = maze;
}  

function printMaze(maze){
  let height = maze.length;
  let width  = maze[0].length;

  for(let y=0;y<height;y++){
   let line = "";
   let cChr = "";
   for(let x=0; x<width;x++){
           switch(maze[y][x]){
               case(LS):
                 cChr = LeftSlash;
                 break;
               case(RS):
                 cChr = RightSlash;
                 break;
               case(MLS):
                 cChr = MarkedESC + LeftSlash;
                 break;
               case(MRS):
                 cChr = MarkedESC + RightSlash;
                 break;
               default:
           }
           line = line + cChr + RESET;
        }
        console.log(line);
   }
}

function buildMaze(width, height){
        let maze = new Array(height);
	maze.fill(0);
 	maze.forEach(function(v, i, a){
		a[i] = new Array(width);
		a[i].fill(0);
	});

	for(let y=0;y<height;y++){
        	for(let x=0; x<width;x++){
                	maze[y][x] = nextChar();
        	}
   	}	

	return maze;
}


function walkMaze(maze){
	let currentDir = RIGHT;
	let currentRow = -1;
	let currentCol =  0;
	let entrance = -1;
        
        // LEFT	UP  RIGHT DOWN
	// '\'	'\'  '\'  '\'
	//' /'	'/'  '/'  '/'
	let lookup = [	[ UP,LEFT,DOWN,RIGHT ], 
			[ DOWN,RIGHT,UP,LEFT ] ];	
         
	// Start Walking //
	// 1. Start in upper lefthand side and look two matching  slashes
	//    a. if LS then RS or RS then LS then move down 1
	//    b. if RS then RS then move RIGHT starting with second RS
      	//    c. if LS then LS then move RIGHT starting with first LS
	// 2. Lookup in table which direction to move for DIRECTION + SLASH
	// 3. Mark each visited box with 
	// 3. Repeat until X | Y  < 0, Y > HEIGHT, or  X > WIDTH 
	//    a. IF X > WIDTH then the puzzle is solved
	//    b. IF X | Y < O, or Y > HEIGHT then the puzzle has no solution

	while((entrance = findEntrance(maze, entrance+1)) != -1){

	// What happens if we don't find an entrance?
	if(entrance < 0 || entrance >= maze.length){
		return false;
	}else{
		currentRow = entrance;
		currentDir = RIGHT;
		currentCol = 0;
	}

	do{
		//set the wall at currentRow,currentCol to visited	//
		//set the currentRow, currentCol and currentDir   	//
 		//based on the current character type and currentDir	//
		let cChr = maze[currentRow][currentCol];
		maze[currentRow][currentCol] =  
				(cChr == LS || cChr == MLS) ? MLS : MRS; 
	        // cChr%2 so that Marked versions and normal versions
		// will both map to the correct row in the lookup	
		currentDir = lookup[(cChr%2)][currentDir];
   		
		switch(currentDir){
			case(UP):
			  currentRow = currentRow - 1;
			  break;
			case(DOWN):
			  currentRow = currentRow + 1;
			  break;
			case(LEFT):
			  currentCol = currentCol - 1;
			  break;
			case(RIGHT):
			  currentCol = currentCol + 1;
			  break;
			default:
		}	

	}while( (currentRow != entrance  || currentCol == 0)
		&& currentRow >= 0 && currentRow < maze.length
                && currentCol >= 0 && currentCol < maze[0].length);

	if(currentCol == maze[0].length){
               return true; 
        } 
	
	// undo any items that we've marked before we try next entrance //
	resetMaze(maze);
     }

     //we did not find a solution!
     return false;	
}

function findEntrance(maze, currentRow){
   if(currentRow >= maze.length-1){ return -1 };

   if(maze[currentRow][0] == maze[currentRow+1][0]){
       return (maze[currentRow][0] == RS 
		|| maze[currentRow][0] == MRS) ? currentRow+1 : currentRow;
   }else{	
	return findEntrance(maze, currentRow+1);
   }
}

function resetMaze(maze){
	maze.forEach(function(v,i,a){
		a[i].forEach(function(v1,i1,a1){
			if(a1[i1] == MLS){
				a1[i1] = LS;
			}else if(a1[i1] == MRS){
				a1[i1] = RS;
			}
		});
	});
}
