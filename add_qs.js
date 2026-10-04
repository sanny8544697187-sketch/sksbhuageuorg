const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

const matchQ1 = `{q:"<b>Match the following:</b><br><br><div style='display:flex;gap:40px;'><div><b>List I (Crop)</b><br>A. Paddy<br>B. Wheat<br>C. Sugarcane<br>D. Cotton</div><div><b>List II (Pest/Weed)</b><br>1. Phalaris minor<br>2. Early shoot borer<br>3. Pink bollworm<br>4. Echinochloa spp.</div></div>", opts:["A-4, B-1, C-2, D-3","A-1, B-4, C-3, D-2","A-4, B-2, C-1, D-3","A-3, B-1, C-4, D-2"], ans:0, exp:"Paddy: Echinochloa, Wheat: Phalaris minor, Sugarcane: Early shoot borer, Cotton: Pink bollworm.", premium:false},`;

const assertQ1 = `{q:"<b>Assertion (A):</b> Application of phosphorus is essential for root development.<br><br><b>Reason (R):</b> Phosphorus is a structural component of cell membranes and ATP.", opts:["Both A and R are true and R is the correct explanation of A","Both A and R are true but R is not the correct explanation of A","A is true but R is false","A is false but R is true"], ans:0, exp:"Phosphorus is crucial for roots and is found in phospholipids and ATP, explaining its metabolic role.", premium:false},`;

const agronomyArrayStart = c.indexOf('"Agronomy":[');
if(agronomyArrayStart > -1) {
  const insertPos = agronomyArrayStart + '"Agronomy":['.length;
  c = c.substring(0, insertPos) + '\n    ' + matchQ1 + '\n    ' + assertQ1 + c.substring(insertPos);
}

fs.writeFileSync('index.html', c);
console.log('Added Match the Following and Assertion-Reason questions.');
