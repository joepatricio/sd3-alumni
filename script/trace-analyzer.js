const fs = require('fs');
const trace = JSON.parse(fs.readFileSync('docs/trace/Trace-20261003T125131.json', 'utf8'));
const events = trace.traceEvents || trace;

// Find the longest events
const longEvents = events
    .filter(e => e.dur > 100000) // longer than 100ms
    .sort((a, b) => b.dur - a.dur)
    .slice(0, 10);

console.log('Top 10 longest events (dur in ms):');
longEvents.forEach(e => {
    console.log(`${(e.dur / 1000).toFixed(2)}ms : ${e.name} (${e.cat}) - ${JSON.stringify(e.args || {}).substring(0, 100)}`);
});

// Calculate total scripting vs rendering time
let scripting = 0;
let rendering = 0;
let painting = 0;

events.forEach(e => {
    if (!e.dur) return;
    if (e.name === 'EvaluateScript' || e.name === 'FunctionCall' || e.name === 'TimerFire' || e.name === 'EventDispatch') {
        scripting += e.dur;
    } else if (e.name === 'UpdateLayoutTree' || e.name === 'Layout') {
        rendering += e.dur;
    } else if (e.name === 'Paint' || e.name === 'CompositeLayers') {
        painting += e.dur;
    }
});

console.log('\nTime breakdown (ms):');
console.log(`Scripting: ${(scripting / 1000).toFixed(2)}ms`);
console.log(`Rendering (Layout/Style): ${(rendering / 1000).toFixed(2)}ms`);
console.log(`Painting: ${(painting / 1000).toFixed(2)}ms`);
