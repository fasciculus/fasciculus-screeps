# CostMatrix

## Prerequisites

All tiles with obstacles (including stationary creeps) are set to 255. This is done last to ensure the path blocking feature of obstacles.

## Priorities

Tiles should be used for travelling with the following priorities:

1. tiles with ramparts
1. tiles with roads
1. plain tiles
1. swamp tiles

## Costs

The CostMatrix doesn't use priorities. Therefore the above priorities need to be converted into costs.

These values need to be kept low.

The following rules are used in the given order:
1. plain cost is set to 3, the swamp cost to 15.
1. A road sets the value to 2.
1. A rampart sets the value to 1.

These gives the following costs:

| Plain/Swamp | Rampart | Road | Cost |
| --- | --- | --- | --- |
| Plain | No | No | 3 |
| Plain | No | Yes | 2 |
| Plain | Yes | No | 1 |
| Plain | Yes | Yes | 1 |
| Swamp | No | No | 15 (see Note 1)|
| Swamp | No | Yes | 2 |
| Swamp | Yes | No | 1 |
| Swamp | Yes | Yes | 1 (see Note 2) |

**Note 1:** Swamp cost with neither rampart nor road may be too low (15)!

**Note 2:** Swamp tiles with rampart but without road have a very low cost (1)!

## Conclusion

Due to the results in the above section, this may be a "war time" solution and during peace the ramparts should be ignored.