# Matching

## Harvesters and Sources

### Source Polygamy

Sources are entered multiple times as targets for the matcher if they provide more free work than an
average harvester can handle.

### Source Value

Sources without free work are not fed into the matcher.

Rules:
- Travelling cost reduces the attractivity.
- Amount of free work increases attractivity.

### Harvester Value

Just the reciprocal of the travelling cost or 0 if no path. Zero must be returned if no path to
still have the source assigned.

## Transporters

### Target Value

Transporter targets are either harvesters or spawns. Containers will be added later.

#### Harvester Value

Rules:
- If the transporter is full, the harvester has no value (-1).
- If the harvester is not yet in position, the harvester has no value (-1).
- Energy in the harvester increases value.
- Travelling cost decreases value.

### Transporter Value

Just the reciprocal of the travelling cost or -1 if no path.
