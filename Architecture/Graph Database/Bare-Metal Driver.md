<!-- Freeki metadata. Do not remove this section!
TITLE: Bare-Metal Driver
-->
#Bare-Metal Driver

* Graph stores:
    * GAV -> out-relationship
    * GAV -> in-relationship
    * variable-GAV
    * incomplete-GAV
    * GAV -> metadata-map
    * GAV -> selection
    * GA -> selection
    * view -> visibility
* GraphView stores:
    * roots
    * root filter
* GraphVisibility stores:
    * view
    * accepted-path -> children derived from accepting filters
    * accepted-GAVs -> accepted paths (that end with GAV target)
        * *(automatically includes roots)* -> empty-set
    * accepted-relationships?
* PathDB stores:
    * canonical-paths

## Use Cases

### Traverse (with GraphView) 

#### With cached paths

1. Retrieve cached paths from view
2. Sort paths according to DFS/BFS needs
3. Iterate paths, calling Traversal api with each path
4. Repeat for #passes expressed by Traverse

**TODO:** How can we sort cached paths for DFS/BFS?

#### Without cached paths

1. Get view roots.
2. Get view filter.
3. Run traverse with DFS/BFS algorithm as needed by Traverse. On each successive relationship:
    0. Process relationship overrides to account for selected GAVs (relocations)
    1. construct filter from parent path
    2. if filter accepts current path, cache it in the view and move on
4. Repeat for #passes expressed by Traverse

### Add Relationship

1. Map declaring GAV to out-edge for relationship
2. Map target GAV to in-edge for relationship
3. Remove declaring GAV from incomplete-GAV set
4. If target isn't already contained in out-edges map, add it to incomplete-GAV set
5. If target GAV is variable, add it to variable-GAV
6. For each cached view -> visibility mapping, call `GraphVisibility.add( relationship, pathDb )`:
    1. If declaring GAV is in view roots AND relationship is accepted by root filter:
         1. construct 1-edge path from relationship
         2. include relationship
         3. map target GAV -> new path
         4. map new path -> `rootFilter.getChildFilter( relationship )`
    2. Lookup existing paths mapped to declaring GAV of relationship. For each:
         1. Lookup filters accepting this path. For each:
              1. if filter accepts this new relationship, add `filter.getChildFilter(relationship)` to temp filters-set
         2. If temp filters-set is not empty:
              1. extend current path with relationship to form a new path
              2. include relationship
              3. map target GAV -> new path
              4. map new path -> temp filter-set