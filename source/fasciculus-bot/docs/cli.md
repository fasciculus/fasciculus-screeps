# CLI

## Pause / Resume

system.pauseSimulation()

system.resumeSimulation()

## Reset

system.resetAllData()

## NPC Terminal

storage.db['rooms.objects'].insert({ type: 'terminal', room: 'W0N0', x: 0, y:0 })

## CPU

storage.db['users'].update({ username: 'rhjoerg' },{ $set: {cpu:20}})

## Spawns

storage.db['rooms.objects'].find({type:"spawn"});

## Energy Capacity

storage.db['rooms.objects'].update({type:"spawn"}, {$set: {storeCapacityResource:{ energy:300}, store:{energy:1}}});
storage.db['rooms.objects'].update({type:"extension"}, {$set: {storeCapacityResource:{energy:200}}}); // or 50/100 depending on RCL
storage.db['rooms.objects'].update({type:"link"}, {$set: {storeCapacityResource:{energy:800}}});
storage.db['rooms.objects'].update({type:"tower"}, {$set: {storeCapacityResource:{energy:1000}}});

## Reflection

Object.keys(storage.db)

Object.keys(storage.db['rooms.objects']);

